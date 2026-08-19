import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bluetooth, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastSnackbar: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-50 pointer-events-none flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="bg-neutral-900/95 border border-neutral-700/80 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center space-x-2.5 text-xs font-medium max-w-sm pointer-events-auto"
        >
          <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400">
            <Bluetooth className="w-3.5 h-3.5" />
          </div>
          <span className="truncate">{toastMessage}</span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
