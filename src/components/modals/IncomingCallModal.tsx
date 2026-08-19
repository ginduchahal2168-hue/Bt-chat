import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IncomingCallModal: React.FC = () => {
  const { incomingCall, answerIncomingCall, declineIncomingCall } = useApp();

  if (!incomingCall) return null;

  return (
    <AnimatePresence>
      <div id="incoming-call-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center shadow-2xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none animate-pulse" />

          {/* Caller Avatar */}
          <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl shadow-blue-500/20 mb-4 animate-bounce">
            {incomingCall.callerAvatar ? (
              <img
                src={incomingCall.callerAvatar}
                alt={incomingCall.callerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">{incomingCall.callerName}</h3>
          <p className="text-xs text-blue-400 font-medium mt-1 flex items-center justify-center gap-1.5">
            {incomingCall.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call...
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {/* Decline */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                id="btn-decline-incoming-call"
                onClick={declineIncomingCall}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition transform active:scale-95"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <span className="text-xs text-neutral-400 font-medium">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                id="btn-accept-incoming-call"
                onClick={answerIncomingCall}
                className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-600/30 transition transform active:scale-95 animate-pulse"
              >
                {incomingCall.type === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
              </button>
              <span className="text-xs text-neutral-400 font-medium">Accept</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
