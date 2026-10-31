import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTransactionActions } from './useTransactionActions';
import { useLedger, type LedgerState } from './useLedger';
import { installLocalStorage } from '../test/setup';
import type { Account, Transaction } from '../types';

// ---------------------------------------------------------------------------
// The service layer is mocked: these tests are about the hook's policy
// (optimistic write, rollback on permanent error, queue on transient error),
// not about Supabase.
// ---------------------------------------------------------------------------
vi.mock('../services/financialService', async () => {
  const actual = await vi.importActual<typeof import('../services/financialService')>(
    '../services/financialService'
  );
  return {
    ...actual,
    addTransactionToDatabase: vi.fn(),
    updateTransactionInDatabase: vi.fn(),
    deleteTransactionFromDatabase: vi.fn(),
  };
});

const financialService = await import('../services/financialService');
const addToDb = vi.mocked(financialService.addTransactionToDatabase);
const updateInDb = vi.mocked(financialService.updateTransactionInDatabase);
const deleteFromDb = vi.mocked(financialService.deleteTransactionFromDatabase);

function account(id: string, initialBalance = 0): Account {
  return { id, name: id, type: 'bank', initialBalance, balance: initialBalance };
}

/** Mounts the ledger + transaction actions together, as the app wires them. */
function setup(initial?: Partial<LedgerState>) {
  const onError = vi.fn();
  const refreshSyncStatus = vi.fn();

  const rendered = renderHook(() => {
    const ledger = useLedger();
    const actions = useTransactionActions({
      commit: ledger.commit,
      restore: ledger.restore,
      refreshSyncStatus,
      onError,
    });
    return { ledger, actions };
  });

  if (initial) {
    act(() => {
      rendered.result.current.ledger.commit(() => initial);
    });
  }

  return { ...rendered, onError, refreshSyncStatus };
}

beforeEach(() => {
  installLocalStorage();
  vi.clearAllMocks();
});

describe('addTransaction - success path', () => {
  it('applies the row optimistically and reconciles with the server copy', async () => {
    const saved: Transaction = {
      id: 'server-id',
      date: '2026-01-01',
      type: 'pengeluaran',
      amount: 2500,
      sourceAccountId: 'a',
      notes: 'kopi',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    addToDb.mockResolvedValue(saved);

    const { result } = setup({ accounts: [account('a', 10000)], transactions: [] });

    let outcome: unknown;
    await act(async () => {
      outcome = await result.current.actions.addTransaction({
        type: 'pengeluaran',
        amount: 2500,
        sourceAccountId: 'a',
        date: '2026-01-01',
        notes: 'kopi',
      });
    });

    expect(outcome).toMatchObject({ ok: true, queued: false, tx: saved });
    expect(result.current.ledger.transactions).toEqual([saved]);
    expect(result.current.ledger.accounts[0].balance).toBe(7500);
  });

  it('mints exactly one id, shared by the optimistic row and the server call', async () => {
    addToDb.mockImplementation(async (_data, rowId) => ({
      id: rowId!,
      date: '2026-01-01',
      type: 'pengeluaran',
      amount: 1000,
      sourceAccountId: 'a',
      createdAt: '2026-01-01T00:00:00.000Z',
    }));

    const { result } = setup({ accounts: [account('a', 5000)], transactions: [] });

    await act(async () => {
      await result.current.actions.addTransaction({
        type: 'pengeluaran',
        amount: 1000,
        sourceAccountId: 'a',
        date: '2026-01-01',
        notes: '',
      });
    });

    const passedId = addToDb.mock.calls[0][1];
    expect(passedId).toBeDefined();
    expect(result.current.ledger.transactions).toHaveLength(1);
    // The id the server was told about is the id now on screen: a second uuid
    // here is what used to duplicate the transaction.
    expect(result.current.ledger.transactions[0].id).toBe(passedId);
  });

  it('marks the row pending while the write is in flight', async () => {
    let resolveWrite: (value: Transaction) => void = () => {};
    addToDb.mockImplementation(
      () => new Promise<Transaction>((resolve) => (resolveWrite = resolve))
    );

    const { result } = setup({ accounts: [account('a', 5000)], transactions: [] });

    act(() => {
      void result.current.actions.addTransaction({
        type: 'pengeluaran',
        amount: 1000,
        sourceAccountId: 'a',
        date: '2026-01-01',
        notes: '',
      });
    });

    expect(result.current.ledger.transactions[0].pendingSync).toBe(true);
    expect(result.current.ledger.accounts[0].balance).toBe(4000);

    await act(async () => {
      resolveWrite({
        id: result.current.ledger.transactions[0].id,
        date: '2026-01-01',
        type: 'pengeluaran',
        amount: 1000,
        sourceAccountId: 'a',
        createdAt: '2026-01-01T00:00:00.000Z',
      });
    });
  });
});

describe('addTransaction - permanent failure', () => {
  it('rolls the optimistic row back and reports the error', async () => {
    const { PermanentWriteError } = await import('../lib/errors');
    addToDb.mockRejectedValue(new PermanentWriteError('uuid tidak valid', 'invalid', '22P02'));

    const { result, onError } = setup({ accounts: [account('a', 10000)], transactions: [] });

    let outcome: { ok: boolean; queued: boolean } | undefined;
    await act(async () => {
      outcome = await result.current.actions.addTransaction({
        type: 'pengeluaran',
        amount: 2500,
        sourceAccountId: 'a',
        date: '2026-01-01',
        notes: '',
      });
    });

    expect(outcome).toMatchObject({ ok: false, queued: false });
    expect(result.current.ledger.transactions).toEqual([]);
    // The balance must return to its pre-write value, not stay debited.
    expect(result.current.ledger.accounts[0].balance).toBe(10000);
    expect(onError).toHaveBeenCalledWith('Transaksi gagal disimpan', 'uuid tidak valid');
  });
});

describe('addTransaction - transient failure', () => {
  it('keeps the row and reports it as queued', async () => {
    // A network error is retryable: the outbox owns it from here.
    addToDb.mockRejectedValue(new TypeError('Failed to fetch'));

    const { result, onError, refreshSyncStatus } = setup({
      accounts: [account('a', 10000)],
      transactions: [],
    });

    let outcome: { ok: boolean; queued: boolean } | undefined;
    await act(async () => {
      outcome = await result.current.actions.addTransaction({
        type: 'pengeluaran',
        amount: 2500,
        sourceAccountId: 'a',
        date: '2026-01-01',
        notes: '',
      });
    });

    expect(outcome).toMatchObject({ ok: true, queued: true });
    expect(result.current.ledger.transactions).toHaveLength(1);
    expect(result.current.ledger.transactions[0].pendingSync).toBe(true);
    expect(result.current.ledger.accounts[0].balance).toBe(7500);
    expect(onError).not.toHaveBeenCalled();
    expect(refreshSyncStatus).toHaveBeenCalled();
  });
});

describe('updateTransaction', () => {
  const existing: Transaction = {
    id: 't1',
    date: '2026-01-01',
    type: 'pengeluaran',
    amount: 2000,
    sourceAccountId: 'a',
    categoryId: 'c1',
    notes: 'lama',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('recomputes balances after an amount change', async () => {
    updateInDb.mockResolvedValue({ queued: false });

    const { result } = setup({ accounts: [account('a', 10000)], transactions: [existing] });
    expect(result.current.ledger.accounts[0].balance).toBe(8000);

    await act(async () => {
      await result.current.actions.updateTransaction({
        id: 't1',
        type: 'pengeluaran',
        amount: 5000,
        sourceAccountId: 'a',
        categoryId: 'c1',
        date: '2026-01-01',
        notes: 'baru',
      });
    });

    expect(result.current.ledger.accounts[0].balance).toBe(5000);
    expect(result.current.ledger.transactions[0].notes).toBe('baru');
  });

  it('rolls back when the server rejects the change permanently', async () => {
    const { PermanentWriteError } = await import('../lib/errors');
    updateInDb.mockRejectedValue(new PermanentWriteError('ditolak RLS', 'unauthorized', '42501'));

    const { result, onError } = setup({ accounts: [account('a', 10000)], transactions: [existing] });

    await act(async () => {
      await result.current.actions.updateTransaction({
        id: 't1',
        type: 'pengeluaran',
        amount: 9000,
        sourceAccountId: 'a',
        categoryId: 'c1',
        date: '2026-01-01',
        notes: 'gagal',
      });
    });

    expect(result.current.ledger.transactions[0].amount).toBe(2000);
    expect(result.current.ledger.accounts[0].balance).toBe(8000);
    expect(onError).toHaveBeenCalledWith('Perubahan gagal disimpan', 'ditolak RLS');
  });

  it('keeps the local change when the failure is transient', async () => {
    updateInDb.mockRejectedValue(new TypeError('Failed to fetch'));

    const { result, onError } = setup({ accounts: [account('a', 10000)], transactions: [existing] });

    await act(async () => {
      await result.current.actions.updateTransaction({
        id: 't1',
        type: 'pengeluaran',
        amount: 5000,
        sourceAccountId: 'a',
        categoryId: 'c1',
        date: '2026-01-01',
        notes: 'offline',
      });
    });

    expect(result.current.ledger.transactions[0].amount).toBe(5000);
    expect(onError).not.toHaveBeenCalled();
  });
});

describe('deleteTransaction', () => {
  const existing: Transaction = {
    id: 't1',
    date: '2026-01-01',
    type: 'pengeluaran',
    amount: 2000,
    sourceAccountId: 'a',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('removes the row and credits the balance back', async () => {
    deleteFromDb.mockResolvedValue({ queued: false });

    const { result } = setup({ accounts: [account('a', 8000)], transactions: [existing] });
    expect(result.current.ledger.accounts[0].balance).toBe(6000);

    await act(async () => {
      await result.current.actions.deleteTransaction('t1');
    });

    expect(result.current.ledger.transactions).toEqual([]);
    expect(result.current.ledger.accounts[0].balance).toBe(8000);
  });

  it('restores the row when the delete is permanently rejected', async () => {
    const { PermanentWriteError } = await import('../lib/errors');
    deleteFromDb.mockRejectedValue(new PermanentWriteError('tidak diizinkan', 'unauthorized', '42501'));

    const { result, onError } = setup({ accounts: [account('a', 8000)], transactions: [existing] });

    await act(async () => {
      await result.current.actions.deleteTransaction('t1');
    });

    expect(result.current.ledger.transactions).toHaveLength(1);
    expect(result.current.ledger.accounts[0].balance).toBe(6000);
    expect(onError).toHaveBeenCalledWith('Transaksi gagal dihapus', 'tidak diizinkan');
  });
});

describe('concurrent writes', () => {
  it('does not lose a row when two saves are fired in the same tick', async () => {
    addToDb.mockImplementation(async (data, rowId) => ({
      id: rowId!,
      date: data.date,
      type: data.type,
      // Echo the submitted amount. A hard-coded value would make both rows look
      // identical and hide the very bug this test exists to catch.
      amount: data.amount,
      sourceAccountId: data.sourceAccountId,
      createdAt: '2026-01-01T00:00:00.000Z',
    }));

    const { result } = setup({ accounts: [account('a', 10000)], transactions: [] });

    await act(async () => {
      await Promise.all([
        result.current.actions.addTransaction({
          type: 'pengeluaran',
          amount: 1000,
          sourceAccountId: 'a',
          date: '2026-01-01',
          notes: 'satu',
        }),
        result.current.actions.addTransaction({
          type: 'pengeluaran',
          amount: 2000,
          sourceAccountId: 'a',
          date: '2026-01-01',
          notes: 'dua',
        }),
      ]);
    });

    // Both must survive: reading render-time state for the second write would
    // have overwritten the first.
    expect(result.current.ledger.transactions).toHaveLength(2);
    expect(result.current.ledger.accounts[0].balance).toBe(7000);
  });
});
