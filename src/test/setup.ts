/**
 * Shared test harness.
 *
 * Replaces the browser globals the services depend on (`localStorage`,
 * `navigator.onLine`) with controllable in-memory versions, so queueing and
 * offline behaviour can be tested without a DOM or a network.
 */

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  readonly length: number;
}

export function installLocalStorage(): StorageLike {
  const store = new Map<string, string>();

  const storage: StorageLike = {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => void store.set(key, String(value)),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true,
  });

  return storage;
}

export function setOnline(online: boolean): void {
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: online },
    configurable: true,
    writable: true,
  });
}

/** Ensures `crypto.randomUUID` exists on the test runner. */
export function ensureCrypto(): void {
  if (typeof globalThis.crypto === 'undefined') {
    throw new Error('Node 19+ is required: globalThis.crypto is missing');
  }
}
