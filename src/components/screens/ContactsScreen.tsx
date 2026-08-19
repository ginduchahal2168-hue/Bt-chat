import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Search, UserPlus, MessageSquare, Trash2, Ban, Check, User, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { searchUsers } from '../../services/userService';
import { UserProfile } from '../../types';

export const ContactsScreen: React.FC = () => {
  const {
    contacts,
    addContact,
    removeContact,
    toggleBlockUser,
    startChatWithUser,
    showToast,
  } = useApp();

  const { userProfile, firebaseUser, setShowAuthModal } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<UserProfile[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchQuery.trim() || !userProfile) return;

    setIsSearchingGlobal(true);
    try {
      const results = await searchUsers(globalSearchQuery, userProfile.uid);
      setGlobalResults(results);
    } catch (err) {
      console.error('Global user search failed', err);
    } finally {
      setIsSearchingGlobal(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    return (
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Contacts</h2>
          <p className="text-xs text-neutral-400">Manage your address book & registered users</p>
        </div>

        <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-blue-400">
          {contacts.length} Contacts
        </span>
      </div>

      {/* Search Registered Users in Directory (Global Search) */}
      <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <h3 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">
          Find Registered Users Across Directory
        </h3>

        <form onSubmit={handleGlobalSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                if (!e.target.value) setGlobalResults([]);
              }}
              placeholder="Search by @username, email, or name..."
              className="w-full bg-neutral-800/80 border border-neutral-700 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingGlobal || !globalSearchQuery.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
          >
            {isSearchingGlobal ? '...' : 'Search'}
          </button>
        </form>

        {globalResults.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            {globalResults.map((u) => {
              const isAlreadyContact = contacts.some((c) => c.contactUserId === u.uid);
              return (
                <div
                  key={u.uid}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-700">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                          {u.displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{u.displayName}</h4>
                      <p className="text-[10px] text-blue-400">@{u.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isAlreadyContact && (
                      <button
                        onClick={() => addContact(u)}
                        className="px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold hover:bg-blue-600 hover:text-white transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    )}
                    <button
                      onClick={() => startChatWithUser(u)}
                      className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Saved Contacts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">My Contacts</span>
          <div className="relative w-44">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter contacts..."
              className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-2">
            <Users className="w-8 h-8 text-neutral-600 mx-auto" />
            <h4 className="text-sm font-medium text-neutral-300">No contacts in your list</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Search for users above by @username to add them to your contacts.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map((c) => {
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
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {c.displayName}
                        {c.isBlocked && (
                          <span className="px-1.5 py-0.2 bg-red-500/20 text-red-400 text-[10px] rounded font-normal">
                            Blocked
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-neutral-400">@{c.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => startChatWithUser(u)}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
                      title="Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleBlockUser(c.contactUserId, !c.isBlocked)}
                      className={`p-2 rounded-xl border transition ${
                        c.isBlocked
                          ? 'bg-red-500/20 border-red-500/30 text-red-400'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
                      }`}
                      title={c.isBlocked ? 'Unblock user' : 'Block user'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeContact(c.contactUserId)}
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-red-400 transition"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
