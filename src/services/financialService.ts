import { loadSupabase, isSupabaseConfigured, SUPABASE_SESSION_HINT } from '../lib/supabase';
import type { Account, AccountType, Category, Transaction, TransactionType } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES } from '../lib/constants';
import { compareAccountsByDisplayOrder } from '../lib/accountOrder';
import { getLogoDevUrl, getLocalFallback, LOCAL_FALLBACK_ICONS, BANK_DOMAIN_MAP } from './logoService';
import { classifyWriteError, isBrowserOffline, PermanentWriteError } from '../lib/errors';
import { isUuid } from '../lib/uuid';
import {
  enqueueDelete,
  enqueueUpsert,
  flushOutbox,
  getPendingRowIds,
  getPendingSyncCount,
  markPendingRows,
  markRowDeleted,
  markRowSynced,
  markRowsSynced,
  type OutboxTable,
} from './outbox';

export interface FinancialData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}

export { BANK_DOMAIN_MAP };
export const BANK_ICON_MAP = LOCAL_FALLBACK_ICONS;

export { getPendingSyncCount, getPendingRowIds, markPendingRows };

/**
 * @deprecated Use `flushOutbox()` from `services/outbox`. Kept as a thin alias so
 * older call sites keep working.
 */
export async function flushOfflineSyncQueue(): Promise<number> {
  const result = await flushOutbox();
  return result.synced;
}

export interface WriteResult<T> {
  data: T;
  /** True when the row only exists locally and is queued for the server. */
  queued: boolean;
  /** Present when the write failed permanently; the row was NOT kept. */
  warning?: string;
}

/* ------------------------------------------------------------------ *
 * localStorage snapshots
 * ------------------------------------------------------------------ */

interface LocalSnapshot {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}

function readJsonArray<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to persist ${key}:`, err);
  }
}

/** Reads the offline snapshot, repairing rows that would otherwise produce NaN. */
export function readLocalSnapshot(): LocalSnapshot {
  const accounts = readJsonArray<Account>('ft_accounts', INITIAL_ACCOUNTS).filter(
    (acc) => acc && typeof acc.id === 'string' && acc.id.length > 0
  );
  const categories = readJsonArray<Category>('ft_categories', INITIAL_CATEGORIES).filter(
    (cat) => cat && typeof cat.id === 'string' && cat.id.length > 0
  );
  const transactions = readJsonArray<Transaction>('ft_transactions', []).filter(
    (tx) => tx && typeof tx.id === 'string' && tx.id.length > 0 && Number.isFinite(Number(tx.amount))
  );
  return { accounts, categories, transactions };
}

/** Persists a full snapshot so the next cold start renders instantly. */
export function writeLocalSnapshot(snapshot: {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}): void {
  writeJson('ft_accounts', snapshot.accounts);
  writeJson('ft_transactions', snapshot.transactions);
  writeJson('ft_categories', snapshot.categories);
}

export function getAccountIcon(name: string, website?: string, fallbackUrl?: string): string {
  const logoUrl = getLogoDevUrl(name, website);
  if (logoUrl) return logoUrl;
  const localFallback = getLocalFallback(name);
  if (localFallback) return localFallback;
  return fallbackUrl || '/icons/banks/cash.svg';
}

/**
 * Calculates current running balance for all accounts based on initial_balance and transaction history.
 * Non-finite amounts are ignored so one corrupt row cannot poison every balance.
 */
export function calculateAccountBalances(
  rawAccounts: Account[],
  transactions: Transaction[]
): Account[] {
  const balanceMap: Record<string, number> = {};

  rawAccounts.forEach((acc) => {
    const initial = Number(acc.initialBalance ?? 0);
    balanceMap[acc.id] = Number.isFinite(initial) ? initial : 0;
  });

  transactions.forEach((tx) => {
    const amt = Number(tx.amount);
    if (!Number.isFinite(amt)) return;

    if (tx.type === 'pemasukan') {
      if (tx.sourceAccountId && balanceMap[tx.sourceAccountId] !== undefined) {
        balanceMap[tx.sourceAccountId] += amt;
      }
    } else if (tx.type === 'pengeluaran') {
      if (tx.sourceAccountId && balanceMap[tx.sourceAccountId] !== undefined) {
        balanceMap[tx.sourceAccountId] -= amt;
      }
    } else if (tx.type === 'transfer') {
      // Same account on both sides is a no-op, not a double count.
      if (tx.destinationAccountId && tx.destinationAccountId === tx.sourceAccountId) return;
      // A transfer with no destination debits the source and credits nobody.
      // This used to be skipped entirely, which contradicted isExpense() in
      // lib/transactions.ts — that one treats it as spending so the money is
      // never silently dropped. Debit-only keeps both rules consistent.
      if (tx.sourceAccountId && balanceMap[tx.sourceAccountId] !== undefined) {
        balanceMap[tx.sourceAccountId] -= amt;
      }
      if (tx.destinationAccountId && balanceMap[tx.destinationAccountId] !== undefined) {
        balanceMap[tx.destinationAccountId] += amt;
      }
    }
  });

  const pendingIds = getPendingRowIds();
  return rawAccounts.map((acc) => {
    const next: Account = { ...acc, balance: balanceMap[acc.id] ?? 0 };
    if (pendingIds.has(acc.id)) next.pendingSync = true;
    else delete next.pendingSync;
    return next;
  });
}

/* ------------------------------------------------------------------ *
 * Row <-> model mappers
 * ------------------------------------------------------------------ */

const TRANSACTION_TYPES: TransactionType[] = ['pengeluaran', 'pemasukan', 'transfer'];
const ACCOUNT_TYPES: AccountType[] = ['bank', 'ewallet', 'credit', 'cash'];

function coerceTransactionType(value: unknown): TransactionType {
  return TRANSACTION_TYPES.includes(value as TransactionType)
    ? (value as TransactionType)
    : 'pengeluaran';
}

function coerceAccountType(value: unknown): AccountType {
  return ACCOUNT_TYPES.includes(value as AccountType) ? (value as AccountType) : 'cash';
}

function nullableId(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  return String(value);
}

export function mapTransactionRow(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id),
    date: String(row.date ?? '').slice(0, 10),
    type: coerceTransactionType(row.type),
    amount: Number(row.amount) || 0,
    sourceAccountId: String(row.source_account_id ?? ''),
    destinationAccountId: nullableId(row.destination_account_id),
    categoryId: nullableId(row.category_id),
    notes: row.notes ? String(row.notes) : '',
    createdAt: row.created_at ? String(row.created_at) : new Date().toISOString(),
  };
}

export function mapAccountRow(row: Record<string, unknown>): Account {
  const name = String(row.name ?? '');
  const website = nullableId(row.website);
  return {
    id: String(row.id),
    name,
    type: coerceAccountType(row.type),
    website,
    icon: getAccountIcon(name, website, nullableId(row.icon_url)),
    initialBalance: Number(row.initial_balance ?? 0) || 0,
    balance: Number(row.initial_balance ?? 0) || 0,
    sortOrder: row.sort_order === null || row.sort_order === undefined
      ? undefined
      : Number(row.sort_order),
  };
}

export function mapCategoryRow(row: Record<string, unknown>): Category {
  const emoji = String(row.emoji || '🏷️');
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    type: row.type === 'pemasukan' ? 'pemasukan' : 'pengeluaran',
    emoji,
    icon: emoji,
  };
}

/* ------------------------------------------------------------------ *
 * Loading
 * ------------------------------------------------------------------ */

function localFinancialData(): FinancialData {
  const snapshot = readLocalSnapshot();
  return {
    accounts: calculateAccountBalances(snapshot.accounts, snapshot.transactions),
    categories: snapshot.categories,
    transactions: snapshot.transactions,
  };
}

/** Clears the cached snapshot so a stale device cannot resurrect old rows. */
export function clearLocalSnapshot(): void {
  try {
    localStorage.removeItem('ft_accounts');
    localStorage.removeItem('ft_transactions');
    localStorage.removeItem('ft_categories');
    localStorage.removeItem('ft_quick_templates');
  } catch {
    /* ignore */
  }
}

/**
 * Loads accounts, categories, and all transactions from Supabase.
 * Flushes any queued mutations first, then falls back to the local snapshot if
 * Supabase is unconfigured, unreachable, or slow.
 */
export async function loadFinancialData(): Promise<FinancialData> {
  const db = await loadSupabase();
  if (!db) {
    return localFinancialData();
  }

  // Never fetch while the user is offline: the snapshot already has the truth,
  // and a failed fetch would only overwrite it with itself.
  if (isBrowserOffline()) {
    return localFinancialData();
  }

  try {
    await flushOutbox();

    const [accRes, catRes] = await Promise.all([
      db.from('accounts').select('*').order('name'),
      db.from('categories').select('*').order('name'),
    ]);

    if (accRes.error) throw accRes.error;
    if (catRes.error) throw catRes.error;

    // Paginate transactions deterministically by created_at + id. Ordering by a
    // non-unique column alone can repeat or skip rows across pages.
    const pageSize = 1000;
    const rows: Record<string, unknown>[] = [];
    for (let page = 0; ; page += 1) {
      const from = page * pageSize;
      const { data, error } = await db
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;
      rows.push(...(data as Record<string, unknown>[]));
      if (data.length < pageSize) break;
    }

    const transactions = rows.map(mapTransactionRow);
    const categories = (catRes.data || []).map((row) =>
      mapCategoryRow(row as Record<string, unknown>)
    );
    const rawAccounts = (accRes.data || []).map((row) =>
      mapAccountRow(row as Record<string, unknown>)
    );

    // A custom order beats the alphabetical one from the query. Both sides are
    // kept: the server response is still `order('name')` so an older database
    // without `sort_order` keeps working.
    const accountsByOrder = [...rawAccounts].sort(compareAccountsByDisplayOrder);
    rawAccounts.length = 0;
    rawAccounts.push(...accountsByOrder);

    // Remember which ids exist server-side so a later offline edit is queued as
    // an update instead of an insert against a uuid that already exists.
    markRowsSynced(transactions);
    markRowsSynced(categories);
    markRowsSynced(rawAccounts);

    const accounts = calculateAccountBalances(rawAccounts, transactions);

    const resolvedCategories = categories.length > 0 ? categories : INITIAL_CATEGORIES;
    writeLocalSnapshot({ accounts, categories: resolvedCategories, transactions });

    return { accounts, categories: resolvedCategories, transactions };
  } catch (err) {
    const classification = classifyWriteError(err);
    console.warn(`Falling back to the local snapshot (${classification.reason}):`, err);
    return localFinancialData();
  }
}

/* ------------------------------------------------------------------ *
 * Write helpers
 * ------------------------------------------------------------------ */

/**
 * Resolves the client for a remote write, or throws the reason it is impossible.
 *
 * All three write helpers used to repeat this check verbatim. Keeping it in one
 * place means the "no backend configured" and "device is offline" paths cannot
 * drift apart, and both reach the outbox through the same classifier.
 */
async function requireClient() {
  const db = await loadSupabase();
  if (!db) throw new Error('Supabase client is not configured');
  if (isBrowserOffline()) {
    throw new Error('Perangkat sedang offline');
  }
  return db;
}

/**
 * Rejects a write addressed to a row that the server cannot have.
 *
 * Seeded accounts and categories carry readable ids (`'cash'`, `'makan'`) in the
 * `uuid` primary key column. Postgres answers such a write with `22P02`, which
 * the classifier treats as permanent — correctly, but the user would see a red
 * error for a row the app itself created. Returning the outcome here means the
 * call is skipped locally instead of becoming a doomed request.
 */
function isLocalOnlyRow(rowId: string): boolean {
  return !isUuid(rowId);
}

async function upsertRemote(
  table: OutboxTable,
  rowId: string,
  values: Record<string, unknown>
): Promise<void> {
  if (isLocalOnlyRow(rowId)) return;
  const db = await requireClient();
  const { error } = await db.from(table).upsert({ id: rowId, ...values }, { onConflict: 'id' });
  if (error) throw error;
}

async function updateRemote(
  table: OutboxTable,
  rowId: string,
  values: Record<string, unknown>
): Promise<void> {
  if (isLocalOnlyRow(rowId)) return;
  const db = await requireClient();
  const { error } = await db.from(table).update(values).eq('id', rowId);
  if (error) throw error;
}

async function deleteRemote(table: OutboxTable, rowId: string): Promise<void> {
  if (isLocalOnlyRow(rowId)) return;
  const db = await requireClient();
  const { error } = await db.from(table).delete().eq('id', rowId);
  if (error) throw error;
}

/**
 * Runs a remote write and decides what the caller should believe.
 * Retryable failures queue the mutation; permanent failures throw.
 */
async function performWrite(
  table: OutboxTable,
  action: 'upsert' | 'update' | 'delete',
  rowId: string,
  values: Record<string, unknown>
): Promise<{ queued: boolean }> {
  if (!isSupabaseConfigured) {
    return { queued: false };
  }

  // A seeded row (`'cash'`, `'makan'`) has no server counterpart to update or
  // delete, and cannot be inserted under that id. Skipping here keeps it out of
  // the outbox, so it can never become a permanently failing queue entry.
  if (isLocalOnlyRow(rowId)) {
    return { queued: false };
  }

  try {
    if (action === 'upsert') await upsertRemote(table, rowId, values);
    else if (action === 'update') await updateRemote(table, rowId, values);
    else await deleteRemote(table, rowId);

    // The server now owns this id (or no longer has it). Recording that is what
    // keeps a later offline edit an `update` rather than a re-insert.
    if (action === 'delete') markRowDeleted(rowId);
    else markRowSynced(rowId);

    return { queued: false };
  } catch (err) {
    const classification = classifyWriteError(err);

    if (classification.retryable) {
      if (action === 'delete') enqueueDelete(table, rowId);
      else enqueueUpsert(table, rowId, values);
      console.warn(`Queued ${action} ${table} for offline sync (${classification.reason}):`, err);
      return { queued: true };
    }

    throw new PermanentWriteError(
      classification.userMessage,
      classification.reason,
      classification.detail
    );
  }
}

/* ------------------------------------------------------------------ *
 * Transactions
 * ------------------------------------------------------------------ */

export interface TransactionInput {
  date: string;
  type: TransactionType;
  amount: number;
  sourceAccountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  notes: string;
}

function transactionValues(txData: TransactionInput): Record<string, unknown> {
  return {
    date: txData.date,
    type: txData.type,
    amount: txData.amount,
    source_account_id: txData.sourceAccountId,
    destination_account_id: txData.destinationAccountId || null,
    category_id: txData.categoryId || null,
    notes: txData.notes ?? '',
  };
}

/**
 * Creates a transaction.
 *
 * The id is generated once, on the client, and is the id the server row will
 * have. That is what makes the optimistic insert safe: a queued write and the
 * local record share a single identity, so the caller never has to guess.
 *
 * @param rowId Optional pre-generated id reuse when the caller retries.
 */
export async function addTransactionToDatabase(
  txData: TransactionInput,
  rowId?: string
): Promise<Transaction> {
  const id = rowId || crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const values = transactionValues(txData);

  await performWrite('transactions', 'upsert', id, values);

  return {
    id,
    date: txData.date,
    type: txData.type,
    amount: txData.amount,
    sourceAccountId: txData.sourceAccountId,
    destinationAccountId: txData.destinationAccountId,
    categoryId: txData.categoryId,
    notes: txData.notes ?? '',
    createdAt,
  };
}

/** Updates a transaction. Non-retryable failures throw `PermanentWriteError`. */
export async function updateTransactionInDatabase(
  id: string,
  txData: TransactionInput
): Promise<{ queued: boolean }> {
  return performWrite('transactions', 'update', id, transactionValues(txData));
}

/** Deletes a transaction. Non-retryable failures throw `PermanentWriteError`. */
export async function deleteTransactionFromDatabase(id: string): Promise<{ queued: boolean }> {
  return performWrite('transactions', 'delete', id, {});
}

/* ------------------------------------------------------------------ *
 * Accounts
 * ------------------------------------------------------------------ */

export interface AccountInput {
  name: string;
  type: AccountType;
  website?: string;
  initialBalance: number;
  sortOrder?: number;
}

function accountValues(account: AccountInput): Record<string, unknown> {
  const values: Record<string, unknown> = {
    name: account.name,
    type: account.type,
    website: account.website || null,
    icon_url: getAccountIcon(account.name, account.website),
    initial_balance: account.initialBalance,
  };
  // Only sent when known, so an older deployment whose `accounts` table has no
  // `sort_order` column keeps accepting edits instead of rejecting every write.
  if (account.sortOrder !== undefined) values.sort_order = account.sortOrder;
  return values;
}

/**
 * Persists a new display order for the Saldo list.
 *
 * One `update` per account, because that is the shape `performWrite` already
 * guarantees: each row is either accepted or queued for retry independently.
 * A partial failure therefore leaves a usable list, never a half-renumbered one
 * applied to the wrong accounts.
 */
export async function reorderAccountsInDatabase(
  orderedIds: string[]
): Promise<{ queued: boolean }> {
  let queued = false;
  for (const [index, id] of orderedIds.entries()) {
    const result = await performWrite('accounts', 'update', id, { sort_order: index });
    queued = queued || result.queued;
  }
  return { queued };
}

export async function addAccountToDatabase(account: AccountInput): Promise<Account> {
  const id = crypto.randomUUID();
  const iconUrl = getAccountIcon(account.name, account.website);
  const values = { ...accountValues(account), icon_url: iconUrl };

  await performWrite('accounts', 'upsert', id, values);

  return {
    id,
    name: account.name,
    type: account.type,
    website: account.website,
    icon: iconUrl,
    initialBalance: account.initialBalance,
    balance: account.initialBalance,
  };
}

export async function updateAccountInDatabase(
  id: string,
  updates: AccountInput
): Promise<{ queued: boolean }> {
  return performWrite('accounts', 'update', id, accountValues(updates));
}

export async function deleteAccountFromDatabase(id: string): Promise<{ queued: boolean }> {
  return performWrite('accounts', 'delete', id, {});
}

/* ------------------------------------------------------------------ *
 * Categories
 * ------------------------------------------------------------------ */

export interface CategoryInput {
  name: string;
  type: 'pengeluaran' | 'pemasukan';
  emoji: string;
  icon?: string;
}

function categoryValues(catData: CategoryInput): Record<string, unknown> {
  return {
    name: catData.name,
    type: catData.type,
    emoji: catData.icon || catData.emoji,
  };
}

export async function addCategoryToDatabase(catData: CategoryInput): Promise<Category> {
  const id = crypto.randomUUID();
  const storedIcon = catData.icon || catData.emoji;
  const values = { ...categoryValues(catData), emoji: storedIcon };

  await performWrite('categories', 'upsert', id, values);

  return {
    id,
    name: catData.name,
    type: catData.type,
    emoji: storedIcon,
    icon: storedIcon,
  };
}

export async function updateCategoryInDatabase(
  id: string,
  updates: CategoryInput
): Promise<{ queued: boolean }> {
  return performWrite('categories', 'update', id, categoryValues(updates));
}

export async function deleteCategoryFromDatabase(id: string): Promise<{ queued: boolean }> {
  return performWrite('categories', 'delete', id, {});
}

export { SUPABASE_SESSION_HINT };
