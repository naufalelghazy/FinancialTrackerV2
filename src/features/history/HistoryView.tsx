import React, { useState, useMemo, useCallback } from 'react';
import type { Transaction, Account, Category } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import {
  Search,
  Calendar,
  Edit2,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { CategoryIcon } from '../../components/ui/CategoryIcon';

interface HistoryViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
}

interface DayGroup {
  date: string;
  items: Transaction[];
  dayTotal: number;
}

interface MonthGroup {
  monthKey: string;
  label: string;
  days: DayGroup[];
  totalCount: number;
  totalExpense: number;
  totalIncome: number;
  netTotal: number;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function formatMonthLabel(monthKey: string): string {
  const parts = monthKey.split('-');
  if (parts.length !== 2) return monthKey;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (!year || !month || month < 1 || month > 12) return monthKey;
  return `${MONTH_NAMES[month - 1]} ${year}`;
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

  const dayName = dayNames[dateObj.getDay()];
  const monthName = MONTH_NAMES[month - 1];

  if (isToday) return `Hari Ini, ${day} ${monthName} ${year}`;
  if (isYesterday) return `Kemarin, ${day} ${monthName} ${year}`;
  return `${dayName}, ${day} ${monthName} ${year}`;
}

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  accounts,
  categories,
  onEditTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  // Fast O(1) lookup maps
  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of accounts) map.set(a.id, a.name);
    return map;
  }, [accounts]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const categoryObjectMap = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const getAccountName = useCallback((id?: string) => (id ? accountMap.get(id) || id : '-'), [accountMap]);
  const getCategoryName = useCallback((id?: string) => (id ? categoryMap.get(id) || id : '-'), [categoryMap]);
  const getCategory = useCallback((id?: string) => (id ? categoryObjectMap.get(id) : undefined), [categoryObjectMap]);

  const currentMonthKey = useMemo(() => getCurrentMonthKey(), []);

  // 1. Filtered Transactions
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) {
        return false;
      }

      if (!query) return true;

      const sourceName = getAccountName(t.sourceAccountId).toLowerCase();
      const destName = t.destinationAccountId ? getAccountName(t.destinationAccountId).toLowerCase() : '';
      const categoryName = getCategoryName(t.categoryId).toLowerCase();
      const notesMatch = (t.notes || '').toLowerCase().includes(query);
      const sourceMatch = sourceName.includes(query);
      const destMatch = destName.includes(query);
      const categoryMatch = categoryName.includes(query);
      const dateMatch = t.date.includes(query);

      return notesMatch || sourceMatch || destMatch || categoryMatch || dateMatch;
    });
  }, [transactions, search, filterType, getAccountName, getCategoryName]);

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

  // 3. Group by Month, then by Day (Sorted Descending)
  const groupedByMonth = useMemo(() => {
    const monthMap = new Map<string, Map<string, Transaction[]>>();

    for (const t of filtered) {
      const monthKey = t.date.slice(0, 7);
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, new Map<string, Transaction[]>());
      }
      const dayMap = monthMap.get(monthKey)!;
      const list = dayMap.get(t.date) || [];
      list.push(t);
      dayMap.set(t.date, list);
    }

    // Sort months descending (newest month first)
    const sortedMonthKeys = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a));
    const result: MonthGroup[] = [];

    for (const monthKey of sortedMonthKeys) {
      const dayMap = monthMap.get(monthKey)!;
      const sortedDates = Array.from(dayMap.keys()).sort((a, b) => b.localeCompare(a));

      const days: DayGroup[] = [];
      let totalExpense = 0;
      let totalIncome = 0;
      let totalCount = 0;

      for (const date of sortedDates) {
        const items = dayMap.get(date) || [];
        totalCount += items.length;

        let dayTotal = 0;
        for (const item of items) {
          if (item.type === 'pengeluaran') {
            dayTotal -= item.amount;
            totalExpense += item.amount;
          } else if (item.type === 'pemasukan') {
            dayTotal += item.amount;
            totalIncome += item.amount;
          }
        }

        days.push({ date, items, dayTotal });
      }

      result.push({
        monthKey,
        label: formatMonthLabel(monthKey),
        days,
        totalCount,
        totalExpense,
        totalIncome,
        netTotal: totalIncome - totalExpense,
      });
    }

    return result;
  }, [filtered]);

  // Check if a specific month is open:
  // - Open if searching (so matching transactions are visible immediately)
  // - Open if user explicitly expanded it
  // - Open by default for current month (or newest month if current month has no transactions)
  // - Closed by default for past months
  const isMonthExpanded = useCallback(
    (monthKey: string, isFirstMonth: boolean): boolean => {
      if (search.trim().length > 0) return true;

      if (expandedMonths[monthKey] !== undefined) {
        return expandedMonths[monthKey];
      }

      if (monthKey === currentMonthKey) return true;

      const hasCurrentMonth = groupedByMonth.some((m) => m.monthKey === currentMonthKey);
      if (!hasCurrentMonth && isFirstMonth) return true;

      return false;
    },
    [search, expandedMonths, currentMonthKey, groupedByMonth]
  );

  const toggleMonth = (monthKey: string, isFirstMonth: boolean) => {
    const currentStatus = isMonthExpanded(monthKey, isFirstMonth);
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !currentStatus,
    }));
  };

  const allMonthsExpanded = useMemo(() => {
    if (groupedByMonth.length === 0) return false;
    return groupedByMonth.every((m, idx) => isMonthExpanded(m.monthKey, idx === 0));
  }, [groupedByMonth, isMonthExpanded]);

  const handleToggleAll = () => {
    const nextState = !allMonthsExpanded;
    const updated: Record<string, boolean> = {};
    for (const m of groupedByMonth) {
      updated[m.monthKey] = nextState;
    }
    setExpandedMonths(updated);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Search & Filter Header Card */}
      <div className="bg-white dark:bg-[#16171f] p-4 sm:p-5 rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#101114] dark:text-[#f3f4f8] tracking-[-0.5px]">
              Riwayat Transaksi
            </h2>
            <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
              Daftar seluruh mutasi, pengeluaran & pemasukan per bulan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-[8px] bg-[#edeef3] dark:bg-[#232534] text-xs font-bold text-[#101114] dark:text-[#f3f4f8]">
              {stats.count} Transaksi
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9497a9] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi, rekening, kategori, atau catatan..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-sm text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 placeholder:text-[#9497a9] transition-all"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex bg-[#edeef3] dark:bg-[#232534] p-1 rounded-[10px] gap-1 text-xs">
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
                    ? 'bg-white dark:bg-[#282937] text-[#101114] dark:text-[#f3f4f8] shadow-micro'
                    : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:text-[#f3f4f8]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Metrics & Accordion Toggle Controls */}
        <div className="pt-1 border-t border-[#dedee5] dark:border-[#282937]/70 space-y-2">
          {(filterType === 'all' || filterType === 'pengeluaran' || filterType === 'pemasukan') && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#fafbfe] dark:bg-[#13141c] p-2.5 rounded-[10px] border border-[#dedee5] dark:border-[#282937]/60">
                <span className="text-[10px] uppercase font-bold text-[#686b82] dark:text-[#9ca0ba] block tracking-wider">
                  Total Keluar
                </span>
                <span className="text-sm font-bold text-[#e53e3e] tracking-tight">
                  -{formatCurrency(stats.totalExpense)}
                </span>
              </div>
              <div className="bg-[#fafbfe] dark:bg-[#13141c] p-2.5 rounded-[10px] border border-[#dedee5] dark:border-[#282937]/60">
                <span className="text-[10px] uppercase font-bold text-[#686b82] dark:text-[#9ca0ba] block tracking-wider">
                  Total Masuk
                </span>
                <span className="text-sm font-bold text-[#026b3f] tracking-tight">
                  +{formatCurrency(stats.totalIncome)}
                </span>
              </div>
            </div>
          )}

          {groupedByMonth.length > 1 && (
            <div className="flex items-center justify-between text-xs pt-1 text-[#686b82] dark:text-[#9ca0ba]">
              <span className="text-[11px]">
                {groupedByMonth.length} Bulan Terdata
              </span>
              <button
                type="button"
                onClick={handleToggleAll}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/50 text-xs font-semibold text-[#101114] dark:text-[#f3f4f8] transition-all cursor-pointer active:scale-95"
              >
                <ChevronsUpDown className="w-3.5 h-3.5 text-[#7132f5] shrink-0" />
                <span>{allMonthsExpanded ? 'Tutup Semua Bulan' : 'Buka Semua Bulan'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Grouped Transaction Accordions */}
      {groupedByMonth.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] p-6 text-[#9497a9] dark:text-[#7d8299] shadow-whisper">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#686b82] dark:text-[#9ca0ba]" />
          <p className="text-sm font-semibold text-[#101114] dark:text-[#f3f4f8]">Tidak ada transaksi ditemukan</p>
          <p className="text-xs text-[#9497a9] mt-1">Coba ubah kata kunci pencarian atau filter</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {groupedByMonth.map((monthGroup, monthIndex) => {
            const isFirst = monthIndex === 0;
            const isOpen = isMonthExpanded(monthGroup.monthKey, isFirst);
            const isCurrent = monthGroup.monthKey === currentMonthKey;

            return (
              <div
                key={monthGroup.monthKey}
                className="bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper overflow-hidden transition-all duration-200"
              >
                {/* Month Dropdown / Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleMonth(monthGroup.monthKey, isFirst)}
                  aria-expanded={isOpen}
                  className="w-full px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 text-left bg-[#f8f9fc] dark:bg-[#1e202b] hover:bg-[#edeef3] dark:hover:bg-[#252837] transition-colors cursor-pointer select-none"
                >
                  {/* Left: Calendar Icon + Month Title + Badge */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? 'bg-[#7132f5]/15 text-[#7132f5] dark:text-[#a78bfa]'
                          : 'bg-[#edeef3] dark:bg-[#282937] text-[#686b82] dark:text-[#9ca0ba]'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                          {monthGroup.label}
                        </h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7132f5]/15 text-[#7132f5] dark:text-[#a78bfa] tracking-wide">
                            Bulan Ini
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] mt-0.5">
                        {monthGroup.totalCount} transaksi
                      </p>
                    </div>
                  </div>

                  {/* Right: Net / Expense Summary + Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-2 justify-end text-xs font-bold">
                        {monthGroup.totalExpense > 0 && (
                          <span className="text-[#e53e3e] tabular-nums">
                            -{formatCurrency(monthGroup.totalExpense)}
                          </span>
                        )}
                        {monthGroup.totalIncome > 0 && (
                          <span className="text-[#026b3f] tabular-nums">
                            +{formatCurrency(monthGroup.totalIncome)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#9497a9] block mt-0.5">
                        {monthGroup.netTotal !== 0 ? (
                          <>
                            Net:{' '}
                            <span className={monthGroup.netTotal < 0 ? 'text-[#e53e3e]' : 'text-[#026b3f]'}>
                              {monthGroup.netTotal < 0 ? '-' : '+'}
                              {formatCurrency(Math.abs(monthGroup.netTotal))}
                            </span>
                          </>
                        ) : (
                          'Seimbang'
                        )}
                      </span>
                    </div>

                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] flex items-center justify-center text-[#686b82] dark:text-[#9ca0ba] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-[#7132f5] dark:text-[#a78bfa]' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Collapsible Month Body with Days */}
                {isOpen && (
                  <div className="p-3 sm:p-4 space-y-3 bg-[#fafbfe]/40 dark:bg-[#121316]/40 border-t border-[#dedee5] dark:border-[#282937]">
                    {monthGroup.days.map((dayGroup) => (
                      <div
                        key={dayGroup.date}
                        className="bg-white dark:bg-[#16171f] rounded-[12px] sm:rounded-[14px] border border-[#dedee5] dark:border-[#282937] shadow-micro overflow-hidden"
                      >
                        {/* Day Header */}
                        <div className="flex items-center justify-between px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#f8f9fc] dark:bg-[#1e202b] border-b border-[#dedee5] dark:border-[#282937]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                              {formatIndonesianDate(dayGroup.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[#686b82] dark:text-[#9ca0ba]">
                              {dayGroup.items.length} transaksi
                            </span>
                            {dayGroup.dayTotal !== 0 && (
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-[6px] ${
                                  dayGroup.dayTotal < 0
                                    ? 'bg-[#fee2e2] dark:bg-[#e53e3e]/20 text-[#b91c1c] dark:text-[#fca5a5]'
                                    : 'bg-[#d1fae5] dark:bg-[#149e61]/20 text-[#026b3f] dark:text-[#34d399]'
                                }`}
                              >
                                {dayGroup.dayTotal < 0 ? '-' : '+'}
                                {formatCurrency(Math.abs(dayGroup.dayTotal))}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Transactions List within this Date */}
                        <div className="divide-y divide-[#dedee5] dark:divide-[#282937]/60">
                          {dayGroup.items.map((t) => {
                            const isExpense = t.type === 'pengeluaran';
                            const isIncome = t.type === 'pemasukan';
                            const isTransfer = t.type === 'transfer';

                            const sourceName = getAccountName(t.sourceAccountId);
                            const destName = t.destinationAccountId ? getAccountName(t.destinationAccountId) : '';
                            const categoryName = getCategoryName(t.categoryId);
                            const catObj = t.categoryId ? getCategory(t.categoryId) : undefined;

                            return (
                              <div
                                key={t.id}
                                className="group px-3.5 py-3 sm:px-4 sm:py-3 flex items-start sm:items-center justify-between gap-3 hover:bg-[#fafbfe] dark:hover:bg-[#1e202b] dark:bg-[#13141c] transition-colors"
                              >
                                {/* Left: Category Icon */}
                                <div className="pt-0.5 sm:pt-0 shrink-0">
                                  <CategoryIcon
                                    name={isTransfer ? 'Pindah Akun' : categoryName}
                                    type={t.type}
                                    icon={isTransfer ? undefined : catObj?.icon}
                                    emoji={isTransfer ? undefined : catObj?.emoji}
                                    size="md"
                                  />
                                </div>

                                {/* Middle: Kategori, Akun, and Catatan */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8] tracking-tight group-hover:text-[#7132f5] transition-colors">
                                      {isTransfer ? 'Pindah Akun' : categoryName}
                                    </span>

                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#f0f1f5] border border-[#dedee5] dark:border-[#282937]/80 text-[11px] font-semibold text-[#484b5e]">
                                      {isTransfer ? (
                                        <>
                                          <span className="text-[#101114] dark:text-[#f3f4f8] font-bold">{sourceName}</span>
                                          <ArrowRight className="w-2.5 h-2.5 text-[#7132f5] shrink-0" />
                                          <span className="text-[#101114] dark:text-[#f3f4f8] font-bold">{destName}</span>
                                        </>
                                      ) : (
                                        <span>{sourceName}</span>
                                      )}
                                    </div>
                                  </div>

                                  {t.notes ? (
                                    <p className="text-xs text-[#686b82] dark:text-[#9ca0ba] leading-snug line-clamp-2">
                                      {t.notes}
                                    </p>
                                  ) : (
                                    <p className="text-[11px] text-[#9497a9] italic">
                                      Tanpa catatan
                                    </p>
                                  )}
                                </div>

                                {/* Right: Nominal & Edit Action */}
                                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-center">
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

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditTransaction(t);
                                    }}
                                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#9497a9] hover:text-[#7132f5] dark:hover:text-[#a78bfa] hover:bg-[#855bfb]/15 transition-all cursor-pointer active:scale-95 border border-transparent hover:border-[#855bfb]/30"
                                    title="Ubah Transaksi"
                                    aria-label="Ubah Transaksi"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
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
          })}
        </div>
      )}
    </div>
  );
};
