import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';
import { UserStatus } from '../types';

export function listenToActiveStatuses(onUpdate: (statuses: UserStatus[]) => void): () => void {
  const path = 'statuses';
  try {
    const statusesRef = collection(db, 'statuses');
    const q = query(statusesRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: UserStatus[] = [];
        const currentTime = Date.now();
        snapshot.forEach((docSnap) => {
          const status = docSnap.data() as UserStatus;
          // Filter out expired statuses (> 24 hours)
          if (status.expiresAt > currentTime) {
            list.push({ ...status, id: docSnap.id });
          }
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function createUserStatus(status: UserStatus): Promise<void> {
  const path = `statuses/${status.id}`;
  try {
    await setDoc(doc(db, 'statuses', status.id), status);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function markStatusAsViewed(statusId: string, currentUserId: string): Promise<void> {
  const path = `statuses/${statusId}`;
  try {
    const statusRef = doc(db, 'statuses', statusId);
    await updateDoc(statusRef, {
      viewerIds: arrayUnion(currentUserId),
    });
  } catch (err) {
    console.warn('Failed to record status view', err);
  }
}

export async function deleteUserStatus(statusId: string): Promise<void> {
  const path = `statuses/${statusId}`;
  try {
    await deleteDoc(doc(db, 'statuses', statusId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
