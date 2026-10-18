import React, { useState, useEffect, useRef } from 'react';
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
  Check,
} from 'lucide-react';
import { CategoryIcon } from '../ui/CategoryIcon';
import { AccountAvatar } from '../ui/AccountAvatar';
import { resolveTemplateAccount, resolveTemplateCategory } from '../../services/templateService';

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
  }) => void;
  onSaveAsTemplate?: (data: Omit<QuickTemplate, 'id'>) => void;
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  bank: 'Bank',
  ewallet: 'E-Wallet',
  cash: 'Tunai',
  credit: 'Kredit',
};

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
    () => prefilledData?.date || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(() => prefilledData?.notes || '');
  const [isSuccess, setIsSuccess] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState<
    'source' | 'destination' | 'category' | null
  >(null);
  const [fieldError, setFieldError] = useState<'source' | 'destination' | 'category' | null>(null);

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
  useEffect(() => {
    if (!activeDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownAreaRef.current &&
        !dropdownAreaRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdown]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseRawAmount(amountDisplay);
    if (!rawAmount) return;

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

    if (type !== 'transfer' && !categoryId) {
      setFieldError('category');
      setActiveDropdown('category');
      categoryTriggerRef.current?.focus();
      return;
    }

    onSubmit({
      type,
      amount: rawAmount,
      sourceAccountId,
      destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
      categoryId: type !== 'transfer' ? categoryId : undefined,
      date,
      notes,
    });

    // Reset Form
    setAmountDisplay('');
    setNotes('');
    setFieldError(null);
    setActiveDropdown(null);
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
          <div className="flex items-center justify-between text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba]">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#7132f5] fill-current" />
              Pilih dari Template Favorit:
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white dark:bg-[#181a20] border border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5] dark:hover:border-[#7132f5] shadow-2xs text-xs font-semibold text-[#101114] dark:text-[#f3f4f8] shrink-0 transition-all active:scale-95"
              >
                <span>{tpl.emoji || '⚡'}</span>
                <span>{tpl.name}</span>
                <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba] font-normal tabular-nums">
                  ({formatNumberWithDots(String(tpl.amount))})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Type Toggle - Kraken Style Segmented Control */}
      <div className="grid grid-cols-3 p-1 bg-[#edeef3] dark:bg-[#232534] rounded-[12px] gap-1 border border-[#dedee5] dark:border-[#282937]">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setType('pengeluaran');
            setCategoryId('');
            setFieldError(null);
            setActiveDropdown(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] font-semibold text-xs tracking-tight transition-colors duration-150 ${
            type === 'pengeluaran'
              ? 'bg-[#101114] text-white shadow-micro'
              : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Keluar
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setType('transfer');
            setCategoryId('');
            setFieldError(null);
            setActiveDropdown(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] font-semibold text-xs tracking-tight transition-colors duration-150 ${
            type === 'transfer'
              ? 'bg-[#7132f5] text-white shadow-micro'
              : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Transfer
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setType('pemasukan');
            setCategoryId('');
            setFieldError(null);
            setActiveDropdown(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] font-semibold text-xs tracking-tight transition-colors duration-150 ${
            type === 'pemasukan'
              ? 'bg-[#149e61] text-white shadow-micro'
              : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          Masuk
        </button>
      </div>

      {/* Amount Card - Clean Display with Voice Input */}
      <div className="bg-white dark:bg-[#16171f] rounded-[16px] p-5 sm:p-6 border border-[#dedee5] dark:border-[#282937] shadow-whisper text-center">
        <div className="flex items-center justify-between min-h-[26px]">
          <label
            htmlFor="tx-amount-input"
            className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba]"
          >
            Nominal Transaksi
          </label>
          {onOpenVoiceModal && (
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#7132f5] dark:text-[#3cffd0] bg-[#7132f5]/10 dark:bg-[#3cffd0]/10 hover:bg-[#7132f5]/20 dark:hover:bg-[#3cffd0]/20 transition-all active:scale-95 border border-[#7132f5]/20 dark:border-[#3cffd0]/30 shadow-2xs"
              title="Input Transaksi Pakai Suara"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Input Suara</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="text-2xl font-bold text-[#9497a9]">Rp</span>
          <input
            id="tx-amount-input"
            name="amount"
            type="text"
            inputMode="numeric"
            value={amountDisplay}
            onChange={handleAmountChange}
            placeholder="0"
            required
            className="w-full text-4xl font-bold text-[#101114] dark:text-[#f3f4f8] text-center tracking-[-1px] outline-none placeholder:text-[#9497a9]"
          />
        </div>
      </div>

      {/* Form Fields Card */}
      <div className="bg-white dark:bg-[#16171f] rounded-[16px] p-5 border border-[#dedee5] dark:border-[#282937] shadow-whisper space-y-4">
        <div ref={dropdownAreaRef} className="space-y-4">
          {/* Source Account Popup Dropdown */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5 h-4">
              <span
                id="tx-source-account-label"
                className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] leading-4"
              >
                {type === 'transfer' ? 'Dari Akun' : 'Akun'}
              </span>
              {fieldError === 'source' && !selectedSourceAccount && (
                <span className="text-[11px] font-semibold text-[#c53030] dark:text-[#f87171] leading-none">
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
              className={`w-full min-h-[42px] px-3.5 py-2 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border text-sm font-medium text-[#101114] dark:text-[#f3f4f8] flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                activeDropdown === 'source'
                  ? 'border-[#7132f5] ring-2 ring-[#855bfb]/15'
                  : fieldError === 'source'
                  ? 'border-[#e53e3e] ring-2 ring-[#e53e3e]/15'
                  : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {selectedSourceAccount ? (
                  <>
                    <AccountAvatar acc={selectedSourceAccount} size="sm" />
                    <span className="truncate font-semibold">{selectedSourceAccount.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#edeef3] dark:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba] font-semibold shrink-0">
                      {ACCOUNT_TYPE_LABELS[selectedSourceAccount.type] || selectedSourceAccount.type}
                    </span>
                  </>
                ) : (
                  <span className="truncate text-[#101114] dark:text-[#f3f4f8]">
                    Pilih Akun Rekening / Dompet
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedSourceAccount && (
                  <span className="text-xs font-bold tabular-nums text-[#686b82] dark:text-[#9ca0ba]">
                    {formatCurrency(selectedSourceAccount.balance)}
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-[#686b82] dark:text-[#9ca0ba] shrink-0 transition-transform duration-150 ${
                    activeDropdown === 'source' ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {activeDropdown === 'source' && (
              <div
                role="listbox"
                aria-label="Pilih Akun Rekening / Dompet"
                className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[14px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="p-1.5 max-h-60 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
                  {accounts.map((acc) => {
                    const isSelected = sourceAccountId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setSourceAccountId(acc.id);
                          if (destinationAccountId === acc.id) {
                            setDestinationAccountId('');
                          }
                          setFieldError(null);
                          setActiveDropdown(null);
                        }}
                        className={`w-full min-h-[44px] px-3 py-2 rounded-[10px] text-left flex items-center justify-between gap-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                          isSelected
                            ? 'bg-[#7132f5] text-white font-bold'
                            : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AccountAvatar acc={acc} size="sm" />
                          <span className="truncate text-sm">{acc.name}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                              isSelected
                                ? 'bg-black/15 text-current'
                                : 'bg-[#edeef3] dark:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba]'
                            }`}
                          >
                            {ACCOUNT_TYPE_LABELS[acc.type] || acc.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs tabular-nums ${
                              isSelected
                                ? 'text-current font-bold'
                                : acc.balance < 0
                                ? 'text-[#c53030] dark:text-[#f87171] font-semibold'
                                : 'text-[#686b82] dark:text-[#9ca0ba] font-semibold'
                            }`}
                          >
                            {formatCurrency(acc.balance)}
                          </span>
                          {isSelected && <Check className="w-4 h-4 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
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
                    className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] leading-none"
                  >
                    Ke Akun Tujuan
                  </span>
                  {fieldError === 'destination' && !selectedDestinationAccount && (
                    <span className="text-[11px] font-semibold text-[#c53030] dark:text-[#f87171] leading-none">
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
                  className={`w-full min-h-[42px] px-3.5 py-2 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border text-sm font-medium text-[#101114] dark:text-[#f3f4f8] flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                    activeDropdown === 'destination'
                      ? 'border-[#7132f5] ring-2 ring-[#855bfb]/15'
                      : fieldError === 'destination'
                      ? 'border-[#e53e3e] ring-2 ring-[#e53e3e]/15'
                      : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedDestinationAccount ? (
                      <>
                        <AccountAvatar acc={selectedDestinationAccount} size="sm" />
                        <span className="truncate font-semibold">
                          {selectedDestinationAccount.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#edeef3] dark:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba] font-semibold shrink-0">
                          {ACCOUNT_TYPE_LABELS[selectedDestinationAccount.type] ||
                            selectedDestinationAccount.type}
                        </span>
                      </>
                    ) : (
                      <span className="truncate text-[#101114] dark:text-[#f3f4f8]">
                        Pilih Akun Tujuan
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedDestinationAccount && (
                      <span className="text-xs font-bold tabular-nums text-[#686b82] dark:text-[#9ca0ba]">
                        {formatCurrency(selectedDestinationAccount.balance)}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-[#686b82] dark:text-[#9ca0ba] shrink-0 transition-transform duration-150 ${
                        activeDropdown === 'destination' ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {activeDropdown === 'destination' && (
                  <div
                    role="listbox"
                    aria-label="Pilih Akun Tujuan"
                    className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[14px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="p-1.5 max-h-60 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
                      {availableDestinationAccounts.map((acc) => {
                        const isSelected = destinationAccountId === acc.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setDestinationAccountId(acc.id);
                              setFieldError(null);
                              setActiveDropdown(null);
                            }}
                            className={`w-full min-h-[44px] px-3 py-2 rounded-[10px] text-left flex items-center justify-between gap-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                              isSelected
                                ? 'bg-[#7132f5] text-white font-bold'
                                : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <AccountAvatar acc={acc} size="sm" />
                              <span className="truncate text-sm">{acc.name}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                                  isSelected
                                    ? 'bg-black/15 text-current'
                                    : 'bg-[#edeef3] dark:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba]'
                                }`}
                              >
                                {ACCOUNT_TYPE_LABELS[acc.type] || acc.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-xs tabular-nums ${
                                  isSelected
                                    ? 'text-current font-bold'
                                    : acc.balance < 0
                                    ? 'text-[#c53030] dark:text-[#f87171] font-semibold'
                                    : 'text-[#686b82] dark:text-[#9ca0ba] font-semibold'
                                }`}
                              >
                                {formatCurrency(acc.balance)}
                              </span>
                              {isSelected && <Check className="w-4 h-4 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5 h-5">
                  <span
                    id="tx-category-label"
                    className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] leading-none"
                  >
                    Kategori
                  </span>
                  {selectedCategory ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#edeef3] dark:bg-[#232534] text-[11px] font-semibold text-[#101114] dark:text-[#f3f4f8]">
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
                    <span className="text-[11px] font-semibold text-[#c53030] dark:text-[#f87171] leading-none">
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
                  className={`w-full min-h-[42px] px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border text-sm font-medium text-[#101114] dark:text-[#f3f4f8] flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                    activeDropdown === 'category'
                      ? 'border-[#7132f5] ring-2 ring-[#855bfb]/15'
                      : fieldError === 'category'
                      ? 'border-[#e53e3e] ring-2 ring-[#e53e3e]/15'
                      : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/60'
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
                      <span className="truncate text-[#101114] dark:text-[#f3f4f8]">
                        Pilih Kategori Transaksi
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#686b82] dark:text-[#9ca0ba] shrink-0 transition-transform duration-150 ${
                      activeDropdown === 'category' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeDropdown === 'category' && (
                  <div
                    role="listbox"
                    aria-label="Pilih Kategori Transaksi"
                    className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[14px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="p-1.5 max-h-60 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
                      {filteredCategories.map((cat) => {
                        const isSelected = categoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setCategoryId(cat.id);
                              setFieldError(null);
                              setActiveDropdown(null);
                            }}
                            className={`w-full min-h-[42px] px-3 py-2 rounded-[10px] text-left flex items-center justify-between gap-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                              isSelected
                                ? 'bg-[#7132f5] text-white font-bold'
                                : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-black/15 text-current'
                                    : 'bg-[#edeef3] dark:bg-[#232534]'
                                }`}
                              >
                                <CategoryIcon
                                  name={cat.name}
                                  type={type}
                                  icon={cat.icon}
                                  emoji={cat.emoji}
                                  size="sm"
                                  className={isSelected ? '!text-current' : ''}
                                />
                              </span>
                              <span className="truncate text-sm">{cat.name}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
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
            className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1.5 h-4 leading-4"
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
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-sm font-medium text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
          />
        </div>

        {/* Notes Input */}
        <div>
          <label
            htmlFor="tx-notes-input"
            className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1.5 h-4 leading-4"
          >
            Catatan <span className="text-[#9497a9] font-normal lowercase">(opsional)</span>
          </label>
          <textarea
            id="tx-notes-input"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Keterangan transaksi..."
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-sm text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all resize-none placeholder:text-[#9497a9]"
          />
        </div>
      </div>

      {/* Success Notification Banner - Kraken Semantic Green Badge */}
      {isSuccess && (
        <div className="flex items-center gap-2 p-3 bg-[#149e61]/15 border border-[#149e61]/30 text-[#026b3f] rounded-[10px] text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#149e61] shrink-0" />
          <span>Transaksi berhasil disimpan!</span>
        </div>
      )}

      {/* Save as Template Option */}
      {onSaveAsTemplate && amountDisplay && sourceAccountId && (
        <div className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#fafbfe] dark:bg-[#16171f] border border-[#dedee5]/80 dark:border-[#282937]">
          <div className="flex items-center gap-2 min-w-0">
            <BookmarkPlus className="w-4 h-4 text-[#7132f5] shrink-0" />
            <span className="text-xs text-[#686b82] dark:text-[#9ca0ba] truncate">
              Jadikan transaksi ini sebagai template cepat?
            </span>
          </div>
          <button
            type="button"
            onClick={handleSaveCurrentAsTemplate}
            className="px-2.5 py-1 rounded-[6px] bg-[#7132f5]/10 hover:bg-[#7132f5]/20 text-[#7132f5] dark:text-[#a78bfa] text-xs font-bold transition-colors shrink-0"
          >
            {savedTemplateSuccess ? 'Tersimpan!' : 'Simpan Template'}
          </button>
        </div>
      )}

      {/* Primary Kraken Purple Submit Button (12px radius, 13px 16px padding) */}
      <button
        type="submit"
        className="w-full btn-kraken-primary text-sm tracking-tight shadow-whisper"
      >
        Simpan Transaksi
      </button>
    </form>
  );
};
