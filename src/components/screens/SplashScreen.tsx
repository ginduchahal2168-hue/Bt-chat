import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Bluetooth, ShieldCheck, WifiOff, Radio } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-between p-8 text-neutral-100 select-none max-w-md mx-auto">
      <div />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center space-y-4"
      >
        {/* Animated App Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-1 flex items-center justify-center shadow-2xl shadow-blue-500/40 border border-blue-400/40">
            <Bluetooth className="w-12 h-12 text-white animate-pulse" />
          </div>

          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl border-2 border-blue-400 pointer-events-none"
          />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">BlueMesh</h1>
          <p className="text-sm font-medium text-neutral-400 mt-1">
            Offline Bluetooth Social Mesh
          </p>
        </div>

        {/* Offline Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <WifiOff className="w-3.5 h-3.5" />
          <span>100% Zero Internet Mode</span>
        </div>
      </motion.div>

      {/* Footer Specs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col items-center space-y-2 text-center"
      >
        <div className="flex items-center space-x-2 text-xs font-mono text-neutral-400">
          <Radio className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span>Initializing 2.4 GHz RF Stack...</span>
        </div>
        <p className="text-[10px] text-neutral-400 font-mono">
          AES-256 GCM P2P • Direct Device-to-Device Link
        </p>
      </motion.div>
    </div>
  );
};
