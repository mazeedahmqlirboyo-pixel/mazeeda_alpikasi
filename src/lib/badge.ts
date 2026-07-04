import { Badge } from '@capawesome/capacitor-badge';

/**
 * Meminta izin untuk menampilkan badge notifikasi (opsional tapi disarankan)
 */
export async function requestBadgePermission() {
  try {
    const status = await Badge.requestPermissions();
    return status.display === 'granted';
  } catch (error) {
    console.error("Gagal meminta izin badge:", error);
    return false;
  }
}

/**
 * Mengatur angka badge secara spesifik
 * @param count jumlah notifikasi
 */
export async function setBadgeCount(count: number) {
  try {
    const hasPermission = await requestBadgePermission();
    if (hasPermission) {
      await Badge.set({ count });
    }
  } catch (error) {
    console.error("Gagal mengatur badge:", error);
  }
}

/**
 * Menambah angka badge saat ini dengan 1
 */
export async function increaseBadgeCount() {
  try {
    const hasPermission = await requestBadgePermission();
    if (hasPermission) {
      await Badge.increase();
    }
  } catch (error) {
    console.error("Gagal menambah badge:", error);
  }
}

/**
 * Mengurangi angka badge saat ini dengan 1
 */
export async function decreaseBadgeCount() {
  try {
    const hasPermission = await requestBadgePermission();
    if (hasPermission) {
      await Badge.decrease();
    }
  } catch (error) {
    console.error("Gagal mengurangi badge:", error);
  }
}

/**
 * Menghapus/menghilangkan badge dari ikon aplikasi
 */
export async function clearBadge() {
  try {
    await Badge.clear();
  } catch (error) {
    console.error("Gagal menghapus badge:", error);
  }
}
