import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Account, AccountType, Category, Transaction, TransactionType } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES } from '../lib/constants';
import { getLogoDevUrl, getLocalFallback, LOCAL_FALLBACK_ICONS, BANK_DOMAIN_MAP } from './logoService';

export interface FinancialData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}

export { BANK_DOMAIN_MAP };
export const BANK_ICON_MAP = LOCAL_FALLBACK_ICONS;

const OFFLINE_SYNC_QUEUE_KEY = 'ft_pending_sync';

type OfflineSyncAction =
  | {
      action: 'add_transaction';
      payload: {
        id: string;
        date: string;
        type: TransactionType;
        amount: number;
        sourceAccountId: string;
        destinationAccountId?: string;
        categoryId?: string;
        notes: string;
        createdAt: string;
      };
    }
  | {
      action: 'update_transaction';
      payload: {
        id: string;
        date: string;
        type: TransactionType;
        amount: number;
        sourceAccountId: string;
        destinationAccountId?: string;
        categoryId?: string;
        notes: string;
      };
    }
  | {
      action: 'delete_transaction';
      payload: { id: string };
    }
  | {
      action: 'add_account';
      payload: {
        id: string;
        name: string;
        type: AccountType;
        website?: string;
        iconUrl: string;
        initialBalance: number;
      };
    }
  | {
      action: 'update_account';
      payload: {
        id: string;
        name: string;
        type: AccountType;
        website?: string;
        iconUrl: string;
        initialBalance?: number;
      };
    }
  | {
      action: 'delete_account';
      payload: { id: string };
    }
  | {
      action: 'add_category';
      payload: {
        id: string;
        name: string;
        type: 'pengeluaran' | 'pemasukan';
        emoji: string;
      };
    }
  | {
      action: 'update_category';
      payload: {
        id: string;
        name: string;
        type: 'pengeluaran' | 'pemasukan';
        emoji: string;
      };
    }
  | {
      action: 'delete_category';
      payload: { id: string };
    };

export type OfflineSyncItem = OfflineSyncAction & {
  queueId: string;
  timestamp: string;
};

function loadSyncQueue(): OfflineSyncItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: OfflineSyncItem[]): void {
  try {
    localStorage.setItem(OFFLINE_SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save offline sync queue:', err);
  }
}

function enqueueOfflineSync(item: OfflineSyncAction): void {
  const queue = loadSyncQueue();
  queue.push({
    ...item,
    queueId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });
  saveSyncQueue(queue);
}

export function getPendingSyncCount(): number {
  return loadSyncQueue().length;
}

/**
 * Flushes pending offline mutations to Supabase in chronological order.
 * Returns the number of successfully synced operations.
 */
export async function flushOfflineSyncQueue(): Promise<number> {
  if (!isSupabaseConfigured || !supabase) return 0;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 0;

  const queue = loadSyncQueue();
  if (queue.length === 0) return 0;

  const remaining: OfflineSyncItem[] = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      if (item.action === 'add_transaction') {
        const { error } = await supabase.from('transactions').upsert({
          id: item.payload.id,
          date: item.payload.date,
          type: item.payload.type,
          amount: item.payload.amount,
          source_account_id: item.payload.sourceAccountId,
          destination_account_id: item.payload.destinationAccountId || null,
          category_id: item.payload.categoryId || null,
          notes: item.payload.notes,
        });
        if (error) throw error;
      } else if (item.action === 'update_transaction') {
        const { error } = await supabase
          .from('transactions')
          .update({
            date: item.payload.date,
            type: item.payload.type,
            amount: item.payload.amount,
            source_account_id: item.payload.sourceAccountId,
            destination_account_id: item.payload.destinationAccountId || null,
            category_id: item.payload.categoryId || null,
            notes: item.payload.notes,
          })
          .eq('id', item.payload.id);
        if (error) throw error;
      } else if (item.action === 'delete_transaction') {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', item.payload.id);
        if (error) throw error;
      } else if (item.action === 'add_account') {
        const { error } = await supabase.from('accounts').upsert({
          id: item.payload.id,
          name: item.payload.name,
          type: item.payload.type,
          website: item.payload.website || null,
          icon_url: item.payload.iconUrl,
          initial_balance: item.payload.initialBalance,
        });
        if (error) throw error;
      } else if (item.action === 'update_account') {
        const updatePayload: Record<string, unknown> = {
          name: item.payload.name,
          type: item.payload.type,
          website: item.payload.website || null,
          icon_url: item.payload.iconUrl,
        };
        if (item.payload.initialBalance !== undefined) {
          updatePayload.initial_balance = item.payload.initialBalance;
        }
        const { error } = await supabase
          .from('accounts')
          .update(updatePayload)
          .eq('id', item.payload.id);
        if (error) throw error;
      } else if (item.action === 'delete_account') {
        const { error } = await supabase
          .from('accounts')
          .delete()
          .eq('id', item.payload.id);
        if (error) throw error;
      } else if (item.action === 'add_category') {
        const { error } = await supabase.from('categories').upsert({
          id: item.payload.id,
          name: item.payload.name,
          type: item.payload.type,
          emoji: item.payload.emoji,
        });
        if (error) throw error;
      } else if (item.action === 'update_category') {
        const { error } = await supabase
          .from('categories')
          .update({
            name: item.payload.name,
            type: item.payload.type,
            emoji: item.payload.emoji,
          })
          .eq('id', item.payload.id);
        if (error) throw error;
      } else if (item.action === 'delete_category') {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', item.payload.id);
        if (error) throw error;
      }

      syncedCount += 1;
    } catch (err) {
      console.warn('Failed to flush offline sync item, keeping in queue:', item.action, err);
      remaining.push(item);
    }
  }

  saveSyncQueue(remaining);
  return syncedCount;
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
 */
export function calculateAccountBalances(
  rawAccounts: Account[],
  transactions: Transaction[]
): Account[] {
  const balanceMap: Record<string, number> = {};

  rawAccounts.forEach((acc) => {
    balanceMap[acc.id] = Number(acc.initialBalance || 0);
  });

  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'pemasukan') {
      if (tx.sourceAccountId && balanceMap[tx.sourceAccountId] !== undefined) {
        balanceMap[tx.sourceAccountId] += amt;
      }
    } else if (tx.type === 'pengeluaran') {
      if (tx.sourceAccountId && balanceMap[tx.sourceAccountId] !== undefined) {
        balanceMap[tx.sourceAccountId] -= amt;
      }
    } else if (tx.type === 'transfer') {
      if (tx.sourceAccountId && balanceMap[tx.sourceAccountId] !== undefined) {
        balanceMap[tx.sourceAccountId] -= amt;
      }
      if (tx.destinationAccountId && balanceMap[tx.destinationAccountId] !== undefined) {
        balanceMap[tx.destinationAccountId] += amt;
      }
    }
  });

  return rawAccounts.map((acc) => ({
    ...acc,
    balance: balanceMap[acc.id] ?? 0,
  }));
}

/**
 * Loads accounts, categories, and all transactions from Supabase.
 * Flushes any pending offline mutations before fetching.
 * Falls back to localStorage/initial state if Supabase is unconfigured or unreachable.
 */
export async function loadFinancialData(): Promise<FinancialData> {
  if (!isSupabaseConfigured || !supabase) {
    const savedAcc = localStorage.getItem('ft_accounts');
    const savedTx = localStorage.getItem('ft_transactions');
    const savedCat = localStorage.getItem('ft_categories');
    const localAccounts = savedAcc ? JSON.parse(savedAcc) : INITIAL_ACCOUNTS;
    const localTx = savedTx ? JSON.parse(savedTx) : [];
    const localCat = savedCat ? JSON.parse(savedCat) : INITIAL_CATEGORIES;
    return {
      accounts: calculateAccountBalances(localAccounts, localTx),
      categories: localCat,
      transactions: localTx,
    };
  }

  try {
    await flushOfflineSyncQueue();

    // 1. Fetch Accounts
    const { data: accData, error: accErr } = await supabase
      .from('accounts')
      .select('*')
      .order('name');
    if (accErr) throw accErr;

    // 2. Fetch Categories
    const { data: catData, error: catErr } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (catErr) throw catErr;

    // 3. Fetch Transactions with pagination loop
    let allTxs: Record<string, unknown>[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data: pageData, error: txErr } = await supabase
        .from('transactions')
        .select('*')
        .range(from, from + pageSize - 1)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (txErr) throw txErr;
      if (!pageData || pageData.length === 0) break;
      allTxs = allTxs.concat(pageData);
      if (pageData.length < pageSize) break;
      from += pageSize;
    }

    const categories: Category[] = (catData || []).map((c: Record<string, unknown>) => ({
      id: String(c.id),
      name: String(c.name),
      type: c.type as 'pengeluaran' | 'pemasukan',
      emoji: String(c.emoji || '🏷️'),
      icon: c.emoji ? String(c.emoji) : undefined,
    }));

    const transactions: Transaction[] = allTxs.map((t: Record<string, unknown>) => ({
      id: String(t.id),
      date: String(t.date),
      type: t.type as TransactionType,
      amount: Number(t.amount),
      sourceAccountId: String(t.source_account_id),
      destinationAccountId: t.destination_account_id ? String(t.destination_account_id) : undefined,
      categoryId: t.category_id ? String(t.category_id) : undefined,
      notes: String(t.notes || ''),
      createdAt: t.created_at ? String(t.created_at) : new Date().toISOString(),
    }));

    const rawAccounts: Account[] = (accData || []).map((a: Record<string, unknown>) => ({
      id: String(a.id),
      name: String(a.name),
      type: a.type as AccountType,
      website: a.website ? String(a.website) : undefined,
      icon: getAccountIcon(
        String(a.name),
        a.website ? String(a.website) : undefined,
        a.icon_url ? String(a.icon_url) : undefined
      ),
      initialBalance: Number(a.initial_balance || 0),
      balance: Number(a.initial_balance || 0),
    }));

    const accountsWithBalances = calculateAccountBalances(rawAccounts, transactions);

    localStorage.setItem('ft_accounts', JSON.stringify(accountsWithBalances));
    localStorage.setItem('ft_transactions', JSON.stringify(transactions));
    localStorage.setItem(
      'ft_categories',
      JSON.stringify(categories.length > 0 ? categories : INITIAL_CATEGORIES)
    );

    return {
      accounts: accountsWithBalances,
      categories: categories.length > 0 ? categories : INITIAL_CATEGORIES,
      transactions,
    };
  } catch (err) {
    console.error('Failed to load from Supabase:', err);
    const savedAcc = localStorage.getItem('ft_accounts');
    const savedTx = localStorage.getItem('ft_transactions');
    const savedCat = localStorage.getItem('ft_categories');
    const localAccounts = savedAcc ? JSON.parse(savedAcc) : INITIAL_ACCOUNTS;
    const localTx = savedTx ? JSON.parse(savedTx) : [];
    const localCat = savedCat ? JSON.parse(savedCat) : INITIAL_CATEGORIES;
    return {
      accounts: calculateAccountBalances(localAccounts, localTx),
      categories: localCat,
      transactions: localTx,
    };
  }
}

/**
 * Creates a new transaction in Supabase, or queues it in the offline sync outbox if offline/unreachable.
 */
export async function addTransactionToDatabase(txData: {
  date: string;
  type: TransactionType;
  amount: number;
  sourceAccountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  notes: string;
}): Promise<Transaction> {
  const tempId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Browser is offline');
      }
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          id: tempId,
          date: txData.date,
          type: txData.type,
          amount: txData.amount,
          source_account_id: txData.sourceAccountId,
          destination_account_id: txData.destinationAccountId || null,
          category_id: txData.categoryId || null,
          notes: txData.notes,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        return {
          id: data.id,
          date: data.date,
          type: data.type,
          amount: Number(data.amount),
          sourceAccountId: data.source_account_id,
          destinationAccountId: data.destination_account_id || undefined,
          categoryId: data.category_id || undefined,
          notes: data.notes || '',
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn('Queued add_transaction for offline sync:', err);
      enqueueOfflineSync({
        action: 'add_transaction',
        payload: {
          id: tempId,
          date: txData.date,
          type: txData.type,
          amount: txData.amount,
          sourceAccountId: txData.sourceAccountId,
          destinationAccountId: txData.destinationAccountId,
          categoryId: txData.categoryId,
          notes: txData.notes,
          createdAt,
        },
      });
    }
  }

  return {
    id: tempId,
    date: txData.date,
    type: txData.type,
    amount: txData.amount,
    sourceAccountId: txData.sourceAccountId,
    destinationAccountId: txData.destinationAccountId,
    categoryId: txData.categoryId,
    notes: txData.notes,
    createdAt,
  };
}

/**
 * Updates an existing transaction in Supabase, or queues the update when offline.
 */
export async function updateTransactionInDatabase(
  id: string,
  txData: {
    date: string;
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    notes: string;
  }
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Browser is offline');
      }
      const { error } = await supabase
        .from('transactions')
        .update({
          date: txData.date,
          type: txData.type,
          amount: txData.amount,
          source_account_id: txData.sourceAccountId,
          destination_account_id: txData.destinationAccountId || null,
          category_id: txData.categoryId || null,
          notes: txData.notes,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('Queued update_transaction for offline sync:', err);
      enqueueOfflineSync({
        action: 'update_transaction',
        payload: {
          id,
          date: txData.date,
          type: txData.type,
          amount: txData.amount,
          sourceAccountId: txData.sourceAccountId,
          destinationAccountId: txData.destinationAccountId,
          categoryId: txData.categoryId,
          notes: txData.notes,
        },
      });
    }
  }
}

/**
 * Deletes a transaction from Supabase, or queues the deletion when offline.
 */
export async function deleteTransactionFromDatabase(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Browser is offline');
      }
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('Queued delete_transaction for offline sync:', err);
      enqueueOfflineSync({
        action: 'delete_transaction',
        payload: { id },
      });
    }
  }
}

/**
 * Updates an account in Supabase (name, type, initial_balance), or queues the update when offline.
 */
export async function updateAccountInDatabase(
  id: string,
  updates: {
    name: string;
    type: AccountType;
    website?: string;
    initialBalance?: number;
  }
): Promise<void> {
  const iconUrl = getAccountIcon(updates.name, updates.website);
  if (isSupabaseConfigured && supabase) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Browser is offline');
      }
      const payload: Record<string, unknown> = {
        name: updates.name,
        type: updates.type,
        website: updates.website || null,
        icon_url: iconUrl,
      };
      if (updates.initialBalance !== undefined) {
        payload.initial_balance = updates.initialBalance;
      }

      const { error } = await supabase
        .from('accounts')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('Queued update_account for offline sync:', err);
      enqueueOfflineSync({
        action: 'update_account',
        payload: {
          id,
          name: updates.name,
          type: updates.type,
          website: updates.website,
          iconUrl,
          initialBalance: updates.initialBalance,
        },
      });
    }
  }
}

/**
 * Creates a new account in Supabase, or queues the creation when offline.
 */
export async function addAccountToDatabase(account: {
  name: string;
  type: AccountType;
  website?: string;
  initialBalance: number;
}): Promise<Account> {
  const tempId = crypto.randomUUID();
  const iconUrl = getAccountIcon(account.name, account.website);
  if (isSupabaseConfigured && supabase) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Browser is offline');
      }
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          id: tempId,
          name: account.name,
          type: account.type,
          website: account.website || null,
          icon_url: iconUrl,
          initial_balance: account.initialBalance,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        return {
          id: data.id,
          name: data.name,
          type: data.type,
          website: data.website || undefined,
          icon: iconUrl,
          initialBalance: Number(data.initial_balance || 0),
          balance: Number(data.initial_balance || 0),
        };
      }
    } catch (err) {
      console.warn('Queued add_account for offline sync:', err);
      enqueueOfflineSync({
        action: 'add_account',
        payload: {
          id: tempId,
          name: account.name,
          type: account.type,
          website: account.website,
          iconUrl,
          initialBalance: account.initialBalance,
        },
      });
    }
  }

  return {
    id: tempId,
    name: account.name,
    type: account.type,
    website: account.website,
    icon: iconUrl,
    initialBalance: account.initialBalance,
    balance: account.initialBalance,
  };
}

/**
 * Deletes an account from Supabase, or queues the deletion when offline.
 */
export async function deleteAccountFromDatabase(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Browser is offline');
      }
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('Queued delete_account for offline sync:', err);
      enqueueOfflineSync({
        action: 'delete_account',
        payload: { id },
      });
    }
  }
}

/**
 * Creates a new category in Supabase, or queues the creation when offline.
 */
export async function addCategoryToDatabase(catData: {
  name: string;
  type: 'pengeluaran' | 'pemasukan';
  emoji: string;
  icon?: string;
}): Promise<Category> {
  const tempId = crypto.randomUUID();
  const storedIcon = catData.icon || catData.emoji;

  if (isSupabaseConfigured && supabase) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Browser is offline');
      }
      const { data, error } = await supabase
        .from('categories')
        .insert({
          id: tempId,
          name: catData.name,
          type: catData.type,
          emoji: storedIcon,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        return {
          id: data.id,
          name: data.name,
          type: data.type,
          emoji: data.emoji || storedIcon,
          icon: data.emoji || storedIcon,
        };
      }
    } catch (err) {
      console.warn('Queued add_category for offline sync:', err);
      enqueueOfflineSync({
        action: 'add_category',
        payload: {
          id: tempId,
          name: catData.name,
          type: catData.type,
          emoji: storedIcon,
        },
      });
    }
  }

  return {
    id: tempId,
    name: catData.name,
    type: catData.type,
    emoji: storedIcon,
    icon: storedIcon,
  };
}

/**
 * Updates an existing category in Supabase, or queues the update when offline.
 */
export async function updateCategoryInDatabase(
  id: string,
  updates: {
    name: string;
    type: 'pengeluaran' | 'pemasukan';
    emoji: string;
    icon?: string;
  }
): Promise<void> {
  const storedIcon = updates.icon || updates.emoji;
  if (isSupabaseConfigured && supabase) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Browser is offline');
      }
      const { error } = await supabase
        .from('categories')
        .update({
          name: updates.name,
          type: updates.type,
          emoji: storedIcon,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('Queued update_category for offline sync:', err);
      enqueueOfflineSync({
        action: 'update_category',
        payload: {
          id,
          name: updates.name,
          type: updates.type,
          emoji: storedIcon,
        },
      });
    }
  }
}

/**
 * Deletes a category from Supabase, or queues the deletion when offline.
 */
export async function deleteCategoryFromDatabase(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('Browser is offline');
      }
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.warn('Queued delete_category for offline sync:', err);
      enqueueOfflineSync({
        action: 'delete_category',
        payload: { id },
      });
    }
  }
}
