import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNetworkStatus } from './useNetworkStatus';
import { installLocalStorage, setOnline } from '../test/setup';
import { enqueueUpsert, clearOutbox } from '../services/outbox';

beforeEach(() => {
  installLocalStorage();
  setOnline(true);
  clearOutbox();
});

describe('useNetworkStatus', () => {
  it('reads the initial connectivity', () => {
    setOnline(false);
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(false);
  });

  it('starts with the current outbox size', () => {
    enqueueUpsert('transactions', crypto.randomUUID(), { amount: 1 });
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.pendingSyncCount).toBe(1);
  });

  it('refresh() re-reads both values', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.pendingSyncCount).toBe(0);

    enqueueUpsert('transactions', crypto.randomUUID(), { amount: 1 });
    act(() => result.current.refresh());

    expect(result.current.pendingSyncCount).toBe(1);
  });

  it('tracks the browser offline event', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);

    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('tracks the browser online event', () => {
    setOnline(false);
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it('removes its listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    removeSpy.mockRestore();
  });
});
