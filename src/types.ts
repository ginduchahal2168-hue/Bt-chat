export type TabType = 'home' | 'chats' | 'calls' | 'status' | 'nearby' | 'contacts' | 'files' | 'settings';

export interface PrivacySettings {
  lastSeen: 'everyone' | 'contacts' | 'nobody';
  online: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  profilePhoto: 'everyone' | 'contacts' | 'nobody';
  status: 'everyone' | 'contacts' | 'nobody';
}

export interface NotificationSettings {
  messages: boolean;
  calls: boolean;
  statusUpdates: boolean;
  sound: boolean;
  vibrate: boolean;
}

export interface UserProfile {
  id?: string;
  uid: string;
  displayName: string;
  username: string; // e.g. "alex_dev" (lowercase, unique)
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  bio?: string;
  statusMessage?: string;
  isOnline: boolean;
  lastSeen: number;
  createdAt: number;
  blockedUserIds?: string[];
  privacySettings?: PrivacySettings;
  notificationSettings?: NotificationSettings;
}

export interface Contact {
  id: string; // Document ID
  contactUserId: string; // User ID of the contact
  displayName: string;
  username: string;
  photoURL?: string;
  bio?: string;
  addedAt: number;
  isBlocked: boolean;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'call' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number; // for audio voice notes in seconds
  timestamp: number;
  status: MessageStatus;
  deleted?: boolean;
  isOutgoing?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  reaction?: string;
}

export interface ParticipantDetail {
  displayName: string;
  username: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: number;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantDetails: Record<string, ParticipantDetail>;
  lastMessageText?: string;
  lastMessageType?: MessageType;
  lastMessageSenderId?: string;
  lastMessageTimestamp?: number;
  unreadCounts?: Record<string, number>;
  createdAt: number;
  updatedAt: number;
}

export interface UserStatus {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'text' | 'image' | 'video';
  content?: string;
  mediaUrl?: string;
  backgroundColor?: string;
  createdAt: number;
  expiresAt: number;
  viewerIds: string[];
}

export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'active' | 'ended' | 'declined' | 'missed';

export interface CallRecord {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  type: CallType;
  status: CallStatus;
  offer?: any;
  answer?: any;
  callerCandidates?: any[];
  receiverCandidates?: any[];
  createdAt: number;
  endedAt?: number;
  duration?: number;
}

export type DeviceType = 'phone' | 'tablet' | 'laptop' | 'wearable' | 'other';
export type PeerStatus = 'available' | 'connecting' | 'connected' | 'busy' | 'offline';

export interface PeerDevice {
  id: string;
  name: string;
  deviceType: DeviceType;
  bluetoothMac: string;
  rssi: number;
  distanceMeters: number;
  status: PeerStatus;
  bio: string;
  avatar: string;
  lastSeen: number;
  isRealLiveTab?: boolean;
  modelName?: string;
  isCustomContact?: boolean;
}

export type TransferStatus = 'queued' | 'transferring' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type TransferDirection = 'incoming' | 'outgoing';

export interface FileTransferItem {
  id: string;
  peerId: string;
  peerName: string;
  fileName: string;
  fileSize: number;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'apk' | 'other';
  mimeType: string;
  progress: number;
  speedMbps: number;
  bytesTransferred: number;
  status: TransferStatus;
  direction: TransferDirection;
  dataUrl?: string;
  timestamp: number;
  checksum?: string;
}

export interface AppPermissions {
  bluetooth: boolean;
  bluetoothScan: boolean;
  bluetoothConnect: boolean;
  nearbyDevices: boolean;
  microphone: boolean;
  camera: boolean;
  storage: boolean;
  notifications: boolean;
}

export interface ConnectionRequest {
  id: string;
  fromPeer: PeerDevice;
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined';
}
