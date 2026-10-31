import { useCallback } from 'react';
import type { Category } from '../types';
import {
  addCategoryToDatabase,
  deleteCategoryFromDatabase,
  updateCategoryInDatabase,
} from '../services/financialService';
import { isPermanentWriteError } from '../lib/errors';
import type { LedgerState, LedgerUpdater } from './useLedger';

export interface CategoryInput {
  id?: string;
  name: string;
  type: 'pengeluaran' | 'pemasukan';
  emoji: string;
  icon?: string;
}

interface CategoryActionOptions {
  commit: (updater: LedgerUpdater) => LedgerState;
  restore: (state: LedgerState) => void;
  refreshSyncStatus: () => void;
  onError: (message: string, detail?: string) => void;
  /** Closes the category modal once the write settles, success or not. */
  onSettled: () => void;
}

export function useCategoryActions(options: CategoryActionOptions) {
  const { commit, restore, refreshSyncStatus, onError, onSettled } = options;

  const saveCategory = useCallback(
    async (data: CategoryInput) => {
      if (data.id) {
        const previous = commit((current) => ({
          categories: current.categories.map((c) =>
            c.id === data.id
              ? { ...c, name: data.name, type: data.type, emoji: data.emoji, icon: data.icon }
              : c
          ),
        }));

        try {
          await updateCategoryInDatabase(data.id, data);
        } catch (err) {
          if (isPermanentWriteError(err)) {
            restore(previous);
            onError('Kategori gagal diperbarui', err.message);
            return;
          }
          console.error('Unexpected category update failure:', err);
        }
      } else {
        try {
          const created: Category = await addCategoryToDatabase(data);
          commit((current) => ({ categories: [...current.categories, created] }));
        } catch (err) {
          if (isPermanentWriteError(err)) {
            onError('Kategori gagal ditambahkan', err.message);
            return;
          }
          console.error('Unexpected category create failure:', err);
        }
      }
      onSettled();
      refreshSyncStatus();
    },
    [commit, restore, refreshSyncStatus, onError, onSettled]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const previous = commit((current) => ({
        categories: current.categories.filter((c) => c.id !== id),
      }));
      onSettled();

      try {
        await deleteCategoryFromDatabase(id);
      } catch (err) {
        if (isPermanentWriteError(err)) {
          restore(previous);
          onError('Kategori gagal dihapus', err.message);
          return;
        }
        console.error('Unexpected category delete failure:', err);
      } finally {
        refreshSyncStatus();
      }
    },
    [commit, restore, refreshSyncStatus, onError, onSettled]
  );

  return { saveCategory, deleteCategory };
}
