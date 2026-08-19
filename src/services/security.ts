// Security, Cryptography & Signal Physics for Offline Bluetooth Mesh

export function generateBluetoothMac(): string {
  const hex = '0123456789ABCDEF';
  const parts: string[] = [];
  for (let i = 0; i < 6; i++) {
    parts.push(hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)]);
  }
  return parts.join(':');
}

export function generateDeviceId(): string {
  return 'bt_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
}

// Convert RSSI (dBm) to estimated distance in meters
export function rssiToDistance(rssi: number): number {
  if (rssi === 0) return 0.5;
  const measuredPower = -59;
  const n = 2.4;
  const ratio = (measuredPower - rssi) / (10 * n);
  const distance = Math.pow(10, ratio);
  return Math.min(Math.max(parseFloat(distance.toFixed(1)), 0.3), 35.0);
}

export function getSignalLevel(rssi: number): { bars: number; label: string; color: string } {
  if (rssi >= -55) return { bars: 4, label: 'Excellent', color: 'text-emerald-500' };
  if (rssi >= -70) return { bars: 3, label: 'Good', color: 'text-teal-500' };
  if (rssi >= -85) return { bars: 2, label: 'Fair', color: 'text-amber-500' };
  return { bars: 1, label: 'Weak', color: 'text-rose-500' };
}

// Compute simple SHA-256 hash representation for data integrity verification
export async function calculateDataChecksum(data: string | ArrayBuffer): Promise<string> {
  try {
    const buffer = typeof data === 'string' 
      ? new TextEncoder().encode(data) 
      : new Uint8Array(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16).toUpperCase();
  } catch {
    let hash = 0;
    const str = typeof data === 'string' ? data : new Uint8Array(data).toString();
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  }
}

export function generateOfflineSessionKey(): { publicKey: string; sessionSecret: string } {
  const chars = 'ABCDEF0123456789';
  let publicKey = 'PK_BLE_';
  let sessionSecret = '';
  for (let i = 0; i < 24; i++) {
    publicKey += chars[Math.floor(Math.random() * chars.length)];
    sessionSecret += chars[Math.floor(Math.random() * chars.length)];
  }
  return { publicKey, sessionSecret };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
