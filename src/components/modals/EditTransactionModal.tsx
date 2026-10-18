import React, { useState, useEffect, useRef } from 'react';
import type { Transaction, Account, Category, TransactionType } from '../../types';
import { formatCurrency, formatNumberInput, parseNumberInput } from '../../lib/formatters';
import { X, Trash2, AlertTriangle, ChevronDown, Check } from 'lucide-react';
import { CategoryIcon } from '../ui/CategoryIcon';
import { AccountAvatar } from '../ui/AccountAvatar';

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSave: (updated: {
    id: string;
    amount: number;
    type: TransactionType;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface EditModalContentProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSave: (updated: {
    id: string;
    amount: number;
    type: TransactionType;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  bank: 'Bank',
  ewallet: 'E-Wallet',
  cash: 'Tunai',
  credit: 'Kredit',
};

const EditModalContent: React.FC<EditModalContentProps> = ({
  transaction,
  accounts,
  categories,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [amountDisplay, setAmountDisplay] = useState(() =>
    formatNumberInput(transaction.amount.toString())
  );
  const [sourceAccountId, setSourceAccountId] = useState(transaction.sourceAccountId);
  const [destinationAccountId, setDestinationAccountId] = useState(
    transaction.destinationAccountId || ''
  );
  const [categoryId, setCategoryId] = useState(transaction.categoryId || '');
  const [date, setDate] = useState(transaction.date);
  const [notes, setNotes] = useState(transaction.notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<
    'source' | 'destination' | 'category' | null
  >(null);

  const dropdownAreaRef = useRef<HTMLDivElement>(null);

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

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedSourceAccount = accounts.find((a) => a.id === sourceAccountId);
  const selectedDestinationAccount = accounts.find((a) => a.id === destinationAccountId);
  const availableDestinationAccounts = accounts.filter((a) => a.id !== sourceAccountId);
  const filteredCategories = categories.filter((cat) =>
    type === 'pemasukan' ? cat.type === 'pemasukan' : cat.type === 'pengeluaran'
  );

  const toggleDropdown = (menu: 'source' | 'destination' | 'category') => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numericAmount = parseNumberInput(amountDisplay);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari 0.');
      return;
    }

    if (!sourceAccountId) {
      setErrorMsg('Pilih rekening transaksi.');
      setActiveDropdown('source');
      return;
    }

    if (type === 'transfer' && !destinationAccountId) {
      setErrorMsg('Pilih rekening tujuan transfer.');
      setActiveDropdown('destination');
      return;
    }

    if (type === 'transfer' && sourceAccountId === destinationAccountId) {
      setErrorMsg('Rekening asal dan tujuan tidak boleh sama.');
      return;
    }

    if (type !== 'transfer' && !categoryId) {
      setErrorMsg('Pilih kategori transaksi.');
      setActiveDropdown('category');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: transaction.id,
        amount: numericAmount,
        type,
        sourceAccountId,
        destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
        categoryId: type !== 'transfer' ? categoryId : undefined,
        date,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan transaksi.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    setErrorMsg('');
    try {
      await onDelete(transaction.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus transaksi.';
      setErrorMsg(msg);
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white dark:bg-[#16171f] rounded-[16px] w-full max-w-sm overflow-hidden shadow-whisper border border-[#dedee5] dark:border-[#282937] max-h-[90vh] flex flex-col transition-colors duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#dedee5] dark:border-[#282937] shrink-0">
          <div className="flex items-center gap-2.5">
            <CategoryIcon
              name={type === 'transfer' ? 'Pindah Akun' : selectedCategory?.name}
              type={type}
              icon={type === 'transfer' ? undefined : selectedCategory?.icon}
              emoji={type === 'transfer' ? undefined : selectedCategory?.emoji}
              size="md"
            />
            <div>
              <h2 className="font-bold text-base text-[#101114] dark:text-[#f3f4f8] tracking-[-0.5px]">
                Edit Transaksi
              </h2>
              <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                Perbarui rincian transaksi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-[10px] bg-[#e53e3e]/10 border border-[#e53e3e]/20 text-[#e53e3e] text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Segmented Type Selector */}
          <div className="flex bg-[#edeef3] dark:bg-[#232534] p-1 rounded-[12px] gap-1">
            <button
              type="button"
              onClick={() => {
                setType('pengeluaran');
                setCategoryId('');
                setActiveDropdown(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[9px] transition-all ${
                type === 'pengeluaran'
                  ? 'bg-white dark:bg-[#252836] text-[#101114] dark:text-[#f3f4f8] shadow-sm'
                  : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
              }`}
            >
              Keluar
            </button>
            <button
              type="button"
              onClick={() => {
                setType('pemasukan');
                setCategoryId('');
                setActiveDropdown(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[9px] transition-all ${
                type === 'pemasukan'
                  ? 'bg-[#149e61] text-white shadow-sm'
                  : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setType('transfer');
                setCategoryId('');
                setActiveDropdown(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[9px] transition-all ${
                type === 'transfer'
                  ? 'bg-[#7132f5] text-white shadow-sm'
                  : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
              }`}
            >
              Transfer
            </button>
          </div>

          {/* Nominal Field */}
          <div>
            <label
              htmlFor="edit-tx-amount"
              className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1"
            >
              Nominal (Rp)
            </label>
            <input
              id="edit-tx-amount"
              name="amount"
              type="text"
              inputMode="numeric"
              required
              value={amountDisplay}
              onChange={(e) => setAmountDisplay(formatNumberInput(e.target.value))}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-lg font-bold text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
            />
          </div>

          {/* Date Field */}
          <div>
            <label
              htmlFor="edit-tx-date"
              className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1"
            >
              Tanggal
            </label>
            <input
              id="edit-tx-date"
              name="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-sm font-medium text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
            />
          </div>

          <div ref={dropdownAreaRef} className="space-y-4">
            {/* Source Account Popup Dropdown */}
            <div className="relative">
              <span
                id="edit-tx-source-label"
                className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1"
              >
                {type === 'transfer' ? 'Dari Rekening' : 'Rekening / Dompet'}
              </span>
              <button
                type="button"
                aria-labelledby="edit-tx-source-label"
                aria-expanded={activeDropdown === 'source'}
                aria-haspopup="listbox"
                onClick={() => toggleDropdown('source')}
                className={`w-full min-h-[42px] px-3.5 py-2 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border text-sm font-medium text-[#101114] dark:text-[#f3f4f8] flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                  activeDropdown === 'source'
                    ? 'border-[#7132f5] ring-2 ring-[#855bfb]/15'
                    : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedSourceAccount ? (
                    <>
                      <AccountAvatar acc={selectedSourceAccount} size="sm" />
                      <span className="truncate font-semibold">{selectedSourceAccount.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#edeef3] dark:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba] font-semibold shrink-0">
                        {ACCOUNT_TYPE_LABELS[selectedSourceAccount.type] ||
                          selectedSourceAccount.type}
                      </span>
                    </>
                  ) : (
                    <span className="truncate text-[#101114] dark:text-[#f3f4f8]">
                      Pilih Rekening
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
                  aria-label="Pilih Rekening"
                  className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[14px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="p-1.5 max-h-52 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
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
                            setActiveDropdown(null);
                          }}
                          className={`w-full min-h-[42px] px-3 py-2 rounded-[10px] text-left flex items-center justify-between gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                            isSelected
                              ? 'bg-[#7132f5] text-white font-bold'
                              : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <AccountAvatar acc={acc} size="sm" />
                            <span className="truncate text-xs sm:text-sm">{acc.name}</span>
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

            {/* Destination Account (if transfer) OR Category Popup Dropdown */}
            {type === 'transfer' ? (
              <div className="relative">
                <span
                  id="edit-tx-dest-label"
                  className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1"
                >
                  Rekening Tujuan
                </span>
                <button
                  type="button"
                  aria-labelledby="edit-tx-dest-label"
                  aria-expanded={activeDropdown === 'destination'}
                  aria-haspopup="listbox"
                  onClick={() => toggleDropdown('destination')}
                  className={`w-full min-h-[42px] px-3.5 py-2 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border text-sm font-medium text-[#101114] dark:text-[#f3f4f8] flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                    activeDropdown === 'destination'
                      ? 'border-[#7132f5] ring-2 ring-[#855bfb]/15'
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
                        Pilih Rekening Tujuan
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
                    aria-label="Pilih Rekening Tujuan"
                    className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[14px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="p-1.5 max-h-52 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
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
                              setActiveDropdown(null);
                            }}
                            className={`w-full min-h-[42px] px-3 py-2 rounded-[10px] text-left flex items-center justify-between gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                              isSelected
                                ? 'bg-[#7132f5] text-white font-bold'
                                : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <AccountAvatar acc={acc} size="sm" />
                              <span className="truncate text-xs sm:text-sm">{acc.name}</span>
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
                <div className="flex items-center justify-between mb-1">
                  <span
                    id="edit-tx-category-label"
                    className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba]"
                  >
                    Kategori
                  </span>
                  {selectedCategory && (
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
                  )}
                </div>
                <button
                  type="button"
                  aria-labelledby="edit-tx-category-label"
                  aria-expanded={activeDropdown === 'category'}
                  aria-haspopup="listbox"
                  onClick={() => toggleDropdown('category')}
                  className={`w-full min-h-[42px] px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border text-sm font-medium text-[#101114] dark:text-[#f3f4f8] flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                    activeDropdown === 'category'
                      ? 'border-[#7132f5] ring-2 ring-[#855bfb]/15'
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
                        Pilih Kategori
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
                    aria-label="Pilih Kategori"
                    className="absolute left-0 right-0 bottom-full mb-1.5 z-30 rounded-[14px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="p-1.5 max-h-52 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
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
                              <span className="truncate text-xs sm:text-sm">{cat.name}</span>
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

          {/* Notes */}
          <div>
            <label
              htmlFor="edit-tx-notes"
              className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1"
            >
              Catatan
            </label>
            <input
              id="edit-tx-notes"
              name="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Beli bensin, bayar listrik..."
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-sm font-medium text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-[12px] bg-[#7132f5] hover:bg-[#5741d8] active:bg-[#5b1ecf] text-white font-bold text-sm shadow-whisper transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`w-full py-2.5 rounded-[12px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                confirmDelete
                  ? 'bg-[#e53e3e] text-white'
                  : 'bg-transparent text-[#e53e3e] hover:bg-[#e53e3e]/10'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {confirmDelete ? 'Konfirmasi Hapus Transaksi Ini?' : 'Hapus Transaksi'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  transaction,
  accounts,
  categories,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <EditModalContent
      key={transaction.id}
      transaction={transaction}
      accounts={accounts}
      categories={categories}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
};
