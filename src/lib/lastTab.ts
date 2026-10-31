/**
 * Mengingat halaman terakhir yang dibuka, supaya membuka aplikasi kembali
 * mendarat di tempat yang sama alih-alih selalu kembali ke Dashboard.
 *
 * Yang disimpan hanya *tab navigasi*, bukan isi modal atau kata kunci
 * pencarian. Membuka aplikasi langsung di tengah form transaksi yang setengah
 * terisi akan terasa seperti kehilangan kontrol, sedangkan "tadi saya sedang di
 * Riwayat" adalah hal yang wajar diingat.
 */

import type { NavTab } from '../components/layout/BottomNav';

export const LAST_TAB_STORAGE_KEY = 'ft_last_tab';

/** Semua tab navigasi, termasuk `input`. */
const ALL_TABS: readonly NavTab[] = [
  'dashboard',
  'riwayat',
  'report',
  'saldo',
  'tagihan',
  'input',
];

/**
 * Tab yang aman dipulihkan setelah aplikasi **ditutup**.
 *
 * `input` tidak termasuk: membuka aplikasi langsung pada form kosong adalah
 * satu langkah yang tidak diminta siapa pun.
 */
const RESTORABLE_ON_LAUNCH: readonly NavTab[] = [
  'dashboard',
  'riwayat',
  'report',
  'saldo',
  'tagihan',
];

export function isNavTab(value: unknown): value is NavTab {
  return typeof value === 'string' && (ALL_TABS as readonly string[]).includes(value);
}

/** Tab terakhir apa pun, termasuk `input`. Dipakai untuk memulihkan saat muat ulang. */
export function readRawLastTab(): NavTab | null {
  try {
    const raw = localStorage.getItem(LAST_TAB_STORAGE_KEY);
    return isNavTab(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Tab untuk peluncuran baru, atau `'dashboard'` bila tidak ada / datanya rusak. */
export function readLastTab(): NavTab {
  const raw = readRawLastTab();
  return raw && (RESTORABLE_ON_LAUNCH as readonly string[]).includes(raw)
    ? raw
    : 'dashboard';
}

export function writeLastTab(tab: NavTab): void {
  if (!isNavTab(tab)) return;
  try {
    localStorage.setItem(LAST_TAB_STORAGE_KEY, tab);
  } catch {
    /* private mode: nilai in-memory tetap dipakai sesi ini */
  }
}
