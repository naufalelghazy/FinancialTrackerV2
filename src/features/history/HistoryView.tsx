import React, { useState } from 'react';
import type { Transaction, Account, Category } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { Search, ArrowLeftRight, Calendar, Edit2 } from 'lucide-react';

interface HistoryViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  accounts,
  categories,
  onEditTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getAccountName = (id?: string) => accounts.find((a) => a.id === id)?.name || id || '-';
  const getCategoryEmoji = (id?: string) => categories.find((c) => c.id === id)?.emoji || '🏷️';
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
      {/* Search & Filter Card */}
      <div className="bg-white p-4 rounded-[16px] border border-[#dedee5] shadow-whisper space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#101114] tracking-[-0.5px]">
            Riwayat Transaksi
          </h2>
          <span className="text-xs font-semibold text-[#686b82]">
            {filtered.length} dari {transactions.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9497a9] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi, akun, catatan..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-sm text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 placeholder:text-[#9497a9]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 text-xs">
          {['all', 'pengeluaran', 'pemasukan', 'transfer'].map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1.5 rounded-[8px] capitalize font-semibold transition-all ${
                filterType === ft
                  ? 'bg-[#7132f5] text-white shadow-micro'
                  : 'bg-[#edeef3] text-[#686b82] hover:text-[#101114]'
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
          <div className="text-center py-12 bg-white rounded-[16px] border border-[#dedee5] p-6 text-[#9497a9]">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#686b82]" />
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
                onClick={() => onEditTransaction(t)}
                className="group p-3.5 bg-white rounded-[12px] border border-[#dedee5] shadow-micro flex items-center justify-between hover:border-[#7132f5]/50 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onEditTransaction(t);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-[8px] flex items-center justify-center text-lg shrink-0 ${
                      isExpense
                        ? 'bg-[#101114] text-white'
                        : isIncome
                        ? 'bg-[#149e61]/15 text-[#026b3f]'
                        : 'bg-[#855bfb]/15 text-[#7132f5]'
                    }`}
                  >
                    {isTransfer ? (
                      <ArrowLeftRight className="w-4 h-4" />
                    ) : (
                      getCategoryEmoji(t.categoryId)
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#101114] block tracking-tight group-hover:text-[#7132f5] transition-colors">
                      {isTransfer
                        ? `${getAccountName(t.sourceAccountId)} → ${getAccountName(
                            t.destinationAccountId
                          )}`
                        : getCategoryName(t.categoryId)}
                    </span>
                    <span className="text-[11px] text-[#686b82] font-medium block">
                      {t.date} • {getAccountName(t.sourceAccountId)}
                      {t.notes ? ` • ${t.notes}` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span
                      className={`font-bold text-sm block tracking-tight ${
                        isExpense
                          ? 'text-[#e53e3e]'
                          : isIncome
                          ? 'text-[#026b3f]'
                          : 'text-[#7132f5]'
                      }`}
                    >
                      {isExpense ? '-' : isIncome ? '+' : ''}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[#9497a9] group-hover:text-[#7132f5] group-hover:bg-[#855bfb]/10 transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
