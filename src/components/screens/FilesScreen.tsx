import React from 'react';
import { motion } from 'motion/react';
import { Share2, Download, Trash2, FileText, Image as ImageIcon, Video, Music, Archive, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFileSize } from '../../services/mediaService';
import { FileTransferItem } from '../../types';

export const FilesScreen: React.FC = () => {
  const { transfers, clearTransfers, showToast } = useApp();

  const getFileIcon = (type: FileTransferItem['fileType']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-400" />;
      case 'audio':
        return <Music className="w-5 h-5 text-pink-400" />;
      case 'archive':
      case 'apk':
        return <Archive className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            P2P File Beam
          </h2>
          <p className="text-xs text-neutral-400">Direct Bluetooth & local Wi-Fi direct file transfers</p>
        </div>

        {transfers.length > 0 && (
          <button
            onClick={clearTransfers}
            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-red-400 rounded-xl text-xs transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* History List */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase text-neutral-400 tracking-wider px-1">
          Transfer History ({transfers.length})
        </span>

        {transfers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-2">
            <Share2 className="w-8 h-8 text-neutral-600 mx-auto" />
            <h4 className="text-sm font-medium text-neutral-300">No file transfers yet</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              You can send photos, videos, and documents directly to nearby Bluetooth devices from the Nearby tab or in
              chats.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {transfers.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                      {getFileIcon(item.fileType)}
                    </div>
                    <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                      <h4 className="text-sm font-semibold text-white truncate">{item.fileName}</h4>
                      <p className="text-xs text-neutral-400">
                        {formatFileSize(item.fileSize)} • {item.direction === 'incoming' ? 'From' : 'To'}{' '}
                        <span className="text-neutral-300 font-medium">{item.peerName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'completed' && item.dataUrl && (
                      <a
                        href={item.dataUrl}
                        download={item.fileName}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-blue-400 hover:text-white transition"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress bar if transferring */}
                {item.status === 'transferring' && (
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-150"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>{item.progress}%</span>
                      <span>{item.speedMbps} MB/s</span>
                    </div>
                  </div>
                )}

                {item.status === 'completed' && (
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/60">
                    <span className="flex items-center gap-1 text-green-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Transfer Completed
                    </span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
