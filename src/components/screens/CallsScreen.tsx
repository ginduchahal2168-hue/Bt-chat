import React from 'react';
import { motion } from 'motion/react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';

export const CallsScreen: React.FC = () => {
  const { contacts, startCall, showToast } = useApp();
  const { userProfile } = useAuth();

  const handleLaunchCall = (contactUser: UserProfile, type: 'audio' | 'video') => {
    startCall(contactUser, type);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-400" />
            Calls
          </h2>
          <p className="text-xs text-neutral-400">Encrypted WebRTC P2P Voice & Video</p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>STUN / WebRTC P2P</span>
        </div>
      </div>

      {/* Direct Call to Contacts */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase text-neutral-400 tracking-wider px-1">
          Direct Call Contacts ({contacts.length})
        </span>

        {contacts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-2">
            <Phone className="w-8 h-8 text-neutral-600 mx-auto" />
            <h4 className="text-sm font-medium text-neutral-300">No contacts saved yet</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Add contacts from the Contacts tab to make instant one-touch WebRTC voice & video calls.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => {
              const u: UserProfile = {
                uid: c.contactUserId,
                displayName: c.displayName,
                username: c.username,
                photoURL: c.photoURL,
                bio: c.bio,
                isOnline: true,
                lastSeen: Date.now(),
                createdAt: c.addedAt,
              };

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700">
                      {c.photoURL ? (
                        <img src={c.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {c.displayName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white">{c.displayName}</h4>
                      <p className="text-xs text-neutral-400">@{c.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLaunchCall(u, 'audio')}
                      className="p-2.5 rounded-xl bg-neutral-800 hover:bg-green-600 text-green-400 hover:text-white transition shadow-sm"
                      title="Audio Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleLaunchCall(u, 'video')}
                      className="p-2.5 rounded-xl bg-neutral-800 hover:bg-blue-600 text-blue-400 hover:text-white transition shadow-sm"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400 space-y-1">
        <p className="font-semibold text-neutral-300">WebRTC Direct Media Stream</p>
        <p>Audio and video streams are transmitted peer-to-peer using DTLS/SRTP encryption standards.</p>
      </div>
    </div>
  );
};
