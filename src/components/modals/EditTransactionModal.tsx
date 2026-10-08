import React, { useState } from 'react';
import type { Transaction, Account, Category, TransactionType } from '../../types';
import { formatNumberInput, parseNumberInput } from '../../lib/formatters';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { CategoryIcon } from '../ui/CategoryIcon';

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

  const selectedCategory = categories.find((c) => c.id === categoryId);

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
      return;
    }

    if (type === 'transfer' && !destinationAccountId) {
      setErrorMsg('Pilih rekening tujuan transfer.');
      return;
    }

    if (type === 'transfer' && sourceAccountId === destinationAccountId) {
      setErrorMsg('Rekening asal dan tujuan tidak boleh sama.');
      return;
    }

    if (type !== 'transfer' && !categoryId) {
      setErrorMsg('Pilih kategori transaksi.');
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan transaksi.');
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus transaksi.');
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-[16px] w-full max-w-sm overflow-hidden shadow-whisper border border-[#dedee5] max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#dedee5] shrink-0">
          <div className="flex items-center gap-2.5">
            <CategoryIcon
              name={type === 'transfer' ? 'Pindah Akun' : selectedCategory?.name}
              type={type}
              size="md"
            />
            <div>
              <h2 className="font-bold text-base text-[#101114] tracking-[-0.5px]">
                Edit Transaksi
              </h2>
              <p className="text-[11px] text-[#686b82]">Perbarui rincian transaksi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#686b82] hover:text-[#101114] hover:bg-[#edeef3] transition-colors"
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
          <div className="flex bg-[#edeef3] p-1 rounded-[12px] gap-1">
            <button
              type="button"
              onClick={() => {
                setType('pengeluaran');
                setCategoryId('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[9px] transition-all ${
                type === 'pengeluaran'
                  ? 'bg-white text-[#101114] shadow-sm'
                  : 'text-[#686b82] hover:text-[#101114]'
              }`}
            >
              Keluar
            </button>
            <button
              type="button"
              onClick={() => {
                setType('pemasukan');
                setCategoryId('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[9px] transition-all ${
                type === 'pemasukan'
                  ? 'bg-[#149e61] text-white shadow-sm'
                  : 'text-[#686b82] hover:text-[#101114]'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setType('transfer');
                setCategoryId('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[9px] transition-all ${
                type === 'transfer'
                  ? 'bg-[#7132f5] text-white shadow-sm'
                  : 'text-[#686b82] hover:text-[#101114]'
              }`}
            >
              Transfer
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
              Nominal Transaksi (Rp)
            </label>
            <input
              type="text"
              required
              value={amountDisplay}
              onChange={(e) => setAmountDisplay(formatNumberInput(e.target.value))}
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-lg font-bold text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
            />
          </div>

          {/* Date Field */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
              Tanggal
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-sm font-medium text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
            />
          </div>

          {/* Source Account */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
              {type === 'transfer' ? 'Dari Rekening' : 'Rekening / Dompet'}
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-sm font-medium text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
            >
              <option value="">Pilih Rekening</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Account (if transfer) */}
          {type === 'transfer' && (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
                Rekening Tujuan
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-sm font-medium text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
              >
                <option value="">Pilih Rekening Tujuan</option>
                {accounts
                  .filter((acc) => acc.id !== sourceAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Category (if not transfer) */}
          {type !== 'transfer' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82]">
                  Kategori
                </label>
                {selectedCategory && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#edeef3] text-[11px] font-semibold text-[#101114]">
                    <CategoryIcon name={selectedCategory.name} type={type} size="sm" />
                    <span>{selectedCategory.name}</span>
                  </div>
                )}
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-sm font-medium text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
              >
                <option value="">Pilih Kategori</option>
                {categories
                  .filter((cat) => (type === 'pemasukan' ? cat.type === 'pemasukan' : cat.type === 'pengeluaran'))
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
              Catatan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Beli bensin, bayar listrik..."
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-sm font-medium text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
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
                {confirmDelete
                  ? 'Konfirmasi Hapus Transaksi Ini?'
                  : 'Hapus Transaksi'}
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
