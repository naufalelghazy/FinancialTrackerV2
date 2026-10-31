import React, { useMemo, useCallback, useState } from "react";
import type {
  Account,
  Category,
  Transaction,
  QuickTemplate,
} from "../../types";
import type { NavTab } from "../../components/layout/BottomNav";
import { formatCurrency } from "../../lib/formatters";
import { ACCOUNT_TYPE_LABELS } from "../../lib/labels";
import {
  currentMonthKey,
  formatMonthLabel,
  monthRange,
  shiftMonthKey,
} from "../../lib/date";
import { isInternalTransfer } from "../../lib/transactions";
import { CategoryIcon } from "../../components/ui/CategoryIcon";
import { AccountAvatar } from "../../components/ui/AccountAvatar";
import { resolveTemplateAccount } from "../../services/templateService";
import {
  Wallet,
  CreditCard,
  ArrowRight,
  History,
  PieChart,
  Edit2,
  Zap,
  Plus,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DashboardViewProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  templates?: QuickTemplate[];
  isBalanceHidden?: boolean;
  onToggleHideBalance?: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onAddTransaction?: () => void;
  /** Opens the history tab pre-filtered to one account's movements. */
  onSelectAccountHistory?: (account: Account) => void;
  onUseTemplateDirectly?: (template: QuickTemplate) => void;
  onUseTemplateInForm?: (template: QuickTemplate) => void;
  onEditTemplate?: (template: QuickTemplate) => void;
  onAddTemplate?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  transactions,
  categories,
  templates = [],
  isBalanceHidden = false,
  onToggleHideBalance,
  onNavigateTab,
  onEditTransaction,
  onAddTransaction,
  onSelectAccountHistory,
  onUseTemplateDirectly,
  onEditTemplate,
  onAddTemplate,
}) => {
  // The dashboard opens on the CURRENT month, not on the month of the newest
  // transaction. Deriving it from `transactions[0]` meant that on 2 March, with
  // the last entry dated 28 February, the card was titled "Februari" while the
  // user was looking at a nearly empty March. The user can step through months
  // from here.
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() =>
    currentMonthKey(),
  );
  const isCurrentMonth = selectedMonthKey === currentMonthKey();

  const maskAmount = (amount: number, prefix = "") =>
    isBalanceHidden
      ? `${prefix}Rp •••••••`
      : `${prefix}${formatCurrency(amount)}`;

  const getAccountName = (id?: string) =>
    accounts.find((a) => a.id === id)?.name || id || "-";
  const getCategory = (id?: string) => categories.find((c) => c.id === id);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      map.set(c.id, c.name);
    }
    return map;
  }, [categories]);

  const getCategoryName = useCallback(
    (id?: string) => (id ? categoryNameMap.get(id) || id : "-"),
    [categoryNameMap],
  );

  // 1. Account Balances Overview
  const { totalAvailable, totalDebt, liquidAccounts, creditAccounts } =
    useMemo(() => {
      const liquid = accounts.filter((a) => a.type !== "credit");
      const credit = accounts.filter((a) => a.type === "credit");

      const available = liquid.reduce((sum, a) => sum + a.balance, 0);
      const debt = credit.reduce(
        (sum, a) => sum + (a.balance < 0 ? Math.abs(a.balance) : 0),
        0,
      );

      // Net worth is `available - debt`. It used to be rendered beside both of
      // those numbers, which only restated arithmetic the user could see; the
      // hero card now shows this month's cash flow instead.
      return {
        totalAvailable: available,
        totalDebt: debt,
        liquidAccounts: liquid,
        creditAccounts: credit,
      };
    }, [accounts]);

  /** How many liquid accounts the snapshot list is not showing. */
  const ACCOUNT_SNAPSHOT_LIMIT = 5;
  const hiddenAccountCount = Math.max(
    0,
    liquidAccounts.length - ACCOUNT_SNAPSHOT_LIMIT,
  );

  // Helper to detect Pindah Akun / Transfer.
  // Delegates to the shared rule so the dashboard and the report never disagree.
  const isPindahAkunOrTransfer = useCallback(
    (t: Transaction) => isInternalTransfer(t, { categories }),
    [categories],
  );

  // 2. Spending breakdown for the selected month (excluding Pindah Akun / Transfer)
  const { monthLabel, monthExpense, monthIncome, netCashflow, topCategories } =
    useMemo(() => {
      const range = monthRange(selectedMonthKey);
      // A malformed key would silently match nothing; fall back to the raw value
      // so the header still shows something recognisable instead of blank.
      const label = formatMonthLabel(selectedMonthKey);

      if (!range) {
        return {
          monthLabel: label,
          monthExpense: 0,
          monthIncome: 0,
          netCashflow: 0,
          topCategories: [] as Array<{
            catId: string;
            name: string;
            amount: number;
            percentage: number;
          }>,
        };
      }

      let expense = 0;
      let income = 0;
      const catExpenseMap: Record<string, number> = {};

      for (const t of transactions) {
        // String comparison works because both sides are `YYYY-MM-DD`.
        if (t.date < range.start || t.date > range.end) continue;

        // Abaikan kategori pindah akun dan transaksi transfer dari arus kas
        if (isPindahAkunOrTransfer(t)) continue;

        if (t.type === "pengeluaran") {
          expense += t.amount;
          if (t.categoryId) {
            catExpenseMap[t.categoryId] =
              (catExpenseMap[t.categoryId] || 0) + t.amount;
          }
        } else if (t.type === "pemasukan") {
          income += t.amount;
        }
      }

      const sortedCats = Object.entries(catExpenseMap)
        .filter(([catId]) => {
          const name = getCategoryName(catId).toLowerCase().trim();
          return (
            !name.includes("pindah akun") &&
            !name.includes("transfer") &&
            !catId.includes("pindah")
          );
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
        monthLabel: label,
        monthExpense: expense,
        monthIncome: income,
        netCashflow: income - expense,
        topCategories: sortedCats,
      };
    }, [
      transactions,
      selectedMonthKey,
      getCategoryName,
      isPindahAkunOrTransfer,
    ]);

  /** Previous month's expense, used as the comparison for the current one. */
  const previousMonthExpense = useMemo(() => {
    const range = monthRange(shiftMonthKey(selectedMonthKey, -1));
    if (!range) return null;

    let expense = 0;
    for (const t of transactions) {
      if (t.date < range.start || t.date > range.end) continue;
      if (isPindahAkunOrTransfer(t)) continue;
      if (t.type === "pengeluaran") expense += t.amount;
    }
    return expense;
  }, [transactions, selectedMonthKey, isPindahAkunOrTransfer]);

  /**
   * Percentage change against the previous month, or null when there is no
   * meaningful baseline. `Rp 3.200.000` alone says nothing; "12% lebih rendah
   * dari Januari" is the sentence the user actually wants.
   */
  const monthExpenseDelta = useMemo(() => {
    if (previousMonthExpense === null || previousMonthExpense === 0)
      return null;
    const change =
      ((monthExpense - previousMonthExpense) / previousMonthExpense) * 100;
    if (!Number.isFinite(change)) return null;
    return Math.round(change);
  }, [monthExpense, previousMonthExpense]);

  const canGoToNextMonth = !isCurrentMonth;

  const goToPreviousMonth = useCallback(
    () => setSelectedMonthKey((key) => shiftMonthKey(key, -1)),
    [],
  );
  const goToNextMonth = useCallback(() => {
    setSelectedMonthKey((key) => {
      // Never move past the current month: there is no future data to show, and
      // an empty "April 2026" would look like a bug.
      const next = shiftMonthKey(key, 1);
      return next > currentMonthKey() ? key : next;
    });
  }, []);
  const goToCurrentMonth = useCallback(
    () => setSelectedMonthKey(currentMonthKey()),
    [],
  );

  // 3. Recent 5 Transactions (Excluding Pindah Akun / Transfer)
  const recentTransactions = useMemo(() => {
    return transactions.filter((t) => !isPindahAkunOrTransfer(t)).slice(0, 5);
  }, [transactions, isPindahAkunOrTransfer]);

  return (
    <div className="space-y-6 2xl:space-y-8 pb-24">
      {/* ===================== HERO CARDS GRID (Compact 2-Column on Mobile & Desktop) ===================== */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 2xl:gap-6">
        {/* Total Saldo Tersedia (Kraken Purple Hero) */}
        <div className="hero-balance-card min-w-0 bg-brand text-white rounded-[14px] sm:rounded-[16px] p-3 sm:p-6 shadow-whisper relative overflow-hidden border border-brand-hover flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span className="text-white/85 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 min-w-0">
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate sm:hidden">Saldo</span>
              <span className="truncate hidden sm:inline">
                Total Saldo Tersedia
              </span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-[6px] bg-surface/15 text-[11px] font-medium text-white/90">
                {liquidAccounts.length} Rekening & Dompet
              </span>
              {onToggleHideBalance && (
                <button
                  type="button"
                  onClick={onToggleHideBalance}
                  title={
                    isBalanceHidden ? "Tampilkan saldo" : "Sembunyikan saldo"
                  }
                  aria-label={
                    isBalanceHidden ? "Tampilkan saldo" : "Sembunyikan saldo"
                  }
                  // 24px visual, but 44px of tappable area via a negative
                  // margin + padding: the icon stays compact in a dense hero card
                  // while still meeting the minimum touch target.
                  className="w-6 h-6 sm:w-7 sm:h-7 -m-2.5 p-2.5 box-content rounded-[6px] sm:rounded-[8px] bg-surface/15 hover:bg-surface/25 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                >
                  {isBalanceHidden ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="my-2 sm:my-3 min-w-0">
            <div className="balance-card-amount text-[22px] leading-tight sm:text-3xl lg:text-4xl 2xl:text-[42px] font-bold tracking-tight tabular-nums truncate">
              {maskAmount(totalAvailable)}
            </div>
            <p className="hidden sm:block text-xs text-white/80 mt-1">
              Bank, E-Wallet, dan Kas Tunai
            </p>
          </div>

          <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-1 text-[11px] sm:text-xs min-w-0">
            {/* Net Worth used to sit here, but it is `totalAvailable - totalDebt`
                -- both numbers are already on screen, so the line repeated
                arithmetic instead of adding information. This month's cash flow
                is the number that is otherwise nowhere on the dashboard. */}
            <span className="text-white/75 truncate">
              <span className="sm:hidden">Arus kas</span>
              <span className="hidden sm:inline">
                Arus Kas {monthLabel.replace(/ \d{4}$/, "")}
              </span>
            </span>
            <span
              className="net-worth-amount font-bold text-white tracking-tight tabular-nums truncate"
              title={`Masuk ${formatCurrency(monthIncome)} - Keluar ${formatCurrency(monthExpense)}`}
            >
              {isBalanceHidden
                ? "Rp •••••••"
                : `${netCashflow >= 0 ? "+" : "-"}${formatCurrency(Math.abs(netCashflow))}`}
            </span>
          </div>
        </div>

        {/* Total Tagihan & Hutang Card (Red Hero Debt Card) */}
        <div className="hero-debt-card min-w-0 text-white rounded-[14px] sm:rounded-[16px] p-3 sm:p-6 shadow-whisper border border-negative/40 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <span className="debt-card-header text-white/90 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 min-w-0">
              <CreditCard className="debt-card-icon w-3.5 h-3.5 text-white/90 shrink-0" />
              <span className="truncate sm:hidden">Tagihan</span>
              <span className="truncate hidden sm:inline">
                Total Tagihan & Hutang
              </span>
            </span>
            <span className="debt-card-badge px-1.5 sm:px-2 py-0.5 rounded-[5px] sm:rounded-[6px] bg-black/25 text-[10px] sm:text-[11px] font-semibold text-white border border-white/20 shrink-0">
              {creditAccounts.length}{" "}
              <span className="hidden sm:inline">Akun </span>Kredit
            </span>
          </div>

          <div className="my-2 sm:my-3 min-w-0">
            <div className="debt-card-amount text-[22px] leading-tight sm:text-3xl lg:text-4xl 2xl:text-[42px] font-bold tracking-tight text-white tabular-nums truncate">
              {maskAmount(totalDebt)}
            </div>
            <p className="debt-card-sub hidden sm:block text-xs text-white/80 mt-1">
              Kartu Kredit, Paylater & Cicilan Pinjaman
            </p>
          </div>

          <div className="debt-card-divider pt-2 border-t border-white/20 flex items-center justify-between gap-1 text-[11px] sm:text-xs min-w-0">
            <button
              type="button"
              onClick={() => onNavigateTab("tagihan")}
              className="debt-card-btn text-white hover:text-white/80 font-bold flex items-center gap-1 transition-all group min-w-0 cursor-pointer"
            >
              <span className="underline underline-offset-2 truncate">
                Rincian<span className="hidden sm:inline"> Tagihan</span>
              </span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
            <span className="debt-card-status text-[10px] sm:text-[11px] text-white/90 font-medium shrink-0">
              {totalDebt === 0 ? "Lunas" : "Aktif"}
            </span>
          </div>
        </div>
      </div>

      {/* ===================== QUICK TEMPLATES SECTION (Compact High-Density Grid) ===================== */}
      <div className="bg-surface rounded-[14px] sm:rounded-[16px] border border-hairline shadow-whisper p-3.5 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[7px] bg-brand-soft text-brand-text flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-ink tracking-tight truncate">
              Template Cepat (1-Klik)
            </h3>
          </div>

          {onAddTemplate && (
            <button
              type="button"
              onClick={onAddTemplate}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] bg-brand-soft text-brand-text text-[11px] font-bold transition-all border border-brand/20 shrink-0 cursor-pointer active:scale-95"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Tambah</span>
            </button>
          )}
        </div>

        {/* Compact Templates Grid */}
        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {templates.map((tpl) => {
              const srcAcc = resolveTemplateAccount(
                accounts,
                tpl.sourceAccountId,
              );
              const dstAcc = tpl.destinationAccountId
                ? resolveTemplateAccount(accounts, tpl.destinationAccountId)
                : null;
              const isExpense = tpl.type === "pengeluaran";
              const isTransfer = tpl.type === "transfer";

              return (
                <div
                  key={tpl.id}
                  // Deliberately NOT role="button": the card contains an edit
                  // button, and nesting an interactive control inside one makes
                  // the keyboard stop twice and confuses screen readers. The
                  // card body is a real <button type="button">; edit sits beside it.
                  className="group relative min-w-0 bg-canvas hover:bg-surface rounded-[10px] border border-hairline hover:border-brand shadow-2xs hover:shadow-micro transition-all flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => onUseTemplateDirectly?.(tpl)}
                    className="flex flex-col justify-between gap-1 min-h-[44px] px-2.5 py-2 pr-7 text-left cursor-pointer active:scale-[0.98] transition-transform w-full"
                  >
                    {/* Row 1: Emoji + Template Name */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs leading-none shrink-0">
                        {tpl.emoji || "⚡"}
                      </span>
                      <h4 className="text-xs font-bold text-ink truncate group-hover:text-brand-text transition-colors">
                        {tpl.name}
                      </h4>
                    </div>

                    {/* Row 2: Nominal + Account Info */}
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <span
                        className={`text-[11px] font-bold tabular-nums shrink-0 ${
                          isExpense
                            ? "text-negative-bright"
                            : isTransfer
                              ? "text-brand-text"
                              : "text-positive-bright"
                        }`}
                      >
                        {isExpense ? "-" : isTransfer ? "" : "+"}
                        {formatCurrency(tpl.amount)}
                      </span>
                      <span className="text-[10px] font-medium text-ink-muted truncate">
                        {isTransfer
                          ? `${srcAcc?.name || "Akun"}→${dstAcc?.name || "Tujuan"}`
                          : srcAcc?.name || "Akun"}
                      </span>
                    </div>
                  </button>

                  {/* Edit sits outside the use-button, so neither nests.
                      The padding lifts the 20px icon to a usable target. */}
                  {onEditTemplate && (
                    <button
                      type="button"
                      onClick={() => onEditTemplate(tpl)}
                      className="absolute top-1 right-1 w-5 h-5 p-1.5 box-content rounded-[5px] flex items-center justify-center text-ink-subtle hover:text-brand-text hover:bg-brand-soft transition-colors cursor-pointer"
                      title="Edit template"
                      aria-label={`Edit template ${tpl.name}`}
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 px-3 text-center border border-dashed border-hairline rounded-[10px]">
            <p className="text-xs text-ink-muted">
              Belum ada template transaksi.
            </p>
            {onAddTemplate && (
              <button
                type="button"
                onClick={onAddTemplate}
                className="mt-1.5 text-xs font-bold text-brand-text hover:underline cursor-pointer"
              >
                Buat template pertama Anda
              </button>
            )}
          </div>
        )}
      </div>

      {/* ===================== TWO-COLUMN MAIN CONTENT ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8">
        {/* Left Column (7 cols): Top Categories Breakdown & Recent Transactions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Spending Categories */}
          <div className="bg-surface rounded-[16px] border border-hairline shadow-whisper p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] bg-warning-bright/15 text-warning flex items-center justify-center shrink-0">
                  <PieChart className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-ink tracking-tight">
                    Pengeluaran Terbesar
                  </h3>
                  <p className="text-[11px] text-ink-muted truncate">
                    Kategori dengan belanja tertinggi
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-brand-soft text-xs font-bold text-brand-text self-start sm:self-auto shrink-0 border border-brand">
                <span className="text-[11px] font-medium text-ink-muted">
                  Total:
                </span>
                <span className="tabular-nums font-bold text-ink">
                  {formatCurrency(monthExpense)}
                </span>
              </div>
            </div>

            {/* Month switcher: the dashboard used to be locked to the month of the
                newest transaction, so on the 2nd of a month it could still show
                the previous one with no way to look further back. */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-brand-text hover:bg-brand-soft transition-colors active:scale-95"
                aria-label="Bulan sebelumnya"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="text-xs font-bold text-ink truncate"
                  aria-live="polite"
                >
                  {monthLabel}
                </span>
                {!isCurrentMonth && (
                  <button
                    type="button"
                    onClick={goToCurrentMonth}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[5px] bg-surface-sunken hover:bg-brand-soft text-ink-muted hover:text-brand-text transition-colors shrink-0"
                  >
                    Kembali ke bulan ini
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={goToNextMonth}
                disabled={!canGoToNextMonth}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-brand-text hover:bg-brand-soft transition-colors active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Bulan berikutnya"
                title={
                  canGoToNextMonth
                    ? "Bulan berikutnya"
                    : "Belum ada bulan berikutnya"
                }
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Cash flow for the selected month. `monthIncome`/`netCashflow` were
                already computed but never rendered anywhere. */}
            <div className="flex items-center justify-between gap-2 text-[11px] px-1">
              <span className="text-ink-muted">
                Masuk{" "}
                <span className="tabular-nums font-semibold text-positive">
                  {formatCurrency(monthIncome)}
                </span>
              </span>
              <span className="text-ink-muted">
                Arus kas{" "}
                <span
                  className={`tabular-nums font-semibold ${
                    netCashflow >= 0 ? "text-positive" : "text-negative-bright"
                  }`}
                >
                  {netCashflow >= 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(netCashflow))}
                </span>
              </span>
              {monthExpenseDelta !== null && (
                <span
                  className={`tabular-nums font-semibold ${
                    monthExpenseDelta > 0
                      ? "text-negative-bright"
                      : "text-positive"
                  }`}
                  title={`Pengeluaran bulan sebelumnya: ${formatCurrency(previousMonthExpense ?? 0)}`}
                >
                  {monthExpenseDelta > 0
                    ? "↑"
                    : monthExpenseDelta < 0
                      ? "↓"
                      : "="}{" "}
                  {Math.abs(monthExpenseDelta)}% vs bulan lalu
                </span>
              )}
            </div>

            {topCategories.length === 0 ? (
              <div className="py-6 px-3 text-center border border-dashed border-hairline rounded-[12px] space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-surface-sunken flex items-center justify-center text-ink-subtle">
                  <PieChart className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-ink">
                    Belum ada pengeluaran
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    Tidak ada belanja tercatat di {monthLabel}.
                  </p>
                </div>
                {!isCurrentMonth ? (
                  <button
                    type="button"
                    onClick={goToCurrentMonth}
                    className="text-[11px] font-bold text-brand-text hover:underline"
                  >
                    Lihat bulan ini
                  </button>
                ) : (
                  onAddTransaction && (
                    <button
                      type="button"
                      onClick={onAddTransaction}
                      className="text-[11px] font-bold text-brand-text hover:underline"
                    >
                      Catat pengeluaran
                    </button>
                  )
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {topCategories.map((cat) => {
                  const catObj = getCategory(cat.catId);
                  return (
                    <div key={cat.catId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CategoryIcon
                            name={cat.name}
                            type="pengeluaran"
                            icon={catObj?.icon}
                            emoji={catObj?.emoji}
                            size="sm"
                          />
                          <span className="font-semibold text-ink truncate">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-ink-muted shrink-0">
                            ({cat.percentage}%)
                          </span>
                        </div>
                        <span className="font-bold text-ink tabular-nums shrink-0">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                      {/* Kraken Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand transition-all duration-500"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Transactions List */}
          <div className="bg-surface rounded-[16px] border border-hairline shadow-whisper overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-hairline bg-canvas">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-brand-soft text-brand-text flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink tracking-tight">
                    Transaksi Terakhir
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    5 aktivitas mutasi terbaru
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("riwayat")}
                className="text-xs font-semibold text-brand-text hover:text-brand-text flex items-center gap-1 transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-hairline">
              {recentTransactions.length === 0 ? (
                // Without this branch the panel rendered its header above an empty
                // box, which reads as "failed to load" rather than "no data yet".
                <div className="px-4 py-8 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-surface-sunken flex items-center justify-center text-ink-subtle">
                    <History className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-ink">
                      Belum ada transaksi
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      Transaksi pertama Anda akan muncul di sini.
                    </p>
                  </div>
                  {onAddTransaction && (
                    <button
                      type="button"
                      onClick={onAddTransaction}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-brand text-on-brand text-xs font-bold transition-colors hover:bg-brand-hover active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Catat Transaksi
                    </button>
                  )}
                </div>
              ) : (
                recentTransactions.map((t) => {
                  const isExpense = t.type === "pengeluaran";
                  const isIncome = t.type === "pemasukan";
                  const isTransfer = t.type === "transfer";
                  const sourceName = getAccountName(t.sourceAccountId);
                  const categoryName = getCategoryName(t.categoryId);
                  const catObj = t.categoryId
                    ? getCategory(t.categoryId)
                    : undefined;

                  return (
                    <div
                      key={t.id}
                      // The whole row is the target now. Before, editing was only
                      // reachable through a 28x28 pencil -- far under the 44px
                      // minimum for a touch target on a mobile-first app.
                      role="button"
                      tabIndex={0}
                      onClick={() => onEditTransaction(t)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onEditTransaction(t);
                        }
                      }}
                      className="p-3.5 sm:px-4 flex items-center justify-between gap-3 group hover:bg-surface-sunken focus:outline-none focus-visible:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-brand transition-colors cursor-pointer min-h-[56px]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CategoryIcon
                          name={isTransfer ? "Pindah Akun" : categoryName}
                          type={t.type}
                          icon={isTransfer ? undefined : catObj?.icon}
                          emoji={isTransfer ? undefined : catObj?.emoji}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-ink truncate">
                              {isTransfer ? "Pindah Akun" : categoryName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-[5px] bg-surface-sunken border border-hairline text-[10px] font-semibold text-ink-muted">
                              {sourceName}
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-muted truncate mt-0.5">
                            {t.date} {t.notes ? `• ${t.notes}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span
                            className={`font-bold text-xs sm:text-sm block tabular-nums ${
                              isExpense
                                ? "text-negative-bright"
                                : isIncome
                                  ? "text-positive"
                                  : "text-brand-text"
                            }`}
                          >
                            {isExpense ? "-" : isIncome ? "+" : ""}
                            {formatCurrency(t.amount)}
                          </span>
                        </div>
                        {/* Visual affordance only. A nested <button type="button"> inside a
                            role="button" row is invalid and stops the keyboard
                            twice on one card, so the row owns the action. */}
                        <span
                          aria-hidden="true"
                          className="w-7 h-7 rounded-[7px] flex items-center justify-center text-ink-subtle group-hover:text-brand-text transition-colors shrink-0"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Accounts Snapshot & Tagihan Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ringkasan Rekening & Dompet Snapshot */}
          <div className="bg-surface rounded-[16px] border border-hairline shadow-whisper p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink tracking-tight">
                  Rekening & Dompet
                </h3>
                <p className="text-[11px] text-ink-muted">
                  Saldo akun aktif Anda
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("saldo")}
                className="text-xs font-semibold text-brand-text hover:text-brand-text flex items-center gap-1"
              >
                <span>Kelola</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {liquidAccounts.slice(0, ACCOUNT_SNAPSHOT_LIMIT).map((acc) => (
                <div
                  key={acc.id}
                  role={onSelectAccountHistory ? "button" : undefined}
                  tabIndex={onSelectAccountHistory ? 0 : undefined}
                  onClick={
                    onSelectAccountHistory
                      ? () => onSelectAccountHistory(acc)
                      : undefined
                  }
                  onKeyDown={
                    onSelectAccountHistory
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelectAccountHistory(acc);
                          }
                        }
                      : undefined
                  }
                  className={`flex items-center justify-between p-2.5 rounded-[12px] bg-canvas border border-hairline hover:border-brand/40 transition-all min-h-[52px] ${
                    onSelectAccountHistory
                      ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AccountAvatar acc={acc} />
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-ink block truncate">
                        {acc.name}
                      </span>
                      <span className="text-[10px] text-ink-muted uppercase">
                        {ACCOUNT_TYPE_LABELS[acc.type] || acc.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`font-bold text-xs sm:text-sm tabular-nums ${
                        acc.balance < 0 ? "text-negative-bright" : "text-ink"
                      }`}
                    >
                      {maskAmount(acc.balance)}
                    </span>
                    {onSelectAccountHistory && (
                      <ChevronRight
                        aria-hidden="true"
                        className="w-3.5 h-3.5 text-ink-subtle"
                      />
                    )}
                  </div>
                </div>
              ))}
              {hiddenAccountCount > 0 && (
                // `slice(0, 5)` used to drop the rest silently; with 12 seeded
                // accounts the user could not tell 7 were missing.
                <button
                  type="button"
                  onClick={() => onNavigateTab("saldo")}
                  className="w-full py-2 rounded-[10px] border border-dashed border-hairline text-[11px] font-semibold text-ink-muted hover:text-brand-text hover:border-brand/40 transition-colors"
                >
                  +{hiddenAccountCount} rekening lain
                </button>
              )}
            </div>
          </div>

          {/* Tagihan & Pinjaman Alert Card.
              The panel gets a red left edge only while something is actually
              owed -- that is the one panel on this page that deserves to shout,
              and it also breaks the five-identical-white-cards monotony. */}
          <div
            className={`bg-surface rounded-[16px] border shadow-whisper p-5 space-y-3.5 transition-colors ${
              totalDebt > 0
                ? "border-negative/30 border-l-4 border-l-negative"
                : "border-hairline"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[8px] bg-critical-soft text-critical flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink tracking-tight">
                    Tagihan & Pinjaman
                  </h3>
                  <p className="text-[11px] text-ink-muted">
                    Kewajiban berjalan
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-critical tabular-nums">
                {maskAmount(totalDebt)}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {creditAccounts.length === 0 && (
                <p className="text-xs text-ink-subtle py-4 text-center">
                  Belum ada akun kredit atau pinjaman.
                </p>
              )}
              {creditAccounts.map((acc) => {
                const debtAmount = acc.balance < 0 ? Math.abs(acc.balance) : 0;
                return (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-2.5 rounded-[12px] bg-canvas border border-hairline"
                  >
                    <div className="flex items-center gap-2.5">
                      <AccountAvatar acc={acc} />
                      <div>
                        <span className="font-bold text-xs text-ink block">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-ink-muted">
                          {debtAmount > 0 ? "Ada Tagihan" : "Lunas"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-xs sm:text-sm tabular-nums ${
                        debtAmount > 0
                          ? "text-negative-bright"
                          : "text-positive"
                      }`}
                    >
                      {debtAmount > 0
                        ? maskAmount(debtAmount, "-")
                        : "Lunas (Rp 0)"}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab("tagihan")}
              className="w-full py-2.5 rounded-[12px] bg-surface-sunken hover:bg-hairline text-ink text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
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
