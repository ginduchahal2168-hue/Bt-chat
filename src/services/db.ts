import { AppPermissions, FileTransferItem } from '../types';

const DB_PREFIX = 'bluemesh_app_';

export const DEFAULT_PERMISSIONS: AppPermissions = {
  bluetooth: true,
  bluetoothScan: true,
  bluetoothConnect: true,
  nearbyDevices: true,
  microphone: true,
  camera: true,
  storage: true,
  notifications: true,
};

class LocalDbService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(DB_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage quota exceeded or unavailable', e);
    }
  }

  getTransfers(): FileTransferItem[] {
    return this.getItem<FileTransferItem[]>('transfers', []);
  }

  saveTransfers(transfers: FileTransferItem[]): void {
    this.setItem('transfers', transfers);
  }

  getPermissions(): AppPermissions {
    return this.getItem<AppPermissions>('permissions', DEFAULT_PERMISSIONS);
  }

  savePermissions(permissions: AppPermissions): void {
    this.setItem('permissions', permissions);
  }

  clearTransfers(): void {
    this.setItem('transfers', []);
  }

  resetAllData(): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(DB_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  getStorageUsageBytes(): number {
    let total = 0;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(DB_PREFIX)) {
        total += (localStorage.getItem(key)?.length || 0) * 2;
      }
    });
    return total;
  }
}

export const localDb = new LocalDbService();
