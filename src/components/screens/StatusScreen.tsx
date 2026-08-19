import React from 'react';
import { motion } from 'motion/react';
import { Plus, Clock, Sparkles, User, Trash2, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const StatusScreen: React.FC = () => {
  const {
    statuses,
    setShowCreateStatusModal,
    setActiveStoryToView,
    deleteStatus,
    showToast,
  } = useApp();

  const { userProfile, firebaseUser, setShowAuthModal } = useAuth();

  const myStatuses = statuses.filter((s) => s.userId === userProfile?.uid);
  const otherStatuses = statuses.filter((s) => s.userId !== userProfile?.uid);

  return (
    <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Status Stories</h2>
          <p className="text-xs text-neutral-400">Ephemeral 24-hour visual updates</p>
        </div>

        <button
          id="btn-create-status"
          onClick={() => {
            if (!firebaseUser) setShowAuthModal(true);
            else setShowCreateStatusModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Status</span>
        </button>
      </div>

      {/* My Status Section */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase text-neutral-400 tracking-wider px-1">My Status</span>

        <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
          <div
            onClick={() => {
              if (myStatuses.length > 0) setActiveStoryToView(myStatuses[0]);
              else if (firebaseUser) setShowCreateStatusModal(true);
              else setShowAuthModal(true);
            }}
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-full overflow-hidden p-0.5 ${
                  myStatuses.length > 0
                    ? 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500'
                    : 'bg-neutral-800 border border-neutral-700'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
              {myStatuses.length === 0 && (
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border-2 border-neutral-900">
                  +
                </span>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">My Status</h4>
              <p className="text-xs text-neutral-400">
                {myStatuses.length > 0
                  ? `${myStatuses.length} active updates • Tap to view`
                  : 'Tap to add status update (valid for 24h)'}
              </p>
            </div>
          </div>

          {myStatuses.length > 0 && (
            <button
              onClick={() => deleteStatus(myStatuses[0].id)}
              className="p-2 rounded-lg text-red-400 hover:bg-neutral-800 transition"
              title="Delete current status"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recent Updates from Contacts / Network */}
      <div className="space-y-2.5">
        <span className="text-xs font-semibold uppercase text-neutral-400 tracking-wider px-1">
          Recent Updates ({otherStatuses.length})
        </span>

        {otherStatuses.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-neutral-600 mx-auto" />
            <h4 className="text-sm font-medium text-neutral-300">No status updates yet</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              When people in your contacts or network post stories, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {otherStatuses.map((status) => {
              const isViewed = userProfile && status.viewerIds?.includes(userProfile.uid);

              return (
                <div
                  key={status.id}
                  onClick={() => setActiveStoryToView(status)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-900/70 hover:bg-neutral-850 border border-neutral-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full p-0.5 ${
                        isViewed
                          ? 'bg-neutral-700'
                          : 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-pink-500'
                      }`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
                        {status.userAvatar ? (
                          <img src={status.userAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-neutral-800">
                            {status.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white">{status.userName}</h4>
                      <p className="text-xs text-neutral-400">
                        {new Date(status.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>24h</span>
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
