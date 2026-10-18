import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Check,
  Zap,
  ChevronDown,
} from 'lucide-react';
import type { Account, Category, QuickTemplate, TransactionType } from '../../types';
import { formatCurrency, formatNumberWithDots, parseRawAmount } from '../../lib/formatters';
import { CategoryIcon } from '../ui/CategoryIcon';
import { AccountAvatar } from '../ui/AccountAvatar';

interface EditTemplateModalProps {
  isOpen: boolean;
  template: QuickTemplate | null;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSave: (data: Omit<QuickTemplate, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const PRESET_EMOJIS = [
  '🍔', '☕', '⛽', '🔄', '💵', '🛒', '🍱', '🍜', '🛵', '🚗',
  '💡', '📶', '📱', '👕', '🎮', '📺', '🏥', '💳', '🎁', '💰',
];

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  bank: 'Bank',
  ewallet: 'E-Wallet',
  cash: 'Tunai',
  credit: 'Kredit',
};

const EditTemplateModalContent: React.FC<Omit<EditTemplateModalProps, 'isOpen'>> = ({
  template,
  accounts,
  categories,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(template);
  const firstExpenseCat = categories.find((c) => c.type === 'pengeluaran');

  const [name, setName] = useState(() => template?.name || '');
  const [type, setType] = useState<TransactionType>(() => template?.type || 'pengeluaran');
  const [amountDisplay, setAmountDisplay] = useState(() =>
    template ? formatNumberWithDots(String(template.amount)) : ''
  );
  const [sourceAccountId, setSourceAccountId] = useState(
    () => template?.sourceAccountId || accounts[0]?.id || ''
  );
  const [destinationAccountId, setDestinationAccountId] = useState(
    () => template?.destinationAccountId || accounts[1]?.id || ''
  );
  const [categoryId, setCategoryId] = useState(
    () => template?.categoryId || firstExpenseCat?.id || ''
  );
  const [notes, setNotes] = useState(() => template?.notes || '');
  const [selectedEmoji, setSelectedEmoji] = useState(() => template?.emoji || '⚡');
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

  const filteredCategories = categories.filter((c) => c.type === type);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedSourceAccount = accounts.find((a) => a.id === sourceAccountId);
  const selectedDestinationAccount = accounts.find((a) => a.id === destinationAccountId);
  const availableDestinationAccounts = accounts.filter((a) => a.id !== sourceAccountId);

  const toggleDropdown = (menu: 'source' | 'destination' | 'category') => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama template tidak boleh kosong');
      return;
    }
    const rawAmount = parseRawAmount(amountDisplay);
    if (!rawAmount || rawAmount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari 0');
      return;
    }
    if (!sourceAccountId) {
      setErrorMsg('Pilih akun sumber');
      setActiveDropdown('source');
      return;
    }
    if (type === 'transfer' && !destinationAccountId) {
      setErrorMsg('Pilih akun tujuan untuk transfer');
      setActiveDropdown('destination');
      return;
    }
    if (type !== 'transfer' && !categoryId) {
      setErrorMsg('Pilih kategori');
      setActiveDropdown('category');
      return;
    }

    onSave({
      id: template?.id,
      name: name.trim(),
      type,
      amount: rawAmount,
      sourceAccountId,
      destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
      categoryId: type !== 'transfer' ? categoryId : undefined,
      notes: notes.trim(),
      emoji: selectedEmoji,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#181a20] rounded-[20px] max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#dedee5] dark:border-[#282937] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#dedee5] dark:border-[#282937]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-[#7132f5]/10 text-[#7132f5] flex items-center justify-center font-bold text-sm">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#101114] dark:text-[#f3f4f8]">
                {isEditing ? 'Edit Template Transaksi' : 'Tambah Template Baru'}
              </h3>
              <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                Pintasan untuk mencatat transaksi harian dalam 1-klik
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal template"
            className="p-1.5 rounded-full hover:bg-[#edeef3] dark:hover:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-[10px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Tipe Transaksi */}
          <div>
            <span className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1.5">
              Tipe Transaksi
            </span>
            <div className="grid grid-cols-3 p-1 bg-[#edeef3] dark:bg-[#232534] rounded-[12px] gap-1 border border-[#dedee5] dark:border-[#282937]">
              <button
                type="button"
                onClick={() => {
                  setType('pengeluaran');
                  const first = categories.find((c) => c.type === 'pengeluaran');
                  setCategoryId(first?.id || '');
                  setActiveDropdown(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-[10px] font-semibold text-xs transition-colors ${
                  type === 'pengeluaran'
                    ? 'bg-[#101114] text-white shadow-micro'
                    : 'text-[#686b82] dark:text-[#9ca0ba]'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Keluar
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('transfer');
                  setCategoryId('');
                  setActiveDropdown(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-[10px] font-semibold text-xs transition-colors ${
                  type === 'transfer'
                    ? 'bg-[#7132f5] text-white shadow-micro'
                    : 'text-[#686b82] dark:text-[#9ca0ba]'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Transfer
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('pemasukan');
                  const first = categories.find((c) => c.type === 'pemasukan');
                  setCategoryId(first?.id || '');
                  setActiveDropdown(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-[10px] font-semibold text-xs transition-colors ${
                  type === 'pemasukan'
                    ? 'bg-[#149e61] text-white shadow-micro'
                    : 'text-[#686b82] dark:text-[#9ca0ba]'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Masuk
              </button>
            </div>
          </div>

          {/* Nama Template & Emoji */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label
                htmlFor="tpl-name-input"
                className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1"
              >
                Nama Template
              </label>
              <input
                id="tpl-name-input"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kopi Pagi, Makan Siang"
                className="w-full px-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border border-[#dedee5] dark:border-[#282937] text-sm font-medium focus:outline-none focus:border-[#7132f5]"
              />
            </div>
            <div>
              <label
                htmlFor="tpl-emoji-input"
                className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1"
              >
                Ikon Emoji
              </label>
              <input
                id="tpl-emoji-input"
                name="emoji"
                type="text"
                value={selectedEmoji}
                onChange={(e) => setSelectedEmoji(e.target.value)}
                className="w-full px-3 py-2 text-center rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border border-[#dedee5] dark:border-[#282937] text-lg font-medium focus:outline-none focus:border-[#7132f5]"
              />
            </div>
          </div>

          {/* Preset Emojis */}
          <div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5">
              {PRESET_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setSelectedEmoji(em)}
                  className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-sm shrink-0 transition-transform ${
                    selectedEmoji === em
                      ? 'bg-[#7132f5]/20 ring-2 ring-[#7132f5] scale-110'
                      : 'hover:bg-[#edeef3] dark:hover:bg-[#232534]'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Nominal */}
          <div>
            <label
              htmlFor="tpl-amount-input"
              className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1"
            >
              Nominal Default (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-[#686b82] dark:text-[#9ca0ba]">
                Rp
              </span>
              <input
                id="tpl-amount-input"
                name="amount"
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => setAmountDisplay(formatNumberWithDots(e.target.value))}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border border-[#dedee5] dark:border-[#282937] text-sm font-bold tracking-tight focus:outline-none focus:border-[#7132f5]"
              />
            </div>
          </div>

          {/* Akun Sumber & Tujuan/Kategori Popup Dropdowns */}
          <div ref={dropdownAreaRef} className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Source Account Dropdown */}
            <div className="relative">
              <span
                id="tpl-source-label"
                className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1"
              >
                Akun Sumber
              </span>
              <button
                type="button"
                aria-labelledby="tpl-source-label"
                aria-expanded={activeDropdown === 'source'}
                aria-haspopup="listbox"
                onClick={() => toggleDropdown('source')}
                className={`w-full min-h-[42px] px-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border text-xs font-semibold text-[#101114] dark:text-[#f3f4f8] flex items-center justify-between gap-2 transition-all focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                  activeDropdown === 'source'
                    ? 'border-[#7132f5] ring-2 ring-[#7132f5]/15'
                    : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {selectedSourceAccount ? (
                    <>
                      <AccountAvatar acc={selectedSourceAccount} size="sm" />
                      <span className="truncate">{selectedSourceAccount.name}</span>
                    </>
                  ) : (
                    <span className="truncate">Pilih Akun Sumber</span>
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#686b82] dark:text-[#9ca0ba] shrink-0 transition-transform duration-150 ${
                    activeDropdown === 'source' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {activeDropdown === 'source' && (
                <div
                  role="listbox"
                  aria-label="Pilih Akun Sumber"
                  className="absolute left-0 right-0 bottom-full mb-1.5 z-30 rounded-[12px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="p-1.5 max-h-48 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
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
                          className={`w-full min-h-[40px] px-2.5 py-1.5 rounded-[8px] text-left flex items-center justify-between gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                            isSelected
                              ? 'bg-[#7132f5] text-white font-bold'
                              : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <AccountAvatar acc={acc} size="sm" />
                            <span className="truncate text-xs">{acc.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                                isSelected
                                  ? 'bg-black/15 text-current'
                                  : 'bg-[#edeef3] dark:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba]'
                              }`}
                            >
                              {ACCOUNT_TYPE_LABELS[acc.type] || acc.type}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Destination Account OR Category Dropdown */}
            {type === 'transfer' ? (
              <div className="relative">
                <span
                  id="tpl-dest-label"
                  className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1"
                >
                  Akun Tujuan
                </span>
                <button
                  type="button"
                  aria-labelledby="tpl-dest-label"
                  aria-expanded={activeDropdown === 'destination'}
                  aria-haspopup="listbox"
                  onClick={() => toggleDropdown('destination')}
                  className={`w-full min-h-[42px] px-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border text-xs font-semibold text-[#101114] dark:text-[#f3f4f8] flex items-center justify-between gap-2 transition-all focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                    activeDropdown === 'destination'
                      ? 'border-[#7132f5] ring-2 ring-[#7132f5]/15'
                      : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {selectedDestinationAccount ? (
                      <>
                        <AccountAvatar acc={selectedDestinationAccount} size="sm" />
                        <span className="truncate">{selectedDestinationAccount.name}</span>
                      </>
                    ) : (
                      <span className="truncate">Pilih Akun Tujuan</span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#686b82] dark:text-[#9ca0ba] shrink-0 transition-transform duration-150 ${
                      activeDropdown === 'destination' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeDropdown === 'destination' && (
                  <div
                    role="listbox"
                    aria-label="Pilih Akun Tujuan"
                    className="absolute left-0 right-0 bottom-full mb-1.5 z-30 rounded-[12px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="p-1.5 max-h-48 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
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
                            className={`w-full min-h-[40px] px-2.5 py-1.5 rounded-[8px] text-left flex items-center justify-between gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                              isSelected
                                ? 'bg-[#7132f5] text-white font-bold'
                                : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-semibold'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <AccountAvatar acc={acc} size="sm" />
                              <span className="truncate text-xs">{acc.name}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                                  isSelected
                                    ? 'bg-black/15 text-current'
                                    : 'bg-[#edeef3] dark:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba]'
                                }`}
                              >
                                {formatCurrency(acc.balance)}
                              </span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <span
                  id="tpl-category-label"
                  className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1"
                >
                  Kategori
                </span>
                <button
                  type="button"
                  aria-labelledby="tpl-category-label"
                  aria-expanded={activeDropdown === 'category'}
                  aria-haspopup="listbox"
                  onClick={() => toggleDropdown('category')}
                  className={`w-full min-h-[42px] px-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border text-xs font-semibold text-[#101114] dark:text-[#f3f4f8] flex items-center justify-between gap-2 transition-all focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                    activeDropdown === 'category'
                      ? 'border-[#7132f5] ring-2 ring-[#7132f5]/15'
                      : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {selectedCategory ? (
                      <>
                        <CategoryIcon
                          name={selectedCategory.name}
                          type={type}
                          icon={selectedCategory.icon}
                          emoji={selectedCategory.emoji}
                          size="sm"
                        />
                        <span className="truncate">{selectedCategory.name}</span>
                      </>
                    ) : (
                      <span className="truncate">Pilih Kategori</span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#686b82] dark:text-[#9ca0ba] shrink-0 transition-transform duration-150 ${
                      activeDropdown === 'category' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {activeDropdown === 'category' && (
                  <div
                    role="listbox"
                    aria-label="Pilih Kategori"
                    className="absolute left-0 right-0 bottom-full mb-1.5 z-30 rounded-[12px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="p-1.5 max-h-48 overflow-y-auto divide-y divide-[#dedee5]/40 dark:divide-[#282937]/50">
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
                            className={`w-full min-h-[40px] px-2.5 py-1.5 rounded-[8px] text-left flex items-center justify-between gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#7132f5] ${
                              isSelected
                                ? 'bg-[#7132f5] text-white font-bold'
                                : 'text-[#101114] dark:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] font-semibold'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 ${
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
                              <span className="truncate text-xs">{cat.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Catatan Opsional */}
          <div>
            <label
              htmlFor="tpl-notes-input"
              className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1"
            >
              Catatan (Opsional)
            </label>
            <input
              id="tpl-notes-input"
              name="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan saat template digunakan"
              className="w-full px-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border border-[#dedee5] dark:border-[#282937] text-xs font-medium focus:outline-none focus:border-[#7132f5]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#dedee5] dark:border-[#282937] flex items-center justify-between gap-3">
            {isEditing && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-red-500 font-bold">Hapus template ini?</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (template) {
                        onDelete(template.id);
                        onClose();
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-[8px] bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1.5 rounded-[8px] bg-[#edeef3] dark:bg-[#232534] text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba]"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[10px] bg-[#edeef3] dark:bg-[#232534] text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] hover:bg-[#e2e4ea] dark:hover:bg-[#2d3043] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#7132f5] hover:bg-[#5b1ecf] text-white text-xs font-bold transition-all shadow-micro"
              >
                <Check className="w-3.5 h-3.5" />
                {isEditing ? 'Simpan Perubahan' : 'Buat Template'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  isOpen,
  template,
  accounts,
  categories,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <EditTemplateModalContent
      key={template?.id || 'new-template'}
      template={template}
      accounts={accounts}
      categories={categories}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
};
