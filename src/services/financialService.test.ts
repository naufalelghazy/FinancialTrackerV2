import { beforeEach, describe, expect, it } from 'vitest';
import {
  calculateAccountBalances,
  mapAccountRow,
  mapCategoryRow,
  mapTransactionRow,
  readLocalSnapshot,
  writeLocalSnapshot,
} from './financialService';
import { enqueueUpsert } from './outbox';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES } from '../lib/constants';
import type { Account, Transaction } from '../types';
import { installLocalStorage, setOnline } from '../test/setup';

let storage: ReturnType<typeof installLocalStorage>;

beforeEach(() => {
  storage = installLocalStorage();
  setOnline(true);
});

function account(id: string, initialBalance = 0, type: Account['type'] = 'bank'): Account {
  return { id, name: id, type, initialBalance, balance: initialBalance };
}

function tx(partial: Partial<Transaction> & Pick<Transaction, 'id' | 'amount' | 'type'>): Transaction {
  return {
    date: '2026-01-01',
    sourceAccountId: 'a',
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('calculateAccountBalances', () => {
  it('starts every account from its initial balance', () => {
    const result = calculateAccountBalances([account('a', 1000), account('b', 500)], []);
    expect(result.map((acc) => acc.balance)).toEqual([1000, 500]);
  });

  it('adds income to the source account', () => {
    const result = calculateAccountBalances([account('a', 0)], [
      tx({ id: '1', type: 'pemasukan', amount: 5000, sourceAccountId: 'a' }),
    ]);
    expect(result[0].balance).toBe(5000);
  });

  it('subtracts expenses from the source account', () => {
    const result = calculateAccountBalances([account('a', 10000)], [
      tx({ id: '1', type: 'pengeluaran', amount: 2500, sourceAccountId: 'a' }),
    ]);
    expect(result[0].balance).toBe(7500);
  });

  it('moves money between accounts on a transfer', () => {
    const result = calculateAccountBalances([account('a', 10000), account('b', 0)], [
      tx({ id: '1', type: 'transfer', amount: 4000, sourceAccountId: 'a', destinationAccountId: 'b' }),
    ]);
    expect(result[0].balance).toBe(6000);
    expect(result[1].balance).toBe(4000);
  });

  it('treats a self-transfer as a no-op', () => {
    const result = calculateAccountBalances([account('a', 1000)], [
      tx({ id: '1', type: 'transfer', amount: 500, sourceAccountId: 'a', destinationAccountId: 'a' }),
    ]);
    expect(result[0].balance).toBe(1000);
  });

  it('applies several transactions in order', () => {
    const result = calculateAccountBalances([account('a', 1000), account('b', 0)], [
      tx({ id: '1', type: 'pemasukan', amount: 500, sourceAccountId: 'a' }),
      tx({ id: '2', type: 'pengeluaran', amount: 200, sourceAccountId: 'a' }),
      tx({ id: '3', type: 'transfer', amount: 300, sourceAccountId: 'a', destinationAccountId: 'b' }),
    ]);
    expect(result[0].balance).toBe(1000);
    expect(result[1].balance).toBe(300);
  });

  it('lets an account go negative (credit cards)', () => {
    const result = calculateAccountBalances([account('cc', 0, 'credit')], [
      tx({ id: '1', type: 'pengeluaran', amount: 750000, sourceAccountId: 'cc' }),
    ]);
    expect(result[0].balance).toBe(-750000);
  });

  it('ignores transactions pointing at an unknown account', () => {
    const result = calculateAccountBalances([account('a', 1000)], [
      tx({ id: '1', type: 'pengeluaran', amount: 500, sourceAccountId: 'hilang' }),
    ]);
    expect(result[0].balance).toBe(1000);
  });

  it('debits a transfer with no destination, matching isExpense()', () => {
    // The balance rule and lib/transactions.isExpense() used to disagree: the
    // balance skipped such a transfer while reports counted it as spending,
    // so the same money vanished from one number and appeared in another.
    const result = calculateAccountBalances([account('a', 1000)], [
      tx({ id: '1', type: 'transfer', amount: 500, sourceAccountId: 'a' }),
    ]);
    expect(result[0].balance).toBe(500);
  });

  it('skips a corrupt amount instead of poisoning every balance', () => {
    const result = calculateAccountBalances([account('a', 1000)], [
      tx({ id: 'bad', type: 'pengeluaran', amount: 'abc' as unknown as number, sourceAccountId: 'a' }),
      tx({ id: 'ok', type: 'pengeluaran', amount: 250, sourceAccountId: 'a' }),
    ]);
    expect(result[0].balance).toBe(750);
    expect(Number.isFinite(result[0].balance)).toBe(true);
  });

  it('skips NaN and Infinity amounts', () => {
    const result = calculateAccountBalances([account('a', 1000)], [
      tx({ id: '1', type: 'pengeluaran', amount: Number.NaN, sourceAccountId: 'a' }),
      tx({ id: '2', type: 'pengeluaran', amount: Number.POSITIVE_INFINITY, sourceAccountId: 'a' }),
    ]);
    expect(result[0].balance).toBe(1000);
  });

  it('falls back to zero for a non-numeric initial balance', () => {
    const broken = { ...account('a'), initialBalance: 'rusak' as unknown as number };
    const result = calculateAccountBalances([broken], []);
    expect(result[0].balance).toBe(0);
    expect(Number.isFinite(result[0].balance)).toBe(true);
  });

  it('does not mutate the input accounts', () => {
    const input = [account('a', 1000)];
    calculateAccountBalances(input, [tx({ id: '1', type: 'pengeluaran', amount: 100, sourceAccountId: 'a' })]);
    expect(input[0].balance).toBe(1000);
  });

  it('flags accounts that exist only on this device', () => {
    const pendingId = crypto.randomUUID();
    enqueueUpsert('accounts', pendingId, { name: 'Offline' });

    const result = calculateAccountBalances([account('a', 100), account(pendingId, 50)], []);
    expect(result[0].pendingSync).toBeUndefined();
    expect(result[1].pendingSync).toBe(true);
  });

  it('clears a stale pending flag', () => {
    const stale = { ...account('a', 100), pendingSync: true };
    const result = calculateAccountBalances([stale], []);
    expect(result[0].pendingSync).toBeUndefined();
  });
});

describe('row mappers', () => {
  it('maps a transaction row', () => {
    const mapped = mapTransactionRow({
      id: 't1',
      date: '2026-03-05T00:00:00+07:00',
      type: 'pengeluaran',
      amount: '15000',
      source_account_id: 'a1',
      destination_account_id: null,
      category_id: 'c1',
      notes: 'kopi',
      created_at: '2026-03-05T01:00:00Z',
    });

    expect(mapped).toMatchObject({
      id: 't1',
      date: '2026-03-05',
      type: 'pengeluaran',
      amount: 15000,
      sourceAccountId: 'a1',
      destinationAccountId: undefined,
      categoryId: 'c1',
      notes: 'kopi',
    });
  });

  it('falls back to pengeluaran for an unknown transaction type', () => {
    expect(mapTransactionRow({ id: 't', type: 'entah' }).type).toBe('pengeluaran');
  });

  it('falls back to zero for a corrupt amount', () => {
    expect(mapTransactionRow({ id: 't', amount: 'abc' }).amount).toBe(0);
  });

  it('maps an account row and resolves an icon', () => {
    const mapped = mapAccountRow({
      id: 'a1',
      name: 'BCA',
      type: 'bank',
      initial_balance: '250000',
    });

    expect(mapped).toMatchObject({ id: 'a1', name: 'BCA', type: 'bank', initialBalance: 250000 });
    expect(typeof mapped.icon).toBe('string');
    expect(mapped.icon!.length).toBeGreaterThan(0);
  });

  it('falls back to the cash type for an unknown account type', () => {
    expect(mapAccountRow({ id: 'a', name: 'x', type: 'kripto' }).type).toBe('cash');
  });

  it('maps a category row', () => {
    expect(mapCategoryRow({ id: 'c1', name: 'Makan', type: 'pengeluaran', emoji: '🍜' })).toMatchObject({
      id: 'c1',
      name: 'Makan',
      type: 'pengeluaran',
      emoji: '🍜',
    });
  });

  it('defaults the category emoji', () => {
    expect(mapCategoryRow({ id: 'c', name: 'x', type: 'pemasukan' }).emoji).toBe('🏷️');
  });
});

describe('readLocalSnapshot', () => {
  it('falls back to the seed data when storage is empty', () => {
    const snapshot = readLocalSnapshot();
    expect(snapshot.accounts).toEqual(INITIAL_ACCOUNTS);
    expect(snapshot.categories).toEqual(INITIAL_CATEGORIES);
    expect(snapshot.transactions).toEqual([]);
  });

  it('reads a previously written snapshot', () => {
    const accounts = [account('a', 1000)];
    const categories = INITIAL_CATEGORIES;
    const transactions = [tx({ id: '1', type: 'pengeluaran', amount: 500 })];

    writeLocalSnapshot({ accounts, categories, transactions });

    const snapshot = readLocalSnapshot();
    expect(snapshot.accounts).toHaveLength(1);
    expect(snapshot.transactions).toHaveLength(1);
    expect(snapshot.categories).toHaveLength(categories.length);
  });

  it('filters out rows without an id', () => {
    storage.setItem('ft_transactions', JSON.stringify([{ id: '', amount: 100 }, { amount: 50 }]));
    expect(readLocalSnapshot().transactions).toEqual([]);
  });

  it('filters out transactions with a non-numeric amount', () => {
    storage.setItem(
      'ft_transactions',
      JSON.stringify([
        { id: 'good', amount: 100 },
        { id: 'bad', amount: 'oops' },
      ])
    );
    expect(readLocalSnapshot().transactions.map((t) => t.id)).toEqual(['good']);
  });

  it('replaces unparseable JSON with the fallback', () => {
    storage.setItem('ft_categories', 'BUKAN JSON');
    expect(readLocalSnapshot().categories).toEqual(INITIAL_CATEGORIES);
  });

  it('replaces a non-array payload with the fallback', () => {
    storage.setItem('ft_accounts', JSON.stringify({ bukan: 'array' }));
    expect(readLocalSnapshot().accounts).toEqual(INITIAL_ACCOUNTS);
  });
});
