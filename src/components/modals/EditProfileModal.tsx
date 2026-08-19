import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, AtSign, FileText, Camera, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { compressImage } from '../../services/mediaService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateProfileData } = useAuth();
  const { showToast } = useApp();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [statusMessage, setStatusMessage] = useState(userProfile?.statusMessage || 'Available');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Compressing avatar...');
      const compressed = await compressImage(file, 250, 0.85);
      setPhotoURL(compressed);
    } catch (err) {
      console.error('Avatar change failed', err);
      showToast('Failed to process avatar');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('Display name is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfileData({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        bio: bio.trim(),
        statusMessage: statusMessage.trim(),
        photoURL,
      });
      showToast('Profile updated successfully');
      onClose();
    } catch (err) {
      console.error('Failed to update profile', err);
      showToast('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div id="edit-profile-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h3 className="text-base font-semibold text-white">Edit Profile</h3>
            <button
              id="close-edit-profile-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-5 space-y-4">
            {/* Avatar Selector */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-800 border-2 border-blue-500/50 shadow-md">
                  {photoURL ? (
                    <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-file-input"
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                </label>
                <input
                  id="avatar-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <span className="text-xs text-neutral-400 mt-2">Tap photo to change avatar</span>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-neutral-800/80 border border-neutral-700 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Username</label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-neutral-800/80 border border-neutral-700 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Status Message */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Status Message</label>
              <input
                type="text"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="Available, In a meeting, Busy..."
                className="w-full bg-neutral-800/80 border border-neutral-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">About / Bio</label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  maxLength={160}
                  className="w-full bg-neutral-800/80 border border-neutral-700 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>
            </div>

            <button
              id="btn-save-profile"
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
