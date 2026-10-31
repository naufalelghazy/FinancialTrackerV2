/**
 * Urutan tampil daftar rekening di tab Saldo.
 *
 * Urutan disimpan sebagai angka pada tiap akun (`sortOrder`) alih-alih sebagai
 * satu daftar id terpisah. Itu membuat akun baru dari perangkat lain tetap
 * muncul di daftar, dan memungkinkan penyimpanan per baris lewat jalur tulis
 * yang sudah ada (termasuk antrean offline).
 */

import type { Account } from '../types';

/**
 * Akun yang punya `sortOrder` lebih dulu, naik sesuai angkanya; sisanya
 * mengikuti abjad. Tanpa cabang kedua, akun lama (tanpa `sortOrder`) akan
 * melompat ke atas setiap kali daftar diubah.
 */
export function compareAccountsByDisplayOrder(a: Account, b: Account): number {
  const ao = a.sortOrder;
  const bo = b.sortOrder;
  const aHas = typeof ao === 'number' && Number.isFinite(ao);
  const bHas = typeof bo === 'number' && Number.isFinite(bo);

  if (aHas && bHas && ao !== bo) return ao - bo;
  if (aHas !== bHas) return aHas ? -1 : 1;
  return a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
}

/** Salinan daftar yang sudah terurut. Tidak memutasi masukan. */
export function sortAccountsForDisplay(accounts: Account[]): Account[] {
  return [...accounts].sort(compareAccountsByDisplayOrder);
}

/**
 * Memberi nomor urut baru 0..n-1 sesuai posisi pada `orderedIds`.
 *
 * Nomor ditulis ulang untuk *semua* akun, bukan hanya yang bergeser, supaya
 * daftar tidak menyisakan celah atau nilai kembar setelah beberapa kali geser.
 */
export function applyAccountOrder(accounts: Account[], orderedIds: string[]): Account[] {
  const position = new Map(orderedIds.map((id, index) => [id, index]));

  return accounts.map((acc) => {
    const next = position.get(acc.id);
    return next === undefined ? acc : { ...acc, sortOrder: next };
  });
}

/** Memindahkan satu id dari satu posisi ke posisi lain. */
export function moveId(ids: string[], from: number, to: number): string[] {
  if (from === to) return ids;
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
