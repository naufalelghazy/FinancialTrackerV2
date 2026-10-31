import { useCallback } from 'react';
import type { Account, AccountType } from '../types';
import {
  addAccountToDatabase,
  deleteAccountFromDatabase,
  getAccountIcon,
  reorderAccountsInDatabase,
  updateAccountInDatabase,
} from '../services/financialService';
import { isPermanentWriteError } from '../lib/errors';
import { applyAccountOrder } from '../lib/accountOrder';
import type { LedgerState, LedgerUpdater } from './useLedger';

export interface AccountInput {
  id?: string;
  name: string;
  type: AccountType;
  website?: string;
  initialBalance: number;
}

interface AccountActionOptions {
  commit: (updater: LedgerUpdater) => LedgerState;
  restore: (state: LedgerState) => void;
  refreshSyncStatus: () => void;
  onError: (message: string, detail?: string) => void;
}

/**
 * Account writes, all following the same optimistic-then-reconcile shape.
 *
 * Note the asymmetry that was easy to get wrong before: creating an account must
 * wait for the server because the server assigns the id, whereas editing one can
 * be applied locally first and rolled back on a permanent failure.
 */
export function useAccountActions(options: AccountActionOptions) {
  const { commit, restore, refreshSyncStatus, onError } = options;

  const saveAccount = useCallback(
    async (data: AccountInput) => {
      if (data.id) {
        const previous = commit((current) => ({
          accounts: current.accounts.map((a) =>
            a.id === data.id
              ? {
                  ...a,
                  name: data.name,
                  type: data.type,
                  website: data.website,
                  icon: getAccountIcon(data.name, data.website),
                  initialBalance: data.initialBalance,
                }
              : a
          ),
        }));

        try {
          await updateAccountInDatabase(data.id, data);
        } catch (err) {
          if (isPermanentWriteError(err)) {
            restore(previous);
            onError('Akun gagal diperbarui', err.message);
            return;
          }
          console.error('Unexpected account update failure:', err);
        }
      } else {
        try {
          const created: Account = await addAccountToDatabase({
            name: data.name,
            type: data.type,
            website: data.website,
            initialBalance: data.initialBalance,
          });
          commit((current) => ({ accounts: [...current.accounts, created] }));
        } catch (err) {
          if (isPermanentWriteError(err)) {
            onError('Akun gagal ditambahkan', err.message);
            return;
          }
          console.error('Unexpected account create failure:', err);
        }
      }
      refreshSyncStatus();
    },
    [commit, restore, refreshSyncStatus, onError]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      const previous = commit((current) => ({
        accounts: current.accounts.filter((a) => a.id !== id),
      }));

      try {
        await deleteAccountFromDatabase(id);
      } catch (err) {
        if (isPermanentWriteError(err)) {
          restore(previous);
          onError('Akun gagal dihapus', err.message);
          return;
        }
        console.error('Unexpected account delete failure:', err);
      } finally {
        refreshSyncStatus();
      }
    },
    [commit, restore, refreshSyncStatus, onError]
  );

  /**
   * Menyimpan urutan tampil daftar rekening.
   *
   * Sama seperti edit akun: diterapkan lebih dulu di layar, dikembalikan bila
   * server menolak secara permanen. Menggeser kartu harus terasa instan, dan
   * kegagalan jaringan sudah ditangani antrean offline.
   */
  const reorderAccounts = useCallback(
    async (orderedIds: string[]) => {
      const previous = commit((current) => ({
        accounts: applyAccountOrder(current.accounts, orderedIds),
      }));

      try {
        await reorderAccountsInDatabase(orderedIds);
      } catch (err) {
        if (isPermanentWriteError(err)) {
          restore(previous);
          onError('Urutan rekening gagal disimpan', err.message);
          return;
        }
        console.error('Unexpected account reorder failure:', err);
      } finally {
        refreshSyncStatus();
      }
    },
    [commit, restore, refreshSyncStatus, onError]
  );

  return { saveAccount, deleteAccount, reorderAccounts };
}
