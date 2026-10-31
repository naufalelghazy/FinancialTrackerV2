import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDismissable } from '../../hooks/useDismissable';
import type { TransactionType, Account, Category, QuickTemplate } from '../../types';
import { formatCurrency, formatNumberWithDots, parseRawAmount } from '../../lib/formatters';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  CheckCircle2,
  Zap,
  BookmarkPlus,
  Mic,
  ChevronDown,
} from 'lucide-react';
import { CategoryIcon } from '../ui/CategoryIcon';
import { CategoryPickerList } from '../ui/CategoryPickerList';
import { AccountAvatar } from '../ui/AccountAvatar';
import { AccountPickerList } from '../ui/AccountPickerList';
import { resolveTemplateAccount, resolveTemplateCategory } from '../../services/templateService';
import { ACCOUNT_TYPE_LABELS } from '../../lib/labels';
import { todayLocalISO } from '../../lib/date';

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  templates?: QuickTemplate[];
  prefilledData?: {
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  } | null;
  onClearPrefilledData?: () => void;
  onOpenVoiceModal?: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => Promise<{ ok: boolean; queued?: boolean } | void>;
  onSaveAsTemplate?: (data: Omit<QuickTemplate, 'id'>) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  accounts,
  categories,
  templates = [],
  prefilledData,
  onClearPrefilledData,
  onOpenVoiceModal,
  onSubmit,
  onSaveAsTemplate,
}) => {
  const [type, setType] = useState<TransactionType>(() => prefilledData?.type || 'pengeluaran');
  const [amountDisplay, setAmountDisplay] = useState(() =>
    prefilledData ? formatNumberWithDots(String(prefilledData.amount)) : ''
  );
  const [sourceAccountId, setSourceAccountId] = useState(
    () => prefilledData?.sourceAccountId || ''
  );
  const [destinationAccountId, setDestinationAccountId] = useState(
    () => prefilledData?.destinationAccountId || ''
  );
  const [categoryId, setCategoryId] = useState(() => prefilledData?.categoryId || '');
  const [date, setDate] = useState(
    () => prefilledData?.date || todayLocalISO()
  );
  const [notes, setNotes] = useState(() => prefilledData?.notes || '');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Transaksi berhasil disimpan!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState<
    'source' | 'destination' | 'category' | null
  >(null);
  const [fieldError, setFieldError] = useState<
    'amount' | 'source' | 'destination' | 'category' | null
  >(null);

  const dropdownAreaRef = useRef<HTMLDivElement>(null);
  const sourceTriggerRef = useRef<HTMLButtonElement>(null);
  const destinationTriggerRef = useRef<HTMLButtonElement>(null);
  const categoryTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (prefilledData) {
      onClearPrefilledData?.();
    }
  }, [prefilledData, onClearPrefilledData]);

  // Tutup popup dropdown saat klik di luar atau tekan Escape
  const dismissDropdown = useCallback(() => setActiveDropdown(null), []);
  useDismissable(dropdownAreaRef, activeDropdown !== null, dismissDropdown);

  const filteredCategories = categories.filter((c) => c.type === type);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedSourceAccount = accounts.find((a) => a.id === sourceAccountId);
  const selectedDestinationAccount = accounts.find((a) => a.id === destinationAccountId);
  const availableDestinationAccounts = accounts.filter((a) => a.id !== sourceAccountId);

  const toggleDropdown = (menu: 'source' | 'destination' | 'category') => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountDisplay(formatNumberWithDots(e.target.value));
  };

  /** Arrow/Home/End navigation for the type radiogroup. */
  const handleTypeGroupKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const order = ['pengeluaran', 'transfer', 'pemasukan'] as const;
    const currentIdx = order.indexOf(type);
    let nextIdx = currentIdx;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIdx = (currentIdx + 1) % order.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIdx = (currentIdx - 1 + order.length) % order.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = order.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    setType(order[nextIdx]);
    setCategoryId('');
    setFieldError(null);
    setActiveDropdown(null);
    // Move focus with the selection, as the radiogroup pattern expects.
    const target = document.querySelector<HTMLElement>(
      `[data-type-option="${order[nextIdx]}"]`
    );
    target?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const rawAmount = parseRawAmount(amountDisplay);
    // Returning silently made the Simpan button look broken: nothing was
    // highlighted and nothing was said.
    if (!rawAmount || rawAmount <= 0) {
      setFieldError('amount');
      document.getElementById('tx-amount-input')?.focus();
      return;
    }

    if (!sourceAccountId) {
      setFieldError('source');
      setActiveDropdown('source');
      sourceTriggerRef.current?.focus();
      return;
    }

    if (type === 'transfer' && !destinationAccountId) {
      setFieldError('destination');
      setActiveDropdown('destination');
      destinationTriggerRef.current?.focus();
      return;
    }

    if (type === 'transfer' && destinationAccountId === sourceAccountId) {
      setFieldError('destination');
      setActiveDropdown('destination');
      destinationTriggerRef.current?.focus();
      return;
    }

    if (type !== 'transfer' && !categoryId) {
      setFieldError('category');
      setActiveDropdown('category');
      categoryTriggerRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    let result: { ok: boolean; queued?: boolean } | void;

    try {
      result = await onSubmit({
        type,
        amount: rawAmount,
        sourceAccountId,
        destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
        categoryId: type !== 'transfer' ? categoryId : undefined,
        date,
        notes,
      });
    } catch (err) {
      console.error('Failed to submit transaction:', err);
      result = { ok: false };
    } finally {
      setIsSubmitting(false);
    }

    // Only clear the form once the write is genuinely accepted (online or queued).
    if (!result || result.ok === false) return;

    // Reset Form
    setAmountDisplay('');
    setNotes('');
    setFieldError(null);
    setActiveDropdown(null);
    setSuccessMessage(
      result.queued
        ? 'Tersimpan di perangkat — akan disinkronkan saat online.'
        : 'Transaksi berhasil disimpan!'
    );
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2500);

    if (navigator.vibrate) {
      navigator.vibrate([40, 40, 40]);
    }
  };

  const [savedTemplateSuccess, setSavedTemplateSuccess] = useState(false);

  const handleApplyTemplate = (tpl: QuickTemplate) => {
    const srcAcc = resolveTemplateAccount(accounts, tpl.sourceAccountId);
    const dstAcc = tpl.destinationAccountId
      ? resolveTemplateAccount(accounts, tpl.destinationAccountId)
      : null;
    const cat = tpl.categoryId ? resolveTemplateCategory(categories, tpl.categoryId) : null;

    setType(tpl.type);
    setAmountDisplay(formatNumberWithDots(String(tpl.amount)));
    setSourceAccountId(srcAcc?.id || accounts[0]?.id || '');
    if (tpl.type === 'transfer') {
      setDestinationAccountId(dstAcc?.id || '');
      setCategoryId('');
    } else {
      setCategoryId(cat?.id || '');
      setDestinationAccountId('');
    }
    setFieldError(null);
    setActiveDropdown(null);
    if (tpl.notes) {
      setNotes(tpl.notes);
    }
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleSaveCurrentAsTemplate = () => {
    const rawAmount = parseRawAmount(amountDisplay);
    if (!rawAmount || !sourceAccountId) return;
    if (type === 'transfer' && !destinationAccountId) return;
    if (type !== 'transfer' && !categoryId) return;

    onSaveAsTemplate?.({
      name:
        notes.trim() ||
        (type === 'transfer'
          ? 'Transfer Saldo'
          : selectedCategory?.name || 'Transaksi Favorit'),
      type,
      amount: rawAmount,
      sourceAccountId,
      destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
      categoryId: type !== 'transfer' ? categoryId : undefined,
      notes: notes.trim(),
      emoji: selectedCategory?.emoji || (type === 'transfer' ? '🔄' : '⚡'),
    });

    setSavedTemplateSuccess(true);
    setTimeout(() => setSavedTemplateSuccess(false), 2500);
    if (navigator.vibrate) {
      navigator.vibrate([30, 30]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24">
      {/* Quick Template Chips */}
      {templates && templates.length > 0 && (
        <div className="space-y-1.5 pb-1">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-brand-text fill-current" />
              Pilih dari Template Favorit:
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-surface border border-hairline hover:border-brand dark:hover:border-brand shadow-2xs text-xs font-semibold text-ink shrink-0 transition-all active:scale-95"
              >
                <span>{tpl.emoji || '⚡'}</span>
                <span>{tpl.name}</span>
                <span className="text-[10px] text-ink-muted font-normal tabular-nums">
                  ({formatNumberWithDots(String(tpl.amount))})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Type Toggle - Kraken Style Segmented Control.
          Roving tabindex: the group is a single tab stop and arrow keys move
          between options, per the radiogroup pattern. It used to be
          tabIndex={-1} on all three, which made the transaction type
          completely unreachable from the keyboard. */}
      <div
        className="grid grid-cols-3 p-1 bg-surface-sunken rounded-[12px] gap-1 border border-hairline"
        role="radiogroup"
        aria-label="Jenis Transaksi"
        onKeyDown={handleTypeGroupKeyDown}
      >
        <button
          type="button"
          role="radio"
          aria-checked={type === 'pengeluaran'}
          tabIndex={type === 'pengeluaran' ? 0 : -1}
          data-type-option="pengeluaran"
          onClick={() => {
            setType('pengeluaran');
            setCategoryId('');
            setFieldError(null);
            setActiveDropdown(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] font-semibold text-xs tracking-tight transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            type === 'pengeluaran'
              ? 'bg-ink text-white shadow-micro'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Keluar
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={type === 'transfer'}
          tabIndex={type === 'transfer' ? 0 : -1}
          data-type-option="transfer"
          onClick={() => {
            setType('transfer');
            setCategoryId('');
            setFieldError(null);
            setActiveDropdown(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] font-semibold text-xs tracking-tight transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            type === 'transfer'
              ? 'bg-brand text-white shadow-micro'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Transfer
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={type === 'pemasukan'}
          tabIndex={type === 'pemasukan' ? 0 : -1}
          data-type-option="pemasukan"
          onClick={() => {
            setType('pemasukan');
            setCategoryId('');
            setFieldError(null);
            setActiveDropdown(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] font-semibold text-xs tracking-tight transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            type === 'pemasukan'
              ? 'bg-positive text-white shadow-micro'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          Masuk
        </button>
      </div>

      {/* Amount Card - Clean Display with Voice Input */}
      <div className="bg-surface rounded-[16px] p-5 sm:p-6 border border-hairline shadow-whisper text-center">
        <div className="flex items-center justify-between min-h-[26px]">
          <label
            htmlFor="tx-amount-input"
            className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
          >
            Nominal Transaksi
          </label>
          {onOpenVoiceModal && (
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-brand-text dark:text-[#3cffd0] bg-brand-soft dark:bg-[#3cffd0]/10 hover:bg-brand-soft dark:hover:bg-[#3cffd0]/20 transition-all active:scale-95 border border-brand/20 dark:border-[#3cffd0]/30 shadow-2xs"
              title="Input Transaksi Pakai Suara"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Input Suara</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="text-2xl font-bold text-ink-subtle">Rp</span>
          <input
            id="tx-amount-input"
            name="amount"
            type="text"
            inputMode="numeric"
            value={amountDisplay}
            onChange={handleAmountChange}
            placeholder="0"
            required
            className="w-full text-4xl font-bold text-ink text-center tracking-[-1px] outline-none placeholder:text-ink-subtle"
          />
        </div>
        {fieldError === 'amount' && !parseRawAmount(amountDisplay) && (
          <p className="text-center text-[11px] font-semibold text-negative mt-1">
            Masukkan nominal lebih dari nol
          </p>
        )}
      </div>

      {/* Form Fields Card */}
      <div className="bg-surface rounded-[16px] p-5 border border-hairline shadow-whisper space-y-4">
        <div ref={dropdownAreaRef} className="space-y-4">
          {/* Source Account Popup Dropdown */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5 h-4">
              <span
                id="tx-source-account-label"
                className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted leading-4"
              >
                {type === 'transfer' ? 'Dari Akun' : 'Akun'}
              </span>
              {fieldError === 'source' && !selectedSourceAccount && (
                <span className="text-[11px] font-semibold text-negative leading-none">
                  Pilih rekening terlebih dahulu
                </span>
              )}
            </div>

            <button
              ref={sourceTriggerRef}
              type="button"
              aria-labelledby="tx-source-account-label"
              aria-expanded={activeDropdown === 'source'}
              aria-haspopup="listbox"
              onClick={() => toggleDropdown('source')}
              className={`w-full min-h-[42px] px-3.5 py-2 rounded-[12px] bg-canvas border text-sm font-medium text-ink flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-brand ${
                activeDropdown === 'source'
                  ? 'border-brand ring-2 ring-brand/15'
                  : fieldError === 'source'
                  ? 'border-negative ring-2 ring-negative/15'
                  : 'border-hairline hover:border-brand'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {selectedSourceAccount ? (
                  <>
                    <AccountAvatar acc={selectedSourceAccount} size="sm" />
                    <span className="truncate font-semibold">{selectedSourceAccount.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-sunken text-ink-muted font-semibold shrink-0">
                      {ACCOUNT_TYPE_LABELS[selectedSourceAccount.type] || selectedSourceAccount.type}
                    </span>
                  </>
                ) : (
                  <span className="truncate text-ink">
                    Pilih Akun Rekening / Dompet
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedSourceAccount && (
                  <span className="text-xs font-bold tabular-nums text-ink-muted">
                    {formatCurrency(selectedSourceAccount.balance)}
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-150 ${
                    activeDropdown === 'source' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {activeDropdown === 'source' && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[14px] bg-surface border border-hairline shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <AccountPickerList
                  ariaLabel="Pilih Akun Rekening / Dompet"
                  accounts={accounts}
                  selectedId={sourceAccountId}
                  onSelect={(acc) => {
                    setSourceAccountId(acc.id);
                    if (destinationAccountId === acc.id) {
                      setDestinationAccountId('');
                    }
                    setFieldError(null);
                    setActiveDropdown(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* Destination Account for Transfer vs Category for Expense/Income (Zero Layout Shift min-h-[66px]) */}
          <div className="min-h-[66px]">
            {type === 'transfer' ? (
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5 h-5">
                  <span
                    id="tx-destination-account-label"
                    className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted leading-none"
                  >
                    Ke Akun Tujuan
                  </span>
                  {fieldError === 'destination' && !selectedDestinationAccount && (
                    <span className="text-[11px] font-semibold text-negative leading-none">
                      Pilih akun tujuan terlebih dahulu
                    </span>
                  )}
                </div>

                <button
                  ref={destinationTriggerRef}
                  type="button"
                  aria-labelledby="tx-destination-account-label"
                  aria-expanded={activeDropdown === 'destination'}
                  aria-haspopup="listbox"
                  onClick={() => toggleDropdown('destination')}
                  className={`w-full min-h-[42px] px-3.5 py-2 rounded-[12px] bg-canvas border text-sm font-medium text-ink flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-brand ${
                    activeDropdown === 'destination'
                      ? 'border-brand ring-2 ring-brand/15'
                      : fieldError === 'destination'
                      ? 'border-negative ring-2 ring-negative/15'
                      : 'border-hairline hover:border-brand'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedDestinationAccount ? (
                      <>
                        <AccountAvatar acc={selectedDestinationAccount} size="sm" />
                        <span className="truncate font-semibold">
                          {selectedDestinationAccount.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-sunken text-ink-muted font-semibold shrink-0">
                          {ACCOUNT_TYPE_LABELS[selectedDestinationAccount.type] ||
                            selectedDestinationAccount.type}
                        </span>
                      </>
                    ) : (
                      <span className="truncate text-ink">
                        Pilih Akun Tujuan
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedDestinationAccount && (
                      <span className="text-xs font-bold tabular-nums text-ink-muted">
                        {formatCurrency(selectedDestinationAccount.balance)}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-150 ${
                        activeDropdown === 'destination' ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {activeDropdown === 'destination' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[14px] bg-surface border border-hairline shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <AccountPickerList
                      ariaLabel="Pilih Akun Tujuan"
                      accounts={availableDestinationAccounts}
                      selectedId={destinationAccountId}
                      onSelect={(acc) => {
                        setDestinationAccountId(acc.id);
                        setFieldError(null);
                        setActiveDropdown(null);
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5 h-5">
                  <span
                    id="tx-category-label"
                    className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted leading-none"
                  >
                    Kategori
                  </span>
                  {selectedCategory ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-surface-sunken text-[11px] font-semibold text-ink">
                      <CategoryIcon
                        name={selectedCategory.name}
                        type={type}
                        icon={selectedCategory.icon}
                        emoji={selectedCategory.emoji}
                        size="sm"
                      />
                      <span>{selectedCategory.name}</span>
                    </div>
                  ) : fieldError === 'category' ? (
                    <span className="text-[11px] font-semibold text-negative leading-none">
                      Pilih kategori terlebih dahulu
                    </span>
                  ) : null}
                </div>

                <button
                  ref={categoryTriggerRef}
                  type="button"
                  aria-labelledby="tx-category-label"
                  aria-expanded={activeDropdown === 'category'}
                  aria-haspopup="listbox"
                  onClick={() => toggleDropdown('category')}
                  className={`w-full min-h-[42px] px-3.5 py-2.5 rounded-[12px] bg-canvas border text-sm font-medium text-ink flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-brand ${
                    activeDropdown === 'category'
                      ? 'border-brand ring-2 ring-brand/15'
                      : fieldError === 'category'
                      ? 'border-negative ring-2 ring-negative/15'
                      : 'border-hairline hover:border-brand'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedCategory ? (
                      <>
                        <CategoryIcon
                          name={selectedCategory.name}
                          type={type}
                          icon={selectedCategory.icon}
                          emoji={selectedCategory.emoji}
                          size="sm"
                        />
                        <span className="truncate font-semibold">{selectedCategory.name}</span>
                      </>
                    ) : (
                      <span className="truncate text-ink">
                        Pilih Kategori Transaksi
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-150 ${
                      activeDropdown === 'category' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeDropdown === 'category' && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[14px] bg-surface border border-hairline shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <CategoryPickerList
                      ariaLabel="Pilih Kategori Transaksi"
                      categories={filteredCategories}
                      selectedId={categoryId}
                      type={type}
                      onSelect={(cat) => {
                        setCategoryId(cat.id);
                        setFieldError(null);
                        setActiveDropdown(null);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label
            htmlFor="tx-date-input"
            className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1.5 h-4 leading-4"
          >
            Tanggal
          </label>
          <input
            id="tx-date-input"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-canvas border border-hairline text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
          />
        </div>

        {/* Notes Input */}
        <div>
          <label
            htmlFor="tx-notes-input"
            className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1.5 h-4 leading-4"
          >
            Catatan <span className="text-ink-subtle font-normal lowercase">(opsional)</span>
          </label>
          <textarea
            id="tx-notes-input"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Keterangan transaksi..."
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-canvas border border-hairline text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all resize-none placeholder:text-ink-subtle"
          />
        </div>
      </div>

      {/* Success Notification Banner - Kraken Semantic Green Badge */}
      {isSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 p-3 bg-positive/15 border border-positive/30 text-positive rounded-[10px] text-xs font-semibold animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-positive-bright shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Save as Template Option */}
      {onSaveAsTemplate && amountDisplay && sourceAccountId && (
        <div className="flex items-center justify-between p-2.5 rounded-[10px] bg-canvas border border-hairline/80">
          <div className="flex items-center gap-2 min-w-0">
            <BookmarkPlus className="w-4 h-4 text-brand-text shrink-0" />
            <span className="text-xs text-ink-muted truncate">
              Jadikan transaksi ini sebagai template cepat?
            </span>
          </div>
          <button
            type="button"
            onClick={handleSaveCurrentAsTemplate}
            className="px-2.5 py-1 rounded-[6px] bg-brand-soft text-brand-text text-xs font-bold transition-colors shrink-0"
          >
            {savedTemplateSuccess ? 'Tersimpan!' : 'Simpan Template'}
          </button>
        </div>
      )}

      {/* Primary Kraken Purple Submit Button (12px radius, 13px 16px padding) */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-kraken-primary text-sm tracking-tight shadow-whisper disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
      </button>
    </form>
  );
};
