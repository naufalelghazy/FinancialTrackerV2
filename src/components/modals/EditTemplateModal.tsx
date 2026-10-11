import React, { useState, useEffect } from 'react';
import { X, Trash2, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Check, Zap } from 'lucide-react';
import type { Account, Category, QuickTemplate, TransactionType } from '../../types';
import { formatNumberWithDots, parseRawAmount } from '../../lib/formatters';

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

export const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  isOpen,
  template,
  accounts,
  categories,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(template);

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('pengeluaran');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('⚡');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (template) {
      setName(template.name);
      setType(template.type);
      setAmountDisplay(formatNumberWithDots(String(template.amount)));
      setSourceAccountId(template.sourceAccountId || (accounts[0]?.id || ''));
      setDestinationAccountId(template.destinationAccountId || '');
      setCategoryId(template.categoryId || '');
      setNotes(template.notes || '');
      setSelectedEmoji(template.emoji || '⚡');
      setConfirmDelete(false);
      setErrorMsg('');
    } else {
      setName('');
      setType('pengeluaran');
      setAmountDisplay('');
      setSourceAccountId(accounts[0]?.id || '');
      setDestinationAccountId(accounts[1]?.id || '');
      const firstExpenseCat = categories.find((c) => c.type === 'pengeluaran');
      setCategoryId(firstExpenseCat?.id || '');
      setNotes('');
      setSelectedEmoji('⚡');
      setConfirmDelete(false);
      setErrorMsg('');
    }
  }, [template, isOpen, accounts, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

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
      return;
    }
    if (type === 'transfer' && !destinationAccountId) {
      setErrorMsg('Pilih akun tujuan untuk transfer');
      return;
    }
    if (type !== 'transfer' && !categoryId) {
      setErrorMsg('Pilih kategori');
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
            <label className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1.5">
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-3 p-1 bg-[#edeef3] dark:bg-[#232534] rounded-[12px] gap-1 border border-[#dedee5] dark:border-[#282937]">
              <button
                type="button"
                onClick={() => {
                  setType('pengeluaran');
                  const first = categories.find((c) => c.type === 'pengeluaran');
                  setCategoryId(first?.id || '');
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
              <label className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1">
                Nama Template
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Kopi Pagi, Makan Siang"
                className="w-full px-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border border-[#dedee5] dark:border-[#282937] text-sm font-medium focus:outline-none focus:border-[#7132f5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1">
                Ikon Emoji
              </label>
              <input
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
            <label className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1">
              Nominal Default (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-[#686b82] dark:text-[#9ca0ba]">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => setAmountDisplay(formatNumberWithDots(e.target.value))}
                placeholder="0"
                className="w-full pl-9 pr-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border border-[#dedee5] dark:border-[#282937] text-sm font-bold tracking-tight focus:outline-none focus:border-[#7132f5]"
              />
            </div>
          </div>

          {/* Akun Sumber & Tujuan/Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1">
                Akun Sumber
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border border-[#dedee5] dark:border-[#282937] text-xs font-semibold focus:outline-none focus:border-[#7132f5]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1">
                  Akun Tujuan
                </label>
                <select
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border border-[#dedee5] dark:border-[#282937] text-xs font-semibold focus:outline-none focus:border-[#7132f5]"
                >
                  <option value="">-- Pilih Akun Tujuan --</option>
                  {accounts
                    .filter((a) => a.id !== sourceAccountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1">
                  Kategori
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] bg-[#fafbfe] dark:bg-[#12141a] border border-[#dedee5] dark:border-[#282937] text-xs font-semibold focus:outline-none focus:border-[#7132f5]"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Catatan Opsional */}
          <div>
            <label className="block text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] mb-1">
              Catatan (Opsional)
            </label>
            <input
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
