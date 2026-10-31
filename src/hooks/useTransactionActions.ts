import { useCallback } from 'react';
import type { Transaction, TransactionType } from '../types';
import {
  addTransactionToDatabase,
  deleteTransactionFromDatabase,
  updateTransactionInDatabase,
} from '../services/financialService';
import { isPermanentWriteError } from '../lib/errors';
import type { LedgerState, LedgerUpdater } from './useLedger';

/** The shape both the form and the edit modal submit. */
export interface TransactionInput {
  type: TransactionType;
  amount: number;
  sourceAccountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  date: string;
  notes: string;
}

export interface EditTransactionInput extends TransactionInput {
  id: string;
}

export interface WriteResult {
  ok: boolean;
  tx?: Transaction;
  /** True when the row was kept locally and queued for a later sync. */
  queued: boolean;
}

interface UseTransactionActionsOptions {
  commit: (updater: LedgerUpdater) => LedgerState;
  restore: (state: LedgerState) => void;
  refreshSyncStatus: () => void;
  onError: (message: string, detail?: string) => void;
}

/**
 * Every write to the transaction slice.
 *
 * Three rules are enforced here so no caller has to remember them:
 *
 * 1. **One id per write.** The optimistic row and its queued server mutation
 *    share the uuid minted below. Minting a second id on failure is what used to
 *    duplicate transactions.
 * 2. **Local first, roll back only when permanent.** A transient failure keeps
 *    the row (the outbox will retry); a permanent one (invalid uuid, RLS) undoes
 *    it, because retrying could never succeed and the user must not keep a row
 *    the server will always reject.
 * 3. **Balances never diverge.** All writes go through `commit`, which derives
 *    balances from the transaction list in the same update.
 */
export function useTransactionActions(options: UseTransactionActionsOptions) {
  const { commit, restore, refreshSyncStatus, onError } = options;

  const addTransaction = useCallback(
    async (data: TransactionInput): Promise<WriteResult> => {
      const rowId = crypto.randomUUID();

      const optimistic: Transaction = {
        id: rowId,
        type: data.type,
        amount: data.amount,
        sourceAccountId: data.sourceAccountId,
        destinationAccountId: data.destinationAccountId,
        categoryId: data.categoryId,
        notes: data.notes,
        date: data.date,
        createdAt: new Date().toISOString(),
        pendingSync: true,
      };

      // The updater form matters: it composes with any write that landed while
      // this one is in flight instead of overwriting it.
      commit((current) => ({
        transactions: [optimistic, ...current.transactions],
      }));

      try {
        const saved = await addTransactionToDatabase(data, rowId);
        commit((current) => ({
          transactions: current.transactions.map((t) => (t.id === rowId ? saved : t)),
        }));
        refreshSyncStatus();
        return { ok: true, tx: saved, queued: false };
      } catch (err) {
        if (isPermanentWriteError(err)) {
          // Remove only this row. Restoring `before` would also undo any write
          // that succeeded while this one was failing.
          commit((current) => ({
            transactions: current.transactions.filter((t) => t.id !== rowId),
          }));
          onError('Transaksi gagal disimpan', err.message);
          return { ok: false, queued: false };
        }
        // Unknown failure: keep the local row and let the outbox retry it.
        refreshSyncStatus();
        return { ok: true, tx: optimistic, queued: true };
      }
    },
    [commit, refreshSyncStatus, onError]
  );

  const updateTransaction = useCallback(
    async (updated: EditTransactionInput) => {
      const previous = commit((current) => ({
        transactions: current.transactions.map((t) =>
          t.id === updated.id
            ? {
                ...t,
                type: updated.type,
                amount: updated.amount,
                sourceAccountId: updated.sourceAccountId,
                destinationAccountId: updated.destinationAccountId,
                categoryId: updated.categoryId,
                date: updated.date,
                notes: updated.notes,
              }
            : t
        ),
      }));

      try {
        await updateTransactionInDatabase(updated.id, updated);
      } catch (err) {
        if (isPermanentWriteError(err)) {
          restore(previous);
          onError('Perubahan gagal disimpan', err.message);
          return;
        }
        console.error('Unexpected edit failure:', err);
      } finally {
        refreshSyncStatus();
      }
    },
    [commit, restore, refreshSyncStatus, onError]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const previous = commit((current) => ({
        transactions: current.transactions.filter((t) => t.id !== id),
      }));

      try {
        await deleteTransactionFromDatabase(id);
      } catch (err) {
        if (isPermanentWriteError(err)) {
          restore(previous);
          onError('Transaksi gagal dihapus', err.message);
          return;
        }
        console.error('Unexpected delete failure:', err);
      } finally {
        refreshSyncStatus();
      }
    },
    [commit, restore, refreshSyncStatus, onError]
  );

  return { addTransaction, updateTransaction, deleteTransaction };
}

export type { LedgerState };
