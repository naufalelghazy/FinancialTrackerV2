/**
 * Opsi-opsi yang berlaku sepanjang sesi satu kali pemuatan halaman.
 *
 * Bedanya dengan `sessionStorage`: nilai di sini tidak selamat dari reload
 * maupun penutupan tab. Setiap kali dokumen dimuat, hitungannya mulai dari nol
 * -- kecuali memang sedang dipulihkan, lihat di bawah.
 *
 * Gunanya: membedakan "pengguna baru membuka aplikasi" dari "halaman ini
 * dimuat ulang". Keduanya terlihat sama dari dalam React, padahal
 * konsekuensinya berbeda -- lihat `lib/lastTab.ts`.
 */

/**
 * Penanda sekali pakai: ada di `sessionStorage` hanya pada pemuatan halaman
 * yang mengikuti sebuah muat ulang, lalu langsung dihapus.
 */
export const RELOAD_FLAG = 'ft_is_reload';

/**
 * Tanpa `sessionStorage` kita tidak punya cara jujur untuk tahu apakah ini
 * muat ulang atau peluncuran baru. Jawabannya "bukan muat ulang", sehingga
 * aplikasi lebih suka mendarat di Dashboard daripada menebak-nebak.
 */
function storage(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

/** Catat bahwa halaman berikutnya adalah hasil muat ulang. */
export function markNextLoadAsReload(): void {
  try {
    storage()?.setItem(RELOAD_FLAG, '1');
  } catch {
    /* private mode: halaman tetap berfungsi, hanya tab tidak dipulihkan */
  }
}

/**
 * `true` bila pemuatan ini adalah muat ulang (F5, tarik-untuk-refresh, atau
 * service worker memperbarui halaman). Menghapus penanda saat dipanggil.
 */
export function consumeReloadFlag(): boolean {
  const s = storage();
  if (!s) return false;
  try {
    const hit = s.getItem(RELOAD_FLAG) === '1';
    s.removeItem(RELOAD_FLAG);
    return hit;
  } catch {
    return false;
  }
}
