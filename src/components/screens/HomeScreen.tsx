import React from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  Radio,
  Share2,
  Phone,
  Shield,
  Wifi,
  WifiOff,
  UserPlus,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  Lock,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const HomeScreen: React.FC = () => {
  const {
    setCurrentTab,
    conversations,
    setActiveConversation,
    setActiveChatUser,
    statuses,
    setShowCreateStatusModal,
    setActiveStoryToView,
    nearbyPeers,
    isScanning,
    startScanning,
    stopScanning,
    setShowNewChatModal,
    isOnline,
  } = useApp();

  const { userProfile, firebaseUser, setShowAuthModal } = useAuth();

  const unreadTotal = conversations.reduce((acc, conv) => {
    if (userProfile && conv.unreadCounts?.[userProfile.uid]) {
      return acc + conv.unreadCounts[userProfile.uid];
    }
    return acc;
  }, 0);

  return (
    <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-5">
      {/* Header Profile Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              if (!firebaseUser) setShowAuthModal(true);
              else setCurrentTab('settings');
            }}
            className="relative cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-neutral-800 border-2 border-blue-500/40 p-0.5 shadow-md group-hover:border-blue-400 transition">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-neutral-900 ${
                isOnline ? 'bg-green-500' : 'bg-amber-500'
              }`}
            />
          </div>

          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              {userProfile?.displayName || 'Welcome to BlueMesh'}
              {userProfile && <span className="text-xs font-normal text-blue-400">(@{userProfile.username})</span>}
            </h1>
            <p className="text-xs text-neutral-400 flex items-center gap-1.5">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 font-medium">Online (Cloud & Sync Active)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400 font-medium">Offline Mode (Bluetooth Mesh Only)</span>
                </>
              )}
            </p>
          </div>
        </div>

        {!firebaseUser ? (
          <button
            id="btn-home-signin"
            onClick={() => setShowAuthModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20"
          >
            Sign In
          </button>
        ) : (
          <button
            id="btn-home-newchat"
            onClick={() => setShowNewChatModal(true)}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition"
            title="Start Chat"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 24-Hour Status / Stories Reel */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Status Updates</span>
          <button
            onClick={() => setCurrentTab('status')}
            className="text-xs text-blue-400 hover:underline font-medium"
          >
            View All
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {/* Add My Status Button */}
          <div
            onClick={() => {
              if (!firebaseUser) setShowAuthModal(true);
              else setShowCreateStatusModal(true);
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
          >
            <div className="relative w-14 h-14 rounded-2xl bg-neutral-800/80 border-2 border-dashed border-neutral-700 hover:border-blue-500 flex items-center justify-center text-blue-400 transition group">
              <Plus className="w-6 h-6 group-hover:scale-110 transition" />
            </div>
            <span className="text-[11px] font-medium text-neutral-300">Add Story</span>
          </div>

          {/* Real user stories */}
          {statuses.map((status) => (
            <div
              key={status.id}
              onClick={() => setActiveStoryToView(status)}
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group"
            >
              <div className="w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500 group-hover:scale-105 transition shadow-sm">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-neutral-900 border border-neutral-900">
                  {status.userAvatar ? (
                    <img src={status.userAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-neutral-800">
                      {status.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-medium text-neutral-300 max-w-[60px] truncate">
                {status.userName.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          id="btn-quick-chats"
          onClick={() => setCurrentTab('chats')}
          className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-blue-500/40 hover:bg-neutral-850 flex flex-col justify-between transition group text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
            {unreadTotal > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                {unreadTotal}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Direct Chats</h3>
            <p className="text-[11px] text-neutral-400">{conversations.length} Active chats</p>
          </div>
        </button>

        <button
          id="btn-quick-nearby"
          onClick={() => setCurrentTab('nearby')}
          className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-purple-500/40 hover:bg-neutral-850 flex flex-col justify-between transition group text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <Radio className="w-5 h-5" />
            </div>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Bluetooth Mesh</h3>
            <p className="text-[11px] text-neutral-400">{nearbyPeers.length} Discovered</p>
          </div>
        </button>

        <button
          id="btn-quick-calls"
          onClick={() => setCurrentTab('calls')}
          className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-green-500/40 hover:bg-neutral-850 flex flex-col justify-between transition group text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400 group-hover:scale-110 transition">
              <Phone className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">WebRTC Calls</h3>
            <p className="text-[11px] text-neutral-400">Audio & Video</p>
          </div>
        </button>

        <button
          id="btn-quick-files"
          onClick={() => setCurrentTab('files')}
          className="p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/40 hover:bg-neutral-850 flex flex-col justify-between transition group text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">P2P File Beam</h3>
            <p className="text-[11px] text-neutral-400">Zero Internet</p>
          </div>
        </button>
      </div>

      {/* Bluetooth Mesh Radar Mini Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-neutral-900 border border-blue-900/30 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
                Local 2.4GHz Bluetooth Mesh
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">
              {isScanning ? 'Actively Scanning Nearby Spectrum...' : 'Offline P2P Discovery Ready'}
            </h4>
            <p className="text-xs text-neutral-400 max-w-xs">
              Chat & transfer files directly with phones nearby without cellular, Wi-Fi or data plans.
            </p>
          </div>

          <button
            id="btn-toggle-radar-scan"
            onClick={isScanning ? stopScanning : startScanning}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
              isScanning
                ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
            }`}
          >
            {isScanning ? 'Stop Scan' : 'Scan Radar'}
          </button>
        </div>
      </div>

      {/* Recent Conversations Reel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Recent Chats</span>
          <button
            onClick={() => setCurrentTab('chats')}
            className="text-xs text-blue-400 hover:underline font-medium flex items-center gap-1"
          >
            All Chats <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {conversations.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto" />
            <h4 className="text-sm font-medium text-neutral-300">No conversations yet</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Start chatting by searching for registered users or discovering nearby devices.
            </p>
            <button
              onClick={() => {
                if (!firebaseUser) setShowAuthModal(true);
                else setShowNewChatModal(true);
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Find Someone to Chat
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.slice(0, 4).map((conv) => {
              const otherUserId = conv.participantIds.find((id) => id !== userProfile?.uid) || '';
              const otherDetails = conv.participantDetails?.[otherUserId];
              const unread = userProfile && conv.unreadCounts?.[userProfile.uid] ? conv.unreadCounts[userProfile.uid] : 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (otherDetails) {
                      setActiveConversation(conv);
                      setActiveChatUser({
                        uid: otherUserId,
                        displayName: otherDetails.displayName,
                        username: otherDetails.username,
                        photoURL: otherDetails.photoURL,
                        isOnline: otherDetails.isOnline || false,
                        lastSeen: otherDetails.lastSeen || Date.now(),
                        createdAt: Date.now(),
                      });
                      setCurrentTab('chats');
                    }
                  }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700">
                      {otherDetails?.photoURL ? (
                        <img src={otherDetails.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">
                          {otherDetails?.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      {otherDetails?.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-neutral-900" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white">{otherDetails?.displayName || 'Chat'}</h4>
                      <p className="text-xs text-neutral-400 max-w-[200px] truncate">
                        {conv.lastMessageText || 'Tap to start talking'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-[10px] text-neutral-500">
                      {conv.lastMessageTimestamp
                        ? new Date(conv.lastMessageTimestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Zero Cloud & End-to-End Security Guarantee */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span>Real-time End-to-End Cryptography Active</span>
        </div>
        <Lock className="w-3.5 h-3.5 text-neutral-500" />
      </div>
    </div>
  );
};
