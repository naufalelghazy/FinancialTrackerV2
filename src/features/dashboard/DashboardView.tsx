import React, { useMemo } from 'react';
import type { Account, Category, Transaction } from '../../types';
import type { NavTab } from '../../components/layout/BottomNav';
import { formatCurrency } from '../../lib/formatters';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { AccountAvatar } from '../accounts/AccountsView';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  History,
  Calendar,
  PieChart,
  Edit2,
} from 'lucide-react';

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  onNavigateTab: (tab: NavTab) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onAddTransaction?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  transactions,
  categories,
  onNavigateTab,
  onEditTransaction,
}) => {
  const getAccountName = (id?: string) => accounts.find((a) => a.id === id)?.name || id || '-';
  const getCategoryName = (id?: string) => categories.find((c) => c.id === id)?.name || id || '-';

  // 1. Account Balances Overview
  const { totalAvailable, totalDebt, netWorth, liquidAccounts, creditAccounts } = useMemo(() => {
    const liquid = accounts.filter((a) => a.type !== 'credit');
    const credit = accounts.filter((a) => a.type === 'credit');

    const available = liquid.reduce((sum, a) => sum + a.balance, 0);
    const debt = credit.reduce((sum, a) => sum + (a.balance < 0 ? Math.abs(a.balance) : 0), 0);
    const net = available - debt;

    return {
      totalAvailable: available,
      totalDebt: debt,
      netWorth: net,
      liquidAccounts: liquid,
      creditAccounts: credit,
    };
  }, [accounts]);

  // Helper to detect Pindah Akun / Transfer
  const isPindahAkunOrTransfer = (t: Transaction) => {
    if (t.type === 'transfer') return true;
    const catName = getCategoryName(t.categoryId).toLowerCase().trim();
    if (catName.includes('pindah akun') || catName.includes('transfer')) return true;
    const catId = (t.categoryId || '').toLowerCase().trim();
    if (catId.includes('pindah_akun') || catId.includes('transfer')) return true;
    return false;
  };

  // 2. Active Month Cash Flow (Excluding Pindah Akun / Transfer)
  const { currentMonthLabel, monthExpense, monthIncome, netCashflow, topCategories } =
    useMemo(() => {
      // Find latest date in transactions to dynamically detect active month
      const latestDate = transactions[0]?.date || new Date().toISOString().slice(0, 10);
      const activeMonthKey = latestDate.slice(0, 7); // e.g. "2026-10"

      const [year, month] = activeMonthKey.split('-');
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];
      const monthLabel = `${monthNames[parseInt(month, 10) - 1]} ${year}`;

      const monthlyTx = transactions.filter((t) => t.date.startsWith(activeMonthKey));
      let expense = 0;
      let income = 0;
      const catExpenseMap: Record<string, number> = {};

      for (const t of monthlyTx) {
        // Abaikan kategori pindah akun dan transaksi transfer dari arus kas
        if (isPindahAkunOrTransfer(t)) {
          continue;
        }

        if (t.type === 'pengeluaran') {
          expense += t.amount;
          if (t.categoryId) {
            catExpenseMap[t.categoryId] = (catExpenseMap[t.categoryId] || 0) + t.amount;
          }
        } else if (t.type === 'pemasukan') {
          income += t.amount;
        }
      }

      // Top categories calculation (exclude pindah akun)
      const sortedCats = Object.entries(catExpenseMap)
        .filter(([catId]) => {
          const name = getCategoryName(catId).toLowerCase().trim();
          return !name.includes('pindah akun') && !name.includes('transfer') && !catId.includes('pindah');
        })
        .map(([catId, amount]) => ({
          catId,
          name: getCategoryName(catId),
          amount,
          percentage: expense > 0 ? Math.round((amount / expense) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      return {
        currentMonthLabel: monthLabel,
        monthExpense: expense,
        monthIncome: income,
        netCashflow: income - expense,
        topCategories: sortedCats,
      };
    }, [transactions, categories]);

  // 3. Recent 5 Transactions (Excluding Pindah Akun / Transfer)
  const recentTransactions = useMemo(() => {
    return transactions
      .filter((t) => !isPindahAkunOrTransfer(t))
      .slice(0, 5);
  }, [transactions, categories]);

  return (
    <div className="space-y-6 pb-24">
      {/* ===================== HERO CARDS GRID ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Saldo Tersedia (Kraken Purple Hero) */}
        <div className="hero-balance-card bg-[#7132f5] text-white rounded-[16px] p-5 sm:p-6 shadow-whisper relative overflow-hidden border border-[#5741d8] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              Total Saldo Tersedia
            </span>
            <span className="px-2 py-0.5 rounded-[6px] bg-white/15 text-[11px] font-medium text-white/90">
              {liquidAccounts.length} Rekening & Dompet
            </span>
          </div>

          <div className="my-3">
            <div className="balance-card-amount text-3xl sm:text-4xl font-bold tracking-tight">
              {formatCurrency(totalAvailable)}
            </div>
            <p className="text-xs text-white/80 mt-1">
              Bank, E-Wallet, dan Kas Tunai
            </p>
          </div>

          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-white/70">Kekayaan Bersih (Net Worth)</span>
            <span className="net-worth-amount font-bold text-white tracking-tight">
              {formatCurrency(netWorth)}
            </span>
          </div>
        </div>

        {/* Arus Kas Bulan Ini (White Card with Cashflow metrics) */}
        <div className="bg-white dark:bg-[#16171f] rounded-[16px] p-5 sm:p-6 shadow-whisper border border-[#dedee5] dark:border-[#282937] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[#686b82] dark:text-[#9ca0ba] text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#7132f5]" />
              Arus Kas ({currentMonthLabel})
            </span>
            <span
              className={`px-2 py-0.5 rounded-[6px] text-[11px] font-bold ${
                netCashflow >= 0
                  ? 'bg-[#d1fae5] text-[#026b3f]'
                  : 'bg-[#fee2e2] text-[#b91c1c]'
              }`}
            >
              {netCashflow >= 0 ? '+Surplus' : '-Defisit'}
            </span>
          </div>

          <div className="my-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[6px] bg-[#149e61]/15 text-[#026b3f] flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-[#686b82] dark:text-[#9ca0ba]">Pemasukan</span>
              </div>
              <span className="cashflow-amount text-sm font-bold text-[#026b3f]">
                +{formatCurrency(monthIncome)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[6px] bg-[#e53e3e]/12 text-[#b91c1c] flex items-center justify-center">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs text-[#686b82] dark:text-[#9ca0ba]">Pengeluaran</span>
              </div>
              <span className="cashflow-amount text-sm font-bold text-[#e53e3e]">
                -{formatCurrency(monthExpense)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#dedee5] dark:border-[#282937] flex items-center justify-between text-xs">
            <span className="text-[#686b82] dark:text-[#9ca0ba]">Selisih Bersih</span>
            <span
              className={`cashflow-amount font-bold tracking-tight ${
                netCashflow >= 0 ? 'text-[#026b3f]' : 'text-[#b91c1c]'
              }`}
            >
              {netCashflow >= 0 ? '+' : ''}
              {formatCurrency(netCashflow)}
            </span>
          </div>
        </div>

        {/* Total Tagihan & Hutang Card (Red Hero Debt Card) */}
        <div className="hero-debt-card bg-gradient-to-br from-[#dc2626] to-[#b91c1c] text-white rounded-[16px] p-5 sm:p-6 shadow-whisper border border-[#ef4444]/40 flex flex-col justify-between sm:col-span-2 lg:col-span-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="debt-card-header text-white/90 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="debt-card-icon w-3.5 h-3.5 text-white/90" />
              Total Tagihan & Hutang
            </span>
            <span className="debt-card-badge px-2 py-0.5 rounded-[6px] bg-black/25 text-[11px] font-semibold text-white border border-white/20">
              {creditAccounts.length} Akun Kredit
            </span>
          </div>

          <div className="my-3">
            <div className="debt-card-amount text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {formatCurrency(totalDebt)}
            </div>
            <p className="debt-card-sub text-xs text-white/80 mt-1">
              Kartu Kredit, Paylater & Cicilan Pinjaman
            </p>
          </div>

          <div className="debt-card-divider pt-2 border-t border-white/20 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => onNavigateTab('tagihan')}
              className="debt-card-btn text-white hover:text-white/80 font-bold flex items-center gap-1.5 transition-all group"
            >
              <span className="underline underline-offset-2">Rincian Tagihan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <span className="debt-card-status text-[11px] text-white/90 font-medium">
              {totalDebt === 0 ? 'Semua Lunas' : 'Belum Dibayar'}
            </span>
          </div>
        </div>
      </div>

      {/* ===================== TWO-COLUMN MAIN CONTENT ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Top Categories Breakdown & Recent Transactions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Spending Categories */}
          <div className="bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#f59e0b]/15 text-[#b45309] flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                    Pengeluaran Terbesar ({currentMonthLabel})
                  </h3>
                  <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                    Kategori dengan belanja tertinggi
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#101114] dark:text-[#f3f4f8]">
                Total: {formatCurrency(monthExpense)}
              </span>
            </div>

            {topCategories.length === 0 ? (
              <p className="text-xs text-[#9497a9] py-4 text-center">
                Belum ada transaksi pengeluaran bulan ini.
              </p>
            ) : (
              <div className="space-y-3 pt-1">
                {topCategories.map((cat) => (
                  <div key={cat.catId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={cat.name} type="pengeluaran" size="sm" />
                        <span className="font-semibold text-[#101114] dark:text-[#f3f4f8]">{cat.name}</span>
                        <span className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                          ({cat.percentage}%)
                        </span>
                      </div>
                      <span className="font-bold text-[#101114] dark:text-[#f3f4f8] tabular-nums">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                    {/* Kraken Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[#edeef3] dark:bg-[#232534] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#7132f5] transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions List */}
          <div className="bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#dedee5] dark:border-[#282937] bg-[#fafbfe] dark:bg-[#1e202b]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#855bfb]/15 text-[#7132f5] flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                    Transaksi Terakhir
                  </h3>
                  <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                    5 aktivitas mutasi terbaru
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('riwayat')}
                className="text-xs font-semibold text-[#7132f5] hover:text-[#5741d8] flex items-center gap-1 transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#dedee5] dark:divide-[#282937]/70">
              {recentTransactions.map((t) => {
                const isExpense = t.type === 'pengeluaran';
                const isIncome = t.type === 'pemasukan';
                const isTransfer = t.type === 'transfer';
                const sourceName = getAccountName(t.sourceAccountId);
                const categoryName = getCategoryName(t.categoryId);

                return (
                    <div
                      key={t.id}
                      className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#fafbfe] dark:hover:bg-[#1e202b] dark:bg-[#1e202b] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                      <CategoryIcon
                        name={isTransfer ? 'Pindah Akun' : categoryName}
                        type={t.type}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-[#101114] dark:text-[#f3f4f8] truncate">
                            {isTransfer ? 'Pindah Akun' : categoryName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-[5px] bg-[#f0f1f5] border border-[#dedee5] dark:border-[#282937] text-[10px] font-semibold text-[#484b5e]">
                            {sourceName}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] truncate mt-0.5">
                          {t.date} {t.notes ? `• ${t.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span
                            className={`font-bold text-xs sm:text-sm block tabular-nums ${
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTransaction(t);
                          }}
                          className="w-7 h-7 rounded-[7px] flex items-center justify-center text-[#9497a9] hover:text-[#7132f5] dark:hover:text-[#a78bfa] hover:bg-[#855bfb]/15 transition-all cursor-pointer active:scale-95 border border-transparent hover:border-[#855bfb]/30"
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
        </div>

        {/* Right Column (5 cols): Accounts Snapshot & Tagihan Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ringkasan Rekening & Dompet Snapshot */}
          <div className="bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                  Rekening & Dompet
                </h3>
                <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                  Saldo akun aktif Anda
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('saldo')}
                className="text-xs font-semibold text-[#7132f5] hover:text-[#5741d8] flex items-center gap-1"
              >
                <span>Kelola</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {liquidAccounts.slice(0, 5).map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937]/80 hover:border-[#7132f5]/40 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <AccountAvatar acc={acc} />
                    <div>
                      <span className="font-bold text-xs text-[#101114] dark:text-[#f3f4f8] block">
                        {acc.name}
                      </span>
                      <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba] uppercase">
                        {acc.type}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-xs sm:text-sm tabular-nums ${
                      acc.balance < 0 ? 'text-[#e53e3e]' : 'text-[#101114] dark:text-[#f3f4f8]'
                    }`}
                  >
                    {formatCurrency(acc.balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tagihan & Pinjaman Alert Card */}
          <div className="bg-white dark:bg-[#16171f] rounded-[16px] border border-[#dedee5] dark:border-[#282937] shadow-whisper p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-[#e11d48]/12 text-[#be123c] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101114] dark:text-[#f3f4f8] tracking-tight">
                    Tagihan & Pinjaman
                  </h3>
                  <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                    Kewajiban berjalan
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#e11d48]">
                {formatCurrency(totalDebt)}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {creditAccounts.map((acc) => {
                const debtAmount = acc.balance < 0 ? Math.abs(acc.balance) : 0;
                return (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937]/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <AccountAvatar acc={acc} />
                      <div>
                        <span className="font-bold text-xs text-[#101114] dark:text-[#f3f4f8] block">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba]">
                          {debtAmount > 0 ? 'Ada Tagihan' : 'Lunas'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-xs sm:text-sm tabular-nums ${
                        debtAmount > 0 ? 'text-[#e53e3e]' : 'text-[#026b3f]'
                      }`}
                    >
                      {debtAmount > 0 ? `-${formatCurrency(debtAmount)}` : 'Lunas (Rp 0)'}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigateTab('tagihan')}
              className="w-full py-2.5 rounded-[12px] bg-[#edeef3] dark:bg-[#232534] hover:bg-[#dedee5] dark:hover:bg-[#2d3042] text-[#101114] dark:text-[#f3f4f8] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Bayar & Perbarui Tagihan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
