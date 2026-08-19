import React from 'react';
import { WifiOff, Radio, ShieldCheck } from 'lucide-react';

interface OfflineBadgeProps {
  size?: 'sm' | 'md';
  showDetail?: boolean;
}

export const OfflineBadge: React.FC<OfflineBadgeProps> = ({ size = 'md', showDetail = true }) => {
  if (size === 'sm') {
    return (
      <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
        <Radio className="w-3 h-3 animate-pulse" />
        <span>100% Offline</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <WifiOff className="w-4 h-4" />
      </div>
      <div>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold text-white">Offline Mode Active</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        {showDetail && (
          <p className="text-[10px] text-neutral-400 font-mono">
            Zero Internet • Local Bluetooth 2.4 GHz
          </p>
        )}
      </div>
    </div>
  );
};
