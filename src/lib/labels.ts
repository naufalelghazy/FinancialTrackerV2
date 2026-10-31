import type { AccountType } from '../types';

/**
 * Display labels for account types.
 *
 * This table existed in five files (`HistoryView`, `TransactionForm`,
 * `EditTransactionModal`, `EditTemplateModal`, `VoiceTransactionModal`) with
 * slightly different keys and wording — "E-Wallet" in one, "Ewallet" in another.
 * A label change now happens once.
 */
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: 'Bank',
  ewallet: 'E-Wallet',
  credit: 'Kartu Kredit',
  cash: 'Tunai',
};

/** Label for a type, falling back to the raw value for unknown data. */
export function accountTypeLabel(type: string | undefined): string {
  if (!type) return '';
  return ACCOUNT_TYPE_LABELS[type as AccountType] ?? type;
}

/** Display labels for transaction types. */
export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  pemasukan: 'Pemasukan',
  pengeluaran: 'Pengeluaran',
  transfer: 'Transfer',
};
