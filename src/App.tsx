import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import type { NavTab } from './components/layout/BottomNav';
import { TransactionForm } from './components/forms/TransactionForm';
import { AccountsView } from './features/accounts/AccountsView';
import { BillsView } from './features/accounts/BillsView';
import { HistoryView } from './features/history/HistoryView';
import { SettingsModal } from './components/modals/SettingsModal';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES } from './lib/constants';
import type { Account, Transaction, TransactionType } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('input');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
  const [categories] = useState(INITIAL_CATEGORIES);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ft_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('ft_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Handle new transaction
  const handleAddTransaction = (data: {
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => {
    const newTx: Transaction = {
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

    // Update balances
    setAccounts((prev) =>
      prev.map((acc) => {
        // If transfer
        if (data.type === 'transfer') {
          if (acc.id === data.sourceAccountId) {
            return { ...acc, balance: acc.balance - data.amount };
          }
          if (acc.id === data.destinationAccountId) {
            return { ...acc, balance: acc.balance + data.amount };
          }
        }
        // If expense
        else if (data.type === 'pengeluaran' && acc.id === data.sourceAccountId) {
          if (acc.type === 'credit') {
            return { ...acc, balance: acc.balance - data.amount };
          }
          return { ...acc, balance: acc.balance - data.amount };
        }
        // If income
        else if (data.type === 'pemasukan' && acc.id === data.sourceAccountId) {
          return { ...acc, balance: acc.balance + data.amount };
        }
        return acc;
      })
    );

    // Append to transactions list (newest first)
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Content Area */}
      <main className="max-w-md w-full mx-auto px-4 pt-4 flex-1">
        {activeTab === 'input' && (
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSubmit={handleAddTransaction}
          />
        )}

        {activeTab === 'saldo' && <AccountsView accounts={accounts} />}

        {activeTab === 'tagihan' && <BillsView accounts={accounts} />}

        {activeTab === 'riwayat' && (
          <HistoryView
            transactions={transactions}
            accounts={accounts}
            categories={categories}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
