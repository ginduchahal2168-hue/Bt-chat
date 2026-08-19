import React from 'react';
import { Home, MessageSquare, Radio, Phone, Sparkles, Users, Share2, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { TabType } from '../../types';

export const BottomNavigation: React.FC = () => {
  const { currentTab, setCurrentTab, conversations, nearbyPeers, statuses, activeConversation } = useApp();
  const { userProfile } = useAuth();

  // If inside active conversation chat detail, hide bottom nav for full mobile immersion
  if (activeConversation) return null;

  const unreadTotal = conversations.reduce((acc, conv) => {
    if (userProfile && conv.unreadCounts?.[userProfile.uid]) {
      return acc + conv.unreadCounts[userProfile.uid];
    }
    return acc;
  }, 0);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'chats', label: 'Chats', icon: <MessageSquare className="w-5 h-5" />, badge: unreadTotal },
    { id: 'nearby', label: 'Nearby', icon: <Radio className="w-5 h-5" />, badge: nearbyPeers.length },
    { id: 'calls', label: 'Calls', icon: <Phone className="w-5 h-5" /> },
    { id: 'status', label: 'Status', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'contacts', label: 'Contacts', icon: <Users className="w-5 h-5" /> },
    { id: 'files', label: 'Files', icon: <Share2 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div
      id="bottom-nav-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800/80 px-2 py-1.5"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                isActive ? 'text-blue-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center border border-neutral-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-3 h-0.5 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
