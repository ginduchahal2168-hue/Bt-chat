import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserAccount,
  setOnlinePresence,
  DEFAULT_PRIVACY,
  DEFAULT_NOTIFICATIONS,
} from '../services/userService';
import { UserProfile } from '../types';

interface AuthContextType {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            // Generate clean username from email or name
            const rawName = user.displayName || user.email?.split('@')[0] || 'user';
            const baseUsername = rawName.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 15) || 'user';
            const username = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;

            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || 'New User',
              username,
              email: user.email || '',
              photoURL: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
              bio: 'Available on BlueMesh',
              statusMessage: 'Available',
              isOnline: true,
              lastSeen: Date.now(),
              createdAt: Date.now(),
              blockedUserIds: [],
              privacySettings: DEFAULT_PRIVACY,
              notificationSettings: DEFAULT_NOTIFICATIONS,
            };
            await createUserProfile(newProfile);
            profile = newProfile;
          } else {
            // Update online presence
            setOnlinePresence(user.uid, true);
          }
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load or initialize user profile', err);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    // Window visibility & unload presence tracker
    const handleVisibility = () => {
      if (auth.currentUser) {
        setOnlinePresence(auth.currentUser.uid, document.visibilityState === 'visible');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setShowAuthModal(false);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setShowAuthModal(false);
    } catch (error: any) {
      console.error('Email Sign-In Error:', error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, displayName: string, username: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        displayName: displayName.trim() || 'New User',
        username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || `user_${Date.now().toString().slice(-4)}`,
        email: cred.user.email || email,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${cred.user.uid}`,
        bio: 'Hey there! I am using BlueMesh.',
        statusMessage: 'Available',
        isOnline: true,
        lastSeen: Date.now(),
        createdAt: Date.now(),
        blockedUserIds: [],
        privacySettings: DEFAULT_PRIVACY,
        notificationSettings: DEFAULT_NOTIFICATIONS,
      };
      await createUserProfile(newProfile);
      setUserProfile(newProfile);
      setShowAuthModal(false);
    } catch (error: any) {
      console.error('Registration Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (firebaseUser) {
      await setOnlinePresence(firebaseUser.uid, false);
    }
    await signOut(auth);
    setUserProfile(null);
  };

  const deleteAccount = async () => {
    if (firebaseUser) {
      await deleteUserAccount(firebaseUser.uid);
      await deleteUser(firebaseUser);
      setUserProfile(null);
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!firebaseUser || !userProfile) return;
    const updated = { ...userProfile, ...updates };
    setUserProfile(updated);
    await updateUserProfile(firebaseUser.uid, updates);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        deleteAccount,
        updateProfileData,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
