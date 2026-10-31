import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUiState } from './useUiState';
import { installLocalStorage } from '../test/setup';
import { markNextLoadAsReload } from '../lib/sessionFlag';
import type { Account, Category, QuickTemplate, Transaction } from '../types';

function installSessionStorage(): void {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() {
        return store.size;
      },
    },
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  installLocalStorage();
  installSessionStorage();
});

function account(id: string): Account {
  return { id, name: id, type: 'bank', balance: 0 };
}

function transaction(id: string): Transaction {
  return {
    id,
    date: '2026-01-01',
    type: 'pengeluaran',
    amount: 1000,
    sourceAccountId: 'a',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('useUiState - navigation', () => {
  it('starts on the dashboard when nothing was visited before', () => {
    const { result } = renderHook(() => useUiState());
    expect(result.current.activeTab).toBe('dashboard');
  });

  it('switches tabs', () => {
    const { result } = renderHook(() => useUiState());
    act(() => result.current.setActiveTab('riwayat'));
    expect(result.current.activeTab).toBe('riwayat');
  });

  it('defaults the history filter to all accounts', () => {
    const { result } = renderHook(() => useUiState());
    expect(result.current.historyAccountFilterId).toBe('all');
  });
});

describe('useUiState - restores the last visited page', () => {
  it('remembers a tab that was visited', () => {
    const first = renderHook(() => useUiState());
    act(() => first.result.current.setActiveTab('report'));

    // A fresh mount stands in for closing and reopening the app.
    const second = renderHook(() => useUiState());
    expect(second.result.current.activeTab).toBe('report');
    expect(localStorage.getItem('ft_last_tab')).toBe('report');
  });

  it('does not open on the input tab after a fresh launch', () => {
    localStorage.setItem('ft_last_tab', 'input');
    const { result } = renderHook(() => useUiState());
    expect(result.current.activeTab).toBe('dashboard');
  });

  it('does restore the input tab after a reload', () => {
    localStorage.setItem('ft_last_tab', 'input');
    markNextLoadAsReload();

    const { result } = renderHook(() => useUiState());
    expect(result.current.activeTab).toBe('input');
  });

  it('restores any tab after a reload', () => {
    localStorage.setItem('ft_last_tab', 'tagihan');
    markNextLoadAsReload();

    const { result } = renderHook(() => useUiState());
    expect(result.current.activeTab).toBe('tagihan');
  });

  it('the reload flag is used up, so the next launch starts clean', () => {
    localStorage.setItem('ft_last_tab', 'input');
    markNextLoadAsReload();
    renderHook(() => useUiState());

    const relaunch = renderHook(() => useUiState());
    expect(relaunch.result.current.activeTab).toBe('dashboard');
  });

  it('falls back to the dashboard for an unknown tab', () => {
    localStorage.setItem('ft_last_tab', 'does-not-exist');
    const { result } = renderHook(() => useUiState());
    expect(result.current.activeTab).toBe('dashboard');
  });
});

describe('useUiState - entity modals', () => {
  it('starts closed with no item', () => {
    const { result } = renderHook(() => useUiState());
    expect(result.current.accountModal).toMatchObject({ isOpen: false, item: null });
    expect(result.current.categoryModal.isOpen).toBe(false);
    expect(result.current.templateModal.isOpen).toBe(false);
    expect(result.current.transactionModal.isOpen).toBe(false);
  });

  it('open(null) means "create"', () => {
    const { result } = renderHook(() => useUiState());
    act(() => result.current.accountModal.open(null));
    expect(result.current.accountModal).toMatchObject({ isOpen: true, item: null });
  });

  it('open(item) means "edit that item"', () => {
    const { result } = renderHook(() => useUiState());
    const acc = account('a1');
    act(() => result.current.accountModal.open(acc));
    expect(result.current.accountModal).toMatchObject({ isOpen: true, item: acc });
  });

  it('close() clears the item so a stale row cannot be re-used', () => {
    const { result } = renderHook(() => useUiState());
    act(() => result.current.accountModal.open(account('a1')));
    act(() => result.current.accountModal.close());
    expect(result.current.accountModal).toMatchObject({ isOpen: false, item: null });
  });

  it('keeps the four entity modals independent', () => {
    const { result } = renderHook(() => useUiState());

    act(() => {
      result.current.accountModal.open(account('a'));
      result.current.categoryModal.open({ id: 'c', name: 'Makan', type: 'pengeluaran', emoji: '🍜' } as Category);
      result.current.templateModal.open({ id: 't', name: 'Kopi' } as QuickTemplate);
      result.current.transactionModal.open(transaction('tx'));
    });

    expect(result.current.accountModal.isOpen).toBe(true);
    expect(result.current.categoryModal.isOpen).toBe(true);
    expect(result.current.templateModal.isOpen).toBe(true);
    expect(result.current.transactionModal.isOpen).toBe(true);

    act(() => result.current.accountModal.close());

    // Closing one must not close the others.
    expect(result.current.accountModal.isOpen).toBe(false);
    expect(result.current.categoryModal.isOpen).toBe(true);
    expect(result.current.transactionModal.isOpen).toBe(true);
  });
});

describe('useUiState - settings', () => {
  it('opens on the requested tab', () => {
    const { result } = renderHook(() => useUiState());
    act(() => result.current.openSettings('tampilan'));
    expect(result.current).toMatchObject({ isSettingsOpen: true, settingsTab: 'tampilan' });
  });

  it('defaults to the accounts tab', () => {
    const { result } = renderHook(() => useUiState());
    act(() => result.current.openSettings());
    expect(result.current.settingsTab).toBe('akun');
  });

  it('closes', () => {
    const { result } = renderHook(() => useUiState());
    act(() => result.current.openSettings('backend'));
    act(() => result.current.closeSettings());
    expect(result.current.isSettingsOpen).toBe(false);
  });
});

describe('useUiState - voice prefill', () => {
  it('bumps the key so the form remounts with the new data', () => {
    const { result } = renderHook(() => useUiState());
    const before = result.current.prefillKey;

    act(() =>
      result.current.applyVoicePrefill({
        type: 'pengeluaran',
        amount: 25000,
        sourceAccountId: 'a',
        date: '2026-01-01',
        notes: 'kopi',
      })
    );

    expect(result.current.prefillKey).toBe(before + 1);
    expect(result.current.prefillData).toMatchObject({ amount: 25000 });
    // Applying a voice result jumps straight to the form.
    expect(result.current.activeTab).toBe('input');
  });

  it('bumps the key on every apply, even with identical data', () => {
    const { result } = renderHook(() => useUiState());
    const data = {
      type: 'pengeluaran' as const,
      amount: 25000,
      sourceAccountId: 'a',
      date: '2026-01-01',
      notes: 'kopi',
    };

    act(() => result.current.applyVoicePrefill(data));
    const first = result.current.prefillKey;
    act(() => result.current.applyVoicePrefill(data));

    // Without the bump the form would keep showing the previous parse.
    expect(result.current.prefillKey).toBe(first + 1);
  });

  it('clears the prefill', () => {
    const { result } = renderHook(() => useUiState());
    act(() =>
      result.current.applyVoicePrefill({
        type: 'pengeluaran',
        amount: 1,
        sourceAccountId: 'a',
        date: '2026-01-01',
        notes: '',
      })
    );
    act(() => result.current.clearPrefill());
    expect(result.current.prefillData).toBeNull();
  });
});

describe('useUiState - privacy mode', () => {
  it('defaults to visible', () => {
    const { result } = renderHook(() => useUiState());
    expect(result.current.isBalanceHidden).toBe(false);
  });

  it('toggles and persists the choice', () => {
    const { result } = renderHook(() => useUiState());
    act(() => result.current.toggleHideBalance());

    expect(result.current.isBalanceHidden).toBe(true);
    expect(localStorage.getItem('ft_hide_balance')).toBe('true');

    act(() => result.current.toggleHideBalance());
    expect(result.current.isBalanceHidden).toBe(false);
    expect(localStorage.getItem('ft_hide_balance')).toBe('false');
  });

  it('restores the saved choice on mount', () => {
    localStorage.setItem('ft_hide_balance', 'true');
    const { result } = renderHook(() => useUiState());
    expect(result.current.isBalanceHidden).toBe(true);
  });
});
