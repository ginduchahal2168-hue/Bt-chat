import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Search, UserPlus, Check, CheckCheck, Clock, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ChatDetailScreen } from './ChatDetailScreen';

export const ChatsScreen: React.FC = () => {
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    setActiveChatUser,
    setShowNewChatModal,
  } = useApp();

  const { userProfile, firebaseUser, setShowAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // If a conversation is active, render full-screen ChatDetailScreen
  if (activeConversation) {
    return <ChatDetailScreen />;
  }

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const otherUserId = conv.participantIds.find((id) => id !== userProfile?.uid) || '';
    const details = conv.participantDetails?.[otherUserId];
    return (
      details?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      details?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessageText?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden pb-20">
      {/* Top Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Messages</h2>
          <p className="text-xs text-neutral-400">Direct encrypted conversations</p>
        </div>

        <button
          id="btn-open-new-chat"
          onClick={() => {
            if (!firebaseUser) setShowAuthModal(true);
            else setShowNewChatModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-neutral-800/60">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredConversations.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-neutral-300">
                {searchQuery ? 'No matching conversations' : 'No conversations yet'}
              </h4>
              <p className="text-xs text-neutral-500 max-w-xs mt-1">
                {searchQuery
                  ? 'Try searching by name or username'
                  : 'Start a chat by searching registered users with @username'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => {
                  if (!firebaseUser) setShowAuthModal(true);
                  else setShowNewChatModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Find Users
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const otherUserId = conv.participantIds.find((id) => id !== userProfile?.uid) || '';
            const otherDetails = conv.participantDetails?.[otherUserId];
            const unread = userProfile && conv.unreadCounts?.[userProfile.uid] ? conv.unreadCounts[userProfile.uid] : 0;
            const isLastMessageMine = conv.lastMessageSenderId === userProfile?.uid;

            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
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
                  }
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/70 hover:bg-neutral-850 border border-neutral-800/80 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700">
                    {otherDetails?.photoURL ? (
                      <img src={otherDetails.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                        {otherDetails?.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    {otherDetails?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-neutral-900" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-white">{otherDetails?.displayName || 'Chat'}</h3>
                    <p className="text-xs text-neutral-400 max-w-[220px] sm:max-w-xs truncate flex items-center gap-1">
                      {isLastMessageMine && <Check className="w-3 h-3 text-neutral-500 shrink-0" />}
                      <span>{conv.lastMessageText || 'Tap to send message'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="text-[10px] text-neutral-500">
                    {conv.lastMessageTimestamp
                      ? new Date(conv.lastMessageTimestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {unread}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
