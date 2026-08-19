import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/firestoreErrors';
import { ChatMessage, Conversation, UserProfile } from '../types';

export function getDirectConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

export async function getOrCreateConversation(
  currentUser: UserProfile,
  targetUser: UserProfile
): Promise<Conversation> {
  const convId = getDirectConversationId(currentUser.uid, targetUser.uid);
  const path = `conversations/${convId}`;

  try {
    const convRef = doc(db, 'conversations', convId);
    const snap = await getDoc(convRef);

    if (snap.exists()) {
      return snap.data() as Conversation;
    }

    const newConversation: Conversation = {
      id: convId,
      participantIds: [currentUser.uid, targetUser.uid],
      participantDetails: {
        [currentUser.uid]: {
          displayName: currentUser.displayName,
          username: currentUser.username,
          photoURL: currentUser.photoURL || '',
          isOnline: currentUser.isOnline,
          lastSeen: currentUser.lastSeen,
        },
        [targetUser.uid]: {
          displayName: targetUser.displayName,
          username: targetUser.username,
          photoURL: targetUser.photoURL || '',
          isOnline: targetUser.isOnline,
          lastSeen: targetUser.lastSeen,
        },
      },
      lastMessageText: '',
      lastMessageTimestamp: Date.now(),
      unreadCounts: {
        [currentUser.uid]: 0,
        [targetUser.uid]: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(convRef, newConversation);
    return newConversation;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function listenToUserConversations(
  userId: string,
  onUpdate: (conversations: Conversation[]) => void
): () => void {
  const path = 'conversations';
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Conversation);
        });
        // Sort by updatedAt descending
        onUpdate(list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export function listenToConversationMessages(
  conversationId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  const path = `conversations/${conversationId}/messages`;
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(150));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as ChatMessage);
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

export async function sendChatMessage(
  conversationId: string,
  message: ChatMessage
): Promise<void> {
  const messagePath = `conversations/${conversationId}/messages/${message.id}`;
  const convPath = `conversations/${conversationId}`;

  try {
    // 1. Write the message document
    await setDoc(doc(db, 'conversations', conversationId, 'messages', message.id), message);

    // 2. Update conversation summary
    const convRef = doc(db, 'conversations', conversationId);
    const convSnap = await getDoc(convRef);
    if (convSnap.exists()) {
      const convData = convSnap.data() as Conversation;
      const receiverId = message.receiverId;
      const currentUnread = convData.unreadCounts?.[receiverId] || 0;

      await updateDoc(convRef, {
        lastMessageText:
          message.type === 'text'
            ? message.content
            : message.type === 'image'
            ? '📷 Photo'
            : message.type === 'video'
            ? '🎥 Video'
            : message.type === 'audio'
            ? '🎤 Voice Message'
            : message.type === 'call'
            ? '📞 Call'
            : `📎 ${message.fileName || 'File'}`,
        lastMessageType: message.type,
        lastMessageSenderId: message.senderId,
        lastMessageTimestamp: message.timestamp,
        updatedAt: message.timestamp,
        [`unreadCounts.${receiverId}`]: currentUnread + 1,
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, messagePath);
  }
}

export async function markConversationAsRead(
  conversationId: string,
  currentUserId: string,
  messages: ChatMessage[]
): Promise<void> {
  try {
    // 1. Reset unread count on conversation
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      [`unreadCounts.${currentUserId}`]: 0,
    });

    // 2. Mark incoming unread messages as read
    const unreadIncoming = messages.filter(
      (m) => m.receiverId === currentUserId && m.status !== 'read'
    );

    for (const msg of unreadIncoming) {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', msg.id);
      await updateDoc(msgRef, {
        status: 'read',
      });
    }
  } catch (err) {
    // Silent fail for non-critical read receipt update
    console.warn('Failed to mark conversation read', err);
  }
}

export async function deleteChatMessage(
  conversationId: string,
  messageId: string
): Promise<void> {
  const path = `conversations/${conversationId}/messages/${messageId}`;
  try {
    await deleteDoc(doc(db, 'conversations', conversationId, 'messages', messageId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
