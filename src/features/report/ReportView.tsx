import React, { useState, useMemo } from 'react';
import type { Transaction, Account, Category } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { AccountAvatar } from '../accounts/AccountsView';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  CreditCard,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface ReportViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

type PeriodType = 'this_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'all';

// Curated harmonious color palette for charts
const CATEGORY_COLORS = [
  '#7132f5', // Kraken purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#6366f1', // Indigo
];

export const ReportView: React.FC<ReportViewProps> = ({
  transactions,
  accounts,
  categories,
}) => {
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<PeriodType>('this_month');
  const [activeChartTab, setActiveChartTab] = useState<'flow' | 'category' | 'source' | 'account'>('category');

  // Helper map for accounts and categories
  const accountMap = useMemo(() => {
    const map = new Map<string, Account>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Check if a transaction is an internal transfer / "Pindah Akun"
  const isTransferTx = (t: Transaction): boolean => {
    const cat = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
    return (
      t.type === 'transfer' ||
      Boolean(t.destinationAccountId) ||
      Boolean(cat?.name && cat.name.toLowerCase().includes('pindah akun'))
    );
  };

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    return transactions.filter((t) => {
      // Must not be a transfer (exclude "Pindah Akun")
      if (isTransferTx(t)) return false;

      const txDate = new Date(t.date);
      if (isNaN(txDate.getTime())) return false;

      if (period === 'this_month') {
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      }
      if (period === 'last_3_months') {
        const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
        return txDate >= threeMonthsAgo && txDate <= now;
      }
      if (period === 'last_6_months') {
        const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
        return txDate >= sixMonthsAgo && txDate <= now;
      }
      if (period === 'this_year') {
        return txDate.getFullYear() === currentYear;
      }
      return true; // 'all'
    });
  }, [transactions, period, categoryMap]);

  // Aggregate Executive KPIs
  const { totalIncome, totalExpense, netCashflow, savingsRate } = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredTransactions.forEach((t) => {
      if (t.type === 'pemasukan') {
        income += t.amount;
      } else if (t.type === 'pengeluaran') {
        expense += t.amount;
      }
    });

    const net = income - expense;
    const rate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return {
      totalIncome: income,
      totalExpense: expense,
      netCashflow: net,
      savingsRate: Math.max(Math.min(rate, 100), -100),
    };
  }, [filteredTransactions]);

  // 1. Monthly or Daily Timeline Data for Cashflow Trend
  const timelineData = useMemo(() => {
    if (filteredTransactions.length === 0) return [];

    if (period === 'this_month') {
      // Group by Day
      const dayMap: { [day: string]: { date: string; pemasukan: number; pengeluaran: number; net: number } } = {};
      
      filteredTransactions.forEach((t) => {
        const dayStr = t.date.slice(8, 10); // DD
        if (!dayMap[dayStr]) {
          dayMap[dayStr] = { date: `Tgl ${parseInt(dayStr, 10)}`, pemasukan: 0, pengeluaran: 0, net: 0 };
        }
        if (t.type === 'pemasukan') dayMap[dayStr].pemasukan += t.amount;
        if (t.type === 'pengeluaran') dayMap[dayStr].pengeluaran += t.amount;
        dayMap[dayStr].net = dayMap[dayStr].pemasukan - dayMap[dayStr].pengeluaran;
      });

      return Object.keys(dayMap)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .map((k) => dayMap[k]);
    } else {
      // Group by Month (YYYY-MM)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const monthMap: { [key: string]: { date: string; sortKey: string; pemasukan: number; pengeluaran: number; net: number } } = {};

      filteredTransactions.forEach((t) => {
        const key = t.date.slice(0, 7); // YYYY-MM
        const [year, month] = key.split('-');
        const monthLabel = `${monthNames[parseInt(month, 10) - 1]} ${year.slice(2)}`;

        if (!monthMap[key]) {
          monthMap[key] = { date: monthLabel, sortKey: key, pemasukan: 0, pengeluaran: 0, net: 0 };
        }
        if (t.type === 'pemasukan') monthMap[key].pemasukan += t.amount;
        if (t.type === 'pengeluaran') monthMap[key].pengeluaran += t.amount;
        monthMap[key].net = monthMap[key].pemasukan - monthMap[key].pengeluaran;
      });

      return Object.values(monthMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }
  }, [filteredTransactions, period]);

  // 2. Category Expense Breakdown (Donut Chart & List)
  const expenseByCategory = useMemo(() => {
    const catMap: { [catId: string]: { name: string; emoji: string; amount: number } } = {};
    let total = 0;

    filteredTransactions
      .filter((t) => t.type === 'pengeluaran')
      .forEach((t) => {
        const cat = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
        const catName = cat?.name || 'Lain-lain';
        const emoji = cat?.emoji || '🏷️';
        const id = t.categoryId || 'unknown';

        if (!catMap[id]) {
          catMap[id] = { name: catName, emoji, amount: 0 };
        }
        catMap[id].amount += t.amount;
        total += t.amount;
      });

    return Object.values(catMap)
      .map((item, idx) => ({
        ...item,
        percentage: total > 0 ? (item.amount / total) * 100 : 0,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categoryMap]);

  // 3. Category Income Breakdown (Donut Chart & List)
  const incomeByCategory = useMemo(() => {
    const catMap: { [catId: string]: { name: string; emoji: string; amount: number } } = {};
    let total = 0;

    filteredTransactions
      .filter((t) => t.type === 'pemasukan')
      .forEach((t) => {
        const cat = t.categoryId ? categoryMap.get(t.categoryId) : undefined;
        const catName = cat?.name || 'Pemasukan Lainnya';
        const emoji = cat?.emoji || '💰';
        const id = t.categoryId || 'unknown';

        if (!catMap[id]) {
          catMap[id] = { name: catName, emoji, amount: 0 };
        }
        catMap[id].amount += t.amount;
        total += t.amount;
      });

    return Object.values(catMap)
      .map((item, idx) => ({
        ...item,
        percentage: total > 0 ? (item.amount / total) * 100 : 0,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, categoryMap]);

  // 4. Expense by Source Account
  const expenseByAccount = useMemo(() => {
    const accExpMap: { [accId: string]: { account?: Account; name: string; type: string; amount: number } } = {};

    filteredTransactions
      .filter((t) => t.type === 'pengeluaran')
      .forEach((t) => {
        const acc = accountMap.get(t.sourceAccountId);
        const name = acc?.name || 'Akun Tidak Dikenal';
        const type = acc?.type || 'bank';

        if (!accExpMap[t.sourceAccountId]) {
          accExpMap[t.sourceAccountId] = { account: acc, name, type, amount: 0 };
        }
        accExpMap[t.sourceAccountId].amount += t.amount;
      });

    return Object.values(accExpMap).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, accountMap]);

  // 5. Daily Average and Top Single Expense
  const insights = useMemo(() => {
    const expenseTxs = filteredTransactions.filter((t) => t.type === 'pengeluaran');
    const topExpense = expenseTxs.reduce<Transaction | null>((max, t) => {
      if (!max || t.amount > max.amount) return t;
      return max;
    }, null);

    const uniqueDates = new Set(expenseTxs.map((t) => t.date));
    const activeDays = Math.max(uniqueDates.size, 1);
    const avgDailyExpense = totalExpense / activeDays;

    return {
      topExpense,
      avgDailyExpense,
      activeDays,
    };
  }, [filteredTransactions, totalExpense]);

  // Tooltip styles based on theme
  const tooltipStyle = {
    backgroundColor: isDark ? '#16171f' : '#ffffff',
    borderColor: isDark ? '#282937' : '#dedee5',
    color: isDark ? '#f3f4f8' : '#101114',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    padding: '10px 14px',
    fontSize: '12px',
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Period Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#16171f] p-3 sm:p-5 rounded-[14px] sm:rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[8px] bg-[#855bfb]/15 text-[#7132f5] dark:text-[#a78bfa] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                Laporan & Analisis Keuangan
              </h1>
              <p className="text-xs text-[#686b82] dark:text-[#9ca0ba] hidden sm:block">
                Visualisasi tren pemasukan, pengeluaran, dan alokasi kategori
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 bg-[#edeef3] dark:bg-[#1e202b] p-1 rounded-[12px] border border-[#dedee5] dark:border-[#282937] shrink-0">
          <button
            onClick={() => setPeriod('this_month')}
            className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all whitespace-nowrap ${
              period === 'this_month'
                ? 'bg-white dark:bg-[#282937] text-[#7132f5] dark:text-[#a78bfa] shadow-micro'
                : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriod('last_3_months')}
            className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all whitespace-nowrap ${
              period === 'last_3_months'
                ? 'bg-white dark:bg-[#282937] text-[#7132f5] dark:text-[#a78bfa] shadow-micro'
                : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
            }`}
          >
            3 Bulan
          </button>
          <button
            onClick={() => setPeriod('last_6_months')}
            className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all whitespace-nowrap ${
              period === 'last_6_months'
                ? 'bg-white dark:bg-[#282937] text-[#7132f5] dark:text-[#a78bfa] shadow-micro'
                : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
            }`}
          >
            6 Bulan
          </button>
          <button
            onClick={() => setPeriod('this_year')}
            className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all whitespace-nowrap ${
              period === 'this_year'
                ? 'bg-white dark:bg-[#282937] text-[#7132f5] dark:text-[#a78bfa] shadow-micro'
                : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
            }`}
          >
            Tahun Ini
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-all whitespace-nowrap ${
              period === 'all'
                ? 'bg-white dark:bg-[#282937] text-[#7132f5] dark:text-[#a78bfa] shadow-micro'
                : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards - Compact 2x2 grid on mobile so charts fit without scrolling */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Total Pemasukan */}
        <div className="bg-white dark:bg-[#16171f] rounded-[12px] sm:rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-2.5 sm:p-5 relative overflow-hidden group flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] truncate">
              Pemasukan
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-[6px] sm:rounded-[8px] bg-[#149e61]/12 text-[#149e61] dark:text-[#34d399] flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-sm sm:text-2xl font-bold tracking-tight text-[#026b3f] dark:text-[#34d399] mt-1 sm:mt-2 tabular-nums truncate">
            +{formatCurrency(totalIncome)}
          </div>
          <div className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] mt-1 hidden sm:flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#149e61] dark:text-[#34d399]" />
            <span>Arus masuk tanpa transfer</span>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white dark:bg-[#16171f] rounded-[12px] sm:rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-2.5 sm:p-5 relative overflow-hidden group flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] truncate">
              Pengeluaran
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-[6px] sm:rounded-[8px] bg-[#e53e3e]/12 text-[#e53e3e] dark:text-[#f87171] flex items-center justify-center shrink-0">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-sm sm:text-2xl font-bold tracking-tight text-[#e53e3e] dark:text-[#f87171] mt-1 sm:mt-2 tabular-nums truncate">
            -{formatCurrency(totalExpense)}
          </div>
          <div className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] mt-1 hidden sm:flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-[#e53e3e] dark:text-[#f87171]" />
            <span>Beban belanja & operasional</span>
          </div>
        </div>

        {/* Cashflow Bersih */}
        <div className="bg-white dark:bg-[#16171f] rounded-[12px] sm:rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-2.5 sm:p-5 relative overflow-hidden group flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] truncate">
              Cashflow
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-[6px] sm:rounded-[8px] bg-[#855bfb]/12 text-[#7132f5] dark:text-[#a78bfa] flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>
          <div
            className={`text-sm sm:text-2xl font-bold tracking-tight mt-1 sm:mt-2 tabular-nums truncate ${
              netCashflow >= 0
                ? 'text-[#026b3f] dark:text-[#34d399]'
                : 'text-[#e53e3e] dark:text-[#f87171]'
            }`}
          >
            {netCashflow >= 0 ? '+' : ''}
            {formatCurrency(netCashflow)}
          </div>
          <div className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] mt-1 hidden sm:block">
            {netCashflow >= 0 ? (
              <span className="text-[#026b3f] dark:text-[#34d399] font-medium">Surplus keuangan</span>
            ) : (
              <span className="text-[#e53e3e] dark:text-[#f87171] font-medium">Defisit periode ini</span>
            )}
          </div>
        </div>

        {/* Rasio Tabungan */}
        <div className="bg-white dark:bg-[#16171f] rounded-[12px] sm:rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-2.5 sm:p-5 relative overflow-hidden group flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] truncate">
              Tabungan
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-[6px] sm:rounded-[8px] bg-[#3b82f6]/12 text-[#3b82f6] flex items-center justify-center shrink-0">
              <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="text-sm sm:text-2xl font-bold tracking-tight text-[#101114] dark:text-[#f3f4f8] mt-1 sm:mt-2 tabular-nums truncate">
            {savingsRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] mt-1 hidden sm:block">
            {savingsRate >= 20 ? (
              <span className="text-[#026b3f] dark:text-[#34d399] font-medium">Kondisi Sangat Sehat (&ge;20%)</span>
            ) : savingsRate > 0 ? (
              <span className="text-[#f59e0b] font-medium">Cukup Sehat (&gt;0%)</span>
            ) : (
              <span className="text-[#e53e3e] dark:text-[#f87171] font-medium">Pengeluaran &gt; Pemasukan</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Analysis Tabs */}
      <div className="flex items-center gap-2 border-b border-[#dedee5] dark:border-[#282937] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveChartTab('category')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-xs font-bold transition-all whitespace-nowrap ${
            activeChartTab === 'category'
              ? 'bg-[#7132f5] text-white shadow-micro'
              : 'text-[#686b82] dark:text-[#9ca0ba] hover:bg-[#edeef3] dark:hover:bg-[#1e202b]'
          }`}
        >
          <PieChartIcon className="w-4 h-4" />
          <span>Kategori Pengeluaran</span>
        </button>

        <button
          onClick={() => setActiveChartTab('flow')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-xs font-bold transition-all whitespace-nowrap ${
            activeChartTab === 'flow'
              ? 'bg-[#7132f5] text-white shadow-micro'
              : 'text-[#686b82] dark:text-[#9ca0ba] hover:bg-[#edeef3] dark:hover:bg-[#1e202b]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tren Arus Kas (Masuk vs Keluar)</span>
        </button>

        <button
          onClick={() => setActiveChartTab('source')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-xs font-bold transition-all whitespace-nowrap ${
            activeChartTab === 'source'
              ? 'bg-[#7132f5] text-white shadow-micro'
              : 'text-[#686b82] dark:text-[#9ca0ba] hover:bg-[#edeef3] dark:hover:bg-[#1e202b]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sumber Pemasukan</span>
        </button>

        <button
          onClick={() => setActiveChartTab('account')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-xs font-bold transition-all whitespace-nowrap ${
            activeChartTab === 'account'
              ? 'bg-[#7132f5] text-white shadow-micro'
              : 'text-[#686b82] dark:text-[#9ca0ba] hover:bg-[#edeef3] dark:hover:bg-[#1e202b]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pengeluaran per Akun</span>
        </button>
      </div>

      {/* ===================== TAB 1: KATEGORI PENGELUARAN ===================== */}
      {activeChartTab === 'category' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Chart (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                Alokasi Pengeluaran
              </h3>
              <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                Proporsi pengeluaran berdasarkan kategori
              </p>
            </div>

            {expenseByCategory.length === 0 ? (
              <div className="py-20 text-center text-xs text-[#9497a9]">
                Belum ada pengeluaran pada periode ini
              </div>
            ) : (
              <div className="h-64 sm:h-72 w-full relative flex items-center justify-center my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Pengeluaran']}
                    />
                    <Pie
                      data={expenseByCategory}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-[#9497a9]">Total</span>
                  <span className="text-sm font-bold text-[#101114] dark:text-[#f3f4f8] tabular-nums">
                    {formatCurrency(totalExpense)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2 text-center text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
              {expenseByCategory.length} Kategori pengeluaran aktif
            </div>
          </div>

          {/* Ranked Category List using standard CategoryIcon (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-5 space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                Peringkat Kategori Terbesar
              </h3>
              <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                Urutan pos belanja dari nilai tertinggi ke terendah
              </p>
            </div>

            {expenseByCategory.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#9497a9]">
                Tidak ada data pengeluaran
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {expenseByCategory.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937]/80 hover:border-[#7132f5]/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Standard CategoryIcon + Name + Percentage subtitle */}
                      <div className="flex items-center gap-3 min-w-0">
                        <CategoryIcon name={cat.name} type="pengeluaran" size="md" />
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8] block tracking-tight truncate">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] block">
                            {cat.percentage.toFixed(1)}% dari total pengeluaran
                          </span>
                        </div>
                      </div>

                      {/* Right: Nominal & Percentage Badge */}
                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm sm:text-base text-[#e53e3e] dark:text-[#f87171] tabular-nums block">
                          -{formatCurrency(cat.amount)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-[6px] bg-[#edeef3] dark:bg-[#282937] font-bold text-[#7132f5] dark:text-[#a78bfa] inline-block mt-0.5">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Share */}
                    <div className="w-full bg-[#edeef3] dark:bg-[#282937] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: TREN ARUS KAS ===================== */}
      {activeChartTab === 'flow' && (
        <div className="space-y-6">
          {/* Cashflow Trend Bar Chart */}
          <div className="bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                  Perbandingan Pemasukan vs Pengeluaran
                </h3>
                <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                  {period === 'this_month' ? 'Rincian transaksi harian bulan ini' : 'Tren perbandingan dari waktu ke waktu'}
                </p>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-3 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="text-[#686b82] dark:text-[#9ca0ba]">Pemasukan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#f43f5e]" />
                  <span className="text-[#686b82] dark:text-[#9ca0ba]">Pengeluaran</span>
                </div>
              </div>
            </div>

            {timelineData.length === 0 ? (
              <div className="text-center py-16 text-[#9497a9] text-xs">
                Tidak ada data transaksi pada periode yang dipilih.
              </div>
            ) : (
              <div className="h-72 sm:h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#282937' : '#edeef3'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={isDark ? '#7d8299' : '#9497a9'}
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={isDark ? '#7d8299' : '#9497a9'}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => {
                        if (val >= 1000000) return `${(val / 1000000).toFixed(0)}Jt`;
                        if (val >= 1000) return `${(val / 1000).toFixed(0)}Rb`;
                        return `${val}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: any) => [formatCurrency(Number(val) || 0), '']}
                    />
                    <Bar
                      dataKey="pemasukan"
                      name="Pemasukan"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="pengeluaran"
                      name="Pengeluaran"
                      fill="#f43f5e"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Net Cashflow Curve Area */}
          <div className="bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-5 space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                Tren Selisih Bersih (Net Cashflow)
              </h3>
              <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                Grafik surplus atau defisit bersih per titik waktu
              </p>
            </div>

            {timelineData.length === 0 ? (
              <div className="text-center py-12 text-[#9497a9] text-xs">
                Tidak ada data pada periode ini
              </div>
            ) : (
              <div className="h-56 sm:h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7132f5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7132f5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? '#282937' : '#edeef3'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={isDark ? '#7d8299' : '#9497a9'}
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={isDark ? '#7d8299' : '#9497a9'}
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => {
                        if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(0)}Jt`;
                        return `${val}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Net Surplus']}
                    />
                    <Area
                      type="monotone"
                      dataKey="net"
                      name="Selisih Bersih"
                      stroke="#7132f5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorNet)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 3: SUMBER PEMASUKAN ===================== */}
      {activeChartTab === 'source' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Chart (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                Distribusi Pemasukan
              </h3>
              <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                Proporsi sumber pendapatan
              </p>
            </div>

            {incomeByCategory.length === 0 ? (
              <div className="py-20 text-center text-xs text-[#9497a9]">
                Belum ada transaksi pemasukan pada periode ini
              </div>
            ) : (
              <div className="h-64 sm:h-72 w-full relative flex items-center justify-center my-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Pemasukan']}
                    />
                    <Pie
                      data={incomeByCategory}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {incomeByCategory.map((entry, index) => (
                        <Cell key={`cell-income-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-[#9497a9]">Total</span>
                  <span className="text-sm font-bold text-[#026b3f] dark:text-[#34d399] tabular-nums">
                    +{formatCurrency(totalIncome)}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-2 text-center text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
              {incomeByCategory.length} Kategori pemasukan tercatat
            </div>
          </div>

          {/* Ranked Income List using standard CategoryIcon (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-5 space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                Rincian Sumber Pendapatan
              </h3>
              <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                Aliran dana masuk ke rekening Anda
              </p>
            </div>

            {incomeByCategory.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#9497a9]">
                Tidak ada data pemasukan
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {incomeByCategory.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937]/80 hover:border-[#10b981]/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Standard CategoryIcon + Name + Subtitle */}
                      <div className="flex items-center gap-3 min-w-0">
                        <CategoryIcon name={cat.name} type="pemasukan" size="md" />
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8] block tracking-tight truncate">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] block">
                            {cat.percentage.toFixed(1)}% dari total pendapatan
                          </span>
                        </div>
                      </div>

                      {/* Right: Nominal & Percentage Badge */}
                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm sm:text-base text-[#026b3f] dark:text-[#34d399] tabular-nums block">
                          +{formatCurrency(cat.amount)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-[6px] bg-[#edeef3] dark:bg-[#282937] font-bold text-[#10b981] dark:text-[#34d399] inline-block mt-0.5">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-[#edeef3] dark:bg-[#282937] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 4: PENGELUARAN PER AKUN ===================== */}
      {activeChartTab === 'account' && (
        <div className="bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-5 space-y-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
              Pengeluaran Berdasarkan Rekening & Sumber Pembayaran
            </h3>
            <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
              Mengetahui dari rekening atau dompet mana pengeluaran paling sering terjadi
            </p>
          </div>

          {expenseByAccount.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#9497a9]">
              Tidak ada data pengeluaran pada akun mana pun
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {expenseByAccount.map((acc, idx) => {
                const percentage = totalExpense > 0 ? (acc.amount / totalExpense) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937]/80 hover:border-[#7132f5]/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {acc.account ? (
                          <AccountAvatar acc={acc.account} />
                        ) : (
                          <div className="w-10 h-10 rounded-[8px] bg-[#edeef3] dark:bg-[#282937] flex items-center justify-center text-[#7132f5] dark:text-[#a78bfa] font-bold text-xs uppercase shrink-0">
                            {acc.name.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8] block truncate">
                            {acc.name}
                          </span>
                          <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba] uppercase font-semibold">
                            {acc.type}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-sm sm:text-base text-[#e53e3e] dark:text-[#f87171] tabular-nums block">
                          -{formatCurrency(acc.amount)}
                        </span>
                        <span className="text-[10px] text-[#9497a9] font-semibold">
                          {percentage.toFixed(1)}% dari total belanja
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-[#edeef3] dark:bg-[#282937] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-[#7132f5] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Financial Insights Footer Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rata-rata Harian */}
        <div className="p-4 rounded-[14px] bg-[#fafbfe] dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#686b82] dark:text-[#9ca0ba] tracking-wider block">
              Rata-rata Pengeluaran Harian
            </span>
            <span className="text-base font-bold text-[#101114] dark:text-[#f3f4f8] mt-0.5 block tabular-nums">
              {formatCurrency(insights.avgDailyExpense)} / hari
            </span>
            <span className="text-[10px] text-[#9497a9]">
              Dihitung dari {insights.activeDays} hari transaksi aktif
            </span>
          </div>
          <div className="w-9 h-9 rounded-[10px] bg-[#edeef3] dark:bg-[#282937] flex items-center justify-center text-[#686b82] dark:text-[#9ca0ba]">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Pengeluaran Terbesar */}
        <div className="p-4 rounded-[14px] bg-[#fafbfe] dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#686b82] dark:text-[#9ca0ba] tracking-wider block">
              Pengeluaran Terbesar Periode Ini
            </span>
            <span className="text-base font-bold text-[#e53e3e] dark:text-[#f87171] mt-0.5 block tabular-nums">
              {insights.topExpense ? formatCurrency(insights.topExpense.amount) : 'Rp 0'}
            </span>
            <span className="text-[10px] text-[#9497a9] truncate max-w-[200px] block">
              {insights.topExpense?.notes || insights.topExpense?.date || 'Belum ada transaksi'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-[10px] bg-[#e53e3e]/10 text-[#e53e3e] dark:text-[#f87171] flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
