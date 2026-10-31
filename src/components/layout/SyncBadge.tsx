import { RefreshCw, WifiOff } from 'lucide-react';

export interface SyncBadgeProps {
  isOnline: boolean;
  pendingSyncCount: number;
  isRefreshing: boolean;
  isLoading: boolean;
  onSync: () => void;
  /** Layout variant: the icon-only pill used in headers vs. the wide one on desktop. */
  variant?: 'icon' | 'full';
  testId?: string;
}

/**
 * The sync control, in one place.
 *
 * This markup previously existed three times — in `Header`, in `Sidebar`, and
 * inline in `App`'s desktop toolbar — with three slightly different tooltips and
 * three different `data-testid` values. A label or colour fixed in one copy
 * silently stayed wrong in the other two.
 */
export function SyncBadge({
  isOnline,
  pendingSyncCount,
  isRefreshing,
  isLoading,
  onSync,
  variant = 'icon',
  testId = 'pending-sync-badge',
}: SyncBadgeProps) {
  const title = !isOnline
    ? pendingSyncCount > 0
      ? `Mode Offline (${pendingSyncCount} perubahan dalam antrean lokal)`
      : 'Mode Offline'
    : pendingSyncCount > 0
      ? `${pendingSyncCount} perubahan offline siap disinkronkan ke Supabase`
      : 'Sinkronkan data dengan Supabase';

  const toneClass = !isOnline
    ? 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#b45309] dark:text-[#fbbf24]'
    : pendingSyncCount > 0
      ? 'border-brand/40 bg-brand-soft text-brand-text'
      : 'border-hairline hover:border-brand/40 bg-canvas text-ink-muted hover:text-ink';

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onSync}
        disabled={isRefreshing || isLoading}
        className={`px-3 py-1.5 rounded-[10px] border text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 ${toneClass}`}
        aria-label={title}
        title={title}
      >
        {!isOnline ? (
          <WifiOff className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
        ) : (
          <RefreshCw
            className={`w-3.5 h-3.5 shrink-0 ${isRefreshing || isLoading ? 'animate-spin' : ''}`}
          />
        )}
        <span>
          {isRefreshing
            ? 'Menyinkronkan...'
            : !isOnline
              ? pendingSyncCount > 0
                ? `Mode Offline • ${pendingSyncCount} Antrean`
                : 'Mode Offline'
              : pendingSyncCount > 0
                ? `${pendingSyncCount} Antrean Belum Sinkron`
                : 'Sinkronkan'}
        </span>
        {pendingSyncCount > 0 && !isOnline && (
          <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSync}
      disabled={isRefreshing || isLoading}
      title={title}
      aria-label={title}
      className={`relative h-9 px-2.5 sm:px-3 rounded-[10px] border text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 ${toneClass}`}
    >
      {!isOnline ? (
        <WifiOff className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
      ) : (
        <RefreshCw
          className={`w-3.5 h-3.5 shrink-0 ${isRefreshing || isLoading ? 'animate-spin' : ''}`}
        />
      )}

      <span className="hidden lg:inline">
        {isRefreshing ? 'Sinkron...' : !isOnline ? 'Offline' : 'Sinkronkan'}
      </span>

      {pendingSyncCount > 0 ? (
        <span
          data-testid={testId}
          className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#f59e0b] text-white text-[10px] font-bold leading-none tabular-nums shadow-xs"
        >
          {pendingSyncCount}
        </span>
      ) : (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isOnline ? 'bg-[#149e61]' : 'bg-[#f59e0b]'
          }`}
        />
      )}
    </button>
  );
}
