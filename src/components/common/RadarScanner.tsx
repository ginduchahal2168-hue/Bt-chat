import React from 'react';
import { motion } from 'motion/react';
import { Bluetooth, Smartphone, Tablet, Radio } from 'lucide-react';
import { PeerDevice } from '../../types';

interface RadarScannerProps {
  isScanning: boolean;
  peers: PeerDevice[];
  onSelectPeer: (peer: PeerDevice) => void;
}

export const RadarScanner: React.FC<RadarScannerProps> = ({ isScanning, peers, onSelectPeer }) => {
  return (
    <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center select-none">
      {/* Radar concentric circles */}
      <div className="absolute inset-0 rounded-full border border-neutral-800/80 pointer-events-none"></div>
      <div className="absolute inset-8 rounded-full border border-neutral-800/60 pointer-events-none"></div>
      <div className="absolute inset-16 rounded-full border border-neutral-800/40 pointer-events-none"></div>
      <div className="absolute inset-24 rounded-full border border-neutral-800/20 pointer-events-none"></div>

      {/* Axis crosshairs */}
      <div className="absolute w-full h-[1px] bg-neutral-800/40 pointer-events-none"></div>
      <div className="absolute h-full w-[1px] bg-neutral-800/40 pointer-events-none"></div>

      {/* Radar scanning sweep animation */}
      {isScanning && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.25) 60deg, transparent 60.1deg)',
          }}
        />
      )}

      {/* Center device icon (Me) */}
      <div className="relative z-10 w-12 h-12 rounded-full bg-blue-600 border-2 border-blue-400/80 shadow-lg shadow-blue-500/50 flex items-center justify-center text-white">
        <Bluetooth className="w-6 h-6 animate-pulse" />
        <span className="absolute -bottom-5 text-[10px] font-mono font-semibold text-blue-400 bg-neutral-900/80 px-1 rounded">
          You
        </span>
      </div>

      {/* Nearby peers positioned based on RSSI/distance and angle */}
      {peers.map((peer, idx) => {
        // Distribute peers organically
        const angles = [45, 140, 230, 315, 80, 195];
        const angleDeg = angles[idx % angles.length];
        const angleRad = (angleDeg * Math.PI) / 180;

        // Radius scaled by distance (min 45px, max 110px)
        const radius = Math.min(Math.max((peer.distanceMeters / 10) * 80 + 35, 45), 110);
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;

        return (
          <button
            key={peer.id}
            onClick={() => onSelectPeer(peer)}
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
            className="absolute z-20 group cursor-pointer transition-transform hover:scale-125 focus:outline-none"
            title={`${peer.name} (${peer.distanceMeters}m)`}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-neutral-900 border-2 border-emerald-400 p-0.5 shadow-lg overflow-hidden">
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Pulsing indicator */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            {/* Peer Name Tag */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-neutral-900/90 border border-neutral-800 text-[9px] font-mono text-neutral-300 pointer-events-none group-hover:bg-neutral-800 group-hover:text-white">
              {peer.name.split(' ')[0]} ({peer.distanceMeters}m)
            </div>
          </button>
        );
      })}
    </div>
  );
};
