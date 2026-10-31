/**
 * Decides whether a failed write should be retried later (offline outbox) or
 * surfaced to the user immediately.
 *
 * The old behaviour queued *everything* into the outbox — including permanent
 * errors such as "invalid input syntax for type uuid" or an RLS rejection.
 * Those items could never succeed, so they piled up forever and the UI kept
 * promising a sync that would never happen.
 */

/** Postgres / PostgREST error codes that are worth retrying later. */
const RETRYABLE_PG_CODES = new Set([
  '08000', // connection_exception
  '08001', // sqlclient_unable_to_establish_sqlconnection
  '08003', // connection_does_not_exist
  '08004', // sqlserver_rejected_establishment_of_sqlconnection
  '08006', // connection_failure
  '08007', // transaction_resolution_unknown
  '57P01', // admin_shutdown
  '57P02', // crash_shutdown
  '57P03', // cannot_connect_now
  '53300', // too_many_connections
  '40001', // serialization_failure
  '40P01', // deadlock_detected
]);

/** HTTP statuses that mean "try again later" rather than "this will never work". */
const RETRYABLE_HTTP_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

const OFFLINE_MESSAGE_RE =
  /failed to fetch|networkerror|network request failed|load failed|connection (closed|refused|reset)|timed? ?out|timeout/i;

export type WriteFailureReason =
  | 'offline'
  | 'network'
  | 'rate_limited'
  | 'server'
  | 'unauthorized'
  | 'invalid'
  | 'unknown';

export interface WriteErrorClassification {
  /** True when the mutation is safe to retry once connectivity returns. */
  retryable: boolean;
  reason: WriteFailureReason;
  /** Short Indonesian sentence safe to show in the UI. */
  userMessage: string;
  /** Machine-readable detail for logs and the outbox record. */
  detail: string;
}

interface PostgrestLikeError {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
  status?: number;
  name?: string;
}

function readErrorObject(error: unknown): PostgrestLikeError {
  if (!error || typeof error !== 'object') {
    return { message: typeof error === 'string' ? error : undefined };
  }
  const candidate = error as PostgrestLikeError;
  return {
    message: candidate.message,
    details: candidate.details,
    hint: candidate.hint,
    code: candidate.code,
    status: typeof candidate.status === 'number' ? candidate.status : undefined,
    name: candidate.name,
  };
}

export function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

export function classifyWriteError(error: unknown): WriteErrorClassification {
  const parsed = readErrorObject(error);
  const message = parsed.message || '';
  const detail = [parsed.code, parsed.status, message].filter(Boolean).join(' | ') || 'unknown';

  if (isBrowserOffline()) {
    return {
      retryable: true,
      reason: 'offline',
      userMessage: 'Perangkat sedang offline. Perubahan disimpan di antrean dan dikirim saat online.',
      detail,
    };
  }

  // PostgREST puts the SQLSTATE in `code`; transport failures throw a bare TypeError.
  if (parsed.code && RETRYABLE_PG_CODES.has(parsed.code)) {
    return {
      retryable: true,
      reason: 'network',
      userMessage: 'Koneksi ke database terputus. Perubahan diantrekan dan akan dikirim ulang.',
      detail,
    };
  }

  if (parsed.status && RETRYABLE_HTTP_STATUS.has(parsed.status)) {
    const reason: WriteFailureReason = parsed.status === 429 ? 'rate_limited' : 'server';
    return {
      retryable: true,
      reason,
      userMessage:
        parsed.status === 429
          ? 'Terlalu banyak permintaan. Perubahan diantrekan dan dicoba lagi nanti.'
          : 'Server sedang bermasalah. Perubahan diantrekan dan dicoba lagi nanti.',
      detail,
    };
  }

  if (parsed.name === 'TypeError' || parsed.name === 'AbortError' || OFFLINE_MESSAGE_RE.test(message)) {
    return {
      retryable: true,
      reason: 'network',
      userMessage: 'Koneksi gagal. Perubahan diantrekan dan akan dikirim ulang.',
      detail,
    };
  }

  if (parsed.status === 401 || parsed.status === 403 || parsed.code === '42501') {
    return {
      retryable: false,
      reason: 'unauthorized',
      userMessage: 'Akses ditolak. Periksa kembali sesi login Supabase Anda.',
      detail,
    };
  }

  if (
    parsed.status === 400 ||
    parsed.status === 409 ||
    parsed.status === 422 ||
    (parsed.code || '').startsWith('22') ||
    (parsed.code || '').startsWith('23')
  ) {
    return {
      retryable: false,
      reason: 'invalid',
      userMessage: `Data ditolak oleh database. ${message || 'Periksa kembali isian transaksi.'}`.trim(),
      detail,
    };
  }

  // Unknown failure: do not silently promise a sync that may never happen.
  return {
    retryable: false,
    reason: 'unknown',
    userMessage: `Gagal menyimpan ke server. ${message || 'Silakan coba lagi.'}`.trim(),
    detail,
  };
}

/**
 * Thrown by the data services when a write failed for a reason that retrying
 * will not fix. Callers must surface this to the user instead of pretending
 * the optimistic local update is the truth.
 */
export class PermanentWriteError extends Error {
  readonly reason: WriteFailureReason;
  readonly detail: string;

  constructor(userMessage: string, reason: WriteFailureReason, detail: string) {
    super(userMessage);
    this.name = 'PermanentWriteError';
    this.reason = reason;
    this.detail = detail;
  }
}

export function toPermanentWriteError(error: unknown): PermanentWriteError {
  if (error instanceof PermanentWriteError) return error;
  const classification = classifyWriteError(error);
  return new PermanentWriteError(classification.userMessage, classification.reason, classification.detail);
}

export function isPermanentWriteError(error: unknown): error is PermanentWriteError {
  return error instanceof PermanentWriteError;
}
