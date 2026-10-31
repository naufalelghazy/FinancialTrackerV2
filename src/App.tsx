import { ReloadPrompt } from './components/layout/ReloadPrompt';
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav, type NavTab } from './components/layout/BottomNav';
import { DashboardView } from './features/dashboard/DashboardView';
import { TransactionForm } from './components/forms/TransactionForm';
import type { SettingsTab } from './components/modals/SettingsModal';
import { Toast, type ToastItem, type ToastVariant } from './components/ui/Toast';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES } from './lib/constants';
import {
  loadFinancialData,
  addTransactionToDatabase,
  updateTransactionInDatabase,
  deleteTransactionFromDatabase,
  updateAccountInDatabase,
  addAccountToDatabase,
  deleteAccountFromDatabase,
  addCategoryToDatabase,
  updateCategoryInDatabase,
  deleteCategoryFromDatabase,
  calculateAccountBalances,
  getAccountIcon,
  readLocalSnapshot,
  writeLocalSnapshot,
  getPendingSyncCount,
} from './services/financialService';
import { flushOutbox } from './services/outbox';
import { isPermanentWriteError } from './lib/errors';
import { todayLocalISO } from './lib/date';
import {
  loadCachedQuickTemplates,
  loadQuickTemplates,
  addQuickTemplate,
  updateQuickTemplate,
  deleteQuickTemplate,
  resolveTemplateAccount,
  resolveTemplateCategory,
} from './services/templateService';
import type { Account, AccountType, Category, Transaction, TransactionType, QuickTemplate } from './types';
import { formatCurrency } from './lib/formatters';

const AccountsView = lazy(() =>
  import('./features/accounts/AccountsView').then((m) => ({ default: m.AccountsView }))
);
const BillsView = lazy(() =>
  import('./features/accounts/BillsView').then((m) => ({ default: m.BillsView }))
);
const ReportView = lazy(() =>
  import('./features/report/ReportView').then((m) => ({ default: m.ReportView }))
);
const HistoryView = lazy(() =>
  import('./features/history/HistoryView').then((m) => ({ default: m.HistoryView }))
);
const SettingsModal = lazy(() =>
  import('./components/modals/SettingsModal').then((m) => ({ default: m.SettingsModal }))
);
const EditAccountModal = lazy(() =>
  import('./components/modals/EditAccountModal').then((m) => ({ default: m.EditAccountModal }))
);
const EditTransactionModal = lazy(() =>
  import('./components/modals/EditTransactionModal').then((m) => ({ default: m.EditTransactionModal }))
);
const EditCategoryModal = lazy(() =>
  import('./components/modals/EditCategoryModal').then((m) => ({ default: m.EditCategoryModal }))
);
const EditTemplateModal = lazy(() =>
  import('./components/modals/EditTemplateModal').then((m) => ({ default: m.EditTemplateModal }))
);
const VoiceTransactionModal = lazy(() =>
  import('./components/modals/VoiceTransactionModal').then((m) => ({ default: m.VoiceTransactionModal }))
);

function ViewFallback() {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-center space-y-2.5">
      <div className="w-8 h-8 border-2 border-brand/20 border-t-[#7132f5] rounded-full animate-spin" />
      <p className="text-xs font-medium text-ink-muted dark:text-[#9ea2b8]">Memuat tampilan...</p>
    </div>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [historyAccountFilterId, setHistoryAccountFilterId] = useState<string>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('akun');

  const handleOpenSettings = (tab: SettingsTab = 'akun') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Offline Sync Outbox & Network Status State
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => getPendingSyncCount());
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ft_hide_balance') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleHideBalance = useCallback(() => {
    setIsBalanceHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ft_hide_balance', String(next));
      } catch {}
      return next;
    });
  }, []);

  const refreshSyncStatus = useCallback(() => {
    setPendingSyncCount(getPendingSyncCount());
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
  }, []);

  // Modal States
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuickTemplate | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [prefilledVoiceKey, setPrefilledVoiceKey] = useState(0);
  const [prefilledVoiceData, setPrefilledVoiceData] = useState<{
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  } | null>(null);
  const [activeToast, setActiveToast] = useState<ToastItem | null>(null);

  const showToast = useCallback((title: string, subtitle?: string, variant: ToastVariant = 'success') => {
    setActiveToast({
      id: crypto.randomUUID(),
      title,
      subtitle,
      variant,
    });
  }, []);

  // Quick Templates state
  const [templates, setTemplates] = useState<QuickTemplate[]>(() => loadCachedQuickTemplates());

  // Accounts state — hydrated synchronously from the offline snapshot so a cold
  // start renders real data instead of the seeded placeholders.
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const snapshot = readLocalSnapshot();
    return snapshot.accounts.length > 0 ? snapshot.accounts : INITIAL_ACCOUNTS;
  });

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => readLocalSnapshot().transactions);

  // Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    const snapshot = readLocalSnapshot();
    return snapshot.categories.length > 0 ? snapshot.categories : INITIAL_CATEGORIES;
  });

  // Persist every committed slice so the next visit starts from the same state.
  const persistData = useCallback(
    (next: { accounts: Account[]; categories: Category[]; transactions: Transaction[] }) => {
      setAccounts(next.accounts);
      setCategories(next.categories);
      setTransactions(next.transactions);
      writeLocalSnapshot(next);
    },
    []
  );

  // Load from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsLoading(true);
      try {
        const [data, tpls] = await Promise.all([loadFinancialData(), loadQuickTemplates()]);
        if (cancelled) return;
        setAccounts(data.accounts);
        setCategories(data.categories);
        setTransactions(data.transactions);
        setTemplates(tpls);
      } catch (err) {
        console.error('Failed to initialize data:', err);
        if (!cancelled) showToast('Gagal memuat data', 'Menampilkan data tersimpan di perangkat', 'error');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setPendingSyncCount(getPendingSyncCount());
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  // Sync / Refresh data
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const pendingBefore = getPendingSyncCount();
      const [data, tpls] = await Promise.all([loadFinancialData(), loadQuickTemplates()]);
      setAccounts(data.accounts);
      setCategories(data.categories);
      setTransactions(data.transactions);
      setTemplates(tpls);
      const pendingAfter = getPendingSyncCount();
      setPendingSyncCount(pendingAfter);
      if (pendingBefore > 0 && pendingAfter < pendingBefore) {
        showToast(
          `${pendingBefore - pendingAfter} perubahan offline berhasil disinkronkan!`,
          'Data telah diperbarui ke penyimpanan awan'
        );
      } else if (pendingAfter > 0) {
        showToast(
          `${pendingAfter} perubahan belum terkirim`,
          'Akan dicoba lagi otomatis saat koneksi tersedia',
          'info'
        );
      }
    } catch (err) {
      console.error('Refresh failed:', err);
      showToast('Sinkronisasi gagal', 'Data lokal tetap aman di perangkat ini', 'error');
    } finally {
      setIsRefreshing(false);
      refreshSyncStatus();
    }
  }, [isRefreshing, refreshSyncStatus, showToast]);

  // Automatically flush the outbox when the network returns, and keep online state in sync.
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (getPendingSyncCount() === 0) return;

      const result = await flushOutbox();
      refreshSyncStatus();

      if (result.synced > 0) {
        showToast(`${result.synced} antrean offline berhasil disinkronkan!`, 'Koneksi kembali stabil');
        void handleRefresh();
      }
      if (result.stuck > 0) {
        showToast(
          `${result.stuck} perubahan ditolak server`,
          'Buka Pengaturan untuk meninjau dan membersihkannya',
          'error'
        );
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshSyncStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleRefresh, refreshSyncStatus, showToast]);

  /**
   * Single funnel for a local-first transaction write.
   *
   * The row id is generated here and reused by the service, so an optimistic
   * insert and its queued server mutation always share one identity — the old
   * code could mint a second uuid on failure and duplicate the transaction.
   */
  const commitNewTransaction = useCallback(
    async (data: {
      type: TransactionType;
      amount: number;
      sourceAccountId: string;
      destinationAccountId?: string;
      categoryId?: string;
      date: string;
      notes: string;
    }): Promise<{ ok: boolean; tx?: Transaction; queued: boolean }> => {
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

      // Apply locally first: the user's entry is never lost to a slow network.
      const withOptimistic = [optimistic, ...transactions];
      const optimisticAccounts = calculateAccountBalances(accounts, withOptimistic);
      persistData({
        accounts: optimisticAccounts,
        categories,
        transactions: withOptimistic,
      });

      try {
        const saved = await addTransactionToDatabase(data, rowId);
        const reconciled = withOptimistic.map((t) => (t.id === rowId ? saved : t));
        persistData({
          accounts: calculateAccountBalances(accounts, reconciled),
          categories,
          transactions: reconciled,
        });
        refreshSyncStatus();
        return { ok: true, tx: saved, queued: false };
      } catch (err) {
        if (isPermanentWriteError(err)) {
          // Roll the optimistic row back: it will never exist on the server.
          persistData({ accounts, categories, transactions });
          showToast('Transaksi gagal disimpan', err.message, 'error');
          return { ok: false, queued: false };
        }
        // Unknown failure: keep the local row and queue it for retry.
        refreshSyncStatus();
        return { ok: true, tx: optimistic, queued: true };
      }
    },
    [accounts, categories, transactions, persistData, refreshSyncStatus, showToast]
  );

  // Handle create transaction
  const handleAddTransaction = useCallback(
    async (data: {
      type: TransactionType;
      amount: number;
      sourceAccountId: string;
      destinationAccountId?: string;
      categoryId?: string;
      date: string;
      notes: string;
    }) => {
      return commitNewTransaction(data);
    },
    [commitNewTransaction]
  );

  // Handle edit transaction
  const handleSaveTransaction = async (updated: {
    id: string;
    amount: number;
    type: TransactionType;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => {
    const previous = { accounts, categories, transactions };
    const nextTransactions = transactions.map((t) =>
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
    );

    persistData({
      accounts: calculateAccountBalances(accounts, nextTransactions),
      categories,
      transactions: nextTransactions,
    });

    try {
      await updateTransactionInDatabase(updated.id, updated);
    } catch (err) {
      if (isPermanentWriteError(err)) {
        persistData(previous);
        showToast('Perubahan gagal disimpan', err.message, 'error');
        return;
      }
      console.error('Unexpected edit failure:', err);
    } finally {
      refreshSyncStatus();
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    const previous = { accounts, categories, transactions };
    const nextTransactions = transactions.filter((t) => t.id !== id);

    persistData({
      accounts: calculateAccountBalances(accounts, nextTransactions),
      categories,
      transactions: nextTransactions,
    });

    try {
      await deleteTransactionFromDatabase(id);
    } catch (err) {
      if (isPermanentWriteError(err)) {
        persistData(previous);
        showToast('Transaksi gagal dihapus', err.message, 'error');
        return;
      }
      console.error('Unexpected delete failure:', err);
    } finally {
      refreshSyncStatus();
    }
  };

  // Handle direct execution of template from Dashboard
  const handleUseTemplateDirectly = async (tpl: QuickTemplate) => {
    const resolvedSrc = resolveTemplateAccount(accounts, tpl.sourceAccountId) || accounts[0];
    const resolvedDst = tpl.destinationAccountId
      ? resolveTemplateAccount(accounts, tpl.destinationAccountId)
      : undefined;
    const resolvedCat = tpl.categoryId
      ? resolveTemplateCategory(categories, tpl.categoryId)
      : undefined;

    const result = await commitNewTransaction({
      type: tpl.type,
      amount: tpl.amount,
      sourceAccountId: resolvedSrc?.id || tpl.sourceAccountId,
      destinationAccountId: resolvedDst?.id,
      categoryId: resolvedCat?.id,
      date: todayLocalISO(),
      notes: tpl.notes || tpl.name,
    });

    if (!result.ok || !result.tx) return;

    if (navigator.vibrate) {
      navigator.vibrate([35, 35]);
    }

    const createdId = result.tx.id;
    setActiveToast({
      id: String(Date.now()),
      title: `${tpl.emoji || '⚡'} ${tpl.name} (${formatCurrency(tpl.amount)}) berhasil dicatat!`,
      subtitle: result.queued
        ? `${resolvedSrc?.name || 'Akun'} • Tersimpan offline, akan disinkronkan`
        : `${resolvedSrc?.name || 'Akun'} • ${resolvedCat?.name || (tpl.type === 'transfer' ? 'Transfer' : 'Transaksi')}`,
      onUndo: () => {
        void handleDeleteTransaction(createdId);
      },
    });
  };

  // Handle save template
  const handleSaveTemplate = async (data: Omit<QuickTemplate, 'id'> & { id?: string }) => {
    if (data.id) {
      const updated = await updateQuickTemplate(data as QuickTemplate, templates);
      setTemplates(updated);
    } else {
      const { updatedList } = await addQuickTemplate(data, templates);
      setTemplates(updatedList);
    }
  };

  // Handle delete template
  const handleDeleteTemplate = async (id: string) => {
    const updated = await deleteQuickTemplate(id, templates);
    setTemplates(updated);
  };

  // Handle save current transaction as template from form
  const handleSaveAsTemplate = async (data: Omit<QuickTemplate, 'id'>) => {
    const { newTemplate, updatedList } = await addQuickTemplate(data, templates);
    setTemplates(updatedList);
    setActiveToast({
      id: String(Date.now()),
      title: `Template "${newTemplate.name}" berhasil disimpan!`,
      subtitle: 'Dapat digunakan kapan saja di Dashboard atau Form',
    });
  };

  // Handle edit or add account
  const handleSaveAccount = async (data: {
    id?: string;
    name: string;
    type: AccountType;
    website?: string;
    initialBalance: number;
  }) => {
    const previous = { accounts, categories, transactions };

    if (data.id) {
      const nextAccounts = accounts.map((a) =>
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
      );
      persistData({
        accounts: calculateAccountBalances(nextAccounts, transactions),
        categories,
        transactions,
      });

      try {
        await updateAccountInDatabase(data.id, data);
      } catch (err) {
        if (isPermanentWriteError(err)) {
          persistData(previous);
          showToast('Akun gagal diperbarui', err.message, 'error');
          return;
        }
        console.error('Unexpected account update failure:', err);
      }
    } else {
      try {
        const created = await addAccountToDatabase({
          name: data.name,
          type: data.type,
          website: data.website,
          initialBalance: data.initialBalance,
        });
        persistData({
          accounts: calculateAccountBalances([...accounts, created], transactions),
          categories,
          transactions,
        });
      } catch (err) {
        if (isPermanentWriteError(err)) {
          showToast('Akun gagal ditambahkan', err.message, 'error');
          return;
        }
        console.error('Unexpected account create failure:', err);
      }
    }
    refreshSyncStatus();
  };

  // Handle delete account
  const handleDeleteAccount = async (id: string) => {
    const previous = { accounts, categories, transactions };
    persistData({
      accounts: accounts.filter((a) => a.id !== id),
      categories,
      transactions,
    });

    try {
      await deleteAccountFromDatabase(id);
    } catch (err) {
      if (isPermanentWriteError(err)) {
        persistData(previous);
        showToast('Akun gagal dihapus', err.message, 'error');
        return;
      }
      console.error('Unexpected account delete failure:', err);
    } finally {
      refreshSyncStatus();
    }
  };

  // Handle edit or add category
  const handleSaveCategory = async (data: {
    id?: string;
    name: string;
    type: 'pengeluaran' | 'pemasukan';
    emoji: string;
    icon?: string;
  }) => {
    const previous = { accounts, categories, transactions };

    if (data.id) {
      const nextCategories = categories.map((c) =>
        c.id === data.id
          ? { ...c, name: data.name, type: data.type, emoji: data.emoji, icon: data.icon }
          : c
      );
      persistData({ accounts, categories: nextCategories, transactions });

      try {
        await updateCategoryInDatabase(data.id, data);
      } catch (err) {
        if (isPermanentWriteError(err)) {
          persistData(previous);
          showToast('Kategori gagal diperbarui', err.message, 'error');
          return;
        }
        console.error('Unexpected category update failure:', err);
      }
    } else {
      try {
        const created = await addCategoryToDatabase(data);
        persistData({ accounts, categories: [...categories, created], transactions });
      } catch (err) {
        if (isPermanentWriteError(err)) {
          showToast('Kategori gagal ditambahkan', err.message, 'error');
          return;
        }
        console.error('Unexpected category create failure:', err);
      }
    }
    setIsCategoryModalOpen(false);
    refreshSyncStatus();
  };

  // Handle delete category
  const handleDeleteCategory = async (id: string) => {
    const previous = { accounts, categories, transactions };
    persistData({
      accounts,
      categories: categories.filter((c) => c.id !== id),
      transactions,
    });
    setIsCategoryModalOpen(false);

    try {
      await deleteCategoryFromDatabase(id);
    } catch (err) {
      if (isPermanentWriteError(err)) {
        persistData(previous);
        showToast('Kategori gagal dihapus', err.message, 'error');
        return;
      }
      console.error('Unexpected category delete failure:', err);
    } finally {
      refreshSyncStatus();
    }
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-[#0d0e12] text-ink dark:text-[#f3f4f8] flex flex-col md:flex-row font-sans selection:bg-brand-soft selection:text-brand-text transition-colors duration-200">
      {/* Desktop Left Sidebar (Visible on md and above) */}
      <Sidebar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenSettings={handleOpenSettings}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        isRefreshing={isRefreshing}
        isLoading={isLoading}
        onSync={handleRefresh}
        pendingSyncCount={pendingSyncCount}
        isOnline={isOnline}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header (Hidden on desktop) */}
        <div className="md:hidden">
          <Header
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onOpenSettings={handleOpenSettings}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            isRefreshing={isRefreshing}
            isLoading={isLoading}
            onSync={handleRefresh}
            pendingSyncCount={pendingSyncCount}
            isOnline={isOnline}
          />
        </div>

        {/* Desktop Top Header Bar with Sync Outbox Status (Visible on md and above) */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 h-16 border-b border-hairline dark:border-[#282937] bg-white/80 dark:bg-[#16171f]/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="font-bold text-base lg:text-lg text-ink dark:text-[#f3f4f8] tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'riwayat' && 'Riwayat Transaksi'}
              {activeTab === 'report' && 'Laporan & Grafik Keuangan'}
              {activeTab === 'saldo' && 'Saldo & Rekening'}
              {activeTab === 'tagihan' && 'Tagihan & Pinjaman'}
              {activeTab === 'input' && 'Catat Transaksi Baru'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {(!isOnline || pendingSyncCount > 0) && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className={`px-3 py-1.5 rounded-[10px] border text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${
                  !isOnline
                    ? 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#b45309] dark:text-[#fbbf24]'
                    : 'border-brand/40 bg-brand-soft text-brand-text dark:text-[#a78bfa]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
                <span>
                  {!isOnline
                    ? pendingSyncCount > 0
                      ? `Mode Offline • ${pendingSyncCount} Antrean`
                      : 'Mode Offline'
                    : `${pendingSyncCount} Antrean Belum Sinkron`}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area - Responsive Container */}
        <main className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10 py-6 2xl:py-8 flex-1">
          {isLoading && accounts.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-3 border-brand/20 border-t-[#7132f5] rounded-full animate-spin" />
              <p className="text-sm font-semibold text-ink">
                Menghubungkan ke Supabase...
              </p>
              <p className="text-xs text-ink-muted">
                Menghitung saldo dari seluruh riwayat transaksi
              </p>
            </div>
          ) : (
            <Suspense fallback={<ViewFallback />}>
              {activeTab === 'dashboard' && (
                <DashboardView
                  accounts={accounts}
                  transactions={transactions}
                  categories={categories}
                  templates={templates}
                  isBalanceHidden={isBalanceHidden}
                  onToggleHideBalance={handleToggleHideBalance}
                  onNavigateTab={setActiveTab}
                  onEditTransaction={(t) => {
                    setSelectedTransaction(t);
                    setIsTxModalOpen(true);
                  }}
                  onAddTransaction={() => setActiveTab('input')}
                  onUseTemplateDirectly={handleUseTemplateDirectly}
                  onEditTemplate={(tpl) => {
                    setSelectedTemplate(tpl);
                    setIsTemplateModalOpen(true);
                  }}
                  onAddTemplate={() => {
                    setSelectedTemplate(null);
                    setIsTemplateModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'input' && (
                <div className="max-w-xl 2xl:max-w-2xl mx-auto">
                  <TransactionForm
                    key={prefilledVoiceKey}
                    accounts={accounts}
                    categories={categories}
                    templates={templates}
                    prefilledData={prefilledVoiceData}
                    onClearPrefilledData={() => setPrefilledVoiceData(null)}
                    onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                    onSubmit={handleAddTransaction}
                    onSaveAsTemplate={handleSaveAsTemplate}
                  />
                </div>
              )}

              {activeTab === 'saldo' && (
                <AccountsView
                  accounts={accounts}
                  isBalanceHidden={isBalanceHidden}
                  onToggleHideBalance={handleToggleHideBalance}
                  onEditAccount={(acc) => {
                    setSelectedAccount(acc);
                    setIsAccountModalOpen(true);
                  }}
                  onAddAccount={() => {
                    setSelectedAccount(null);
                    setIsAccountModalOpen(true);
                  }}
                  onSelectAccountHistory={(acc) => {
                    setHistoryAccountFilterId(acc.id);
                    setActiveTab('riwayat');
                  }}
                />
              )}

              {activeTab === 'tagihan' && (
                <BillsView
                  accounts={accounts}
                  isBalanceHidden={isBalanceHidden}
                  onToggleHideBalance={handleToggleHideBalance}
                  onEditAccount={(acc) => {
                    setSelectedAccount(acc);
                    setIsAccountModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'riwayat' && (
                <div className="max-w-4xl 2xl:max-w-5xl mx-auto">
                  <HistoryView
                    transactions={transactions}
                    accounts={accounts}
                    categories={categories}
                    selectedAccountId={historyAccountFilterId}
                    onChangeSelectedAccountId={setHistoryAccountFilterId}
                    onEditTransaction={(t) => {
                      setSelectedTransaction(t);
                      setIsTxModalOpen(true);
                    }}
                  />
                </div>
              )}

              {activeTab === 'report' && (
                <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto">
                  <ReportView
                    transactions={transactions}
                    accounts={accounts}
                    categories={categories}
                    onEditTransaction={(t) => {
                      setSelectedTransaction(t);
                      setIsTxModalOpen(true);
                    }}
                  />
                </div>
              )}
            </Suspense>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Lazy-loaded Modals */}
      <Suspense fallback={null}>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            initialTab={settingsTab}
            onClose={() => setIsSettingsOpen(false)}
            accounts={accounts}
            categories={categories}
            templates={templates}
            onEditAccount={(acc) => {
              setSelectedAccount(acc);
              setIsAccountModalOpen(true);
            }}
            onAddAccount={() => {
              setSelectedAccount(null);
              setIsAccountModalOpen(true);
            }}
            onEditCategory={(cat) => {
              setSelectedCategory(cat);
              setIsCategoryModalOpen(true);
            }}
            onAddCategory={() => {
              setSelectedCategory(null);
              setIsCategoryModalOpen(true);
            }}
            onEditTemplate={(tpl) => {
              setSelectedTemplate(tpl);
              setIsTemplateModalOpen(true);
            }}
            onAddTemplate={() => {
              setSelectedTemplate(null);
              setIsTemplateModalOpen(true);
            }}
          />
        )}

        {isAccountModalOpen && (
          <EditAccountModal
            isOpen={isAccountModalOpen}
            account={selectedAccount}
            onClose={() => setIsAccountModalOpen(false)}
            onSave={handleSaveAccount}
            onDelete={handleDeleteAccount}
          />
        )}

        {isCategoryModalOpen && (
          <EditCategoryModal
            isOpen={isCategoryModalOpen}
            category={selectedCategory}
            onClose={() => setIsCategoryModalOpen(false)}
            onSave={handleSaveCategory}
            onDelete={handleDeleteCategory}
          />
        )}

        {isTemplateModalOpen && (
          <EditTemplateModal
            isOpen={isTemplateModalOpen}
            template={selectedTemplate}
            accounts={accounts}
            categories={categories}
            onClose={() => setIsTemplateModalOpen(false)}
            onSave={handleSaveTemplate}
            onDelete={handleDeleteTemplate}
          />
        )}

        {isTxModalOpen && (
          <EditTransactionModal
            isOpen={isTxModalOpen}
            transaction={selectedTransaction}
            accounts={accounts}
            categories={categories}
            onClose={() => setIsTxModalOpen(false)}
            onSave={handleSaveTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}

        {isVoiceModalOpen && (
          <VoiceTransactionModal
            isOpen={isVoiceModalOpen}
            onClose={() => setIsVoiceModalOpen(false)}
            accounts={accounts}
            categories={categories}
            templates={templates}
            history={transactions}
            onApplyToForm={(data) => {
              setPrefilledVoiceData(data);
              setPrefilledVoiceKey((k) => k + 1);
              setActiveTab('input');
              showToast('Data ucapan diterapkan ke formulir!', 'Tinjau detail sebelum menyimpan');
            }}
            onDirectSave={async (data) => {
              const result = await handleAddTransaction(data);
              if (!result.ok) return;
              showToast(
                result.queued
                  ? 'Transaksi suara tersimpan di perangkat'
                  : 'Transaksi berhasil disimpan via suara!',
                result.queued ? 'Akan disinkronkan saat koneksi tersedia' : data.notes,
                result.queued ? 'info' : 'success'
              );
            }}
          />
        )}
      </Suspense>

      {/* Global Toast with Undo Action */}
      <Toast toast={activeToast} onClose={() => setActiveToast(null)} />

      <ReloadPrompt />
    </div>
  );
}

export default App;
