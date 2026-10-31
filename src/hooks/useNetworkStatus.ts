import { useCallback, useEffect, useState } from 'react';
import { flushOutbox, getPendingSyncCount } from '../services/outbox';

export interface NetworkStatus {
  isOnline: boolean;
  pendingSyncCount: number;
  /** Re-reads `navigator.onLine` and the outbox size. */
  refresh: () => void;
}

/**
 * Tracks connectivity and how many mutations are still waiting in the outbox.
 *
 * The old code scattered `setPendingSyncCount` / `setIsOnline` calls across every
 * mutation handler, so the counter could go stale after a write that never
 * touched it. Here the count is read from the outbox in one place and refreshed
 * at the few points where the outbox can actually change.
 */
export function useNetworkStatus(): NetworkStatus {
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => getPendingSyncCount());
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  const refresh = useCallback(() => {
    setPendingSyncCount(getPendingSyncCount());
    if (typeof navigator !== 'undefined') setIsOnline(navigator.onLine);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      refresh();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refresh]);

  return { isOnline, pendingSyncCount, refresh };
}

export interface FlushOutcome {
  synced: number;
  stuck: number;
}

/**
 * Drains the outbox when connectivity returns.
 *
 * Kept separate from `useNetworkStatus` so the listener that performs network
 * work can live in one hook while the badge only reads the counters.
 */
export function useOutboxAutoFlush(options: {
  onFlushed: (outcome: FlushOutcome) => void;
  refreshStatus: () => void;
}): void {
  const { onFlushed, refreshStatus } = options;

  useEffect(() => {
    const handleOnline = async () => {
      if (getPendingSyncCount() === 0) {
        refreshStatus();
        return;
      }

      const result = await flushOutbox();
      refreshStatus();
      onFlushed({ synced: result.synced, stuck: result.stuck });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [onFlushed, refreshStatus]);
}
