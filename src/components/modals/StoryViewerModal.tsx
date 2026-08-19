import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, Trash2, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const StoryViewerModal: React.FC = () => {
  const { activeStoryToView, setActiveStoryToView, viewStatus, deleteStatus } = useApp();
  const { userProfile } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!activeStoryToView) {
      setProgress(0);
      return;
    }

    viewStatus(activeStoryToView.id);

    const DURATION = 6000; // 6 seconds per story
    const INTERVAL = 50;
    const step = (INTERVAL / DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(timer);
          setActiveStoryToView(null);
          return 100;
        }
        return prev + step;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [activeStoryToView]);

  if (!activeStoryToView) return null;

  const isOwnStory = userProfile?.uid === activeStoryToView.userId;

  return (
    <AnimatePresence>
      <div id="story-viewer-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-full max-w-md flex flex-col justify-between overflow-hidden"
          style={{
            background: activeStoryToView.type === 'text' ? activeStoryToView.backgroundColor || '#2563eb' : '#000',
          }}
        >
          {/* Top Progress Bar & User Info */}
          <div className="p-4 z-20 space-y-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* User Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-800 border-2 border-white">
                  {activeStoryToView.userAvatar ? (
                    <img src={activeStoryToView.userAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white leading-tight">{activeStoryToView.userName}</h4>
                  <p className="text-[10px] text-white/70">
                    {new Date(activeStoryToView.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isOwnStory && (
                  <button
                    onClick={async () => {
                      await deleteStatus(activeStoryToView.id);
                      setActiveStoryToView(null);
                    }}
                    className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white transition"
                    title="Delete status"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setActiveStoryToView(null)}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Center Story Content */}
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            {activeStoryToView.type === 'photo' || activeStoryToView.type === 'image' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={activeStoryToView.mediaUrl}
                  alt="Story"
                  className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl"
                />
                {activeStoryToView.content && (
                  <div className="absolute bottom-4 left-0 right-0 p-3 bg-black/60 backdrop-blur-md rounded-xl text-white text-sm">
                    {activeStoryToView.content}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-2xl font-bold text-white leading-relaxed max-w-xs">{activeStoryToView.content}</p>
            )}
          </div>

          {/* Bottom Viewer Count */}
          <div className="p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-2 text-white/80 text-xs font-medium">
            <Eye className="w-4 h-4" />
            <span>{activeStoryToView.viewerIds?.length || 0} views</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
