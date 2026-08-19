import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { HomeScreen } from './components/screens/HomeScreen';
import { ChatsScreen } from './components/screens/ChatsScreen';
import { NearbyScreen } from './components/screens/NearbyScreen';
import { CallsScreen } from './components/screens/CallsScreen';
import { StatusScreen } from './components/screens/StatusScreen';
import { ContactsScreen } from './components/screens/ContactsScreen';
import { FilesScreen } from './components/screens/FilesScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { AuthModal } from './components/modals/AuthModal';
import { CallModal } from './components/modals/CallModal';
import { IncomingCallModal } from './components/modals/IncomingCallModal';
import { NewChatModal } from './components/modals/NewChatModal';
import { CreateStatusModal } from './components/modals/CreateStatusModal';
import { StoryViewerModal } from './components/modals/StoryViewerModal';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentTab, toastMessage, isOnline, incomingConnectionRequest, acceptConnectionRequest, declineConnectionRequest } = useApp();

  return (
    <div className="relative w-full h-screen bg-neutral-950 text-neutral-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-3 py-1 text-center text-xs text-amber-300 font-medium flex items-center justify-center gap-1.5 z-30">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active • Bluetooth Mesh P2P Channels Operating</span>
        </div>
      )}

      {/* Incoming Bluetooth Connection Alert */}
      <AnimatePresence>
        {incomingConnectionRequest && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-50 p-3.5 bg-neutral-900 border border-blue-500/50 rounded-2xl shadow-2xl flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">
                Connection Request from {incomingConnectionRequest.fromPeer.name}
              </h4>
              <p className="text-[10px] text-neutral-400">Direct Bluetooth P2P pairing</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => declineConnectionRequest(incomingConnectionRequest)}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs"
              >
                Decline
              </button>
              <button
                onClick={() => acceptConnectionRequest(incomingConnectionRequest)}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Accept
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Router */}
      <main className="flex-1 flex flex-col overflow-hidden max-w-md mx-auto w-full">
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'chats' && <ChatsScreen />}
        {currentTab === 'nearby' && <NearbyScreen />}
        {currentTab === 'calls' && <CallsScreen />}
        {currentTab === 'status' && <StatusScreen />}
        {currentTab === 'contacts' && <ContactsScreen />}
        {currentTab === 'files' && <FilesScreen />}
        {currentTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Interactive Global Modals */}
      <AuthModal />
      <CallModal />
      <IncomingCallModal />
      <NewChatModal />
      <CreateStatusModal />
      <StoryViewerModal />

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-900/95 border border-neutral-700/80 text-white text-xs font-medium rounded-full shadow-2xl backdrop-blur-md max-w-xs text-center truncate"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
