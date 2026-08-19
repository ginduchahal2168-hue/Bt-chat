import React, { useState, useEffect } from 'react';
import { WifiOff, Bluetooth, Battery, BatteryCharging, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AndroidStatusBar: React.FC = () => {
  const { isBluetoothOn } = useApp();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-8 px-4 flex items-center justify-between text-neutral-400 text-xs font-mono select-none bg-neutral-950 border-b border-neutral-900/60 sticky top-0 z-30">
      {/* Left: Clock */}
      <span className="font-semibold text-neutral-200">{time || '09:41'}</span>

      {/* Center: Offline Security Status */}
      <div className="flex items-center space-x-1 text-[11px] text-teal-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="font-medium tracking-tight">Offline BLE</span>
      </div>

      {/* Right: Icons (No WiFi, Bluetooth, Battery) */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center text-rose-400" title="Airplane Mode / Zero Internet">
          <WifiOff className="w-3.5 h-3.5" />
        </div>

        <div
          className={`flex items-center ${isBluetoothOn ? 'text-blue-400' : 'text-neutral-600'}`}
          title={isBluetoothOn ? 'Bluetooth Radio Active' : 'Bluetooth OFF'}
        >
          <Bluetooth className="w-3.5 h-3.5" />
        </div>

        <div className="flex items-center space-x-1 text-neutral-300">
          <span className="text-[10px]">85%</span>
          <Battery className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
