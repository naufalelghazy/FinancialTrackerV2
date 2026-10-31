import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import type { Transaction, Account, Category } from "../../types";
import { formatCurrency } from "../../lib/formatters";
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
  Wallet,
  Layers,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { CategoryIcon } from "../../components/ui/CategoryIcon";
import { AccountAvatar } from "../../components/ui/AccountAvatar";
import { ACCOUNT_TYPE_LABELS } from "../../lib/labels";
import {
  currentMonthKey as getCurrentMonthKey,
  formatIndonesianDateLong as formatIndonesianDate,
  formatMonthLabel,
} from "../../lib/date";

interface HistoryViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onEditTransaction: (transaction: Transaction) => void;
  selectedAccountId?: string;
  onChangeSelectedAccountId?: (accountId: string) => void;
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

/* Month and date formatting now lives in 'lib/date': the four helpers that used
   to be defined here were byte-for-byte copies of the shared ones. */
export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  accounts,
  categories,
  onEditTransaction,
  selectedAccountId: controlledAccountId,
  onChangeSelectedAccountId,
}) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [internalAccountId, setInternalAccountId] = useState<string>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(
    {},
  );

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const activeAccountId =
    controlledAccountId !== undefined ? controlledAccountId : internalAccountId;

  const handleSetAccountFilter = useCallback(
    (nextId: string) => {
      if (onChangeSelectedAccountId) {
        onChangeSelectedAccountId(nextId);
      } else {
        setInternalAccountId(nextId);
      }
    },
    [onChangeSelectedAccountId],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(target)
      ) {
        setIsAccountDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
      }
    };
    if (isAccountDropdownOpen || isCategoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountDropdownOpen, isCategoryDropdownOpen]);

  // Fast O(1) lookup maps
  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of accounts) map.set(a.id, a.name);
    return map;
  }, [accounts]);

  const accountObjectMap = useMemo(() => {
    const map = new Map<string, Account>();
    for (const a of accounts) map.set(a.id, a);
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

  const getAccountName = useCallback(
    (id?: string) => (id ? accountMap.get(id) || id : "-"),
    [accountMap],
  );
  const getCategoryName = useCallback(
    (id?: string) => (id ? categoryMap.get(id) || id : "-"),
    [categoryMap],
  );
  const getCategory = useCallback(
    (id?: string) => (id ? categoryObjectMap.get(id) : undefined),
    [categoryObjectMap],
  );

  const selectedAccountObj = useMemo(
    () =>
      activeAccountId !== "all"
        ? accountObjectMap.get(activeAccountId)
        : undefined,
    [activeAccountId, accountObjectMap],
  );

  const selectedCategoryObj = useMemo(
    () =>
      selectedCategoryId !== "all"
        ? categoryObjectMap.get(selectedCategoryId)
        : undefined,
    [selectedCategoryId, categoryObjectMap],
  );

  const availableCategoriesForFilter = useMemo(() => {
    if (filterType === "pengeluaran" || filterType === "pemasukan") {
      return categories.filter((c) => c.type === filterType);
    }
    return categories;
  }, [categories, filterType]);

  const currentMonthKey = useMemo(() => getCurrentMonthKey(), []);

  const hasActiveFilters =
    search.trim().length > 0 ||
    filterType !== "all" ||
    activeAccountId !== "all" ||
    selectedCategoryId !== "all";

  const handleResetFilters = () => {
    setSearch("");
    setFilterType("all");
    handleSetAccountFilter("all");
    setSelectedCategoryId("all");
  };

  // 1. Filtered Transactions
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) {
        return false;
      }

      if (activeAccountId !== "all") {
        const matchesSource = t.sourceAccountId === activeAccountId;
        const matchesDest = t.destinationAccountId === activeAccountId;
        if (!matchesSource && !matchesDest) {
          return false;
        }
      }

      if (selectedCategoryId !== "all" && t.categoryId !== selectedCategoryId) {
        return false;
      }

      if (!query) return true;

      const sourceName = getAccountName(t.sourceAccountId).toLowerCase();
      const destName = t.destinationAccountId
        ? getAccountName(t.destinationAccountId).toLowerCase()
        : "";
      const categoryName = getCategoryName(t.categoryId).toLowerCase();
      const notesMatch = (t.notes || "").toLowerCase().includes(query);
      const sourceMatch = sourceName.includes(query);
      const destMatch = destName.includes(query);
      const categoryMatch = categoryName.includes(query);
      const dateMatch = t.date.includes(query);

      return (
        notesMatch || sourceMatch || destMatch || categoryMatch || dateMatch
      );
    });
  }, [
    transactions,
    search,
    filterType,
    activeAccountId,
    selectedCategoryId,
    getAccountName,
    getCategoryName,
  ]);

  // 2. Group by Month, then by Day (Sorted Descending)
  const groupedByMonth = useMemo(() => {
    const monthMap = new Map<string, Map<string, Transaction[]>>();

    for (const t of filtered) {
      const monthKey = t.date.slice(0, 7);
      // Allocate the inner map once and keep the reference; a `get()!` lookup
      // right after a `set()` is a promise to the compiler that it's already
      // there, which is exactly the kind of claim that breaks silently later.
      let dayMap = monthMap.get(monthKey);
      if (!dayMap) {
        dayMap = new Map<string, Transaction[]>();
        monthMap.set(monthKey, dayMap);
      }
      const list = dayMap.get(t.date) || [];
      list.push(t);
      dayMap.set(t.date, list);
    }

    // Sort months descending (newest month first)
    const sortedMonthKeys = Array.from(monthMap.keys()).sort((a, b) =>
      b.localeCompare(a),
    );
    const result: MonthGroup[] = [];

    for (const monthKey of sortedMonthKeys) {
      const dayMap = monthMap.get(monthKey);
      if (!dayMap) continue;
      const sortedDates = Array.from(dayMap.keys()).sort((a, b) =>
        b.localeCompare(a),
      );

      const days: DayGroup[] = [];
      let totalExpense = 0;
      let totalIncome = 0;
      let totalCount = 0;

      for (const date of sortedDates) {
        const items = dayMap.get(date) || [];
        totalCount += items.length;

        let dayTotal = 0;
        for (const item of items) {
          if (item.type === "pengeluaran") {
            dayTotal -= item.amount;
            totalExpense += item.amount;
          } else if (item.type === "pemasukan") {
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
  // - Open if any filter or search is active (so matching transactions are visible immediately)
  // - Open if user explicitly expanded it
  // - Open by default for current month (or newest month if current month has no transactions)
  const isMonthExpanded = useCallback(
    (monthKey: string, isFirstMonth: boolean): boolean => {
      if (expandedMonths[monthKey] !== undefined) {
        return expandedMonths[monthKey];
      }

      if (hasActiveFilters) return true;

      if (monthKey === currentMonthKey) return true;

      const hasCurrentMonth = groupedByMonth.some(
        (m) => m.monthKey === currentMonthKey,
      );
      if (!hasCurrentMonth && isFirstMonth) return true;

      return false;
    },
    [hasActiveFilters, expandedMonths, currentMonthKey, groupedByMonth],
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
    return groupedByMonth.every((m, idx) =>
      isMonthExpanded(m.monthKey, idx === 0),
    );
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
      {/* The "Mutasi Rekening" banner used to sit here. The account dropdown
          below already shows the active account's name and balance, so the
          card repeated both and pushed the list further down the screen. */}

      {/* Search & Filter Header Card */}
      <div className="bg-surface p-4 sm:p-5 rounded-[16px] border border-hairline shadow-whisper space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-ink tracking-[-0.5px]">
              Riwayat Transaksi
            </h2>
            <p className="text-[11px] text-ink-muted tabular-nums">
              {filtered.length} transaksi
              {hasActiveFilters ? " (difilter)" : " tercatat"}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {groupedByMonth.length > 1 && (
              <button
                type="button"
                onClick={handleToggleAll}
                aria-label={
                  allMonthsExpanded
                    ? "Tutup semua bulan"
                    : "Buka semua bulan"
                }
                title={
                  allMonthsExpanded
                    ? "Tutup semua bulan"
                    : "Buka semua bulan"
                }
                className="w-8 h-8 rounded-[8px] bg-canvas border border-hairline hover:border-brand/50 text-ink-muted hover:text-brand-text flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
              </button>
            )}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-8 px-2.5 rounded-[8px] bg-brand-soft text-brand-text text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset Semua Filter"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi, rekening, kategori, atau catatan..."
            className="w-full pl-9 pr-9 py-2.5 rounded-[12px] bg-canvas border border-hairline text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 placeholder:text-ink-subtle transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="w-6 h-6 -m-2 p-2 box-content rounded-full flex items-center justify-center text-ink-subtle hover:text-ink absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Account & Category Popup Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Account Filter Dropdown */}
          <div className="relative" ref={accountDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsAccountDropdownOpen((prev) => !prev);
                setIsCategoryDropdownOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={isAccountDropdownOpen}
              className={`w-full px-3 py-2 rounded-[12px] bg-canvas border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                activeAccountId !== "all"
                  ? "border-brand ring-2 ring-brand/15"
                  : "border-hairline hover:border-brand/50"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {selectedAccountObj ? (
                  <>
                    <AccountAvatar acc={selectedAccountObj} size="sm" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-ink truncate block">
                        {selectedAccountObj.name}
                      </span>
                      <span className="text-[10px] text-ink-muted tabular-nums block">
                        {formatCurrency(selectedAccountObj.balance)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-[8px] bg-surface-sunken flex items-center justify-center text-ink-muted shrink-0">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-ink truncate">
                      Semua Rekening
                    </span>
                  </>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-150 ${
                  isAccountDropdownOpen ? "rotate-180 text-brand-text" : ""
                }`}
              />
            </button>

            {isAccountDropdownOpen && (
              <div
                role="listbox"
                aria-label="Filter Rekening"
                className="absolute left-0 right-0 mt-1.5 z-40 bg-surface rounded-[12px] border border-hairline shadow-xl max-h-64 overflow-y-auto p-1.5 space-y-0.5"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={activeAccountId === "all"}
                  onClick={() => {
                    handleSetAccountFilter("all");
                    setIsAccountDropdownOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-[9px] text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    activeAccountId === "all"
                      ? "bg-brand-soft text-brand-text font-bold"
                      : "hover:bg-surface-sunken text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-[8px] bg-surface-sunken flex items-center justify-center text-ink-muted shrink-0">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold truncate">
                      Semua Rekening
                    </span>
                  </div>
                  {activeAccountId === "all" && (
                    <Check className="w-4 h-4 text-brand-text shrink-0" />
                  )}
                </button>

                {accounts.map((acc) => {
                  const isSelected = activeAccountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        handleSetAccountFilter(acc.id);
                        setIsAccountDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-[9px] text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-brand-soft text-brand-text font-bold"
                          : "hover:bg-surface-sunken text-ink"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AccountAvatar acc={acc} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate">
                              {acc.name}
                            </span>
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-surface-sunken text-ink-muted shrink-0">
                              {ACCOUNT_TYPE_LABELS[acc.type] || acc.type}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-medium tabular-nums block ${
                              acc.balance < 0
                                ? "text-negative-bright"
                                : "text-ink-muted"
                            }`}
                          >
                            {formatCurrency(acc.balance)}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-brand-text shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsCategoryDropdownOpen((prev) => !prev);
                setIsAccountDropdownOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={isCategoryDropdownOpen}
              className={`w-full px-3 py-2 rounded-[12px] bg-canvas border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                selectedCategoryId !== "all"
                  ? "border-brand ring-2 ring-brand/15"
                  : "border-hairline hover:border-brand/50"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {selectedCategoryObj ? (
                  <>
                    <CategoryIcon
                      name={selectedCategoryObj.name}
                      type={selectedCategoryObj.type}
                      icon={selectedCategoryObj.icon}
                      emoji={selectedCategoryObj.emoji}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-ink truncate block">
                        {selectedCategoryObj.name}
                      </span>
                      <span className="text-[10px] text-ink-muted capitalize block">
                        {selectedCategoryObj.type}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-[8px] bg-surface-sunken flex items-center justify-center text-ink-muted shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-ink truncate">
                      Semua Kategori
                    </span>
                  </>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-150 ${
                  isCategoryDropdownOpen ? "rotate-180 text-brand-text" : ""
                }`}
              />
            </button>

            {isCategoryDropdownOpen && (
              <div
                role="listbox"
                aria-label="Filter Kategori"
                className="absolute left-0 right-0 mt-1.5 z-40 bg-surface rounded-[12px] border border-hairline shadow-xl max-h-64 overflow-y-auto p-1.5 space-y-0.5"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedCategoryId === "all"}
                  onClick={() => {
                    setSelectedCategoryId("all");
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-[9px] text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    selectedCategoryId === "all"
                      ? "bg-brand-soft text-brand-text font-bold"
                      : "hover:bg-surface-sunken text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-[8px] bg-surface-sunken flex items-center justify-center text-ink-muted shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold truncate">
                      Semua Kategori
                    </span>
                  </div>
                  {selectedCategoryId === "all" && (
                    <Check className="w-4 h-4 text-brand-text shrink-0" />
                  )}
                </button>

                {availableCategoriesForFilter.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-[9px] text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-brand-soft text-brand-text font-bold"
                          : "hover:bg-surface-sunken text-ink"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CategoryIcon
                          name={cat.name}
                          type={cat.type}
                          icon={cat.icon}
                          emoji={cat.emoji}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold truncate block">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-ink-muted capitalize block">
                            {cat.type}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-brand-text shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex bg-surface-sunken p-1 rounded-[10px] gap-1 text-xs">
          {[
            { id: "all", label: "Semua", icon: null },
            { id: "pengeluaran", label: "Keluar", icon: ArrowUpRight },
            { id: "pemasukan", label: "Masuk", icon: ArrowDownLeft },
            { id: "transfer", label: "Transfer", icon: ArrowLeftRight },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = filterType === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-[8px] font-semibold flex items-center justify-center gap-1 transition-all ${
                  isActive
                    ? "bg-surface text-ink shadow-micro"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Grouped Transaction Accordions */}
      {groupedByMonth.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-[16px] border border-hairline p-6 text-ink-subtle shadow-whisper">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-ink-muted" />
          <p className="text-sm font-semibold text-ink">
            Tidak ada transaksi ditemukan
          </p>
          <p className="text-xs text-ink-subtle mt-1">
            Coba ubah kata kunci pencarian atau filter rekening/kategori
          </p>
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
                className="bg-surface rounded-[16px] border border-hairline shadow-whisper overflow-hidden transition-all duration-200"
              >
                {/* Month Dropdown / Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleMonth(monthGroup.monthKey, isFirst)}
                  aria-expanded={isOpen}
                  className="w-full px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 text-left bg-canvas hover:bg-surface-sunken transition-colors cursor-pointer select-none"
                >
                  {/* Left: Calendar Icon + Month Title + Badge */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? "bg-brand-soft text-brand-text"
                          : "bg-surface-sunken text-ink-muted"
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-ink tracking-tight">
                          {monthGroup.label}
                        </h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-soft text-brand-text tracking-wide">
                            Bulan Ini
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        {monthGroup.totalCount} transaksi
                      </p>
                    </div>
                  </div>

                  {/* Right: Net Summary + Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      {monthGroup.netTotal !== 0 ? (
                        <span
                          className={`text-xs font-bold tabular-nums ${
                            monthGroup.netTotal < 0
                              ? "text-negative-bright"
                              : "text-positive"
                          }`}
                        >
                          {monthGroup.netTotal < 0 ? "-" : "+"}
                          {formatCurrency(Math.abs(monthGroup.netTotal))}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-ink-subtle">
                          Seimbang
                        </span>
                      )}
                    </div>

                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] bg-surface border border-hairline flex items-center justify-center text-ink-muted transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-brand-text" : ""
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Collapsible Month Body with Days */}
                {isOpen && (
                  <div className="p-3 sm:p-4 space-y-3 bg-canvas/40 border-t border-hairline">
                    {monthGroup.days.map((dayGroup) => (
                      <div
                        key={dayGroup.date}
                        className="bg-surface rounded-[12px] sm:rounded-[14px] border border-hairline shadow-micro overflow-hidden"
                      >
                        {/* Day Header */}
                        <div className="flex items-center justify-between px-3.5 py-2 sm:px-4 sm:py-2.5 bg-canvas border-b border-hairline">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ink tracking-tight">
                              {formatIndonesianDate(dayGroup.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-ink-muted">
                              {dayGroup.items.length} transaksi
                            </span>
                            {dayGroup.dayTotal !== 0 && (
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-[6px] ${
                                  dayGroup.dayTotal < 0
                                    ? "bg-negative-soft text-negative"
                                    : "bg-positive-soft text-positive"
                                }`}
                              >
                                {dayGroup.dayTotal < 0 ? "-" : "+"}
                                {formatCurrency(Math.abs(dayGroup.dayTotal))}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Transactions List within this Date */}
                        <div className="divide-y divide-hairline">
                          {dayGroup.items.map((t) => {
                            const isExpense = t.type === "pengeluaran";
                            const isIncome = t.type === "pemasukan";
                            const isTransfer = t.type === "transfer";

                            const sourceName = getAccountName(
                              t.sourceAccountId,
                            );
                            const destName = t.destinationAccountId
                              ? getAccountName(t.destinationAccountId)
                              : "";
                            const categoryName = getCategoryName(t.categoryId);
                            const catObj = t.categoryId
                              ? getCategory(t.categoryId)
                              : undefined;

                            return (
                              <div
                                key={t.id}
                                className="group px-3.5 py-3 sm:px-4 sm:py-3 flex items-start sm:items-center justify-between gap-3 hover:bg-surface-sunken transition-colors"
                              >
                                {/* Left: Category Icon */}
                                <div className="pt-0.5 sm:pt-0 shrink-0">
                                  <CategoryIcon
                                    name={
                                      isTransfer ? "Pindah Akun" : categoryName
                                    }
                                    type={t.type}
                                    icon={isTransfer ? undefined : catObj?.icon}
                                    emoji={
                                      isTransfer ? undefined : catObj?.emoji
                                    }
                                    size="md"
                                  />
                                </div>

                                {/* Middle: Kategori, Akun, and Catatan */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-ink tracking-tight group-hover:text-brand-text transition-colors">
                                      {isTransfer
                                        ? "Pindah Akun"
                                        : categoryName}
                                    </span>

                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-surface-sunken border border-hairline text-[11px] font-semibold text-ink-muted">
                                      {isTransfer ? (
                                        <>
                                          <span className="text-ink font-bold">
                                            {sourceName}
                                          </span>
                                          <ArrowRight className="w-2.5 h-2.5 text-brand-text shrink-0" />
                                          <span className="text-ink font-bold">
                                            {destName}
                                          </span>
                                        </>
                                      ) : (
                                        <span>{sourceName}</span>
                                      )}
                                    </div>
                                  </div>

                                  {t.notes && (
                                    <p className="text-xs text-ink-muted leading-snug line-clamp-2">
                                      {t.notes}
                                    </p>
                                  )}
                                </div>

                                {/* Right: Nominal & Edit Action */}
                                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-center">
                                  <span
                                    className={`font-bold text-sm sm:text-base tracking-tight tabular-nums ${
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

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditTransaction(t);
                                    }}
                                    className="w-8 h-8 -m-2 p-2 box-content rounded-[8px] flex items-center justify-center text-ink-subtle hover:text-brand-text hover:bg-brand-soft transition-all cursor-pointer active:scale-95 border border-transparent hover:border-brand"
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
