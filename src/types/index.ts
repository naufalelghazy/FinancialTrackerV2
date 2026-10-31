export type TransactionType = 'pengeluaran' | 'pemasukan' | 'transfer';
export type AccountType = 'bank' | 'ewallet' | 'credit' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  icon?: string;
  emoji?: string;
  website?: string;
  initialBalance?: number;
  balance: number;
  /**
   * Posisi tampil di daftar Saldo. Akun tanpa nilai dianggap 0 dan diurutkan
   * berdasarkan nama setelah yang bernilai, sehingga data lama tetap tampil rapi.
   */
  sortOrder?: number;
  /**
   * True when this record only exists on this device because the server has not
   * acknowledged it yet (offline outbox). It is replaced in place once the
   * queued mutation is flushed, so the id never changes.
   */
  pendingSync?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'pengeluaran' | 'pemasukan';
  emoji: string;
  icon?: string;
  pendingSync?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  sourceAccountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  notes?: string;
  createdAt: string;
  pendingSync?: boolean;
}

export interface QuickTemplate {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  sourceAccountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  notes?: string;
  emoji?: string;
  color?: string;
}
