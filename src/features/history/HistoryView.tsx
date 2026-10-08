import React, { useState, useMemo } from 'react';
import type { Transaction, Account, Category } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { Search, Calendar, Edit2, ArrowRight, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { CategoryIcon } from '../../components/ui/CategoryIcon';

interface HistoryViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
}

function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day;

  const isYesterday =
    yesterday.getFullYear() === year &&
    yesterday.getMonth() + 1 === month &&
    yesterday.getDate() === day;

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = dayNames[dateObj.getDay()];
  const monthName = monthNames[month - 1];

  if (isToday) return `Hari Ini, ${day} ${monthName} ${year}`;
  if (isYesterday) return `Kemarin, ${day} ${monthName} ${year}`;
  return `${dayName}, ${day} ${monthName} ${year}`;
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
  const getCategoryName = (id?: string) => categories.find((c) => c.id === id)?.name || id || '-';

  // 1. Filtered Transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const notesMatch = (t.notes || '').toLowerCase().includes(search.toLowerCase());
      const accountMatch = getAccountName(t.sourceAccountId).toLowerCase().includes(search.toLowerCase()) ||
        (t.destinationAccountId ? getAccountName(t.destinationAccountId).toLowerCase().includes(search.toLowerCase()) : false);
      const categoryMatch = getCategoryName(t.categoryId).toLowerCase().includes(search.toLowerCase());
      const dateMatch = t.date.includes(search);

      const matchesSearch = notesMatch || accountMatch || categoryMatch || dateMatch;
      const matchesType = filterType === 'all' || t.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [transactions, search, filterType, accounts, categories]);

  // 2. Summary stats for filtered items
  const stats = useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;

    for (const t of filtered) {
      if (t.type === 'pengeluaran') totalExpense += t.amount;
      if (t.type === 'pemasukan') totalIncome += t.amount;
    }

    return { totalExpense, totalIncome, count: filtered.length };
  }, [filtered]);

  // 3. Group by Date (Sorted Descending)
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: Transaction[]; dayTotal: number }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    for (const t of filtered) {
      const list = dateMap.get(t.date) || [];
      list.push(t);
      dateMap.set(t.date, list);
    }

    // Sort dates descending
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    for (const date of sortedDates) {
      const items = dateMap.get(date) || [];
      const dayTotal = items.reduce((acc, curr) => {
        if (curr.type === 'pengeluaran') return acc - curr.amount;
        if (curr.type === 'pemasukan') return acc + curr.amount;
        return acc;
      }, 0);
      groups.push({ date, items, dayTotal });
    }

    return groups;
  }, [filtered]);

  return (
    <div className="space-y-4 pb-24">
      {/* Search & Filter Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-[#dedee5] shadow-whisper space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#101114] tracking-[-0.5px]">
              Riwayat Transaksi
            </h2>
            <p className="text-[11px] text-[#686b82]">
              Daftar seluruh mutasi, pengeluaran & pemasukan
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-[8px] bg-[#edeef3] text-xs font-bold text-[#101114]">
            {stats.count} Transaksi
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9497a9] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi, rekening, kategori, atau catatan..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-sm text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 placeholder:text-[#9497a9] transition-all"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex bg-[#edeef3] p-1 rounded-[10px] gap-1 text-xs">
          {[
            { id: 'all', label: 'Semua', icon: null },
            { id: 'pengeluaran', label: 'Keluar', icon: ArrowUpRight },
            { id: 'pemasukan', label: 'Masuk', icon: ArrowDownLeft },
            { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-[8px] font-semibold flex items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-white text-[#101114] shadow-micro'
                    : 'text-[#686b82] hover:text-[#101114]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Metrics */}
        {(filterType === 'all' || filterType === 'pengeluaran' || filterType === 'pemasukan') && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#dedee5]/70 text-xs">
            <div className="bg-[#fafbfe] p-2.5 rounded-[10px] border border-[#dedee5]/60">
              <span className="text-[10px] uppercase font-bold text-[#686b82] block tracking-wider">
                Total Keluar
              </span>
              <span className="text-sm font-bold text-[#e53e3e] tracking-tight">
                -{formatCurrency(stats.totalExpense)}
              </span>
            </div>
            <div className="bg-[#fafbfe] p-2.5 rounded-[10px] border border-[#dedee5]/60">
              <span className="text-[10px] uppercase font-bold text-[#686b82] block tracking-wider">
                Total Masuk
              </span>
              <span className="text-sm font-bold text-[#026b3f] tracking-tight">
                +{formatCurrency(stats.totalIncome)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grouped Transaction Lists */}
      {groupedByDate.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[16px] border border-[#dedee5] p-6 text-[#9497a9] shadow-whisper">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#686b82]" />
          <p className="text-sm font-semibold text-[#101114]">Tidak ada transaksi ditemukan</p>
          <p className="text-xs text-[#9497a9] mt-1">Coba ubah kata kunci pencarian atau filter</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {groupedByDate.map((group) => (
            <div
              key={group.date}
              className="bg-white rounded-[14px] border border-[#dedee5] shadow-whisper overflow-hidden"
            >
              {/* Date Header: Clear separation of date & daily flow */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#f8f9fc] border-b border-[#dedee5]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-[6px] bg-[#855bfb]/12 flex items-center justify-center text-[#7132f5]">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#101114] tracking-tight">
                    {formatIndonesianDate(group.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#686b82]">
                    {group.items.length} transaksi
                  </span>
                  {group.dayTotal !== 0 && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-[6px] ${
                        group.dayTotal < 0
                          ? 'bg-[#fee2e2] text-[#b91c1c]'
                          : 'bg-[#d1fae5] text-[#026b3f]'
                      }`}
                    >
                      {group.dayTotal < 0 ? '-' : '+'}
                      {formatCurrency(Math.abs(group.dayTotal))}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions List within this Date */}
              <div className="divide-y divide-[#dedee5]/60">
                {group.items.map((t) => {
                  const isExpense = t.type === 'pengeluaran';
                  const isIncome = t.type === 'pemasukan';
                  const isTransfer = t.type === 'transfer';

                  const sourceName = getAccountName(t.sourceAccountId);
                  const destName = t.destinationAccountId ? getAccountName(t.destinationAccountId) : '';
                  const categoryName = getCategoryName(t.categoryId);

                  return (
                    <div
                      key={t.id}
                      onClick={() => onEditTransaction(t)}
                      className="group px-4 py-3 flex items-start sm:items-center justify-between gap-3 hover:bg-[#fafbfe] active:bg-[#f4f5f8] cursor-pointer transition-colors"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onEditTransaction(t);
                        }
                      }}
                    >
                      {/* Left: Category Icon */}
                      <div className="pt-0.5 sm:pt-0 shrink-0">
                        <CategoryIcon
                          name={isTransfer ? 'Pindah Akun' : categoryName}
                          type={t.type}
                          size="md"
                        />
                      </div>

                      {/* Middle: Clear Separation of Kategori, Akun, and Catatan */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Top Line: Kategori Title + Akun Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#101114] tracking-tight group-hover:text-[#7132f5] transition-colors">
                            {isTransfer ? 'Pindah Akun' : categoryName}
                          </span>

                          {/* Distinct Account Badge */}
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#f0f1f5] border border-[#dedee5]/80 text-[11px] font-semibold text-[#484b5e]">
                            {isTransfer ? (
                              <>
                                <span className="text-[#101114] font-bold">{sourceName}</span>
                                <ArrowRight className="w-2.5 h-2.5 text-[#7132f5] shrink-0" />
                                <span className="text-[#101114] font-bold">{destName}</span>
                              </>
                            ) : (
                              <span>{sourceName}</span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Line: Catatan (Notes) distinctly presented */}
                        {t.notes ? (
                          <p className="text-xs text-[#686b82] leading-snug line-clamp-2">
                            {t.notes}
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#9497a9] italic">
                            Tanpa catatan
                          </p>
                        )}
                      </div>

                      {/* Right: Nominal & Edit Action */}
                      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                        <div className="text-right">
                          <span
                            className={`font-bold text-sm sm:text-base block tracking-tight tabular-nums ${
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
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9497a9] block mt-0.5">
                            {isTransfer ? 'Transfer' : isExpense ? 'Keluar' : 'Masuk'}
                          </span>
                        </div>

                        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#9497a9] group-hover:text-[#7132f5] group-hover:bg-[#855bfb]/10 transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
