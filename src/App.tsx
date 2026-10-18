import { ReloadPrompt } from './components/layout/ReloadPrompt';
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import type { NavTab } from './components/layout/BottomNav';
import { DashboardView } from './features/dashboard/DashboardView';
import { TransactionForm } from './components/forms/TransactionForm';
import type { SettingsTab } from './components/modals/SettingsModal';
import { Toast, type ToastItem } from './components/ui/Toast';
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
  flushOfflineSyncQueue,
  getPendingSyncCount,
} from './services/financialService';
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
      <div className="w-8 h-8 border-2 border-[#7132f5]/20 border-t-[#7132f5] rounded-full animate-spin" />
      <p className="text-xs font-medium text-[#686b82] dark:text-[#9ea2b8]">Memuat tampilan...</p>
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

  const showToast = useCallback((title: string, subtitle?: string) => {
    setActiveToast({
      id: crypto.randomUUID(),
      title,
      subtitle,
    });
  }, []);

  // Quick Templates state
  const [templates, setTemplates] = useState<QuickTemplate[]>(() => loadCachedQuickTemplates());

  // Accounts state
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem('ft_accounts');
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('ft_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('ft_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Load from Supabase on mount
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const [data, tpls] = await Promise.all([
          loadFinancialData(),
          loadQuickTemplates(),
        ]);
        setAccounts(data.accounts);
        setCategories(data.categories);
        setTransactions(data.transactions);
        setTemplates(tpls);
      } catch (err) {
        console.error('Failed to initialize data:', err);
      } finally {
        setIsLoading(false);
        setPendingSyncCount(getPendingSyncCount());
      }
    }
    init();
  }, []);

  // Sync / Refresh data
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const pendingBefore = getPendingSyncCount();
      const [data, tpls] = await Promise.all([
        loadFinancialData(),
        loadQuickTemplates(),
      ]);
      setAccounts(data.accounts);
      setCategories(data.categories);
      setTransactions(data.transactions);
      setTemplates(tpls);
      const pendingAfter = getPendingSyncCount();
      setPendingSyncCount(pendingAfter);
      if (pendingBefore > 0 && pendingAfter < pendingBefore) {
        const synced = pendingBefore - pendingAfter;
        showToast(
          `${synced} perubahan offline berhasil disinkronkan!`,
          'Data telah diperbarui ke penyimpanan awan'
        );
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
      refreshSyncStatus();
    }
  }, [isRefreshing, refreshSyncStatus, showToast]);

  // Automatically flush offline outbox when network connection returns, and track online/offline status
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const pending = getPendingSyncCount();
      if (pending > 0) {
        const synced = await flushOfflineSyncQueue();
        refreshSyncStatus();
        if (synced > 0) {
          showToast(
            `${synced} antrean offline berhasil disinkronkan!`,
            'Koneksi kembali stabil'
          );
          handleRefresh();
        }
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

  // Handle create transaction
  const handleAddTransaction = async (data: {
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => {
    try {
      const newTx = await addTransactionToDatabase(data);
      const nextTransactions = [newTx, ...transactions];
      const nextAccounts = calculateAccountBalances(accounts, nextTransactions);
      setTransactions(nextTransactions);
      setAccounts(nextAccounts);
      localStorage.setItem('ft_transactions', JSON.stringify(nextTransactions));
      localStorage.setItem('ft_accounts', JSON.stringify(nextAccounts));
    } catch (err) {
      console.error('Error adding transaction:', err);
      const fallbackTx: Transaction = {
        id: crypto.randomUUID(),
        type: data.type,
        amount: data.amount,
        sourceAccountId: data.sourceAccountId,
        destinationAccountId: data.destinationAccountId,
        categoryId: data.categoryId,
        notes: data.notes,
        date: data.date,
        createdAt: new Date().toISOString(),
      };
      const nextTransactions = [fallbackTx, ...transactions];
      const nextAccounts = calculateAccountBalances(accounts, nextTransactions);
      setTransactions(nextTransactions);
      setAccounts(nextAccounts);
      localStorage.setItem('ft_transactions', JSON.stringify(nextTransactions));
      localStorage.setItem('ft_accounts', JSON.stringify(nextAccounts));
    } finally {
      refreshSyncStatus();
    }
  };

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

    const nextAccounts = calculateAccountBalances(accounts, nextTransactions);
    setTransactions(nextTransactions);
    setAccounts(nextAccounts);
    localStorage.setItem('ft_transactions', JSON.stringify(nextTransactions));
    localStorage.setItem('ft_accounts', JSON.stringify(nextAccounts));

    await updateTransactionInDatabase(updated.id, updated);
    refreshSyncStatus();
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    const nextTransactions = transactions.filter((t) => t.id !== id);
    const nextAccounts = calculateAccountBalances(accounts, nextTransactions);

    setTransactions(nextTransactions);
    setAccounts(nextAccounts);
    localStorage.setItem('ft_transactions', JSON.stringify(nextTransactions));
    localStorage.setItem('ft_accounts', JSON.stringify(nextAccounts));

    await deleteTransactionFromDatabase(id);
    refreshSyncStatus();
  };

  // Handle direct execution of template from Dashboard
  const handleUseTemplateDirectly = async (tpl: QuickTemplate) => {
    const today = new Date().toISOString().slice(0, 10);
    const resolvedSrc = resolveTemplateAccount(accounts, tpl.sourceAccountId) || accounts[0];
    const resolvedDst = tpl.destinationAccountId
      ? resolveTemplateAccount(accounts, tpl.destinationAccountId)
      : undefined;
    const resolvedCat = tpl.categoryId
      ? resolveTemplateCategory(categories, tpl.categoryId)
      : undefined;

    const txData = {
      type: tpl.type,
      amount: tpl.amount,
      sourceAccountId: resolvedSrc?.id || tpl.sourceAccountId,
      destinationAccountId: resolvedDst?.id,
      categoryId: resolvedCat?.id,
      date: today,
      notes: tpl.notes || tpl.name,
    };

    let createdId = '';
    try {
      const newTx = await addTransactionToDatabase(txData);
      createdId = newTx.id;
      const nextTransactions = [newTx, ...transactions];
      const nextAccounts = calculateAccountBalances(accounts, nextTransactions);
      setTransactions(nextTransactions);
      setAccounts(nextAccounts);
      localStorage.setItem('ft_transactions', JSON.stringify(nextTransactions));
      localStorage.setItem('ft_accounts', JSON.stringify(nextAccounts));
    } catch (err) {
      console.error('Error adding transaction from template:', err);
      const fallbackTx: Transaction = {
        id: crypto.randomUUID(),
        type: txData.type,
        amount: txData.amount,
        sourceAccountId: txData.sourceAccountId,
        destinationAccountId: txData.destinationAccountId,
        categoryId: txData.categoryId,
        notes: txData.notes,
        date: txData.date,
        createdAt: new Date().toISOString(),
      };
      createdId = fallbackTx.id;
      const nextTransactions = [fallbackTx, ...transactions];
      const nextAccounts = calculateAccountBalances(accounts, nextTransactions);
      setTransactions(nextTransactions);
      setAccounts(nextAccounts);
      localStorage.setItem('ft_transactions', JSON.stringify(nextTransactions));
      localStorage.setItem('ft_accounts', JSON.stringify(nextAccounts));
    } finally {
      refreshSyncStatus();
    }

    if (navigator.vibrate) {
      navigator.vibrate([35, 35]);
    }

    setActiveToast({
      id: String(Date.now()),
      title: `${tpl.emoji || '⚡'} ${tpl.name} (${formatCurrency(tpl.amount)}) berhasil dicatat!`,
      subtitle: `${resolvedSrc?.name || 'Akun'} • ${resolvedCat?.name || (tpl.type === 'transfer' ? 'Transfer' : 'Transaksi')}`,
      onUndo: () => {
        if (createdId) {
          handleDeleteTransaction(createdId);
        }
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
    if (data.id) {
      // Update existing
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
      const recomputed = calculateAccountBalances(nextAccounts, transactions);
      setAccounts(recomputed);
      localStorage.setItem('ft_accounts', JSON.stringify(recomputed));

      await updateAccountInDatabase(data.id, {
        name: data.name,
        type: data.type,
        website: data.website,
        initialBalance: data.initialBalance,
      });
    } else {
      // Add new
      const created = await addAccountToDatabase({
        name: data.name,
        type: data.type,
        website: data.website,
        initialBalance: data.initialBalance,
      });

      const nextAccounts = [...accounts, created];
      const recomputed = calculateAccountBalances(nextAccounts, transactions);
      setAccounts(recomputed);
      localStorage.setItem('ft_accounts', JSON.stringify(recomputed));
    }
    refreshSyncStatus();
  };

  // Handle delete account
  const handleDeleteAccount = async (id: string) => {
    const nextAccounts = accounts.filter((a) => a.id !== id);
    setAccounts(nextAccounts);
    localStorage.setItem('ft_accounts', JSON.stringify(nextAccounts));
    await deleteAccountFromDatabase(id);
    refreshSyncStatus();
  };

  // Handle edit or add category
  const handleSaveCategory = async (data: {
    id?: string;
    name: string;
    type: 'pengeluaran' | 'pemasukan';
    emoji: string;
    icon?: string;
  }) => {
    if (data.id) {
      // Update existing
      const nextCategories = categories.map((c) =>
        c.id === data.id
          ? {
              ...c,
              name: data.name,
              type: data.type,
              emoji: data.emoji,
              icon: data.icon,
            }
          : c
      );
      setCategories(nextCategories);
      localStorage.setItem('ft_categories', JSON.stringify(nextCategories));

      await updateCategoryInDatabase(data.id, data);
    } else {
      // Add new
      const created = await addCategoryToDatabase(data);
      const nextCategories = [...categories, created];
      setCategories(nextCategories);
      localStorage.setItem('ft_categories', JSON.stringify(nextCategories));
    }
    setIsCategoryModalOpen(false);
    refreshSyncStatus();
  };

  // Handle delete category
  const handleDeleteCategory = async (id: string) => {
    const nextCategories = categories.filter((c) => c.id !== id);
    setCategories(nextCategories);
    localStorage.setItem('ft_categories', JSON.stringify(nextCategories));
    await deleteCategoryFromDatabase(id);
    setIsCategoryModalOpen(false);
    refreshSyncStatus();
  };

  return (
    <div className="min-h-screen bg-[#fafbfe] dark:bg-[#0d0e12] text-[#101114] dark:text-[#f3f4f8] flex flex-col md:flex-row font-sans selection:bg-[#855bfb]/20 selection:text-[#7132f5] transition-colors duration-200">
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
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 h-16 border-b border-[#dedee5] dark:border-[#282937] bg-white/80 dark:bg-[#16171f]/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="font-bold text-base lg:text-lg text-[#101114] dark:text-[#f3f4f8] tracking-tight">
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
                    : 'border-[#7132f5]/40 bg-[#7132f5]/10 text-[#7132f5] dark:text-[#a78bfa]'
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
              <div className="w-10 h-10 border-3 border-[#7132f5]/20 border-t-[#7132f5] rounded-full animate-spin" />
              <p className="text-sm font-semibold text-[#101114]">
                Menghubungkan ke Supabase...
              </p>
              <p className="text-xs text-[#686b82]">
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
            onDeleteTemplate={handleDeleteTemplate}
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
              await handleAddTransaction(data);
              showToast('Transaksi berhasil disimpan via suara!', data.notes);
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
