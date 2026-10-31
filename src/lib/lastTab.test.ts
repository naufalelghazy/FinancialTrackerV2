import { beforeEach, describe, expect, it } from 'vitest';
import {
  LAST_TAB_STORAGE_KEY,
  isNavTab,
  readLastTab,
  readRawLastTab,
  writeLastTab,
} from './lastTab';
import { installLocalStorage } from '../test/setup';

beforeEach(() => {
  installLocalStorage();
});

describe('lastTab', () => {
  it('recognises every navigation tab, input included', () => {
    for (const tab of ['dashboard', 'riwayat', 'report', 'saldo', 'tagihan', 'input']) {
      expect(isNavTab(tab)).toBe(true);
    }
  });

  it('rejects values that are not tabs', () => {
    expect(isNavTab(null)).toBe(false);
    expect(isNavTab('')).toBe(false);
    expect(isNavTab('RIWAYAT')).toBe(false);
  });

  it('stores and reads back any tab, even input', () => {
    writeLastTab('tagihan');
    expect(readLastTab()).toBe('tagihan');
    expect(localStorage.getItem(LAST_TAB_STORAGE_KEY)).toBe('tagihan');

    writeLastTab('input');
    expect(localStorage.getItem(LAST_TAB_STORAGE_KEY)).toBe('input');
  });

  it('readRawLastTab returns input, readLastTab (launch) does not', () => {
    writeLastTab('input');
    expect(readRawLastTab()).toBe('input');
    expect(readLastTab()).toBe('dashboard');
  });

  it('returns the dashboard when nothing is stored', () => {
    expect(readLastTab()).toBe('dashboard');
    expect(readRawLastTab()).toBeNull();
  });

  it('ignores corrupted storage', () => {
    localStorage.setItem(LAST_TAB_STORAGE_KEY, '{"tab":"riwayat"}');
    expect(readLastTab()).toBe('dashboard');
    expect(readRawLastTab()).toBeNull();
  });

  it('survives storage that throws (private mode)', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem() {
          throw new Error('denied');
        },
        setItem() {
          throw new Error('denied');
        },
      },
      configurable: true,
      writable: true,
    });

    expect(readLastTab()).toBe('dashboard');
    expect(readRawLastTab()).toBeNull();
    expect(() => writeLastTab('riwayat')).not.toThrow();
  });
});
