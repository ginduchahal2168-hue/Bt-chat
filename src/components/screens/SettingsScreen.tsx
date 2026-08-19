import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Shield,
  Bell,
  HardDrive,
  LogOut,
  Trash2,
  Edit3,
  Moon,
  Sun,
  Lock,
  Eye,
  Check,
  AlertTriangle,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { EditProfileModal } from '../modals/EditProfileModal';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';
import { localDb } from '../../services/db';
import { formatFileSize } from '../../services/mediaService';

export const SettingsScreen: React.FC = () => {
  const { theme, setTheme, showToast, showPrivacyPolicy, setShowPrivacyPolicy } = useApp();
  const { userProfile, firebaseUser, logout, deleteAccount, updateProfileData, setShowAuthModal } = useAuth();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const storageUsage = localDb.getStorageUsageBytes();

  // Sub-screen navigation within settings hierarchy
  if (showPrivacyPolicy) {
    return <PrivacyPolicyScreen onBack={() => setShowPrivacyPolicy(false)} />;
  }

  const handlePrivacyChange = async (key: string, val: any) => {
    if (!userProfile) return;
    const currentPrivacy = userProfile.privacySettings || {
      lastSeen: 'everyone',
      online: 'everyone',
      readReceipts: true,
      profilePhoto: 'everyone',
      status: 'everyone',
    };
    await updateProfileData({
      privacySettings: {
        ...currentPrivacy,
        [key]: val,
      },
    });
    showToast('Privacy preferences saved');
  };

  const handleNotificationChange = async (key: string, val: boolean) => {
    if (!userProfile) return;
    const currentNotifications = userProfile.notificationSettings || {
      messages: true,
      calls: true,
      statusUpdates: true,
      sound: true,
      vibrate: true,
    };
    await updateProfileData({
      notificationSettings: {
        ...currentNotifications,
        [key]: val,
      },
    });
    showToast('Notification settings updated');
  };

  const handleClearAppCache = () => {
    localDb.resetAllData();
    showToast('Local offline storage cleared');
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 p-4 space-y-5">
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-xs text-neutral-400">Account, privacy and offline controls</p>
      </div>

      {/* User Profile Card */}
      {firebaseUser && userProfile ? (
        <div className="p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-neutral-800 border-2 border-blue-500/40 p-0.5">
              {userProfile.photoURL ? (
                <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{userProfile.displayName}</h3>
              <p className="text-xs text-blue-400 font-medium">@{userProfile.username}</p>
              <p className="text-[11px] text-neutral-400 mt-0.5 max-w-[200px] truncate">{userProfile.bio}</p>
            </div>
          </div>

          <button
            id="btn-edit-profile"
            onClick={() => setIsEditProfileOpen(true)}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 text-center space-y-3">
          <User className="w-10 h-10 text-neutral-600 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-white">Sign In to Your Account</h3>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1">
              Sync your chats, profile, and status across devices with real Firebase authentication.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
            >
              Sign In / Register
            </button>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl border border-neutral-700 transition"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      )}

      {/* Privacy & Security Controls */}
      {userProfile && (
        <div className="p-4 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-3.5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold uppercase text-neutral-300 tracking-wider">Privacy & Security</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Who can see my Last Seen</p>
                <p className="text-neutral-500">Controls last seen timestamp visibility</p>
              </div>
              <select
                value={userProfile.privacySettings?.lastSeen || 'everyone'}
                onChange={(e) => handlePrivacyChange('lastSeen', e.target.value)}
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">Contacts Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Who can see my Online Status</p>
                <p className="text-neutral-500">Controls live active presence dot</p>
              </div>
              <select
                value={userProfile.privacySettings?.online || 'everyone'}
                onChange={(e) => handlePrivacyChange('online', e.target.value)}
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">Contacts Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Read Receipts</p>
                <p className="text-neutral-500">Show blue checkmarks when messages are read</p>
              </div>
              <input
                type="checkbox"
                checked={userProfile.privacySettings?.readReceipts ?? true}
                onChange={(e) => handlePrivacyChange('readReceipts', e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>

            {/* Privacy Policy & Protocol Navigation */}
            <div className="pt-2 border-t border-neutral-800">
              <button
                id="btn-open-privacy-policy"
                onClick={() => setShowPrivacyPolicy(true)}
                className="w-full p-2.5 rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-left flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-blue-300 transition">
                      Privacy Policy & P2P Protocols
                    </p>
                    <p className="text-[11px] text-neutral-400">Account data, cryptography, and direct mesh info</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Controls */}
      {userProfile && (
        <div className="p-4 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-3.5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold uppercase text-neutral-300 tracking-wider">Notifications</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Direct Message Alerts</span>
              <input
                type="checkbox"
                checked={userProfile.notificationSettings?.messages ?? true}
                onChange={(e) => handleNotificationChange('messages', e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Incoming Call Ringing</span>
              <input
                type="checkbox"
                checked={userProfile.notificationSettings?.calls ?? true}
                onChange={(e) => handleNotificationChange('calls', e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Sound Effects</span>
              <input
                type="checkbox"
                checked={userProfile.notificationSettings?.sound ?? true}
                onChange={(e) => handleNotificationChange('sound', e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Storage & Offline Cache */}
      <div className="p-4 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold uppercase text-neutral-300 tracking-wider">Storage & Offline Cache</h3>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-white">Local Cache Usage</p>
            <p className="text-neutral-500">{formatFileSize(storageUsage)} used on this device</p>
          </div>
          <button
            onClick={handleClearAppCache}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium text-xs transition"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Account Actions */}
      {firebaseUser && (
        <div className="p-4 rounded-3xl bg-neutral-900/80 border border-neutral-800 space-y-3">
          <button
            id="btn-logout"
            onClick={logout}
            className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log Out of Account
          </button>

          {showDeleteConfirm ? (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2">
              <p className="text-xs text-red-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Are you sure you want to permanently delete your account?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-delete-account"
                  onClick={deleteAccount}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold"
                >
                  Permanently Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 px-4 text-red-400 hover:text-red-300 text-xs transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Account & Clear Cloud Data
            </button>
          )}
        </div>
      )}
    </div>
  );
};
