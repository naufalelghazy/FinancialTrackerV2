import React, { useState, useEffect } from 'react';
import { X, Receipt, Trash2, AlertTriangle } from 'lucide-react';
import type { Transaction, TransactionType, Account, Category } from '../../types';
import { formatNumberInput, parseRawAmount } from '../../lib/formatters';

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSave: (data: {
    id: string;
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  transaction,
  accounts,
  categories,
  onClose,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<TransactionType>('pengeluaran');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [date, setDate] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmountDisplay(formatNumberInput(String(transaction.amount)));
      setDate(transaction.date);
      setSourceAccountId(transaction.sourceAccountId || '');
      setDestinationAccountId(transaction.destinationAccountId || '');
      setCategoryId(transaction.categoryId || '');
      setNotes(transaction.notes || '');
    }
    setConfirmDelete(false);
    setErrorMsg('');
  }, [transaction, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseRawAmount(amountDisplay);
    if (!rawAmount || rawAmount <= 0) {
      setErrorMsg('Nominal harus lebih dari 0.');
      return;
    }
    if (!sourceAccountId) {
      setErrorMsg('Pilih akun transaksi.');
      return;
    }
    if (type === 'transfer' && !destinationAccountId) {
      setErrorMsg('Pilih akun tujuan untuk transfer.');
      return;
    }
    if (type !== 'transfer' && !categoryId) {
      setErrorMsg('Pilih kategori transaksi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSave({
        id: transaction.id,
        type,
        amount: rawAmount,
        sourceAccountId,
        destinationAccountId: type === 'transfer' ? destinationAccountId : undefined,
        categoryId: type !== 'transfer' ? categoryId : undefined,
        date,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui transaksi.');
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
            <div className="w-8 h-8 rounded-[8px] bg-[#855bfb]/15 flex items-center justify-center text-[#7132f5]">
              <Receipt className="w-4 h-4" />
            </div>
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
              onClick={() => setType('pengeluaran')}
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
              onClick={() => setType('pemasukan')}
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
              onClick={() => setType('transfer')}
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
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
                Kategori
              </label>
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
                      {cat.emoji} {cat.name}
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
