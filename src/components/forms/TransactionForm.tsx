import React, { useState } from 'react';
import type { TransactionType, Account, Category } from '../../types';
import { formatNumberWithDots, parseRawAmount } from '../../lib/formatters';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { CategoryIcon } from '../ui/CategoryIcon';

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
  const selectedCategory = categories.find((c) => c.id === categoryId);

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
      {/* Type Toggle - Kraken Style Segmented Control */}
      <div className="grid grid-cols-3 p-1 bg-[#edeef3] dark:bg-[#232534] rounded-[12px] gap-1 border border-[#dedee5] dark:border-[#282937]">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setType('pengeluaran');
            setCategoryId('');
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

      {/* Amount Card - Clean Kraken Display */}
      <div className="bg-white dark:bg-[#16171f] rounded-[16px] p-6 border border-[#dedee5] dark:border-[#282937] shadow-whisper text-center">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block">
          Nominal Transaksi
        </label>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="text-2xl font-bold text-[#9497a9]">Rp</span>
          <input
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
        {/* Source Account */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1.5 h-4 leading-4">
            {type === 'transfer' ? 'Dari Akun' : 'Akun'}
          </label>
          <select
            value={sourceAccountId}
            onChange={(e) => setSourceAccountId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-sm font-medium text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
          >
            <option value="">Pilih Akun Rekening / Dompet</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Account for Transfer vs Category for Expense/Income */}
        <div className="min-h-[66px]">
          {type === 'transfer' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] leading-none">
                  Ke Akun Tujuan
                </label>
              </div>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-sm font-medium text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
              >
                <option value="">Pilih Akun Tujuan</option>
                {accounts
                  .filter((acc) => acc.id !== sourceAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5 h-5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] leading-none">
                  Kategori
                </label>
                {selectedCategory && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#edeef3] dark:bg-[#232534] text-[11px] font-semibold text-[#101114] dark:text-[#f3f4f8]">
                    <CategoryIcon name={selectedCategory.name} type={type} size="sm" />
                    <span>{selectedCategory.name}</span>
                  </div>
                )}
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-sm font-medium text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
              >
                <option value="">Pilih Kategori Transaksi</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date Input */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1.5 h-4 leading-4">
            Tanggal
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-sm font-medium text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
          />
        </div>

        {/* Notes Input */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1.5 h-4 leading-4">
            Catatan <span className="text-[#9497a9] font-normal lowercase">(opsional)</span>
          </label>
          <textarea
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
