import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, limit, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';
import { UserProfile, PrivacySettings, NotificationSettings } from '../types';

export const DEFAULT_PRIVACY: PrivacySettings = {
  lastSeen: 'everyone',
  online: 'everyone',
  readReceipts: true,
  profilePhoto: 'everyone',
  status: 'everyone',
};

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  messages: true,
  calls: true,
  statusUpdates: true,
  sound: true,
  vibrate: true,
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      privacySettings: profile.privacySettings || DEFAULT_PRIVACY,
      notificationSettings: profile.notificationSettings || DEFAULT_NOTIFICATIONS,
      blockedUserIds: profile.blockedUserIds || [],
      isOnline: true,
      lastSeen: Date.now(),
      createdAt: profile.createdAt || Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      lastSeen: Date.now(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function setOnlinePresence(uid: string, isOnline: boolean): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      isOnline,
      lastSeen: Date.now(),
    });
  } catch (err) {
    // Ignore presence errors during tab unloads/navigation
    console.warn('Presence update skipped or offline', err);
  }
}

export async function searchUsers(searchQuery: string, currentUid: string): Promise<UserProfile[]> {
  const cleanQuery = searchQuery.trim().toLowerCase().replace('@', '');
  if (!cleanQuery) return [];

  const path = 'users';
  try {
    // Query users collection
    const q = query(collection(db, 'users'), limit(30));
    const snap = await getDocs(q);
    const results: UserProfile[] = [];

    snap.forEach((docSnap) => {
      const user = docSnap.data() as UserProfile;
      if (user.uid !== currentUid) {
        const usernameMatch = user.username?.toLowerCase().includes(cleanQuery);
        const nameMatch = user.displayName?.toLowerCase().includes(cleanQuery);
        const emailMatch = user.email?.toLowerCase().includes(cleanQuery);
        if (usernameMatch || nameMatch || emailMatch) {
          results.push(user);
        }
      }
    });

    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
