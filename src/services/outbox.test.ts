import { beforeEach, describe, expect, it } from 'vitest';
import {
  OUTBOX_KEY,
  clearOutbox,
  clearOutboxItem,
  discardStuckItems,
  enqueueDelete,
  enqueueMutation,
  enqueueUpsert,
  getPendingRowIds,
  getPendingSyncCount,
  getStuckSyncItems,
  isRowSynced,
  markPendingRows,
  markRowDeleted,
  markRowSynced,
  markRowsSynced,
  normalizeOutboxItem,
  readOutbox,
} from './outbox';
import { installLocalStorage, setOnline } from '../test/setup';

let storage: ReturnType<typeof installLocalStorage>;

beforeEach(() => {
  storage = installLocalStorage();
  setOnline(true);
  clearOutbox();
});

describe('readOutbox', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(readOutbox()).toEqual([]);
  });

  it('survives corrupt JSON', () => {
    storage.setItem(OUTBOX_KEY, '{not json');
    expect(readOutbox()).toEqual([]);
  });

  it('survives a non-array payload', () => {
    storage.setItem(OUTBOX_KEY, '{"a":1}');
    expect(readOutbox()).toEqual([]);
  });

  it('drops entries that cannot be normalised', () => {
    storage.setItem(OUTBOX_KEY, JSON.stringify([{ action: 'nonsense' }, null, 42]));
    expect(readOutbox()).toEqual([]);
  });
});

describe('enqueueUpsert - collapsing mutations', () => {
  it('records a single insert', () => {
    const id = crypto.randomUUID();
    enqueueUpsert('transactions', id, { amount: 1000 });

    const queue = readOutbox();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ clientRowId: id, table: 'transactions', action: 'insert' });
  });

  it('merges repeated upserts into one insert with the latest values', () => {
    const id = crypto.randomUUID();
    enqueueUpsert('transactions', id, { amount: 1000, notes: 'awal' });
    enqueueUpsert('transactions', id, { amount: 2500, notes: 'revisi' });
    enqueueUpsert('transactions', id, { amount: 3000, notes: 'final' });

    const queue = readOutbox();
    expect(queue).toHaveLength(1);
    expect(queue[0].action).toBe('insert');
    expect(queue[0].payload).toMatchObject({ amount: 3000, notes: 'final' });
    expect(queue[0].clientRowId).toBe(id);
  });

  it('keeps a partial patch instead of replacing the payload', () => {
    const id = crypto.randomUUID();
    enqueueUpsert('transactions', id, { amount: 1000, notes: 'catatan' });
    enqueueUpsert('transactions', id, { amount: 5000 });

    expect(readOutbox()[0].payload).toMatchObject({ amount: 5000, notes: 'catatan' });
  });

  it('downgrades an insert to an update once the row exists on the server', () => {
    const id = crypto.randomUUID();
    markRowSynced(id);

    enqueueUpsert('accounts', id, { name: 'BCA Revisi' });

    const queue = readOutbox();
    expect(queue).toHaveLength(1);
    expect(queue[0].action).toBe('update');
  });

  it('keeps a pending insert an insert even when the row is marked synced', () => {
    const id = crypto.randomUUID();
    enqueueUpsert('transactions', id, { amount: 1000 });
    markRowSynced(id);
    enqueueUpsert('transactions', id, { amount: 2000 });

    expect(readOutbox()[0].action).toBe('insert');
  });

  it('resets attempts and the error when new values arrive', () => {
    const id = crypto.randomUUID();
    enqueueUpsert('transactions', id, { amount: 1 });
    const queue = readOutbox();
    queue[0].attempts = 5;
    queue[0].retryable = false;
    queue[0].lastError = 'boom';
    storage.setItem(OUTBOX_KEY, JSON.stringify(queue));

    enqueueUpsert('transactions', id, { amount: 2 });

    expect(readOutbox()[0]).toMatchObject({ attempts: 0, retryable: true, lastError: undefined });
  });
});

describe('enqueueDelete - collapsing mutations', () => {
  it('removes a still-unsent insert instead of queueing a delete', () => {
    const id = crypto.randomUUID();
    enqueueUpsert('transactions', id, { amount: 1000 });
    enqueueDelete('transactions', id);

    expect(readOutbox()).toEqual([]);
    expect(getPendingSyncCount()).toBe(0);
  });

  it('turns an update on a synced row into a delete', () => {
    const id = crypto.randomUUID();
    markRowSynced(id);
    enqueueUpsert('accounts', id, { name: 'Baru' });
    enqueueDelete('accounts', id);

    const queue = readOutbox();
    expect(queue).toHaveLength(1);
    expect(queue[0].action).toBe('delete');
    expect(queue[0].payload).toEqual({});
  });

  it('collapses a repeated delete into one entry', () => {
    const id = crypto.randomUUID();
    markRowSynced(id);
    enqueueDelete('accounts', id);
    enqueueDelete('accounts', id);

    expect(readOutbox()).toHaveLength(1);
  });
});

describe('queue bookkeeping', () => {
  it('counts and lists pending ids', () => {
    const a = crypto.randomUUID();
    const b = crypto.randomUUID();
    enqueueUpsert('accounts', a, {});
    enqueueUpsert('categories', b, {});

    expect(getPendingSyncCount()).toBe(2);
    expect(getPendingRowIds()).toEqual(new Set([a, b]));
  });

  it('removes one item by id', () => {
    const a = crypto.randomUUID();
    const b = crypto.randomUUID();
    enqueueUpsert('accounts', a, {});
    enqueueUpsert('accounts', b, {});
    clearOutboxItem(a);

    expect(getPendingRowIds()).toEqual(new Set([b]));
  });

  it('discards only the permanently-failed items', () => {
    const good = crypto.randomUUID();
    const bad = crypto.randomUUID();
    enqueueUpsert('accounts', good, {});
    enqueueUpsert('accounts', bad, {});
    const queue = readOutbox();
    queue.find((item) => item.clientRowId === bad)!.retryable = false;
    storage.setItem(OUTBOX_KEY, JSON.stringify(queue));

    expect(getStuckSyncItems()).toHaveLength(1);
    expect(discardStuckItems()).toBe(1);
    expect(getPendingRowIds()).toEqual(new Set([good]));
  });

  it('reports zero discarded when nothing is stuck', () => {
    enqueueUpsert('accounts', crypto.randomUUID(), {});
    expect(discardStuckItems()).toBe(0);
  });

  it('marks pending rows for optimistic UI', () => {
    const id = crypto.randomUUID();
    enqueueUpsert('transactions', id, {});
    const rows = [{ id }, { id: 'lain' }];

    expect(markPendingRows(rows)).toEqual([{ id, pendingSync: true }, { id: 'lain' }]);
  });

  it('returns the same array reference when nothing is pending', () => {
    const rows = [{ id: 'a' }];
    expect(markPendingRows(rows)).toBe(rows);
  });

  it('writes via enqueueMutation with an explicit action', () => {
    const id = crypto.randomUUID();
    enqueueMutation('transactions', 'insert', id, { amount: 1 });
    expect(readOutbox()[0].action).toBe('insert');
  });
});

describe('row origin tracking', () => {
  it('remembers and forgets synced ids', () => {
    const id = crypto.randomUUID();
    expect(isRowSynced(id)).toBe(false);

    markRowSynced(id);
    expect(isRowSynced(id)).toBe(true);

    markRowDeleted(id);
    expect(isRowSynced(id)).toBe(false);
  });

  it('marks many rows at once', () => {
    const rows = [{ id: crypto.randomUUID() }, { id: crypto.randomUUID() }];
    markRowsSynced(rows);
    rows.forEach((row) => expect(isRowSynced(row.id)).toBe(true));
  });

  it('tolerates corrupt storage', () => {
    storage.setItem('ft_known_rows', 'bukan json');
    expect(isRowSynced('apa saja')).toBe(false);
  });
});

describe('normalizeOutboxItem - format migration', () => {
  it('keeps the current format intact', () => {
    const id = crypto.randomUUID();
    const item = normalizeOutboxItem({
      clientRowId: id,
      table: 'transactions',
      action: 'insert',
      payload: { amount: 10 },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      attempts: 2,
    });

    expect(item).toMatchObject({ clientRowId: id, action: 'insert', attempts: 2, retryable: true });
  });

  it('upgrades the structured intermediate format', () => {
    const id = crypto.randomUUID();
    const item = normalizeOutboxItem({
      action: 'insert',
      payload: { table: 'accounts', rowId: id, values: { name: 'BCA' } },
      timestamp: '2026-01-01T00:00:00.000Z',
    });

    expect(item).toMatchObject({ clientRowId: id, table: 'accounts', action: 'insert' });
    expect(item?.payload).toEqual({ name: 'BCA' });
  });

  it('maps a legacy add_transaction to insert with snake_case columns', () => {
    const id = crypto.randomUUID();
    const item = normalizeOutboxItem({
      action: 'add_transaction',
      payload: {
        id,
        date: '2026-01-01',
        type: 'pengeluaran',
        amount: 5000,
        sourceAccountId: 'acc-1',
        destinationAccountId: undefined,
        categoryId: 'cat-1',
        notes: 'kopi',
      },
    });

    expect(item?.action).toBe('insert');
    expect(item?.table).toBe('transactions');
    expect(item?.payload).toEqual({
      date: '2026-01-01',
      type: 'pengeluaran',
      amount: 5000,
      source_account_id: 'acc-1',
      destination_account_id: null,
      category_id: 'cat-1',
      notes: 'kopi',
    });
  });

  it.each([
    ['update_transaction', 'update', 'transactions'],
    ['delete_transaction', 'delete', 'transactions'],
    ['add_account', 'insert', 'accounts'],
    ['update_account', 'update', 'accounts'],
    ['add_category', 'insert', 'categories'],
    ['delete_category', 'delete', 'categories'],
  ])('maps legacy action %s to %s on %s', (action, expectedAction, expectedTable) => {
    const item = normalizeOutboxItem({ action, payload: { id: crypto.randomUUID() } });
    expect(item?.action).toBe(expectedAction);
    expect(item?.table).toBe(expectedTable);
  });

  it('maps legacy account and category fields', () => {
    const account = normalizeOutboxItem({
      action: 'add_account',
      payload: { id: crypto.randomUUID(), name: 'Jago', type: 'bank', initialBalance: 1000 },
    });
    expect(account?.payload).toMatchObject({ name: 'Jago', type: 'bank', initial_balance: 1000 });

    const category = normalizeOutboxItem({
      action: 'add_category',
      payload: { id: crypto.randomUUID(), name: 'Makan', type: 'pengeluaran' },
    });
    expect(category?.payload).toMatchObject({ name: 'Makan', emoji: '\u{1F3F7}\u{FE0F}' });
  });

  it('synthesises a stable id when a legacy payload has none', () => {
    const raw = { action: 'add_transaction', payload: { amount: 1, createdAt: 1000 } };
    const first = normalizeOutboxItem(raw);
    const second = normalizeOutboxItem(raw);
    expect(first?.clientRowId).toBeDefined();
    expect(first?.clientRowId).toBe(second?.clientRowId);
  });

  it('rejects unknown shapes', () => {
    expect(normalizeOutboxItem(null)).toBeNull();
    expect(normalizeOutboxItem('teks')).toBeNull();
    expect(normalizeOutboxItem({ action: 'hapus_semua' })).toBeNull();
  });
});

describe('seeded rows are never queued', () => {
  it('skips a mutation for a non-uuid row id', () => {
    // A seeded account such as 'cash' has no server row and its id would be
    // rejected by the uuid column, so it must never enter the queue.
    enqueueUpsert('accounts', 'cash', { name: 'CASH' });
    expect(getPendingSyncCount()).toBe(0);
  });

  it('still queues a real uuid', () => {
    enqueueUpsert('accounts', crypto.randomUUID(), { name: 'BCA' });
    expect(getPendingSyncCount()).toBe(1);
  });

  it('skips a delete for a non-uuid row id', () => {
    enqueueDelete('categories', 'makan');
    expect(getPendingSyncCount()).toBe(0);
  });
});
