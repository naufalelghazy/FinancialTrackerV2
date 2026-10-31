import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLedger } from './useLedger';
import { installLocalStorage } from '../test/setup';
import type { Account, Transaction } from '../types';

// The ledger reads the offline snapshot on mount; clean storage per test keeps
// the seeded fallback deterministic.
beforeEach(() => {
  installLocalStorage();
});

function account(id: string, initialBalance = 0): Account {
  return { id, name: id, type: 'bank', initialBalance, balance: initialBalance };
}

function tx(partial: Partial<Transaction> & Pick<Transaction, 'id' | 'amount' | 'type'>): Transaction {
  return {
    date: '2026-01-01',
    sourceAccountId: 'a',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

describe('useLedger', () => {
  it('starts from the seeded fallback on a cold start', () => {
    const { result } = renderHook(() => useLedger());
    expect(result.current.accounts.length).toBeGreaterThan(0);
    expect(result.current.transactions).toEqual([]);
  });

  it('derives balances from the transactions on commit', () => {
    const { result } = renderHook(() => useLedger());

    act(() => {
      result.current.commit(() => ({
        accounts: [account('a', 10000)],
        transactions: [tx({ id: '1', type: 'pengeluaran', amount: 2500, sourceAccountId: 'a' })],
      }));
    });

    expect(result.current.accounts[0].balance).toBe(7500);
  });

  it('keeps untouched slices when the updater omits them', () => {
    const { result } = renderHook(() => useLedger());

    act(() => {
      result.current.commit(() => ({ transactions: [] }));
    });

    expect(result.current.accounts.length).toBeGreaterThan(0);
    expect(result.current.categories.length).toBeGreaterThan(0);
  });

  it('returns the previous state so a caller can roll back', () => {
    const { result } = renderHook(() => useLedger());

    let previous: unknown;
    act(() => {
      previous = result.current.commit(() => ({ transactions: [] }));
    });

    expect(previous).toMatchObject({ accounts: expect.any(Array), transactions: [] });
  });

  it('rolls back to the state that was on screen, not a recalculated one', () => {
    const { result } = renderHook(() => useLedger());

    // Seed a known state so the rollback target is unambiguous.
    act(() => {
      result.current.commit(() => ({ accounts: [account('a', 1000)], transactions: [] }));
    });

    let previous: ReturnType<typeof result.current.getLedger> | undefined;
    act(() => {
      previous = result.current.commit(() => ({
        transactions: [tx({ id: 'x', type: 'pengeluaran', amount: 400, sourceAccountId: 'a' })],
      }));
    });

    expect(result.current.accounts[0].balance).toBe(600);
    // The token must be the pre-write state (1000), not the derived one (600).
    expect(previous!.accounts[0].balance).toBe(1000);

    act(() => {
      result.current.restore(previous!);
    });
    expect(result.current.accounts[0].balance).toBe(1000);
    expect(result.current.transactions).toEqual([]);
  });

  it('persists each commit so the next visit starts from the same state', () => {
    const { result } = renderHook(() => useLedger());

    act(() => {
      result.current.commit(() => ({
        accounts: [account('a', 1000)],
        transactions: [tx({ id: '1', type: 'pengeluaran', amount: 400, sourceAccountId: 'a' })],
      }));
    });

    // A fresh hook in the same "browser" reads what was just written.
    const { result: reopened } = renderHook(() => useLedger());
    expect(reopened.current.accounts[0].balance).toBe(600);
    expect(reopened.current.transactions).toHaveLength(1);
  });

  it('getLedger() reflects a commit made in the same tick', () => {
    const { result } = renderHook(() => useLedger());

    act(() => {
      result.current.commit(() => ({ transactions: [] }));
    });

    // The ref updates eagerly, before React re-renders.
    expect(result.current.getLedger().transactions).toEqual([]);
  });

  it('replace() derives balances for a fetched dataset', () => {
    const { result } = renderHook(() => useLedger());

    act(() => {
      result.current.replace({
        accounts: [account('a', 2000)],
        categories: [],
        transactions: [tx({ id: '1', type: 'pengeluaran', amount: 500, sourceAccountId: 'a' })],
      });
    });

    expect(result.current.accounts[0].balance).toBe(1500);
  });

  it('survives a corrupt stored snapshot', () => {
    localStorage.setItem('ft_accounts', 'BUKAN JSON');
    const { result } = renderHook(() => useLedger());
    expect(result.current.accounts.length).toBeGreaterThan(0);
  });
});

describe('useLedger - concurrent writes', () => {
  it('composes two updaters that ran from the same read', () => {
    const { result } = renderHook(() => useLedger());

    act(() => {
      result.current.commit(() => ({
        accounts: [account('a', 10000)],
        transactions: [],
      }));
    });

    // Both handlers read the same snapshot, exactly as two click handlers would
    // before either awaits. The updater form must still keep both rows.
    const snapshot = result.current.getLedger();
    act(() => {
      result.current.commit((current) => ({
        transactions: [
          tx({ id: '1', type: 'pengeluaran', amount: 1000, sourceAccountId: 'a' }),
          ...current.transactions,
        ],
      }));
      result.current.commit((current) => ({
        transactions: [
          tx({ id: '2', type: 'pengeluaran', amount: 2000, sourceAccountId: 'a' }),
          ...current.transactions,
        ],
      }));
    });

    expect(snapshot.transactions).toEqual([]);
    expect(result.current.transactions).toHaveLength(2);
    expect(result.current.accounts[0].balance).toBe(7000);
  });
});

describe('useLedger - referential stability', () => {
  it('keeps action callbacks stable across renders', () => {
    const { result, rerender } = renderHook(() => useLedger());
    const first = result.current.commit;

    rerender();

    // Stable callbacks are what let the action hooks keep short dependency lists.
    expect(result.current.commit).toBe(first);
  });
});
