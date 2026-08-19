import React from 'react';
import { motion } from 'motion/react';
import {
  Radio,
  Bluetooth,
  Wifi,
  Share2,
  Smartphone,
  Check,
  Zap,
  ArrowUpRight,
  Shield,
  RefreshCw,
  Signal,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PeerDevice } from '../../types';

export const NearbyScreen: React.FC = () => {
  const {
    nearbyPeers,
    connectedPeer,
    isScanning,
    startScanning,
    stopScanning,
    hardwareScan,
    connectToPeer,
    disconnectPeer,
    sendFileToPeer,
    showToast,
  } = useApp();

  const { userProfile } = useAuth();

  const handleFileSelectForPeer = (peer: PeerDevice) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await sendFileToPeer(peer, file);
      }
    };
    input.click();
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            Nearby Bluetooth Mesh
          </h2>
          <p className="text-xs text-neutral-400">Zero-Internet P2P offline communication</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-hw-scan"
            onClick={hardwareScan}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-blue-400 border border-neutral-700 transition"
            title="Scan Web Bluetooth Hardware"
          >
            <Bluetooth className="w-4 h-4" />
          </button>

          <button
            id="btn-scan-nearby"
            onClick={isScanning ? stopScanning : startScanning}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              isScanning
                ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Nearby'}
          </button>
        </div>
      </div>

      {/* Interactive Radar Visualizer */}
      <div className="relative w-full h-56 rounded-3xl bg-radial from-blue-950/40 via-neutral-900 to-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden">
        {/* Radar Concentric Rings */}
        <div className="absolute w-44 h-44 rounded-full border border-blue-500/20" />
        <div className="absolute w-32 h-32 rounded-full border border-blue-500/30" />
        <div className="absolute w-20 h-20 rounded-full border border-blue-500/40" />

        {/* Sweep radar beam if scanning */}
        {isScanning && (
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/10 to-transparent animate-spin origin-center" />
        )}

        {/* Center Beacon: My Device */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/40 border-2 border-white/40 animate-pulse">
            <Smartphone className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-white mt-1.5">
            {userProfile?.displayName || 'My Device'}
          </span>
          <span className="text-[10px] text-blue-400">Broadcasting BLE Beacon</span>
        </div>

        {/* Discovered nearby peer blips */}
        {nearbyPeers.map((peer, idx) => {
          const angle = (idx * (360 / Math.max(1, nearbyPeers.length))) * (Math.PI / 180);
          const radius = 70;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={peer.id}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="absolute z-20 flex flex-col items-center group cursor-pointer"
              onClick={() => connectToPeer(peer)}
            >
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg border border-white/60 group-hover:scale-125 transition">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-semibold text-white bg-black/60 px-1 rounded mt-0.5 whitespace-nowrap">
                {peer.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Discovered Devices List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">
            Discovered Devices ({nearbyPeers.length})
          </span>
          <span className="text-[11px] text-neutral-500">2.4 GHz BLE Frequency</span>
        </div>

        {nearbyPeers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-3">
            <Radio className="w-8 h-8 text-neutral-600 mx-auto animate-pulse" />
            <div>
              <h4 className="text-sm font-medium text-neutral-300">No nearby devices found</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                Open this app in another browser tab or on another phone nearby to test real-time P2P mesh discovery.
              </p>
            </div>
            <button
              onClick={hardwareScan}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-blue-400 border border-neutral-700 rounded-xl text-xs font-semibold transition"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              Scan Hardware Web Bluetooth
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {nearbyPeers.map((peer) => {
              const isConnected = connectedPeer?.id === peer.id;

              return (
                <div
                  key={peer.id}
                  className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold">
                        {peer.avatar ? (
                          <img src={peer.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <Smartphone className="w-5 h-5 text-blue-400" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {peer.name}
                          {peer.isRealLiveTab && (
                            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-md font-normal">
                              Live Peer
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Signal className="w-3 h-3 text-blue-400" /> {peer.rssi} dBm
                          </span>
                          <span>•</span>
                          <span>~{peer.distanceMeters}m away</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-semibold">
                            Connected
                          </span>
                          <button
                            onClick={() => disconnectPeer(peer.id)}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-lg text-xs"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => connectToPeer(peer)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions when connected */}
                  {isConnected && (
                    <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2">
                      <button
                        onClick={() => handleFileSelectForPeer(peer)}
                        className="flex-1 py-2 px-3 bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-neutral-700"
                      >
                        <Share2 className="w-3.5 h-3.5 text-blue-400" />
                        Beam File (P2P)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
