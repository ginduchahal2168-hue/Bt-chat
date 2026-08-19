import { PeerDevice, ChatMessage, FileTransferItem, UserProfile, ConnectionRequest } from '../types';
import { calculateDataChecksum, rssiToDistance } from './security';

type EventListener = (data: any) => void;

export class BluetoothMeshService {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<EventListener>> = new Map();
  private myProfile: UserProfile | null = null;
  private isScanning: boolean = false;
  private scanInterval: any = null;

  constructor(profile: UserProfile | null) {
    this.myProfile = profile;
    this.initBroadcastChannel();
  }

  public updateProfile(profile: UserProfile | null) {
    this.myProfile = profile;
    if (this.isScanning && profile) {
      this.broadcastBeacon();
    }
  }

  private initBroadcastChannel() {
    try {
      this.channel = new BroadcastChannel('bluemesh_local_p2p_channel');
      this.channel.onmessage = (event) => {
        this.handleIncomingPacket(event.data);
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this frame', e);
    }
  }

  public on(event: string, callback: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  private handleIncomingPacket(packet: any) {
    if (!packet || !this.myProfile || packet.senderId === this.myProfile.uid) {
      return; // Ignore own packets or invalid
    }

    switch (packet.type) {
      case 'BLE_BEACON': {
        const peer: PeerDevice = {
          id: packet.senderId,
          name: packet.displayName || packet.username || 'Nearby Device',
          deviceType: packet.deviceType || 'phone',
          bluetoothMac: packet.bluetoothMac || 'BLE:MESH:DIRECT',
          rssi: packet.rssi || -55,
          distanceMeters: rssiToDistance(packet.rssi || -55),
          status: 'available',
          bio: packet.bio || packet.statusMessage || '',
          avatar: packet.photoURL || '',
          lastSeen: Date.now(),
          isRealLiveTab: true,
          modelName: packet.modelName || 'Local Device',
        };
        this.emit('peer_discovered', peer);
        break;
      }
      case 'BLE_CONNECT_REQ': {
        if (packet.targetId === this.myProfile.uid) {
          const req: ConnectionRequest = {
            id: 'req_' + Date.now(),
            fromPeer: {
              id: packet.senderId,
              name: packet.senderName,
              deviceType: packet.deviceType || 'phone',
              bluetoothMac: packet.bluetoothMac || 'BLE:MESH',
              rssi: packet.rssi || -50,
              distanceMeters: rssiToDistance(packet.rssi || -50),
              status: 'connecting',
              bio: packet.bio || '',
              avatar: packet.photoURL || '',
              lastSeen: Date.now(),
              isRealLiveTab: true,
            },
            timestamp: Date.now(),
            status: 'pending',
          };
          this.emit('connection_requested', req);
        }
        break;
      }
      case 'BLE_CONNECT_RESP': {
        if (packet.targetId === this.myProfile.uid) {
          this.emit('connection_response', {
            peerId: packet.senderId,
            accepted: packet.accepted,
          });
        }
        break;
      }
      case 'BLE_CHAT_MSG': {
        if (packet.targetId === this.myProfile.uid) {
          const msg: ChatMessage = {
            id: packet.messageId || 'msg_' + Date.now(),
            conversationId: packet.senderId,
            senderId: packet.senderId,
            senderName: packet.senderName,
            receiverId: this.myProfile.uid,
            type: packet.msgType || 'text',
            content: packet.content || '',
            mediaUrl: packet.mediaUrl,
            fileName: packet.fileName,
            fileSize: packet.fileSize,
            duration: packet.duration,
            timestamp: packet.timestamp || Date.now(),
            status: 'read',
            isOutgoing: false,
            replyTo: packet.replyTo,
          };
          this.emit('message_received', msg);
        }
        break;
      }
      case 'BLE_FILE_CHUNK': {
        if (packet.targetId === this.myProfile.uid) {
          this.emit('file_chunk_received', packet);
        }
        break;
      }
    }
  }

  private sendPacket(packet: any) {
    try {
      if (this.channel) {
        this.channel.postMessage(packet);
      }
    } catch (e) {
      console.warn('Failed to transmit packet over BroadcastChannel', e);
    }
  }

  public broadcastBeacon() {
    if (!this.myProfile) return;
    this.sendPacket({
      type: 'BLE_BEACON',
      senderId: this.myProfile.uid,
      displayName: this.myProfile.displayName,
      username: this.myProfile.username,
      photoURL: this.myProfile.photoURL,
      bio: this.myProfile.bio,
      statusMessage: this.myProfile.statusMessage,
      rssi: -50,
    });
  }

  public startDiscovery() {
    this.isScanning = true;
    this.broadcastBeacon();

    if (this.scanInterval) clearInterval(this.scanInterval);
    this.scanInterval = setInterval(() => {
      if (this.isScanning) {
        this.broadcastBeacon();
      }
    }, 4000);
  }

  public stopDiscovery() {
    this.isScanning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  public requestConnection(targetPeer: PeerDevice) {
    if (!this.myProfile) return;
    this.sendPacket({
      type: 'BLE_CONNECT_REQ',
      senderId: this.myProfile.uid,
      senderName: this.myProfile.displayName,
      photoURL: this.myProfile.photoURL,
      bio: this.myProfile.bio,
      targetId: targetPeer.id,
      rssi: targetPeer.rssi,
    });
  }

  public respondToConnection(requesterId: string, accepted: boolean) {
    if (!this.myProfile) return;
    this.sendPacket({
      type: 'BLE_CONNECT_RESP',
      senderId: this.myProfile.uid,
      targetId: requesterId,
      accepted,
    });
  }

  public async sendMessage(
    targetPeerId: string,
    content: string,
    type: ChatMessage['type'] = 'text',
    mediaUrl?: string,
    meta?: Partial<ChatMessage>
  ): Promise<ChatMessage> {
    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const message: ChatMessage = {
      id: messageId,
      conversationId: targetPeerId,
      senderId: this.myProfile?.uid || 'me',
      senderName: this.myProfile?.displayName || 'Me',
      receiverId: targetPeerId,
      type,
      content,
      mediaUrl,
      fileName: meta?.fileName,
      fileSize: meta?.fileSize,
      duration: meta?.duration,
      timestamp: Date.now(),
      status: 'sent',
      isOutgoing: true,
      replyTo: meta?.replyTo,
    };

    this.sendPacket({
      type: 'BLE_CHAT_MSG',
      senderId: this.myProfile?.uid,
      senderName: this.myProfile?.displayName,
      targetId: targetPeerId,
      messageId,
      msgType: type,
      content,
      mediaUrl,
      fileName: meta?.fileName,
      fileSize: meta?.fileSize,
      duration: meta?.duration,
      replyTo: meta?.replyTo,
      timestamp: message.timestamp,
    });

    return message;
  }

  public sendFile(
    targetPeer: PeerDevice,
    file: File,
    onProgress: (progress: number, speedMbps: number, bytesTransferred: number) => void
  ): Promise<FileTransferItem> {
    return new Promise((resolve) => {
      const transferId = 'tr_' + Date.now();
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Data = reader.result as string;
        const checksum = await calculateDataChecksum(base64Data);

        let type: FileTransferItem['fileType'] = 'document';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';
        else if (file.name.endsWith('.apk')) type = 'apk';
        else if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) type = 'archive';

        const transferItem: FileTransferItem = {
          id: transferId,
          peerId: targetPeer.id,
          peerName: targetPeer.name,
          fileName: file.name,
          fileSize: file.size,
          fileType: type,
          mimeType: file.type,
          progress: 0,
          speedMbps: 3.2,
          bytesTransferred: 0,
          status: 'transferring',
          direction: 'outgoing',
          dataUrl: base64Data,
          timestamp: Date.now(),
          checksum,
        };

        let currentProgress = 0;
        const chunkInterval = setInterval(() => {
          currentProgress += 20;
          const bytes = Math.min(file.size, (currentProgress / 100) * file.size);
          onProgress(currentProgress, transferItem.speedMbps, bytes);

          if (currentProgress >= 100) {
            clearInterval(chunkInterval);
            transferItem.progress = 100;
            transferItem.status = 'completed';
            transferItem.bytesTransferred = file.size;

            this.sendPacket({
              type: 'BLE_FILE_CHUNK',
              senderId: this.myProfile?.uid,
              targetId: targetPeer.id,
              fileName: file.name,
              fileSize: file.size,
              fileType: type,
              mimeType: file.type,
              dataUrl: base64Data,
              checksum,
            });

            resolve(transferItem);
          }
        }, 120);
      };

      reader.readAsDataURL(file);
    });
  }

  public async scanHardwareWebBluetooth(): Promise<PeerDevice | null> {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
        });

        if (device) {
          const peer: PeerDevice = {
            id: device.id || 'bt_hw_' + Date.now(),
            name: device.name || 'Nearby Bluetooth Device',
            deviceType: 'phone',
            bluetoothMac: 'HW:BLE:PAIRED',
            rssi: -55,
            distanceMeters: 1.5,
            status: 'available',
            bio: 'Hardware Web Bluetooth paired peripheral',
            avatar: '',
            lastSeen: Date.now(),
            modelName: device.name || 'Paired BLE Device',
          };
          return peer;
        }
      } catch (err) {
        console.log('Web Bluetooth scan dismissed or not supported in this frame', err);
      }
    }
    return null;
  }
}
