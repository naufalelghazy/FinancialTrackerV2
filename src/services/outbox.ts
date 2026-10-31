/**
 * Offline outbox.
 *
 * Contract that makes offline writes safe:
 * 1. The client generates the primary key. Every queued mutation is keyed by the
 *    *final* row id, so flushing is idempotent and an optimistic local record can
 *    be replaced in place without the id ever changing.
 * 2. A queue update is an upsert on `clientRowId`. Offline edits collapse into the
 *    existing `insert` instead of producing an `update` against a row the server
 *    has never seen — the old code sent `UPDATE ... WHERE id = <unknown id>`, which
 *    touched zero rows, reported success, and silently dropped the change.
 * 3. A flush holds an exclusive lock. Two tabs (or a double click) can no longer
 *    push the same mutation twice.
 */

import { isSupabaseConfigured, loadSupabase } from '../lib/supabase';
import { isUuid } from '../lib/uuid';
import { classifyWriteError, isBrowserOffline } from '../lib/errors';

export const OUTBOX_KEY = 'ft_pending_sync';
const LOCK_KEY = 'ft_pending_sync_lock';
const LOCK_TTL_MS = 45_000;
const MAX_ATTEMPTS = 8;

export type OutboxTable = 'transactions' | 'accounts' | 'categories';
export type OutboxAction = 'insert' | 'update' | 'delete';

const KNOWN_ROWS_KEY = 'ft_known_rows';
const KNOWN_ROWS_LIMIT = 4000;

/**
 * Tracks which row ids the server has already confirmed.
 *
 * Without this, an edit made while a *previous* outbox entry was already
 * flushed would be enqueued as an `insert`, because the queue no longer holds
 * that row. Inserts need every column and can resurrect a deleted row, so we
 * remember confirmed ids and keep later edits as `update`.
 */
const RowOriginStore = {
  read(): Set<string> {
    try {
      const raw = localStorage.getItem(KNOWN_ROWS_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === 'string')) : new Set();
    } catch {
      return new Set();
    }
  },

  isKnown(rowId: string): boolean {
    return this.read().has(rowId);
  },

  mark(rowId: string): void {
    const known = this.read();
    if (known.has(rowId)) return;
    known.add(rowId);
    try {
      // Bound the set so it cannot grow without limit on a long-lived install.
      const trimmed = Array.from(known).slice(-KNOWN_ROWS_LIMIT);
      localStorage.setItem(KNOWN_ROWS_KEY, JSON.stringify(trimmed));
    } catch {
      /* ignore */
    }
  },

  forget(rowId: string): void {
    const known = this.read();
    if (!known.delete(rowId)) return;
    try {
      localStorage.setItem(KNOWN_ROWS_KEY, JSON.stringify(Array.from(known)));
    } catch {
      /* ignore */
    }
  },
};

export interface OutboxItem {
  /** Stable identity of the mutation; also the final server row id. */
  clientRowId: string;
  table: OutboxTable;
  action: OutboxAction;
  /** Snake-case column payload, exactly as PostgREST expects it. */
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  lastError?: string;
  /** False once the mutation has proven unretryable; kept for user review. */
  retryable?: boolean;
}

interface LegacyItem {
  action?: string;
  payload?: Record<string, unknown>;
  queueId?: string;
  timestamp?: string;
}

interface StructuredPayload {
  table?: OutboxTable;
  action?: OutboxAction;
  rowId?: string;
  values?: Record<string, unknown>;
}

const LEGACY_ACTION_RE = /^(add|update|delete)_(transaction|account|category)s?$/;

function legacyTableOf(action: string): OutboxTable | null {
  if (action.includes('transaction')) return 'transactions';
  if (action.includes('account')) return 'accounts';
  if (action.includes('category')) return 'categories';
  return null;
}

function legacyRowIdOf(table: OutboxTable, payload: Record<string, unknown>): string {
  const fromPayload = payload.id ?? payload.clientRowId;
  if (fromPayload) return String(fromPayload);
  const seed = JSON.stringify(payload).slice(0, 120);
  return `legacy_${table}_${Date.parse(String(payload.createdAt || 0)) || 0}_${seed.length}`;
}

/**
 * Converts a record written by the previous outbox format into the current one.
 * Older queues may still be sitting in users' localStorage.
 */
export function normalizeOutboxItem(raw: unknown): OutboxItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as OutboxItem & LegacyItem & StructuredPayload;

  // Current format.
  if (candidate.clientRowId && candidate.table && candidate.action && candidate.payload) {
    return {
      clientRowId: String(candidate.clientRowId),
      table: candidate.table,
      action: candidate.action,
      payload: candidate.payload,
      createdAt: candidate.createdAt || new Date().toISOString(),
      updatedAt: candidate.updatedAt || candidate.createdAt || new Date().toISOString(),
      attempts: Number(candidate.attempts) || 0,
      lastError: candidate.lastError,
      retryable: candidate.retryable !== false,
    };
  }

  // Structured intermediate format: { action: 'insert', payload: { table, rowId, values } }
  if (
    candidate.payload &&
    typeof candidate.payload === 'object' &&
    (candidate.payload as StructuredPayload).table &&
    (candidate.payload as StructuredPayload).rowId !== undefined
  ) {
    const structured = candidate.payload as StructuredPayload;
    const table = structured.table as OutboxTable;
    return {
      clientRowId: String(structured.rowId),
      table,
      action: (structured.action || 'insert') as OutboxAction,
      payload: structured.values || {},
      createdAt: candidate.timestamp || new Date().toISOString(),
      updatedAt: candidate.timestamp || new Date().toISOString(),
      attempts: 0,
      retryable: true,
    };
  }

  // Legacy format: { action: 'add_transaction', payload: { id, ... }, queueId, timestamp }
  const legacyAction = candidate.action;
  if (typeof legacyAction === 'string' && LEGACY_ACTION_RE.test(legacyAction)) {
    const table = legacyTableOf(legacyAction);
    if (!table) return null;
    const verb = legacyAction.split('_')[0];
    const action: OutboxAction =
      verb === 'add' ? 'insert' : verb === 'delete' ? 'delete' : 'update';
    const payload = (candidate.payload || {}) as Record<string, unknown>;
    return {
      clientRowId: legacyRowIdOf(table, payload),
      table,
      action,
      payload: toSnakeCasePayload(table, payload),
      createdAt: candidate.timestamp || new Date().toISOString(),
      updatedAt: candidate.timestamp || new Date().toISOString(),
      attempts: 0,
      retryable: true,
    };
  }

  return null;
}

function toSnakeCasePayload(table: OutboxTable, payload: Record<string, unknown>): Record<string, unknown> {
  if (table === 'transactions') {
    return {
      date: payload.date,
      type: payload.type,
      amount: payload.amount,
      source_account_id: payload.sourceAccountId || null,
      destination_account_id: payload.destinationAccountId || null,
      category_id: payload.categoryId || null,
      notes: payload.notes ?? '',
    };
  }
  if (table === 'accounts') {
    return {
      name: payload.name,
      type: payload.type,
      website: payload.website || null,
      icon_url: payload.iconUrl || null,
      initial_balance: payload.initialBalance ?? 0,
    };
  }
  return {
    name: payload.name,
    type: payload.type,
    emoji: payload.emoji ?? '🏷️',
  };
}

export function readOutbox(): OutboxItem[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const normalized: OutboxItem[] = [];
    for (const entry of parsed) {
      const item = normalizeOutboxItem(entry);
      if (item) normalized.push(item);
    }
    return normalized;
  } catch {
    return [];
  }
}

function writeOutbox(items: OutboxItem[]): void {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to persist the offline outbox:', err);
  }
}

/** Number of mutations still waiting to reach the server (includes dead letters). */
export function getPendingSyncCount(): number {
  return readOutbox().length;
}

/** Mutations that failed for a permanent reason and need user attention. */
export function getStuckSyncItems(): OutboxItem[] {
  return readOutbox().filter((item) => item.retryable === false);
}

/** Ids currently represented only on this device. */
export function getPendingRowIds(): Set<string> {
  return new Set(readOutbox().map((item) => item.clientRowId));
}

/**
 * Records (or merges) a mutation.
 *
 * - insert while an insert is already queued  -> merge payload into it
 * - update while an insert is already queued  -> merge payload into that insert
 * - delete while an insert is already queued  -> drop both (nothing to sync)
 * - update/insert on a row the server already knows, with nothing queued
 *   -> recorded as `update` so it can never resurrect or duplicate the row
 */
export function enqueueMutation(
  table: OutboxTable,
  action: OutboxAction,
  rowId: string,
  values: Record<string, unknown>
): void {
  // Seeded rows (`'cash'`, `'makan'`) live only on this device: their ids are not
  // uuids, so any request for them is answered with `22P02`. Queuing one would
  // create an entry that can never succeed and would burn all its retries.
  if (!isUuid(rowId)) return;

  const queue = readOutbox();
  const now = new Date().toISOString();
  const existingIndex = queue.findIndex((item) => item.clientRowId === rowId);

  if (existingIndex >= 0) {
    const existing = queue[existingIndex];

    if (action === 'delete') {
      if (existing.action === 'insert') {
        queue.splice(existingIndex, 1);
      } else {
        queue[existingIndex] = {
          ...existing,
          action: 'delete',
          payload: {},
          updatedAt: now,
          attempts: 0,
          retryable: true,
          lastError: undefined,
        };
      }
      writeOutbox(queue);
      return;
    }

    const nextAction: OutboxAction = existing.action === 'insert' ? 'insert' : action;
    queue[existingIndex] = {
      ...existing,
      action: nextAction,
      payload: { ...existing.payload, ...values },
      updatedAt: now,
      attempts: 0,
      retryable: true,
      lastError: undefined,
    };
    writeOutbox(queue);
    return;
  }

  // No queued mutation for this row. If the row was already confirmed by the
  // server, editing it must stay an UPDATE — downgrading it to an insert would
  // need every column to be present and risks resurrecting a deleted row.
  const alreadySynced = RowOriginStore.isKnown(rowId);
  queue.push({
    clientRowId: rowId,
    table,
    action: action === 'insert' && alreadySynced ? 'update' : action,
    payload: values,
    createdAt: now,
    updatedAt: now,
    attempts: 0,
    retryable: true,
  });
  writeOutbox(queue);
}

/** Persists a payload for a row that may or may not have reached the server. */
export function enqueueUpsert(
  table: OutboxTable,
  rowId: string,
  values: Record<string, unknown>
): void {
  enqueueMutation(table, 'insert', rowId, values);
}

export function enqueueDelete(table: OutboxTable, rowId: string): void {
  enqueueMutation(table, 'delete', rowId, {});
}

/** True when the server has already confirmed this row id. */
export function isRowSynced(rowId: string): boolean {
  return RowOriginStore.isKnown(rowId);
}

/** Remembers that a row id exists on the server. */
export function markRowSynced(rowId: string): void {
  RowOriginStore.mark(rowId);
}

/** Forgets a row id that no longer exists on the server. */
export function markRowDeleted(rowId: string): void {
  RowOriginStore.forget(rowId);
}

/**
 * Maps rows loaded from the server to ids known to exist there.
 * Keeps later offline edits as `update` rather than `insert`.
 */
export function markRowsSynced(rows: Array<{ id: string }>): void {
  for (const row of rows) RowOriginStore.mark(row.id);
}

export function clearOutboxItem(clientRowId: string): void {
  writeOutbox(readOutbox().filter((item) => item.clientRowId !== clientRowId));
}

/**
 * Drops every mutation that can never succeed. Returns how many were discarded
 * so the UI can tell the user what happened.
 */
export function discardStuckItems(): number {
  const queue = readOutbox();
  const kept = queue.filter((item) => item.retryable !== false);
  const removed = queue.length - kept.length;
  if (removed > 0) writeOutbox(kept);
  return removed;
}

export function clearOutbox(): void {
  try {
    localStorage.removeItem(OUTBOX_KEY);
  } catch {
    /* ignore */
  }
}

interface LockRecord {
  owner: string;
  expiresAt: number;
}

function readLock(): LockRecord | null {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LockRecord;
    if (!parsed || typeof parsed.expiresAt !== 'number' || typeof parsed.owner !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

function acquireLock(owner: string): boolean {
  const now = Date.now();
  const current = readLock();
  if (current && current.expiresAt > now && current.owner !== owner) return false;

  const record: LockRecord = { owner, expiresAt: now + LOCK_TTL_MS };
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(record));
  } catch {
    return false;
  }

  // Re-read to close the race between two tabs writing at the same instant.
  const confirmed = readLock();
  return Boolean(confirmed && confirmed.owner === owner);
}

function releaseLock(owner: string): void {
  const current = readLock();
  if (current && current.owner === owner) {
    try {
      localStorage.removeItem(LOCK_KEY);
    } catch {
      /* ignore */
    }
  }
}

const FLUSH_LOCK_OWNER = typeof crypto !== 'undefined' && crypto.randomUUID
  ? `tab_${crypto.randomUUID()}`
  : `tab_${Date.now()}_${Math.random().toString(36).slice(2)}`;

let inFlightFlush: Promise<FlushResult> | null = null;

export interface FlushResult {
  synced: number;
  failed: number;
  stuck: number;
  /** True when another tab (or an earlier call) held the lock. */
  skipped: boolean;
}

async function runItem(item: OutboxItem): Promise<void> {
  const db = await loadSupabase();
  if (!db) throw new Error('Supabase client is not configured');

  if (item.action === 'insert') {
    const { error } = await db
      .from(item.table)
      .upsert({ id: item.clientRowId, ...item.payload }, { onConflict: 'id' });
    if (error) throw error;
    return;
  }

  if (item.action === 'update') {
    const { error } = await db.from(item.table).update(item.payload).eq('id', item.clientRowId);
    if (error) throw error;
    return;
  }

  const { error } = await db.from(item.table).delete().eq('id', item.clientRowId);
  if (error) throw error;
}

/**
 * Pushes queued mutations to Supabase in order.
 * Stops at the first retryable failure so later mutations cannot overtake it.
 */
export async function flushOutbox(): Promise<FlushResult> {
  if (inFlightFlush) {
    await inFlightFlush;
    return { synced: 0, failed: 0, stuck: 0, skipped: true };
  }

  if (!isSupabaseConfigured || isBrowserOffline()) {
    return { synced: 0, failed: 0, stuck: getStuckSyncItems().length, skipped: true };
  }

  if (!acquireLock(FLUSH_LOCK_OWNER)) {
    return { synced: 0, failed: 0, stuck: getStuckSyncItems().length, skipped: true };
  }

  inFlightFlush = (async (): Promise<FlushResult> => {
    let synced = 0;
    let failed = 0;
    let blocked = false;

    try {
      for (const item of readOutbox()) {
        if (blocked) break;
        if (item.retryable === false) continue;

        try {
          await runItem(item);
          clearOutboxItem(item.clientRowId);
          if (item.action === 'delete') markRowDeleted(item.clientRowId);
          else markRowSynced(item.clientRowId);
          synced += 1;
        } catch (err) {
          const classification = classifyWriteError(err);
          const queue = readOutbox();
          const index = queue.findIndex((queued) => queued.clientRowId === item.clientRowId);
          if (index >= 0) {
            const attempts = queue[index].attempts + 1;
            const giveUp = classification.retryable
              ? attempts >= MAX_ATTEMPTS
              : true;
            queue[index] = {
              ...queue[index],
              attempts,
              lastError: classification.detail,
              retryable: giveUp ? false : true,
            };
            writeOutbox(queue);
          }

          if (classification.retryable) {
            failed += 1;
            blocked = true;
          }
        }
      }
    } finally {
      releaseLock(FLUSH_LOCK_OWNER);
    }

    return { synced, failed, stuck: getStuckSyncItems().length, skipped: false };
  })();

  try {
    return await inFlightFlush;
  } finally {
    inFlightFlush = null;
  }
}

/** Fires a background flush and swallows failures; safe to call anywhere. */
export function flushOutboxInBackground(): void {
  void flushOutbox().catch((err) => {
    console.warn('Background outbox flush failed:', err);
  });
}

/** Ids of rows created while offline, useful for optimistic UI flags. */
export function markPendingRows<T extends { id: string }>(rows: T[]): T[] {
  const pending = getPendingRowIds();
  if (pending.size === 0) return rows;
  return rows.map((row) => (pending.has(row.id) ? { ...row, pendingSync: true } : row));
}
