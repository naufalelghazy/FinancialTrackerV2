import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccountActions } from './useAccountActions';
import { useLedger, type LedgerState } from './useLedger';
import { installLocalStorage } from '../test/setup';
import type { Account } from '../types';

vi.mock('../services/financialService', async () => {
  const actual = await vi.importActual<typeof import('../services/financialService')>(
    '../services/financialService'
  );
  return {
    ...actual,
    addAccountToDatabase: vi.fn(),
    updateAccountInDatabase: vi.fn(),
    deleteAccountFromDatabase: vi.fn(),
  };
});

const financialService = await import('../services/financialService');
const addToDb = vi.mocked(financialService.addAccountToDatabase);
const updateInDb = vi.mocked(financialService.updateAccountInDatabase);
const deleteFromDb = vi.mocked(financialService.deleteAccountFromDatabase);

function account(id: string, initialBalance = 0): Account {
  return { id, name: id, type: 'bank', initialBalance, balance: initialBalance };
}

function setup(initial?: Partial<LedgerState>) {
  const onError = vi.fn();
  const refreshSyncStatus = vi.fn();

  const rendered = renderHook(() => {
    const ledger = useLedger();
    const actions = useAccountActions({
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

describe('saveAccount - update', () => {
  it('applies the edit optimistically', async () => {
    updateInDb.mockResolvedValue({ queued: false });
    const { result, refreshSyncStatus } = setup({
      accounts: [account('a', 5000)],
      transactions: [],
    });

    await act(async () => {
      await result.current.actions.saveAccount({
        id: 'a',
        name: 'BCA Baru',
        type: 'bank',
        initialBalance: 7000,
      });
    });

    expect(result.current.ledger.accounts[0].name).toBe('BCA Baru');
    expect(result.current.ledger.accounts[0].initialBalance).toBe(7000);
    expect(refreshSyncStatus).toHaveBeenCalled();
  });

  it('recomputes the balance when the initial balance changes', async () => {
    updateInDb.mockResolvedValue({ queued: false });
    const { result } = setup({
      accounts: [account('a', 5000)],
      transactions: [
        {
          id: 't1',
          date: '2026-01-01',
          type: 'pengeluaran',
          amount: 1000,
          sourceAccountId: 'a',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });
    expect(result.current.ledger.accounts[0].balance).toBe(4000);

    await act(async () => {
      await result.current.actions.saveAccount({
        id: 'a',
        name: 'a',
        type: 'bank',
        initialBalance: 9000,
      });
    });

    expect(result.current.ledger.accounts[0].balance).toBe(8000);
  });

  it('rolls back on a permanent failure', async () => {
    const { PermanentWriteError } = await import('../lib/errors');
    updateInDb.mockRejectedValue(new PermanentWriteError('tolak', 'unauthorized', '42501'));

    const { result, onError } = setup({ accounts: [account('a', 5000)], transactions: [] });

    await act(async () => {
      await result.current.actions.saveAccount({
        id: 'a',
        name: 'Gagal',
        type: 'bank',
        initialBalance: 1,
      });
    });

    expect(result.current.ledger.accounts[0].name).toBe('a');
    expect(onError).toHaveBeenCalledWith('Akun gagal diperbarui', 'tolak');
  });

  it('keeps the local edit on a transient failure', async () => {
    updateInDb.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = setup({ accounts: [account('a', 5000)], transactions: [] });

    await act(async () => {
      await result.current.actions.saveAccount({
        id: 'a',
        name: 'Offline Edit',
        type: 'bank',
        initialBalance: 5000,
      });
    });

    expect(result.current.ledger.accounts[0].name).toBe('Offline Edit');
  });
});

describe('saveAccount - create', () => {
  it('waits for the server because the server assigns the id', async () => {
    addToDb.mockResolvedValue({ ...account('server-assigned', 3000), name: 'Jago' });

    const { result } = setup({ accounts: [], transactions: [] });

    await act(async () => {
      await result.current.actions.saveAccount({
        name: 'Jago',
        type: 'bank',
        initialBalance: 3000,
      });
    });

    expect(result.current.ledger.accounts).toHaveLength(1);
    expect(result.current.ledger.accounts[0].id).toBe('server-assigned');
  });

  it('does not add a row when creation is permanently rejected', async () => {
    const { PermanentWriteError } = await import('../lib/errors');
    addToDb.mockRejectedValue(new PermanentWriteError('duplikat', 'invalid', '23505'));

    const { result, onError } = setup({ accounts: [], transactions: [] });

    await act(async () => {
      await result.current.actions.saveAccount({
        name: 'BCA',
        type: 'bank',
        initialBalance: 0,
      });
    });

    expect(result.current.ledger.accounts).toEqual([]);
    expect(onError).toHaveBeenCalledWith('Akun gagal ditambahkan', 'duplikat');
  });
});

describe('deleteAccount', () => {
  it('removes the account', async () => {
    deleteFromDb.mockResolvedValue({ queued: false });
    const { result } = setup({ accounts: [account('a'), account('b')], transactions: [] });

    await act(async () => {
      await result.current.actions.deleteAccount('a');
    });

    expect(result.current.ledger.accounts.map((x) => x.id)).toEqual(['b']);
  });

  it('restores the account when the delete is permanently rejected', async () => {
    const { PermanentWriteError } = await import('../lib/errors');
    deleteFromDb.mockRejectedValue(new PermanentWriteError('dipakai transaksi', 'invalid', '23503'));

    const { result, onError } = setup({ accounts: [account('a')], transactions: [] });

    await act(async () => {
      await result.current.actions.deleteAccount('a');
    });

    expect(result.current.ledger.accounts).toHaveLength(1);
    expect(onError).toHaveBeenCalledWith('Akun gagal dihapus', 'dipakai transaksi');
  });
});
