import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import type { NavTab } from './components/layout/BottomNav';
import { DashboardView } from './features/dashboard/DashboardView';
import { TransactionForm } from './components/forms/TransactionForm';
import { AccountsView } from './features/accounts/AccountsView';
import { BillsView } from './features/accounts/BillsView';
import { HistoryView } from './features/history/HistoryView';
import { SettingsModal } from './components/modals/SettingsModal';
import { EditAccountModal } from './components/modals/EditAccountModal';
import { EditTransactionModal } from './components/modals/EditTransactionModal';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES } from './lib/constants';
import {
  loadFinancialData,
  addTransactionToDatabase,
  updateTransactionInDatabase,
  deleteTransactionFromDatabase,
  updateAccountInDatabase,
  addAccountToDatabase,
  deleteAccountFromDatabase,
  calculateAccountBalances,
} from './services/financialService';
import type { Account, AccountType, Category, Transaction, TransactionType } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

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
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  // Load from Supabase on mount
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const data = await loadFinancialData();
        setAccounts(data.accounts);
        setCategories(data.categories);
        setTransactions(data.transactions);
      } catch (err) {
        console.error('Failed to initialize data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Sync / Refresh data
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const data = await loadFinancialData();
      setAccounts(data.accounts);
      setCategories(data.categories);
      setTransactions(data.transactions);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

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

    await updateTransactionInDatabase(updated.id, updated);
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    const nextTransactions = transactions.filter((t) => t.id !== id);
    const nextAccounts = calculateAccountBalances(accounts, nextTransactions);

    setTransactions(nextTransactions);
    setAccounts(nextAccounts);

    await deleteTransactionFromDatabase(id);
  };

  // Handle edit or add account
  const handleSaveAccount = async (data: {
    id?: string;
    name: string;
    type: AccountType;
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
              initialBalance: data.initialBalance,
            }
          : a
      );
      const recomputed = calculateAccountBalances(nextAccounts, transactions);
      setAccounts(recomputed);

      await updateAccountInDatabase(data.id, {
        name: data.name,
        type: data.type,
        initialBalance: data.initialBalance,
      });
    } else {
      // Add new
      const created = await addAccountToDatabase({
        name: data.name,
        type: data.type,
        initialBalance: data.initialBalance,
      });

      const nextAccounts = [...accounts, created];
      const recomputed = calculateAccountBalances(nextAccounts, transactions);
      setAccounts(recomputed);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async (id: string) => {
    const nextAccounts = accounts.filter((a) => a.id !== id);
    setAccounts(nextAccounts);
    await deleteAccountFromDatabase(id);
  };

  return (
    <div className="min-h-screen bg-[#fafbfe] text-[#101114] flex flex-col font-sans selection:bg-[#855bfb]/20 selection:text-[#7132f5]">
      {/* Top Header - Responsive desktop & mobile */}
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRefreshing={isRefreshing}
        isLoading={isLoading}
        onSync={handleRefresh}
      />

      {/* Main Content Area - Full Responsive Grid Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1">
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
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                accounts={accounts}
                transactions={transactions}
                categories={categories}
                onNavigateTab={setActiveTab}
                onEditTransaction={(t) => {
                  setSelectedTransaction(t);
                  setIsTxModalOpen(true);
                }}
                onAddTransaction={() => setActiveTab('input')}
              />
            )}

            {activeTab === 'input' && (
              <div className="max-w-xl mx-auto">
                <TransactionForm
                  accounts={accounts}
                  categories={categories}
                  onSubmit={handleAddTransaction}
                />
              </div>
            )}

            {activeTab === 'saldo' && (
              <AccountsView
                accounts={accounts}
                onEditAccount={(acc) => {
                  setSelectedAccount(acc);
                  setIsAccountModalOpen(true);
                }}
                onAddAccount={() => {
                  setSelectedAccount(null);
                  setIsAccountModalOpen(true);
                }}
              />
            )}

            {activeTab === 'tagihan' && (
              <BillsView
                accounts={accounts}
                onEditAccount={(acc) => {
                  setSelectedAccount(acc);
                  setIsAccountModalOpen(true);
                }}
              />
            )}

            {activeTab === 'riwayat' && (
              <div className="max-w-4xl mx-auto">
                <HistoryView
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
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Edit / Add Account Modal */}
      <EditAccountModal
        isOpen={isAccountModalOpen}
        account={selectedAccount}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={isTxModalOpen}
        transaction={selectedTransaction}
        accounts={accounts}
        categories={categories}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
}

export default App;
