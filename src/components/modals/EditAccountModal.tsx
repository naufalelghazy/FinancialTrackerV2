import React, { useState, useEffect } from 'react';
import { X, Landmark, Trash2, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import type { Account, AccountType } from '../../types';
import { formatCurrency, formatNumberInput, parseRawAmount } from '../../lib/formatters';

interface EditAccountModalProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    type: AccountType;
    initialBalance: number;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  account,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(account);

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalanceDisplay, setInitialBalanceDisplay] = useState('0');
  const [targetBalanceDisplay, setTargetBalanceDisplay] = useState('');
  const [isAdjustMode, setIsAdjustMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setInitialBalanceDisplay(formatNumberInput(String(account.initialBalance ?? 0)));
      setTargetBalanceDisplay(formatNumberInput(String(account.balance ?? 0)));
    } else {
      setName('');
      setType('bank');
      setInitialBalanceDisplay('0');
      setTargetBalanceDisplay('0');
    }
    setIsAdjustMode(false);
    setConfirmDelete(false);
    setErrorMsg('');
  }, [account, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama akun tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let finalInitialBalance = parseRawAmount(initialBalanceDisplay);

      if (isEditing && isAdjustMode && account) {
        const targetBalance = parseRawAmount(targetBalanceDisplay);
        const balanceDelta = targetBalance - account.balance;
        finalInitialBalance = (account.initialBalance ?? 0) + balanceDelta;
      }

      await onSave({
        id: account?.id,
        name: name.trim(),
        type,
        initialBalance: finalInitialBalance,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan akun.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!account || !onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(account.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus akun.');
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-[16px] w-full max-w-sm overflow-hidden shadow-whisper border border-[#dedee5]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#dedee5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#855bfb]/15 flex items-center justify-center text-[#7132f5]">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#101114] tracking-[-0.5px]">
                {isEditing ? 'Kelola Akun & Saldo' : 'Tambah Akun Baru'}
              </h2>
              <p className="text-[11px] text-[#686b82]">
                {isEditing ? 'Perbarui informasi atau koreksi saldo' : 'Daftarkan rekening atau dompet baru'}
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 rounded-[10px] bg-[#e53e3e]/10 border border-[#e53e3e]/20 text-[#e53e3e] text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Balance Display (if editing) */}
          {isEditing && account && (
            <div className="p-3.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#686b82] block font-medium uppercase tracking-wider">
                  Saldo Berjalan Saat Ini
                </span>
                <span className="text-base font-bold text-[#101114]">
                  {formatCurrency(account.balance)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustMode(!isAdjustMode)}
                className="text-xs text-[#7132f5] hover:text-[#5741d8] font-semibold flex items-center gap-1 py-1 px-2.5 rounded-[8px] bg-[#855bfb]/10 hover:bg-[#855bfb]/20 transition-all"
              >
                <ArrowRightLeft className="w-3 h-3" />
                {isAdjustMode ? 'Set Saldo Awal' : 'Koreksi Saldo'}
              </button>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
              Nama Akun
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Utama, Dompet Saku"
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-sm font-medium text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
            />
          </div>

          {/* Type Field */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
              Tipe Akun
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-sm font-medium text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
            >
              <option value="bank">Bank (Tabungan / Giro)</option>
              <option value="ewallet">E-Wallet (Gopay, Dana, OVO, dll)</option>
              <option value="cash">Tunai (Cash Fisik)</option>
              <option value="credit">Kartu Kredit / Paylater (Tagihan)</option>
            </select>
          </div>

          {/* Balance Adjustment Field */}
          {isEditing && isAdjustMode ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#7132f5]">
                  Saldo Riil yang Diinginkan (Rp)
                </label>
                <span className="text-[10px] text-[#686b82]">Koreksi otomatis</span>
              </div>
              <input
                type="text"
                value={targetBalanceDisplay}
                onChange={(e) => setTargetBalanceDisplay(formatNumberInput(e.target.value))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fbf9fe] border-2 border-[#7132f5] text-base font-bold text-[#101114] outline-none focus:ring-2 focus:ring-[#855bfb]/25 transition-all"
              />
              <p className="text-[11px] text-[#686b82] mt-1.5 leading-snug">
                Sistem akan menghitung selisih dan menyesuaikan saldo awal agar saldo akhir sama persis dengan angka di atas.
              </p>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] block mb-1">
                Saldo Awal Rekening (Rp)
              </label>
              <input
                type="text"
                value={initialBalanceDisplay}
                onChange={(e) => setInitialBalanceDisplay(formatNumberInput(e.target.value))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-sm font-bold text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-[12px] bg-[#7132f5] hover:bg-[#5741d8] active:bg-[#5b1ecf] text-white font-bold text-sm shadow-whisper transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
            </button>

            {isEditing && onDelete && (
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
                    ? 'Konfirmasi Hapus Akun Ini?'
                    : 'Hapus Akun Ini'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
