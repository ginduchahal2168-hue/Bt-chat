import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CallModal: React.FC = () => {
  const {
    activeCall,
    localStream,
    remoteStream,
    isCallMuted,
    isVideoEnabled,
    toggleMute,
    toggleVideo,
    endCall,
  } = useApp();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!activeCall) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCall]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!activeCall) return null;

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isVideoCall = activeCall.type === 'video';

  return (
    <AnimatePresence>
      <div id="active-call-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-full max-w-lg flex flex-col justify-between p-6 overflow-hidden"
        >
          {/* Top Status & Name */}
          <div className="flex flex-col items-center pt-8 z-10">
            <span className="px-3 py-1 bg-neutral-800/80 backdrop-blur-md rounded-full text-xs font-medium text-blue-400 mb-2 border border-neutral-700/50">
              {isVideoCall ? 'WebRTC Encrypted Video Call' : 'WebRTC Encrypted Voice Call'}
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {activeCall.targetUser.displayName || activeCall.targetUser.username}
            </h2>
            <p className="text-sm font-mono text-neutral-400 mt-1">{formatCallTime(callDuration)}</p>
          </div>

          {/* Center Stage: Video or Avatar */}
          <div className="relative flex-1 my-6 flex items-center justify-center rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800">
            {isVideoCall ? (
              <>
                {/* Remote Video Stream */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Local Video Thumbnail Picture-in-Picture */}
                <div className="absolute top-4 right-4 w-28 h-40 bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl z-20">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/40 shadow-2xl shadow-blue-500/20 mb-4 animate-pulse">
                  {activeCall.targetUser.photoURL ? (
                    <img
                      src={activeCall.targetUser.photoURL}
                      alt={activeCall.targetUser.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-neutral-400">High-Fidelity Opus P2P Audio Stream</p>
              </div>
            )}
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-center gap-6 pb-6 z-10">
            {/* Mute toggle */}
            <button
              id="btn-toggle-mute"
              onClick={toggleMute}
              className={`p-4 rounded-full border transition shadow-lg ${
                isCallMuted
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
              }`}
            >
              {isCallMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* End Call button */}
            <button
              id="btn-end-call"
              onClick={endCall}
              className="p-5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/40 transition transform active:scale-95"
            >
              <PhoneOff className="w-7 h-7" />
            </button>

            {/* Video toggle if video call */}
            {isVideoCall && (
              <button
                id="btn-toggle-video"
                onClick={toggleVideo}
                className={`p-4 rounded-full border transition shadow-lg ${
                  !isVideoEnabled
                    ? 'bg-red-500/20 border-red-500/40 text-red-400'
                    : 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700'
                }`}
              >
                {!isVideoEnabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
