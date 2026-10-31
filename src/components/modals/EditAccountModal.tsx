import React, { useState, useEffect } from "react";
import {
  X,
  Landmark,
  Trash2,
  AlertTriangle,
  ArrowRightLeft,
  Globe,
} from "lucide-react";
import type { Account, AccountType } from "../../types";
import {
  formatCurrency,
  formatNumberInput,
  parseRawAmount,
} from "../../lib/formatters";
import { getLogoDevUrl, getLocalFallback } from "../../services/logoService";

interface EditAccountModalProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    type: AccountType;
    website?: string;
    initialBalance: number;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const EditAccountModalContent: React.FC<
  Omit<EditAccountModalProps, "isOpen">
> = ({ account, onClose, onSave, onDelete }) => {
  const isEditing = Boolean(account);

  const [name, setName] = useState(() => account?.name || "");
  const [type, setType] = useState<AccountType>(() => account?.type || "bank");
  const [website, setWebsite] = useState(() => account?.website || "");
  const [initialBalanceDisplay, setInitialBalanceDisplay] = useState(() =>
    account ? formatNumberInput(String(account.initialBalance ?? 0)) : "0",
  );
  const [targetBalanceDisplay, setTargetBalanceDisplay] = useState(() =>
    account ? formatNumberInput(String(account.balance ?? 0)) : "0",
  );
  const [isAdjustMode, setIsAdjustMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const previewLogoSrc = !previewFailed
    ? getLogoDevUrl(name, website) || getLocalFallback(name)
    : getLocalFallback(name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama akun tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

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
        website: website.trim() || undefined,
        initialBalance: finalInitialBalance,
      });
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyimpan perubahan akun.";
      setErrorMsg(msg);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus akun.";
      setErrorMsg(msg);
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-surface rounded-[16px] w-full max-w-sm overflow-hidden shadow-whisper border border-hairline transition-colors duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-brand-soft flex items-center justify-center text-brand-text">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-ink tracking-[-0.5px]">
                {isEditing ? "Kelola Akun & Saldo" : "Tambah Akun Baru"}
              </h2>
              <p className="text-[11px] text-ink-muted">
                {isEditing
                  ? "Perbarui informasi atau koreksi saldo"
                  : "Daftarkan rekening atau dompet baru"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-sunken transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 rounded-[10px] bg-negative/10 border border-negative/20 text-negative-bright text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Balance Display (if editing) */}
          {isEditing && account && (
            <div className="p-3.5 rounded-[12px] bg-canvas border border-hairline flex items-center justify-between">
              <div>
                <span className="text-[11px] text-ink-muted block font-medium uppercase tracking-wider">
                  Saldo Berjalan Saat Ini
                </span>
                <span className="text-base font-bold text-ink">
                  {formatCurrency(account.balance)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAdjustMode(!isAdjustMode)}
                className="text-xs text-brand-text hover:text-brand-text font-semibold flex items-center gap-1 py-1 px-2.5 rounded-[8px] bg-brand-soft transition-all"
              >
                <ArrowRightLeft className="w-3 h-3" />
                {isAdjustMode ? "Set Saldo Awal" : "Koreksi Saldo"}
              </button>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label
              htmlFor="account-name-input"
              className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1"
            >
              Nama Akun
            </label>
            <input
              id="account-name-input"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setPreviewFailed(false);
              }}
              placeholder="Contoh: BCA Utama, Dompet Saku"
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-canvas border border-hairline text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
            />
          </div>

          {/* Website / Domain URL Input for img.logo.dev */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="account-website-input"
                className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-brand-text" />
                <span>Website / Domain Akun</span>
              </label>
              <span className="text-[10px] text-ink-subtle">
                Untuk Logo.dev
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                id="account-website-input"
                name="website"
                type="text"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  setPreviewFailed(false);
                }}
                placeholder="Contoh: doku.com atau bca.co.id"
                className="w-full pl-3.5 pr-11 py-2.5 rounded-[12px] bg-canvas border border-hairline text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
              />
              {/* Live Logo Preview icon */}
              <div
                className="absolute right-2.5 w-7 h-7 rounded-[7px] bg-surface border border-hairline dark:border-[#35374d] p-0.5 flex items-center justify-center shadow-micro overflow-hidden"
                title={previewLogoSrc ? "Preview Logo CDN" : "Logo Default"}
              >
                {previewLogoSrc ? (
                  <img
                    src={previewLogoSrc}
                    alt="Preview"
                    onError={() => setPreviewFailed(true)}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-ink-subtle" />
                )}
              </div>
            </div>
            <p className="text-[11px] text-ink-muted mt-1.5 leading-snug">
              <code>img.logo.dev</code> akan mencari logo resmi berdasarkan
              domain ini jika nama akun belum terdeteksi.
            </p>
          </div>

          {/* Type Field */}
          <div>
            <label
              htmlFor="account-type-select"
              className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1"
            >
              Tipe Akun
            </label>
            <select
              id="account-type-select"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-canvas border border-hairline text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
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
                <label
                  htmlFor="account-target-balance"
                  className="text-[11px] font-semibold uppercase tracking-wider text-brand-text"
                >
                  Saldo Riil yang Diinginkan (Rp)
                </label>
                <span className="text-[10px] text-ink-muted">
                  Koreksi otomatis
                </span>
              </div>
              <input
                id="account-target-balance"
                name="targetBalance"
                type="text"
                value={targetBalanceDisplay}
                onChange={(e) =>
                  setTargetBalanceDisplay(formatNumberInput(e.target.value))
                }
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fbf9fe] border-2 border-brand text-base font-bold text-ink outline-none focus:ring-2 focus:ring-brand/25 transition-all"
              />
              <p className="text-[11px] text-ink-muted mt-1.5 leading-snug">
                Sistem akan menghitung selisih dan menyesuaikan saldo awal agar
                saldo akhir sama persis dengan angka di atas.
              </p>
            </div>
          ) : (
            <div>
              <label
                htmlFor="account-initial-balance"
                className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1"
              >
                Saldo Awal Rekening (Rp)
              </label>
              <input
                id="account-initial-balance"
                name="initialBalance"
                type="text"
                value={initialBalanceDisplay}
                onChange={(e) =>
                  setInitialBalanceDisplay(formatNumberInput(e.target.value))
                }
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-canvas border border-hairline text-sm font-bold text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-[12px] bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-bold text-sm shadow-whisper transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Akun"}
            </button>

            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={`w-full py-2.5 rounded-[12px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  confirmDelete
                    ? "bg-negative text-white"
                    : "bg-transparent text-negative-bright hover:bg-negative/10"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {confirmDelete
                    ? "Konfirmasi Hapus Akun Ini?"
                    : "Hapus Akun Ini"}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  account,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <EditAccountModalContent
      key={account?.id || "new-account"}
      account={account}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
};
