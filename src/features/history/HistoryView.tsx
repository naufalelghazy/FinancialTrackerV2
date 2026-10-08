import React, { useState } from 'react';
import type { Transaction, Account, Category } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { Search, ArrowLeftRight, Calendar } from 'lucide-react';

interface HistoryViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  accounts,
  categories,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getAccountName = (id?: string) => accounts.find((a) => a.id === id)?.name || id || '-';
  const getCategoryEmoji = (id?: string) => categories.find((c) => c.id === id)?.emoji || '📌';
  const getCategoryName = (id?: string) => categories.find((c) => c.id === id)?.name || id || '-';

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      (t.notes || '').toLowerCase().includes(search.toLowerCase()) ||
      getAccountName(t.sourceAccountId).toLowerCase().includes(search.toLowerCase()) ||
      getCategoryName(t.categoryId).toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Header & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-800">Riwayat Transaksi</h2>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi, akun, catatan..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {['all', 'pengeluaran', 'pemasukan', 'transfer'].map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                filterType === ft
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ft === 'all' ? 'Semua' : ft}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Belum ada riwayat transaksi</p>
          </div>
        ) : (
          filtered.map((t) => {
            const isExpense = t.type === 'pengeluaran';
            const isIncome = t.type === 'pemasukan';
            const isTransfer = t.type === 'transfer';

            return (
              <div
                key={t.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      isExpense
                        ? 'bg-rose-50 text-rose-600'
                        : isIncome
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    {isTransfer ? (
                      <ArrowLeftRight className="w-5 h-5" />
                    ) : (
                      getCategoryEmoji(t.categoryId)
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800 block">
                      {isTransfer
                        ? `Transfer: ${getAccountName(t.sourceAccountId)} → ${getAccountName(
                            t.destinationAccountId
                          )}`
                        : getCategoryName(t.categoryId)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {t.date} • {getAccountName(t.sourceAccountId)}
                      {t.notes ? ` • ${t.notes}` : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold text-sm block ${
                      isExpense
                        ? 'text-rose-600'
                        : isIncome
                        ? 'text-emerald-600'
                        : 'text-indigo-600'
                    }`}
                  >
                    {isExpense ? '-' : isIncome ? '+' : ''}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
