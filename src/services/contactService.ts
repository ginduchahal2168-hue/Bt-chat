import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';
import { Contact, UserProfile } from '../types';

export function listenToContacts(userId: string, onUpdate: (contacts: Contact[]) => void): () => void {
  const path = `users/${userId}/contacts`;
  try {
    const contactsRef = collection(db, 'users', userId, 'contacts');
    return onSnapshot(
      contactsRef,
      (snapshot) => {
        const list: Contact[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Contact, 'id'>) });
        });
        onUpdate(list.sort((a, b) => b.addedAt - a.addedAt));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function addContactToUser(currentUserId: string, targetUser: UserProfile): Promise<void> {
  const path = `users/${currentUserId}/contacts/${targetUser.uid}`;
  try {
    const contactData: Omit<Contact, 'id'> = {
      contactUserId: targetUser.uid,
      displayName: targetUser.displayName || targetUser.username,
      username: targetUser.username,
      photoURL: targetUser.photoURL || '',
      bio: targetUser.bio || targetUser.statusMessage || '',
      addedAt: Date.now(),
      isBlocked: false,
    };
    await setDoc(doc(db, 'users', currentUserId, 'contacts', targetUser.uid), contactData);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeContactFromUser(currentUserId: string, contactUserId: string): Promise<void> {
  const path = `users/${currentUserId}/contacts/${contactUserId}`;
  try {
    await deleteDoc(doc(db, 'users', currentUserId, 'contacts', contactUserId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function toggleBlockContact(currentUserId: string, contactUserId: string, isBlocked: boolean): Promise<void> {
  const path = `users/${currentUserId}/contacts/${contactUserId}`;
  try {
    await updateDoc(doc(db, 'users', currentUserId, 'contacts', contactUserId), {
      isBlocked,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}
