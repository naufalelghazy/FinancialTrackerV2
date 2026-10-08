import React, { useState } from 'react';
import type { TransactionType, Account, Category } from '../../types';
import { formatNumberWithDots, parseRawAmount } from '../../lib/formatters';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

interface TransactionFormProps {
  accounts: Account[];
  categories: Category[];
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    sourceAccountId: string;
    destinationAccountId?: string;
    categoryId?: string;
    date: string;
    notes: string;
  }) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  accounts,
  categories,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>('pengeluaran');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [destinationAccountId, setDestinationAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountDisplay(formatNumberWithDots(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseRawAmount(amountDisplay);
    if (!rawAmount || !sourceAccountId) return;
    if (type === 'transfer' && !destinationAccountId) return;
    if (type !== 'transfer' && !categoryId) return;

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
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2500);

    if (navigator.vibrate) {
      navigator.vibrate([40, 40, 40]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24">
      {/* Type Toggle */}
      <div className="grid grid-cols-3 p-1 bg-slate-200/70 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setType('pengeluaran')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            type === 'pengeluaran'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Keluar
        </button>

        <button
          type="button"
          onClick={() => setType('transfer')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            type === 'transfer'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          Transfer
        </button>

        <button
          type="button"
          onClick={() => setType('pemasukan')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            type === 'pemasukan'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Masuk
        </button>
      </div>

      {/* Amount Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Jumlah
        </label>
        <div className="flex items-center justify-center gap-1 mt-2">
          <span className="text-2xl font-bold text-slate-400">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={amountDisplay}
            onChange={handleAmountChange}
            placeholder="0"
            required
            className="w-full text-3xl font-extrabold text-slate-800 text-center tracking-tight outline-none focus:placeholder-transparent"
          />
        </div>
      </div>

      {/* Account Select */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
            {type === 'transfer' ? 'Dari Akun' : 'Akun'}
          </label>
          <select
            value={sourceAccountId}
            onChange={(e) => setSourceAccountId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          >
            <option value="">Pilih Akun</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.emoji || '💳'} {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Account for Transfer */}
        {type === 'transfer' && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Ke Akun Tujuan
            </label>
            <select
              value={destinationAccountId}
              onChange={(e) => setDestinationAccountId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="">Pilih Akun Tujuan</option>
              {accounts
                .filter((acc) => acc.id !== sourceAccountId)
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.emoji || '💳'} {acc.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Category for Expense/Income */}
        {type !== 'transfer' && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="">Pilih Kategori</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Input */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
            Tanggal
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {/* Notes Input */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
            Catatan <span className="text-slate-400 font-normal lowercase">(opsional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Keterangan transaksi..."
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
          />
        </div>
      </div>

      {/* Success Notification Banner */}
      {isSuccess && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Transaksi berhasil disimpan!</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
      >
        Simpan Transaksi
      </button>
    </form>
  );
};
