import { beforeEach, describe, expect, it } from 'vitest';
import {
  RELOAD_FLAG,
  consumeReloadFlag,
  markNextLoadAsReload,
} from './sessionFlag';

function installSessionStorage(): void {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  installSessionStorage();
});

describe('sessionFlag', () => {
  it('reports no reload when nothing was flagged', () => {
    expect(consumeReloadFlag()).toBe(false);
  });

  it('reports a reload exactly once', () => {
    markNextLoadAsReload();
    expect(consumeReloadFlag()).toBe(true);
    // Flag is consumed: the load after this one is a fresh launch.
    expect(consumeReloadFlag()).toBe(false);
  });

  it('writes the flag under its documented key', () => {
    markNextLoadAsReload();
    expect(sessionStorage.getItem(RELOAD_FLAG)).toBe('1');
  });

  it('treats a missing sessionStorage as "not a reload"', () => {
    Object.defineProperty(globalThis, 'sessionStorage', {
      get() {
        throw new Error('blocked');
      },
      configurable: true,
    });

    expect(consumeReloadFlag()).toBe(false);
    expect(() => markNextLoadAsReload()).not.toThrow();
  });

  it('ignores a corrupted flag value', () => {
    sessionStorage.setItem(RELOAD_FLAG, 'yes');
    expect(consumeReloadFlag()).toBe(false);
  });
});
