import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Type, Sparkles, Upload, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { compressImage } from '../../services/mediaService';

const BG_GRADIENTS = [
  'linear-gradient(135deg, #2563eb, #7c3aed)',
  'linear-gradient(135deg, #db2777, #ea580c)',
  'linear-gradient(135deg, #059669, #0284c7)',
  'linear-gradient(135deg, #4f46e5, #06b6d4)',
  'linear-gradient(135deg, #d97706, #dc2626)',
  'linear-gradient(135deg, #18181b, #27272a)',
];

export const CreateStatusModal: React.FC = () => {
  const { showCreateStatusModal, setShowCreateStatusModal, postStatus, showToast } = useApp();

  const [statusType, setStatusType] = useState<'photo' | 'text'>('photo');
  const [textContent, setTextContent] = useState('');
  const [selectedBg, setSelectedBg] = useState(BG_GRADIENTS[0]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showCreateStatusModal) return null;

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Compressing image...');
      const compressed = await compressImage(file, 1080, 0.8);
      setSelectedImage(compressed);
    } catch (err) {
      console.error('Image compression error', err);
      showToast('Failed to process image');
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      if (statusType === 'photo') {
        if (!selectedImage) {
          showToast('Please select a photo first');
          setIsSubmitting(false);
          return;
        }
        await postStatus('image', photoCaption, selectedImage);
      } else {
        if (!textContent.trim()) {
          showToast('Please write some text for your status');
          setIsSubmitting(false);
          return;
        }
        await postStatus('text', textContent, undefined, selectedBg);
      }
    } catch (err) {
      console.error('Failed to post status', err);
      showToast('Failed to publish status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div id="create-status-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base font-semibold text-white">Create Status</h3>
            </div>
            <button
              id="close-create-status-modal"
              onClick={() => setShowCreateStatusModal(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Selector Tabs */}
          <div className="flex p-2 bg-neutral-950/60 m-4 rounded-xl border border-neutral-800">
            <button
              onClick={() => setStatusType('photo')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                statusType === 'photo' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Photo Status
            </button>
            <button
              onClick={() => setStatusType('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                statusType === 'text' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Type className="w-4 h-4" />
              Text Status
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {statusType === 'photo' ? (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImagePick}
                  className="hidden"
                />

                {selectedImage ? (
                  <div className="relative rounded-2xl overflow-hidden h-64 bg-neutral-950 border border-neutral-800 group">
                    <img src={selectedImage} alt="Status Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-56 rounded-2xl border-2 border-dashed border-neutral-700 hover:border-blue-500 bg-neutral-800/30 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-blue-400 transition"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="text-sm font-medium">Click to select photo</span>
                    <span className="text-xs text-neutral-500">Supports JPG, PNG, WEBP</span>
                  </button>
                )}

                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full bg-neutral-800/80 border border-neutral-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  style={{ background: selectedBg }}
                  className="w-full h-56 rounded-2xl p-4 flex items-center justify-center text-center shadow-inner transition-all duration-300"
                >
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Type a status update..."
                    maxLength={300}
                    rows={4}
                    className="w-full bg-transparent text-white text-xl font-bold text-center resize-none placeholder-white/50 focus:outline-none"
                  />
                </div>

                {/* Color Palette Selector */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {BG_GRADIENTS.map((bg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedBg(bg)}
                      style={{ background: bg }}
                      className={`w-7 h-7 rounded-full border-2 transition transform ${
                        selectedBg === bg ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Status disappears automatically after 24 hours</span>
            </div>

            <button
              id="btn-publish-status"
              onClick={handlePublish}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Post Status'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
