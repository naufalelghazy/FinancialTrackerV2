import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import type { NavTab } from './components/layout/BottomNav';
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
import { RefreshCw } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('saldo');
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

  // Fetch initial data from Supabase
  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const res = await loadFinancialData();
      setAccounts(res.accounts);
      setCategories(res.categories);
      setTransactions(res.transactions);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle new transaction
  const handleAddTransaction = async (data: {
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => {
    const tempTx: Transaction = {
      id: crypto.randomUUID(),
      date: data.date,
      type: data.type,
      amount: data.amount,
      sourceAccountId: data.sourceAccountId,
      destinationAccountId: data.destinationAccountId,
      categoryId: data.categoryId,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    const nextTransactions = [tempTx, ...transactions];
    const nextAccounts = calculateAccountBalances(accounts, nextTransactions);

    setTransactions(nextTransactions);
    setAccounts(nextAccounts);
    setActiveTab('saldo');

    try {
      const saved = await addTransactionToDatabase(data);
      setTransactions((prev) =>
        prev.map((t) => (t.id === tempTx.id ? { ...t, id: saved.id } : t))
      );
    } catch (err) {
      console.error('Failed to persist transaction:', err);
    }
  };

  // Handle edit transaction
  const handleSaveTransaction = async (updated: {
    id: string;
    type: TransactionType;
    amount: number;
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
    const recomputed = calculateAccountBalances(nextAccounts, transactions);
    setAccounts(recomputed);

    await deleteAccountFromDatabase(id);
  };

  return (
    <div className="min-h-screen bg-[#fafbfe] flex flex-col justify-between text-[#101114]">
      {/* Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Sync Status Bar */}
      <div className="max-w-md w-full mx-auto px-4 pt-2 flex items-center justify-between text-xs text-[#686b82]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#149e61]" />
          <span>
            {isLoading
              ? 'Memuat data dari Supabase...'
              : `${transactions.length} transaksi aktif`}
          </span>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={isRefreshing || isLoading}
          className="flex items-center gap-1 text-[#7132f5] hover:text-[#5741d8] font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3 h-3 ${isRefreshing || isLoading ? 'animate-spin' : ''}`}
          />
          <span>{isRefreshing ? 'Sinkron...' : 'Sinkronkan'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-md w-full mx-auto px-4 pt-3 flex-1">
        {isLoading && accounts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#7132f5]/20 border-t-[#7132f5] rounded-full animate-spin" />
            <p className="text-sm font-semibold text-[#101114]">
              Menghubungkan ke Supabase...
            </p>
            <p className="text-xs text-[#686b82]">
              Menghitung saldo dari 1.400+ riwayat transaksi
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'input' && (
              <TransactionForm
                accounts={accounts}
                categories={categories}
                onSubmit={handleAddTransaction}
              />
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
              <HistoryView
                transactions={transactions}
                accounts={accounts}
                categories={categories}
                onEditTransaction={(t) => {
                  setSelectedTransaction(t);
                  setIsTxModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Edit Account Modal */}
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
