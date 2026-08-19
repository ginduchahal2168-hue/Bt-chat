import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import {
  TabType,
  UserProfile,
  Conversation,
  ChatMessage,
  Contact,
  UserStatus,
  CallRecord,
  CallType,
  PeerDevice,
  FileTransferItem,
  AppPermissions,
  ConnectionRequest,
} from '../types';
import { useAuth } from './AuthContext';
import { localDb } from '../services/db';
import {
  listenToUserConversations,
  listenToConversationMessages,
  getOrCreateConversation,
  sendChatMessage,
  markConversationAsRead,
  deleteChatMessage,
} from '../services/chatService';
import {
  listenToContacts,
  addContactToUser,
  removeContactFromUser,
  toggleBlockContact,
} from '../services/contactService';
import {
  listenToActiveStatuses,
  createUserStatus,
  markStatusAsViewed,
  deleteUserStatus,
} from '../services/statusService';
import {
  WebRTCCallService,
  listenForIncomingCalls,
} from '../services/callService';
import { BluetoothMeshService } from '../services/bluetooth';
import { offlineQueue } from '../services/offlineQueueService';

interface AppContextType {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  // Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  activeChatUser: UserProfile | null;
  setActiveChatUser: (user: UserProfile | null) => void;
  activeMessages: ChatMessage[];
  sendMessage: (content: string, type?: ChatMessage['type'], mediaUrl?: string, meta?: Partial<ChatMessage>) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  startChatWithUser: (targetUser: UserProfile) => Promise<void>;
  // Contacts
  contacts: Contact[];
  addContact: (targetUser: UserProfile) => Promise<void>;
  removeContact: (contactUserId: string) => Promise<void>;
  toggleBlockUser: (targetUserId: string, isBlocked: boolean) => Promise<void>;
  // Statuses / Stories
  statuses: UserStatus[];
  postStatus: (type: 'text' | 'image' | 'video', content?: string, mediaUrl?: string, backgroundColor?: string) => Promise<void>;
  viewStatus: (statusId: string) => Promise<void>;
  deleteStatus: (statusId: string) => Promise<void>;
  // Calls (WebRTC)
  activeCall: { callId: string; record?: CallRecord; targetUser: UserProfile; type: CallType } | null;
  incomingCall: CallRecord | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCallMuted: boolean;
  isVideoEnabled: boolean;
  startCall: (targetUser: UserProfile, type: CallType) => Promise<void>;
  answerIncomingCall: () => Promise<void>;
  declineIncomingCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  // Nearby / Bluetooth
  nearbyPeers: PeerDevice[];
  connectedPeer: PeerDevice | null;
  isScanning: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  hardwareScan: () => Promise<void>;
  connectToPeer: (peer: PeerDevice) => void;
  disconnectPeer: (peerId: string) => void;
  incomingConnectionRequest: ConnectionRequest | null;
  acceptConnectionRequest: (req: ConnectionRequest) => void;
  declineConnectionRequest: (req: ConnectionRequest) => void;
  // Files / Transfers
  transfers: FileTransferItem[];
  sendFileToPeer: (targetPeer: PeerDevice, file: File) => Promise<void>;
  clearTransfers: () => void;
  // Offline & System
  isOnline: boolean;
  permissions: AppPermissions;
  updatePermissions: (permissions: Partial<AppPermissions>) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  showPermissionsModal: boolean;
  setShowPermissionsModal: (show: boolean) => void;
  showNewChatModal: boolean;
  setShowNewChatModal: (show: boolean) => void;
  showCreateStatusModal: boolean;
  setShowCreateStatusModal: (show: boolean) => void;
  activeStoryToView: UserStatus | null;
  setActiveStoryToView: (status: UserStatus | null) => void;
  showPrivacyPolicy: boolean;
  setShowPrivacyPolicy: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userProfile, firebaseUser } = useAuth();

  const [currentTab, setCurrentTab] = useState<TabType>('chats');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<UserProfile | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [statuses, setStatuses] = useState<UserStatus[]>([]);
  const [nearbyPeers, setNearbyPeers] = useState<PeerDevice[]>([]);
  const [connectedPeer, setConnectedPeer] = useState<PeerDevice | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [incomingConnectionRequest, setIncomingConnectionRequest] = useState<ConnectionRequest | null>(null);
  const [transfers, setTransfers] = useState<FileTransferItem[]>(() => localDb.getTransfers());
  const [permissions, setPermissions] = useState<AppPermissions>(() => localDb.getPermissions());
  const [isOnline, setIsOnline] = useState<boolean>(offlineQueue.isOnline);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals state
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [showNewChatModal, setShowNewChatModal] = useState<boolean>(false);
  const [showCreateStatusModal, setShowCreateStatusModal] = useState<boolean>(false);
  const [activeStoryToView, setActiveStoryToView] = useState<UserStatus | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);

  // Calling state
  const [activeCall, setActiveCall] = useState<{ callId: string; record?: CallRecord; targetUser: UserProfile; type: CallType } | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallRecord | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCallMuted, setIsCallMuted] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);

  const callServiceRef = useRef<WebRTCCallService>(new WebRTCCallService());
  const btService = useMemo(() => new BluetoothMeshService(userProfile), [userProfile?.uid]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((prev) => (prev === msg ? null : prev)), 3200);
  };

  // Online / Offline listener
  useEffect(() => {
    const unsub = offlineQueue.onNetworkChange((online) => {
      setIsOnline(online);
      if (online) {
        showToast('Internet connection restored');
      } else {
        showToast('Offline Mode: Nearby Bluetooth & P2P active');
      }
    });
    return unsub;
  }, []);

  // Sync profile with bluetooth service
  useEffect(() => {
    btService.updateProfile(userProfile);
  }, [userProfile, btService]);

  // Firestore Real-Time Listeners (Conversations, Contacts, Statuses, Incoming Calls)
  useEffect(() => {
    if (!firebaseUser?.uid) {
      setConversations([]);
      setContacts([]);
      setStatuses([]);
      return;
    }

    const unsubConvs = listenToUserConversations(firebaseUser.uid, (convList) => {
      setConversations(convList);
    });

    const unsubContacts = listenToContacts(firebaseUser.uid, (contactList) => {
      setContacts(contactList);
    });

    const unsubStatuses = listenToActiveStatuses((statusList) => {
      setStatuses(statusList);
    });

    const unsubCalls = listenForIncomingCalls(firebaseUser.uid, (call) => {
      setIncomingCall(call);
    });

    return () => {
      if (unsubConvs) unsubConvs();
      if (unsubContacts) unsubContacts();
      if (unsubStatuses) unsubStatuses();
      if (unsubCalls) unsubCalls();
    };
  }, [firebaseUser?.uid]);

  // Listen to messages of active conversation
  useEffect(() => {
    if (!activeConversation?.id) {
      setActiveMessages([]);
      return;
    }

    const unsubMessages = listenToConversationMessages(activeConversation.id, (msgList) => {
      setActiveMessages(msgList);
      if (firebaseUser?.uid) {
        markConversationAsRead(activeConversation.id, firebaseUser.uid, msgList);
      }
    });

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [activeConversation?.id, firebaseUser?.uid]);

  // Bluetooth & Local Mesh Discovery Listeners
  useEffect(() => {
    const offPeer = btService.on('peer_discovered', (newPeer: PeerDevice) => {
      setNearbyPeers((prev) => {
        const existingIdx = prev.findIndex((p) => p.id === newPeer.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...newPeer, lastSeen: Date.now() };
          return updated;
        }
        return [newPeer, ...prev];
      });
    });

    const offReq = btService.on('connection_requested', (req: ConnectionRequest) => {
      setIncomingConnectionRequest(req);
    });

    const offResp = btService.on('connection_response', ({ peerId, accepted }: { peerId: string; accepted: boolean }) => {
      if (accepted) {
        const target = nearbyPeers.find((p) => p.id === peerId);
        if (target) {
          setConnectedPeer({ ...target, status: 'connected' });
          showToast(`Connected to ${target.name} via Bluetooth!`);
        }
      } else {
        showToast('Connection declined by peer');
      }
    });

    const offChunk = btService.on('file_chunk_received', (packet: any) => {
      const transfer: FileTransferItem = {
        id: 'tr_' + Date.now(),
        peerId: packet.senderId,
        peerName: nearbyPeers.find((p) => p.id === packet.senderId)?.name || 'Nearby Device',
        fileName: packet.fileName,
        fileSize: packet.fileSize,
        fileType: packet.fileType,
        mimeType: packet.mimeType,
        progress: 100,
        speedMbps: 3.2,
        bytesTransferred: packet.fileSize,
        status: 'completed',
        direction: 'incoming',
        dataUrl: packet.dataUrl,
        timestamp: Date.now(),
      };
      setTransfers((prev) => {
        const updated = [transfer, ...prev];
        localDb.saveTransfers(updated);
        return updated;
      });
      showToast(`Received ${packet.fileName} over Bluetooth P2P`);
    });

    return () => {
      offPeer();
      offReq();
      offResp();
      offChunk();
    };
  }, [btService, nearbyPeers]);

  // Start chat with real user
  const startChatWithUser = async (targetUser: UserProfile) => {
    if (!userProfile) return;
    try {
      const conv = await getOrCreateConversation(userProfile, targetUser);
      setActiveConversation(conv);
      setActiveChatUser(targetUser);
      setCurrentTab('chats');
      setShowNewChatModal(false);
    } catch (err) {
      console.error('Failed to create conversation', err);
      showToast('Error opening conversation');
    }
  };

  // Send message
  const sendMessage = async (
    content: string,
    type: ChatMessage['type'] = 'text',
    mediaUrl?: string,
    meta?: Partial<ChatMessage>
  ) => {
    if (!userProfile || !activeConversation || !activeChatUser) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMsg: ChatMessage = {
      id: messageId,
      conversationId: activeConversation.id,
      senderId: userProfile.uid,
      senderName: userProfile.displayName || userProfile.username,
      receiverId: activeChatUser.uid,
      type,
      content,
      mediaUrl,
      fileName: meta?.fileName,
      fileSize: meta?.fileSize,
      duration: meta?.duration,
      timestamp: Date.now(),
      status: isOnline ? 'sent' : 'sending',
      replyTo: meta?.replyTo,
      isOutgoing: true,
    };

    if (isOnline) {
      try {
        await sendChatMessage(activeConversation.id, newMsg);
      } catch (err) {
        console.warn('Network send failed, enqueueing offline', err);
        offlineQueue.enqueueMessage(newMsg);
        showToast('Saved offline. Will deliver when online.');
      }
    } else {
      offlineQueue.enqueueMessage(newMsg);
      // Also broadcast over BLE if nearby peer
      if (connectedPeer) {
        btService.sendMessage(activeChatUser.uid, content, type, mediaUrl, meta);
      }
      showToast('Message saved offline (Pending sync)');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!activeConversation) return;
    try {
      await deleteChatMessage(activeConversation.id, messageId);
      showToast('Message deleted');
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  // Contact operations
  const addContact = async (targetUser: UserProfile) => {
    if (!userProfile) return;
    try {
      await addContactToUser(userProfile.uid, targetUser);
      showToast(`Added @${targetUser.username} to contacts`);
    } catch (err) {
      console.error('Error adding contact', err);
      showToast('Failed to add contact');
    }
  };

  const removeContact = async (contactUserId: string) => {
    if (!userProfile) return;
    try {
      await removeContactFromUser(userProfile.uid, contactUserId);
      showToast('Contact removed');
    } catch (err) {
      console.error('Error removing contact', err);
    }
  };

  const toggleBlockUser = async (targetUserId: string, isBlocked: boolean) => {
    if (!userProfile) return;
    try {
      await toggleBlockContact(userProfile.uid, targetUserId, isBlocked);
      showToast(isBlocked ? 'User blocked' : 'User unblocked');
    } catch (err) {
      console.error('Error toggling block', err);
    }
  };

  // Status operations
  const postStatus = async (
    type: 'text' | 'image' | 'video',
    content?: string,
    mediaUrl?: string,
    backgroundColor?: string
  ) => {
    if (!userProfile) return;
    const newStatus: UserStatus = {
      id: `status_${userProfile.uid}_${Date.now()}`,
      userId: userProfile.uid,
      userName: userProfile.displayName || userProfile.username,
      userAvatar: userProfile.photoURL,
      type,
      content,
      mediaUrl,
      backgroundColor: backgroundColor || '#2563eb',
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      viewerIds: [],
    };
    try {
      await createUserStatus(newStatus);
      showToast('Status posted (valid for 24h)');
      setShowCreateStatusModal(false);
    } catch (err) {
      console.error('Failed to post status', err);
      showToast('Failed to upload status');
    }
  };

  const viewStatus = async (statusId: string) => {
    if (!userProfile) return;
    await markStatusAsViewed(statusId, userProfile.uid);
  };

  const deleteStatus = async (statusId: string) => {
    try {
      await deleteUserStatus(statusId);
      showToast('Status deleted');
    } catch (err) {
      console.error('Failed to delete status', err);
    }
  };

  // WebRTC Calling implementation
  const startCall = async (targetUser: UserProfile, type: CallType) => {
    if (!userProfile) return;
    try {
      const stream = await callServiceRef.current.getMediaStream(type);
      setLocalStream(stream);
      setIsCallMuted(false);
      setIsVideoEnabled(type === 'video');

      const callId = await callServiceRef.current.startCall(
        userProfile,
        targetUser,
        type,
        (rStream) => setRemoteStream(rStream),
        () => {
          setActiveCall(null);
          setLocalStream(null);
          setRemoteStream(null);
          showToast('Call ended');
        }
      );

      setActiveCall({ callId, targetUser, type });
    } catch (err) {
      console.error('Failed to initiate call', err);
      showToast('Camera / Microphone access denied or unavailable');
    }
  };

  const answerIncomingCall = async () => {
    if (!incomingCall || !userProfile) return;
    try {
      const stream = await callServiceRef.current.getMediaStream(incomingCall.type);
      setLocalStream(stream);

      const callerProfile: UserProfile = {
        uid: incomingCall.callerId,
        displayName: incomingCall.callerName,
        username: incomingCall.callerName.toLowerCase().replace(/\s/g, '_'),
        photoURL: incomingCall.callerAvatar,
        isOnline: true,
        lastSeen: Date.now(),
        createdAt: Date.now(),
      };

      await callServiceRef.current.answerCall(
        incomingCall.id,
        incomingCall,
        (rStream) => setRemoteStream(rStream),
        () => {
          setActiveCall(null);
          setLocalStream(null);
          setRemoteStream(null);
          showToast('Call ended');
        }
      );

      setActiveCall({
        callId: incomingCall.id,
        record: incomingCall,
        targetUser: callerProfile,
        type: incomingCall.type,
      });
      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to answer call', err);
      showToast('Could not access microphone/camera');
      if (incomingCall) {
        await callServiceRef.current.declineCall(incomingCall.id);
      }
      setIncomingCall(null);
    }
  };

  const declineIncomingCall = async () => {
    if (!incomingCall) return;
    await callServiceRef.current.declineCall(incomingCall.id);
    setIncomingCall(null);
    showToast('Call declined');
  };

  const endCall = async () => {
    if (activeCall) {
      await callServiceRef.current.endCall(activeCall.callId);
    }
    setActiveCall(null);
    setLocalStream(null);
    setRemoteStream(null);
  };

  const toggleMute = () => {
    const nextState = !isCallMuted;
    setIsCallMuted(nextState);
    callServiceRef.current.toggleAudio(!nextState);
  };

  const toggleVideo = () => {
    const nextState = !isVideoEnabled;
    setIsVideoEnabled(nextState);
    callServiceRef.current.toggleVideo(nextState);
  };

  // Nearby discovery
  const startScanning = () => {
    setIsScanning(true);
    btService.startDiscovery();
    showToast('Scanning 2.4 GHz Bluetooth spectrum & local mesh...');
  };

  const stopScanning = () => {
    setIsScanning(false);
    btService.stopDiscovery();
  };

  const hardwareScan = async () => {
    showToast('Requesting real Web Bluetooth hardware peripheral...');
    const hwDevice = await btService.scanHardwareWebBluetooth();
    if (hwDevice) {
      setNearbyPeers((prev) => [hwDevice, ...prev.filter((p) => p.id !== hwDevice.id)]);
      showToast(`Paired with ${hwDevice.name}`);
    }
  };

  const connectToPeer = (peer: PeerDevice) => {
    setNearbyPeers((prev) =>
      prev.map((p) => (p.id === peer.id ? { ...p, status: 'connecting' } : p))
    );
    btService.requestConnection(peer);
    showToast(`Sent connection request to ${peer.name}`);
  };

  const disconnectPeer = (peerId: string) => {
    setNearbyPeers((prev) =>
      prev.map((p) => (p.id === peerId ? { ...p, status: 'available' } : p))
    );
    if (connectedPeer?.id === peerId) {
      setConnectedPeer(null);
    }
    showToast('Disconnected Bluetooth link');
  };

  const acceptConnectionRequest = (req: ConnectionRequest) => {
    btService.respondToConnection(req.fromPeer.id, true);
    setIncomingConnectionRequest(null);
    setConnectedPeer({ ...req.fromPeer, status: 'connected' });
    showToast(`Connected to ${req.fromPeer.name}`);
  };

  const declineConnectionRequest = (req: ConnectionRequest) => {
    btService.respondToConnection(req.fromPeer.id, false);
    setIncomingConnectionRequest(null);
    showToast('Declined connection');
  };

  // Files
  const sendFileToPeer = async (targetPeer: PeerDevice, file: File) => {
    showToast(`Sending ${file.name} to ${targetPeer.name}...`);
    const transfer = await btService.sendFile(targetPeer, file, (progress, speed, bytes) => {
      setTransfers((prev) => {
        const itemIdx = prev.findIndex((t) => t.fileName === file.name && t.peerId === targetPeer.id);
        if (itemIdx >= 0) {
          const copy = [...prev];
          copy[itemIdx] = { ...copy[itemIdx], progress, speedMbps: speed, bytesTransferred: bytes };
          return copy;
        }
        return prev;
      });
    });

    setTransfers((prev) => {
      const updated = [transfer, ...prev.filter((t) => t.id !== transfer.id)];
      localDb.saveTransfers(updated);
      return updated;
    });
    showToast(`Transferred ${file.name} successfully!`);
  };

  const clearTransfers = () => {
    localDb.clearTransfers();
    setTransfers([]);
    showToast('Transfer history cleared');
  };

  const updatePermissions = (updates: Partial<AppPermissions>) => {
    const updated = { ...permissions, ...updates };
    setPermissions(updated);
    localDb.savePermissions(updated);
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        conversations,
        activeConversation,
        setActiveConversation,
        activeChatUser,
        setActiveChatUser,
        activeMessages,
        sendMessage,
        deleteMessage,
        startChatWithUser,
        contacts,
        addContact,
        removeContact,
        toggleBlockUser,
        statuses,
        postStatus,
        viewStatus,
        deleteStatus,
        activeCall,
        incomingCall,
        localStream,
        remoteStream,
        isCallMuted,
        isVideoEnabled,
        startCall,
        answerIncomingCall,
        declineIncomingCall,
        endCall,
        toggleMute,
        toggleVideo,
        nearbyPeers,
        connectedPeer,
        isScanning,
        startScanning,
        stopScanning,
        hardwareScan,
        connectToPeer,
        disconnectPeer,
        incomingConnectionRequest,
        acceptConnectionRequest,
        declineConnectionRequest,
        transfers,
        sendFileToPeer,
        clearTransfers,
        isOnline,
        permissions,
        updatePermissions,
        toastMessage,
        showToast,
        theme,
        setTheme,
        showPermissionsModal,
        setShowPermissionsModal,
        showNewChatModal,
        setShowNewChatModal,
        showCreateStatusModal,
        setShowCreateStatusModal,
        activeStoryToView,
        setActiveStoryToView,
        showPrivacyPolicy,
        setShowPrivacyPolicy,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
