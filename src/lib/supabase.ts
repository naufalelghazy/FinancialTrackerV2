import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Whether a backend is configured at all.
 *
 * A build-time constant with no dependency on the Supabase SDK, so components
 * that only need the yes/no answer (the settings screen, the offline badge) can
 * import it without pulling the client into their bundle.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Requests never hang forever: the UI shows the cached data after this budget. */
export const SUPABASE_TIMEOUT_MS = 15_000;

let clientPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Loads the Supabase SDK and creates the client, once.
 *
 * The SDK (~55 kB gzipped) used to be a static import, which put it on the
 * critical path of every page: the browser downloaded and parsed it before the
 * dashboard could paint, even though the dashboard reads its data from the
 * offline snapshot. It is now fetched on demand, so the first screen needs
 * neither the network nor the SDK.
 *
 * The promise is memoised rather than the client, so two callers racing on a
 * cold start share one download and one instance. `createClient` starts an auth
 * refresh timer and a session lock per instance; two would leave one leaking.
 */
export function loadSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (clientPromise) return clientPromise;

  const built = import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        // A global AbortSignal would cancel every query at once; instead the
        // fetch wrapper below applies a per-request timeout.
        fetch: (input, init) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
          const external = init?.signal;
          if (external) {
            if (external.aborted) controller.abort();
            else external.addEventListener('abort', () => controller.abort(), { once: true });
          }
          return fetch(input, { ...init, signal: controller.signal }).finally(() =>
            clearTimeout(timer)
          );
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  );

  // A rejected import (offline while the chunk is not cached yet) must not be
  // cached forever, or every later attempt would inherit the first failure.
  clientPromise = built.catch((err) => {
    clientPromise = null;
    console.warn('Supabase SDK failed to load; staying on local data:', err);
    return null;
  });

  return clientPromise;
}

export const SUPABASE_SESSION_HINT =
  'Sesi Supabase tidak ditemukan. Baris data wajib memiliki user_id yang cocok dengan sesi login (RLS). Silakan masuk terlebih dahulu.';
