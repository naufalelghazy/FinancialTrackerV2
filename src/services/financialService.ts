import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Account, AccountType, Category, Transaction, TransactionType } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES } from '../lib/constants';

export interface FinancialData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}

import { getLogoDevUrl, getLocalFallback, LOCAL_FALLBACK_ICONS, BANK_DOMAIN_MAP } from './logoService';
export { BANK_DOMAIN_MAP };
export const BANK_ICON_MAP = LOCAL_FALLBACK_ICONS;

export function getAccountIcon(name: string, fallbackUrl?: string): string {
  const logoUrl = getLogoDevUrl(name);
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
 * Falls back to localStorage/initial state if Supabase is unconfigured or unreachable.
 */
export async function loadFinancialData(): Promise<FinancialData> {
  if (!isSupabaseConfigured || !supabase) {
    const savedAcc = localStorage.getItem('ft_accounts');
    const savedTx = localStorage.getItem('ft_transactions');
    const localAccounts = savedAcc ? JSON.parse(savedAcc) : INITIAL_ACCOUNTS;
    const localTx = savedTx ? JSON.parse(savedTx) : [];
    return {
      accounts: calculateAccountBalances(localAccounts, localTx),
      categories: INITIAL_CATEGORIES,
      transactions: localTx,
    };
  }

  try {
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
    let allTxs: any[] = [];
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

    const categories: Category[] = (catData || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      emoji: c.emoji || '🏷️',
    }));

    const transactions: Transaction[] = allTxs.map((t: any) => ({
      id: t.id,
      date: t.date,
      type: t.type as TransactionType,
      amount: Number(t.amount),
      sourceAccountId: t.source_account_id,
      destinationAccountId: t.destination_account_id || undefined,
      categoryId: t.category_id || undefined,
      notes: t.notes || '',
      createdAt: t.created_at,
    }));

    const rawAccounts: Account[] = (accData || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      icon: getAccountIcon(a.name, a.icon_url),
      initialBalance: Number(a.initial_balance || 0),
      balance: Number(a.initial_balance || 0),
    }));

    const accountsWithBalances = calculateAccountBalances(rawAccounts, transactions);

    localStorage.setItem('ft_accounts', JSON.stringify(accountsWithBalances));
    localStorage.setItem('ft_transactions', JSON.stringify(transactions));

    return {
      accounts: accountsWithBalances,
      categories: categories.length > 0 ? categories : INITIAL_CATEGORIES,
      transactions,
    };
  } catch (err) {
    console.error('Failed to load from Supabase:', err);
    const savedAcc = localStorage.getItem('ft_accounts');
    const savedTx = localStorage.getItem('ft_transactions');
    const localAccounts = savedAcc ? JSON.parse(savedAcc) : INITIAL_ACCOUNTS;
    const localTx = savedTx ? JSON.parse(savedTx) : [];
    return {
      accounts: calculateAccountBalances(localAccounts, localTx),
      categories: INITIAL_CATEGORIES,
      transactions: localTx,
    };
  }
}

/**
 * Creates a new transaction in Supabase.
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
      const { data, error } = await supabase
        .from('transactions')
        .insert({
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
      console.error('Failed to insert transaction to Supabase:', err);
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
 * Updates an existing transaction in Supabase.
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

    if (error) {
      console.error('Failed to update transaction in Supabase:', error);
      throw error;
    }
  }
}

/**
 * Deletes a transaction from Supabase.
 */
export async function deleteTransactionFromDatabase(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete transaction from Supabase:', error);
      throw error;
    }
  }
}

/**
 * Updates an account in Supabase (name, type, initial_balance).
 */
export async function updateAccountInDatabase(
  id: string,
  updates: {
    name: string;
    type: AccountType;
    initialBalance?: number;
  }
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const iconUrl = getAccountIcon(updates.name);
    const payload: any = {
      name: updates.name,
      type: updates.type,
      icon_url: iconUrl,
    };
    if (updates.initialBalance !== undefined) {
      payload.initial_balance = updates.initialBalance;
    }

    const { error } = await supabase
      .from('accounts')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Failed to update account in Supabase:', error);
      throw error;
    }
  }
}

/**
 * Creates a new account in Supabase.
 */
export async function addAccountToDatabase(account: {
  name: string;
  type: AccountType;
  initialBalance: number;
}): Promise<Account> {
  const iconUrl = getAccountIcon(account.name);
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('accounts')
      .insert({
        name: account.name,
        type: account.type,
        icon_url: iconUrl,
        initial_balance: account.initialBalance,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to insert account in Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      icon: iconUrl,
      initialBalance: Number(data.initial_balance || 0),
      balance: Number(data.initial_balance || 0),
    };
  }

  return {
    id: crypto.randomUUID(),
    name: account.name,
    type: account.type,
    icon: iconUrl,
    initialBalance: account.initialBalance,
    balance: account.initialBalance,
  };
}

/**
 * Deletes an account from Supabase.
 */
export async function deleteAccountFromDatabase(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete account from Supabase:', error);
      throw error;
    }
  }
}
