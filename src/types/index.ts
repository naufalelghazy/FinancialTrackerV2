export type TransactionType = 'pengeluaran' | 'pemasukan' | 'transfer';
export type AccountType = 'bank' | 'ewallet' | 'credit' | 'cash';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  icon?: string;
  emoji?: string;
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'pengeluaran' | 'pemasukan';
  emoji: string;
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
}
