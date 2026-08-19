import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';
import { CallRecord, CallType, CallStatus, UserProfile } from '../types';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export class WebRTCCallService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentCallId: string | null = null;
  private unsubscribeCallDoc: (() => void) | null = null;

  public async getMediaStream(type: CallType): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: type === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      return stream;
    } catch (err) {
      console.warn('Microphone/Camera permission error:', err);
      // Fallback: try audio only if video failed
      if (type === 'video') {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.localStream = audioStream;
        return audioStream;
      }
      throw err;
    }
  }

  public async startCall(
    caller: UserProfile,
    receiver: UserProfile,
    type: CallType,
    onRemoteStream: (stream: MediaStream) => void,
    onCallEnded: () => void
  ): Promise<string> {
    const callId = `call_${caller.uid}_${Date.now()}`;
    this.currentCallId = callId;

    this.peerConnection = new RTCPeerConnection(RTC_CONFIG);
    this.remoteStream = new MediaStream();
    onRemoteStream(this.remoteStream);

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Remote track listener
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream?.addTrack(track);
      });
    };

    // ICE Candidate collector
    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate && this.currentCallId) {
        const callDocRef = doc(db, 'calls', this.currentCallId);
        try {
          await updateDoc(callDocRef, {
            callerCandidates: arrayUnion(event.candidate.toJSON()),
          });
        } catch (e) {
          console.warn('Failed to send caller candidate', e);
        }
      }
    };

    // Create SDP Offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    const callData: CallRecord = {
      id: callId,
      callerId: caller.uid,
      callerName: caller.displayName || caller.username,
      callerAvatar: caller.photoURL,
      receiverId: receiver.uid,
      type,
      status: 'ringing',
      offer: { type: offer.type, sdp: offer.sdp },
      callerCandidates: [],
      receiverCandidates: [],
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'calls', callId), callData);

    // Listen for Answer and ICE candidates from receiver
    const callDocRef = doc(db, 'calls', callId);
    this.unsubscribeCallDoc = onSnapshot(callDocRef, async (snapshot) => {
      const data = snapshot.data() as CallRecord | undefined;
      if (!data) return;

      if (data.status === 'ended' || data.status === 'declined') {
        this.cleanup();
        onCallEnded();
        return;
      }

      if (data.answer && this.peerConnection && !this.peerConnection.currentRemoteDescription) {
        const rtcSessionDesc = new RTCSessionDescription(data.answer);
        await this.peerConnection.setRemoteDescription(rtcSessionDesc);
      }

      if (data.receiverCandidates && this.peerConnection) {
        data.receiverCandidates.forEach(async (candidateData) => {
          try {
            await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidateData));
          } catch (e) {
            console.warn('Error adding receiver ice candidate', e);
          }
        });
      }
    });

    return callId;
  }

  public async answerCall(
    callId: string,
    callData: CallRecord,
    onRemoteStream: (stream: MediaStream) => void,
    onCallEnded: () => void
  ): Promise<void> {
    this.currentCallId = callId;
    this.peerConnection = new RTCPeerConnection(RTC_CONFIG);
    this.remoteStream = new MediaStream();
    onRemoteStream(this.remoteStream);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream?.addTrack(track);
      });
    };

    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate && this.currentCallId) {
        const callDocRef = doc(db, 'calls', this.currentCallId);
        try {
          await updateDoc(callDocRef, {
            receiverCandidates: arrayUnion(event.candidate.toJSON()),
          });
        } catch (e) {
          console.warn('Failed to send receiver candidate', e);
        }
      }
    };

    // Set Remote Offer
    if (callData.offer) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(callData.offer));
    }

    // Create SDP Answer
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    const callDocRef = doc(db, 'calls', callId);
    await updateDoc(callDocRef, {
      status: 'active',
      answer: { type: answer.type, sdp: answer.sdp },
    });

    // Add any existing caller candidates
    if (callData.callerCandidates) {
      callData.callerCandidates.forEach(async (candidateData) => {
        try {
          await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidateData));
        } catch (e) {
          console.warn('Error adding caller ice candidate', e);
        }
      });
    }

    // Listen for state changes (e.g. caller hangs up)
    this.unsubscribeCallDoc = onSnapshot(callDocRef, (snapshot) => {
      const data = snapshot.data() as CallRecord | undefined;
      if (!data || data.status === 'ended') {
        this.cleanup();
        onCallEnded();
      }
    });
  }

  public async endCall(callId: string, durationSec: number = 0): Promise<void> {
    try {
      const callDocRef = doc(db, 'calls', callId);
      await updateDoc(callDocRef, {
        status: 'ended',
        endedAt: Date.now(),
        duration: durationSec,
      });
    } catch (e) {
      console.warn('Failed to end call record', e);
    }
    this.cleanup();
  }

  public async declineCall(callId: string): Promise<void> {
    try {
      const callDocRef = doc(db, 'calls', callId);
      await updateDoc(callDocRef, {
        status: 'declined',
        endedAt: Date.now(),
      });
    } catch (e) {
      console.warn('Failed to decline call', e);
    }
    this.cleanup();
  }

  public toggleAudio(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  public toggleVideo(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  public cleanup() {
    if (this.unsubscribeCallDoc) {
      this.unsubscribeCallDoc();
      this.unsubscribeCallDoc = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.currentCallId = null;
  }
}

export function listenForIncomingCalls(
  currentUserId: string,
  onIncomingCall: (call: CallRecord) => void
): () => void {
  const path = 'calls';
  try {
    const q = query(
      collection(db, 'calls'),
      where('receiverId', '==', currentUserId),
      where('status', '==', 'ringing')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const call = change.doc.data() as CallRecord;
            // Only trigger if call is fresh (< 45 seconds old)
            if (Date.now() - call.createdAt < 45000) {
              onIncomingCall(call);
            }
          }
        });
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}
