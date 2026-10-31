import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Requests never hang forever: the UI shows the cached data after this budget. */
export const SUPABASE_TIMEOUT_MS = 15_000;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
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
  : null;

export const SUPABASE_SESSION_HINT =
  'Sesi Supabase tidak ditemukan. Baris data wajib memiliki user_id yang cocok dengan sesi login (RLS). Silakan masuk terlebih dahulu.';
