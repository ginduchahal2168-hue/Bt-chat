import { ChatMessage } from '../types';
import { sendChatMessage } from './chatService';

const QUEUE_STORAGE_KEY = 'bluemesh_pending_message_queue';

export class OfflineQueueService {
  private queue: ChatMessage[] = [];
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  public isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  private loadQueue() {
    try {
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      this.queue = data ? JSON.parse(data) : [];
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('Failed to save offline queue to storage', e);
    }
  }

  public enqueueMessage(message: ChatMessage): void {
    const pendingMsg: ChatMessage = {
      ...message,
      status: 'sending',
    };
    this.queue.push(pendingMsg);
    this.saveQueue();
  }

  public getPendingMessages(conversationId?: string): ChatMessage[] {
    if (conversationId) {
      return this.queue.filter((m) => m.conversationId === conversationId);
    }
    return this.queue;
  }

  public onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private async handleNetworkChange(isOnline: boolean) {
    this.isOnline = isOnline;
    this.listeners.forEach((cb) => cb(isOnline));

    if (isOnline && this.queue.length > 0) {
      console.log(`Connection restored. Syncing ${this.queue.length} pending offline messages...`);
      await this.drainQueue();
    }
  }

  public async drainQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) return;

    const currentQueue = [...this.queue];
    const remaining: ChatMessage[] = [];

    for (const msg of currentQueue) {
      try {
        const deliveredMsg: ChatMessage = {
          ...msg,
          status: 'sent',
        };
        await sendChatMessage(msg.conversationId, deliveredMsg);
      } catch (err) {
        console.warn(`Failed to sync message ${msg.id}, retaining in queue`, err);
        remaining.push(msg);
      }
    }

    this.queue = remaining;
    this.saveQueue();
  }

  public removeMessage(messageId: string): void {
    this.queue = this.queue.filter((m) => m.id !== messageId);
    this.saveQueue();
  }
}

export const offlineQueue = new OfflineQueueService();
