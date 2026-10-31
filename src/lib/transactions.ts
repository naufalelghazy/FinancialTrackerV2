import type { Category, Transaction, TransactionType } from '../types';

/**
 * Single source of truth for "is this a transfer between my own accounts?".
 *
 * Before this module the rule lived in three places with three different
 * definitions: `ReportView` treated any `destinationAccountId` as a transfer,
 * `DashboardView` matched category names, and `HistoryView` checked only the
 * `transfer` type. That made the same transaction show up in one report and
 * vanish from another.
 *
 * A transaction is an internal transfer when ANY of these hold:
 * 1. `type === 'transfer'` — the canonical representation.
 * 2. It has a destination account — money moved between two of the user's
 *    accounts, which must never count as income or expense.
 * 3. Its category is a legacy "Pindah Akun" / "Transfer" category, which is
 *    how transfers were recorded before the `transfer` type existed.
 */

const TRANSFER_CATEGORY_PATTERNS = ['pindah akun', 'pindah_akun', 'transfer'] as const;

/** True when a category name or id looks like a transfer category. */
export function isTransferCategoryLabel(label: string | undefined | null): boolean {
  if (!label) return false;
  const normalized = label.toLowerCase().trim();
  return TRANSFER_CATEGORY_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export interface TransferCheckOptions {
  /** Lookup used to resolve a legacy transfer category by id. */
  categories?: Array<Pick<Category, 'id' | 'name'>>;
}

/**
 * True when the transaction is a movement between the user's own accounts and
 * must be excluded from income, expense and budget calculations.
 */
export function isInternalTransfer(
  transaction: Pick<Transaction, 'type' | 'categoryId' | 'destinationAccountId'>,
  options: TransferCheckOptions = {}
): boolean {
  if (transaction.type === 'transfer') return true;
  if (transaction.destinationAccountId) return true;

  const categoryId = transaction.categoryId;
  if (!categoryId) return false;
  if (isTransferCategoryLabel(categoryId)) return true;

  const category = options.categories?.find((item) => item.id === categoryId);
  return isTransferCategoryLabel(category?.name);
}

/** True when the transaction increases the balance of its account. */
export function isIncome(transaction: Pick<Transaction, 'type' | 'destinationAccountId'>): boolean {
  return transaction.type === 'pemasukan';
}

/** True when the transaction decreases the balance of its source account. */
export function isExpense(transaction: Pick<Transaction, 'type' | 'destinationAccountId'>): boolean {
  if (transaction.type === 'pengeluaran') return true;
  // A transfer with no destination only debits; treat it as an expense so the
  // money is not silently dropped from every total.
  return transaction.type === 'transfer' && !transaction.destinationAccountId;
}

/**
 * Signed contribution of a transaction to a cash-flow total.
 * Transfers contribute nothing, so income - expense stays correct.
 */
export function signedAmount(
  transaction: Pick<Transaction, 'type' | 'amount' | 'categoryId' | 'destinationAccountId'>,
  options: TransferCheckOptions = {}
): number {
  if (isInternalTransfer(transaction, options)) return 0;
  const amount = Number(transaction.amount);
  if (!Number.isFinite(amount)) return 0;
  return transaction.type === 'pemasukan' ? amount : -amount;
}

/** Rupiah total for a transaction type, excluding internal transfers. */
export function sumByType(
  transactions: Transaction[],
  type: TransactionType,
  options: TransferCheckOptions = {}
): number {
  const categories = options.categories;
  return transactions.reduce((total, transaction) => {
    if (transaction.type !== type) return total;
    if (type !== 'transfer' && isInternalTransfer(transaction, { categories })) return total;
    const amount = Number(transaction.amount);
    return Number.isFinite(amount) ? total + amount : total;
  }, 0);
}
