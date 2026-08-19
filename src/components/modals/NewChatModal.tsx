import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, User, MessageSquare, UserCheck, AlertCircle, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { searchUsers } from '../../services/userService';
import { UserProfile } from '../../types';

export const NewChatModal: React.FC = () => {
  const { showNewChatModal, setShowNewChatModal, startChatWithUser, contacts, addContact } = useApp();
  const { userProfile } = useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!showNewChatModal) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !userProfile) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const users = await searchUsers(query, userProfile.uid);
      setResults(users);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AnimatePresence>
      <div id="new-chat-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h3 className="text-base font-semibold text-white">Start New Chat</h3>
            <button
              id="close-new-chat-modal"
              onClick={() => setShowNewChatModal(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-neutral-800/80">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
              <input
                id="search-user-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!e.target.value) {
                    setResults([]);
                    setHasSearched(false);
                  }
                }}
                placeholder="Search by @username, name, or email..."
                className="w-full bg-neutral-800/80 border border-neutral-700 text-white rounded-xl pl-9 pr-20 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
              />
              <button
                id="btn-search-user"
                type="submit"
                disabled={isSearching || !query.trim()}
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Body: Search Results or Saved Contacts */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {hasSearched ? (
              <div>
                <p className="text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-2">Search Results</p>
                {results.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-400">No registered users found</p>
                    <p className="text-xs text-neutral-500 mt-1">Make sure the username or email is spelled correctly</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {results.map((targetUser) => {
                      const isContact = contacts.some((c) => c.contactUserId === targetUser.uid);
                      return (
                        <div
                          key={targetUser.uid}
                          className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-700 border border-neutral-600">
                              {targetUser.photoURL ? (
                                <img src={targetUser.photoURL} alt={targetUser.displayName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <User className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-white">{targetUser.displayName}</h4>
                              <p className="text-xs text-blue-400">@{targetUser.username}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isContact && (
                              <button
                                onClick={() => addContact(targetUser)}
                                title="Add to Contacts"
                                className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-neutral-300 transition"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => startChatWithUser(targetUser)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Chat
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-2">Saved Contacts</p>
                {contacts.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-400">No contacts yet</p>
                    <p className="text-xs text-neutral-500 mt-1">Search for users above using their @username to start chatting</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contacts.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 hover:bg-neutral-800 border border-neutral-700/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-700 border border-neutral-600">
                            {c.photoURL ? (
                              <img src={c.photoURL} alt={c.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">{c.displayName}</h4>
                            <p className="text-xs text-neutral-400">@{c.username}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
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
                            startChatWithUser(u);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
