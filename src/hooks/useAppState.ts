import { useCallback, useEffect, useState } from 'react';
import { getPendingSyncCount } from '../services/outbox';
import { loadFinancialData } from '../services/financialService';
import { useLedger } from './useLedger';
import { useNetworkStatus, useOutboxAutoFlush } from './useNetworkStatus';
import { useToast } from './useToast';
import { useTransactionActions } from './useTransactionActions';
import { useAccountActions } from './useAccountActions';
import { useCategoryActions } from './useCategoryActions';
import { useTemplates } from './useTemplates';
import { useUiState } from './useUiState';

/**
 * Composition root for the app's state.
 *
 * `App` used to hold 26 `useState` hooks plus every handler in one 970-line file.
 * The hooks below each own one concern, and this file is the only place that
 * wires them together — so a component can import a single hook instead of
 * receiving ten props drilled from the root.
 *
 * Reading order mirrors the data flow: ledger (state) → network (sync) →
 * actions (writes) → templates (derived workflow) → ui (presentation).
 */
export function useAppState() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const ledger = useLedger();
  const ui = useUiState();
  const toast = useToast();
  const network = useNetworkStatus();

  const reportError = useCallback(
    (message: string, detail?: string) => toast.show(message, detail, 'error'),
    [toast]
  );

  const transactions = useTransactionActions({
    commit: ledger.commit,
    restore: ledger.restore,
    refreshSyncStatus: network.refresh,
    onError: reportError,
  });

  const accounts = useAccountActions({
    commit: ledger.commit,
    restore: ledger.restore,
    refreshSyncStatus: network.refresh,
    onError: reportError,
  });

  const categories = useCategoryActions({
    commit: ledger.commit,
    restore: ledger.restore,
    refreshSyncStatus: network.refresh,
    onError: reportError,
    onSettled: ui.categoryModal.close,
  });

  const templates = useTemplates({
    getLedger: ledger.getLedger,
    addTransaction: transactions.addTransaction,
    deleteTransaction: transactions.deleteTransaction,
    onError: reportError,
    onRecorded: ({ title, subtitle, undo }) =>
      toast.showUndoable({ title, subtitle, variant: 'success' }, undo),
    onInfo: (title, subtitle) => toast.show(title, subtitle, 'success'),
  });

  /** Folds a freshly fetched dataset into the ledger. */
  const applyRemoteData = useCallback(
    (data: { accounts: typeof ledger.accounts; categories: typeof ledger.categories; transactions: typeof ledger.transactions }) => {
      ledger.replace({
        accounts: data.accounts,
        categories: data.categories,
        transactions: data.transactions,
      });
    },
    [ledger]
  );

  // Initial load: never blocks the first paint, but does show real data as soon
  // as it arrives. The ledger already hydrated from the offline snapshot.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsLoading(true);
      try {
        const data = await loadFinancialData();
        if (cancelled) return;
        applyRemoteData(data);
      } catch (err) {
        console.error('Failed to initialize data:', err);
        if (!cancelled) {
          toast.show('Gagal memuat data', 'Menampilkan data tersimpan di perangkat', 'error');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          network.refresh();
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
    // Runs once on mount: every helper used here is a stable callback, and
    // re-running on each ledger change would refetch the whole dataset after
    // every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Manual sync triggered by the header button. */
  const refreshData = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      const pendingBefore = getPendingSyncCount();
      const data = await loadFinancialData();
      applyRemoteData(data);
      await templates.refreshTemplates();

      const pendingAfter = getPendingSyncCount();
      if (pendingBefore > 0 && pendingAfter < pendingBefore) {
        toast.show(
          `${pendingBefore - pendingAfter} perubahan offline berhasil disinkronkan!`,
          'Data telah diperbarui ke penyimpanan awan'
        );
      } else if (pendingAfter > 0) {
        toast.show(
          `${pendingAfter} perubahan belum terkirim`,
          'Akan dicoba lagi otomatis saat koneksi tersedia',
          'info'
        );
      }
    } catch (err) {
      console.error('Refresh failed:', err);
      toast.show('Sinkronisasi gagal', 'Data lokal tetap aman di perangkat ini', 'error');
    } finally {
      setIsRefreshing(false);
      network.refresh();
    }
  }, [isRefreshing, applyRemoteData, templates, toast, network]);

  // Drain the outbox as soon as connectivity returns.
  const handleFlushed = useCallback(
    ({ synced, stuck }: { synced: number; stuck: number }) => {
      if (synced > 0) {
        toast.show(`${synced} antrean offline berhasil disinkronkan!`, 'Koneksi kembali stabil');
        void refreshData();
      }
      if (stuck > 0) {
        toast.show(
          `${stuck} perubahan ditolak server`,
          'Buka Pengaturan untuk meninjau dan membersihkannya',
          'error'
        );
      }
    },
    [toast, refreshData]
  );

  useOutboxAutoFlush({
    onFlushed: handleFlushed,
    refreshStatus: network.refresh,
  });

  return {
    // Data
    accounts: ledger.accounts,
    categories: ledger.categories,
    transactions: ledger.transactions,

    // Loading / sync
    isLoading,
    isRefreshing,
    isOnline: network.isOnline,
    pendingSyncCount: network.pendingSyncCount,
    refreshData,
    refreshSyncStatus: network.refresh,

    // UI state + actions
    ui,
    toast,

    // Write actions
    addTransaction: transactions.addTransaction,
    updateTransaction: transactions.updateTransaction,
    deleteTransaction: transactions.deleteTransaction,
    saveAccount: accounts.saveAccount,
    deleteAccount: accounts.deleteAccount,
    reorderAccounts: accounts.reorderAccounts,
    saveCategory: categories.saveCategory,
    deleteCategory: categories.deleteCategory,

    // Templates
    templates: templates.templates,
    saveTemplate: templates.saveTemplate,
    deleteTemplate: templates.removeTemplate,
    saveAsTemplate: templates.saveAsTemplate,
    useTemplateDirectly: templates.useTemplateDirectly,
  };
}

export type AppState = ReturnType<typeof useAppState>;
