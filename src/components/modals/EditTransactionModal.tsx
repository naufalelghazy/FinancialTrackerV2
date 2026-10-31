import React, { useState, useRef, useCallback } from "react";
import type {
  Transaction,
  Account,
  Category,
  TransactionType,
} from "../../types";
import {
  formatCurrency,
  formatNumberInput,
  parseNumberInput,
} from "../../lib/formatters";
import { X, Trash2, AlertTriangle, ChevronDown } from "lucide-react";
import { CategoryIcon } from "../ui/CategoryIcon";
import { CategoryPickerList } from "../ui/CategoryPickerList";
import { ModalShell } from "../ui/ModalShell";
import { useDismissable } from "../../hooks/useDismissable";
import { AccountAvatar } from "../ui/AccountAvatar";
import { AccountPickerList } from "../ui/AccountPickerList";
import { ACCOUNT_TYPE_LABELS } from "../../lib/labels";

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
  }) => Promise<void | boolean>;
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
  }) => Promise<void | boolean>;
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
    formatNumberInput(transaction.amount.toString()),
  );
  const [sourceAccountId, setSourceAccountId] = useState(
    transaction.sourceAccountId,
  );
  const [destinationAccountId, setDestinationAccountId] = useState(
    transaction.destinationAccountId || "",
  );
  const [categoryId, setCategoryId] = useState(transaction.categoryId || "");
  const [date, setDate] = useState(transaction.date);
  const [notes, setNotes] = useState(transaction.notes || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<
    "source" | "destination" | "category" | null
  >(null);

  const dropdownAreaRef = useRef<HTMLDivElement>(null);

  const dismissDropdown = useCallback(() => setActiveDropdown(null), []);
  useDismissable(dropdownAreaRef, activeDropdown !== null, dismissDropdown);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedSourceAccount = accounts.find((a) => a.id === sourceAccountId);
  const selectedDestinationAccount = accounts.find(
    (a) => a.id === destinationAccountId,
  );
  const availableDestinationAccounts = accounts.filter(
    (a) => a.id !== sourceAccountId,
  );
  const filteredCategories = categories.filter((cat) =>
    type === "pemasukan"
      ? cat.type === "pemasukan"
      : cat.type === "pengeluaran",
  );

  const toggleDropdown = (menu: "source" | "destination" | "category") => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const numericAmount = parseNumberInput(amountDisplay);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg("Nominal transaksi harus lebih dari 0.");
      return;
    }

    if (!sourceAccountId) {
      setErrorMsg("Pilih rekening transaksi.");
      setActiveDropdown("source");
      return;
    }

    if (type === "transfer" && !destinationAccountId) {
      setErrorMsg("Pilih rekening tujuan transfer.");
      setActiveDropdown("destination");
      return;
    }

    if (type === "transfer" && sourceAccountId === destinationAccountId) {
      setErrorMsg("Rekening asal dan tujuan tidak boleh sama.");
      return;
    }

    if (type !== "transfer" && !categoryId) {
      setErrorMsg("Pilih kategori transaksi.");
      setActiveDropdown("category");
      return;
    }

    setIsSubmitting(true);
    try {
      const accepted = await onSave({
        id: transaction.id,
        amount: numericAmount,
        type,
        sourceAccountId,
        destinationAccountId:
          type === "transfer" ? destinationAccountId : undefined,
        categoryId: type !== "transfer" ? categoryId : undefined,
        date,
        notes: notes.trim(),
      });
      // A rejected write resolves with `false`; keep the modal (and the user's
      // typed values) open so they can fix what the server objected to.
      if (accepted === false) {
        setErrorMsg("Perubahan ditolak server. Periksa kembali datanya.");
        return;
      }
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal menyimpan perubahan transaksi.";
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
    setErrorMsg("");
    try {
      await onDelete(transaction.id);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghapus transaksi.";
      setErrorMsg(msg);
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ModalShell
      onClose={() => {
        // First Escape closes an open dropdown; a second closes the modal.
        if (activeDropdown) {
          setActiveDropdown(null);
          return;
        }
        onClose();
      }}
      ariaLabel="Ubah Transaksi"
      maxWidthClass="max-w-sm"
      zIndexClass="z-50"
    >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2.5">
            <CategoryIcon
              name={
                type === "transfer" ? "Pindah Akun" : selectedCategory?.name
              }
              type={type}
              icon={type === "transfer" ? undefined : selectedCategory?.icon}
              emoji={type === "transfer" ? undefined : selectedCategory?.emoji}
              size="md"
            />
            <div>
              <h2 className="font-bold text-base text-ink tracking-[-0.5px]">
                Edit Transaksi
              </h2>
              <p className="text-[11px] text-ink-muted">
                Perbarui rincian transaksi
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

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-4 text-sm overflow-y-auto flex-1"
        >
          {errorMsg && (
            <div className="p-3 rounded-[10px] bg-negative/10 border border-negative/20 text-negative-bright text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Segmented Type Selector */}
          <div className="flex bg-surface-sunken p-1 rounded-[12px] gap-1">
            <button
              type="button"
              onClick={() => {
                setType("pengeluaran");
                setCategoryId("");
                setActiveDropdown(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[9px] transition-all ${
                type === "pengeluaran"
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Keluar
            </button>
            <button
              type="button"
              onClick={() => {
                setType("pemasukan");
                setCategoryId("");
                setActiveDropdown(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[9px] transition-all ${
                type === "pemasukan"
                  ? "bg-positive text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setType("transfer");
                setCategoryId("");
                setActiveDropdown(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-[9px] transition-all ${
                type === "transfer"
                  ? "bg-brand text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Transfer
            </button>
          </div>

          {/* Nominal Field */}
          <div>
            <label
              htmlFor="edit-tx-amount"
              className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1"
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
              onChange={(e) =>
                setAmountDisplay(formatNumberInput(e.target.value))
              }
              placeholder="0"
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-canvas border border-hairline text-lg font-bold text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
            />
          </div>

          {/* Date Field */}
          <div>
            <label
              htmlFor="edit-tx-date"
              className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1"
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
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-canvas border border-hairline text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
            />
          </div>

          <div ref={dropdownAreaRef} className="space-y-4">
            {/* Source Account Popup Dropdown */}
            <div className="relative">
              <span
                id="edit-tx-source-label"
                className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1"
              >
                {type === "transfer" ? "Dari Rekening" : "Rekening / Dompet"}
              </span>
              <button
                type="button"
                aria-labelledby="edit-tx-source-label"
                aria-expanded={activeDropdown === "source"}
                aria-haspopup="listbox"
                onClick={() => toggleDropdown("source")}
                className={`w-full min-h-[42px] px-3.5 py-2 rounded-[12px] bg-canvas border text-sm font-medium text-ink flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-brand ${
                  activeDropdown === "source"
                    ? "border-brand ring-2 ring-brand/15"
                    : "border-hairline hover:border-brand"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {selectedSourceAccount ? (
                    <>
                      <AccountAvatar acc={selectedSourceAccount} size="sm" />
                      <span className="truncate font-semibold">
                        {selectedSourceAccount.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-sunken text-ink-muted font-semibold shrink-0">
                        {ACCOUNT_TYPE_LABELS[selectedSourceAccount.type] ||
                          selectedSourceAccount.type}
                      </span>
                    </>
                  ) : (
                    <span className="truncate text-ink">Pilih Rekening</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedSourceAccount && (
                    <span className="text-xs font-bold tabular-nums text-ink-muted">
                      {formatCurrency(selectedSourceAccount.balance)}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-150 ${
                      activeDropdown === "source" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {activeDropdown === "source" && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[14px] bg-surface border border-hairline shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <AccountPickerList
                    ariaLabel="Pilih Rekening"
                    accounts={accounts}
                    selectedId={sourceAccountId}
                    onSelect={(acc) => {
                      setSourceAccountId(acc.id);
                      if (destinationAccountId === acc.id) {
                        setDestinationAccountId("");
                      }
                      setActiveDropdown(null);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Destination Account (if transfer) OR Category Popup Dropdown */}
            {type === "transfer" ? (
              <div className="relative">
                <span
                  id="edit-tx-dest-label"
                  className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1"
                >
                  Rekening Tujuan
                </span>
                <button
                  type="button"
                  aria-labelledby="edit-tx-dest-label"
                  aria-expanded={activeDropdown === "destination"}
                  aria-haspopup="listbox"
                  onClick={() => toggleDropdown("destination")}
                  className={`w-full min-h-[42px] px-3.5 py-2 rounded-[12px] bg-canvas border text-sm font-medium text-ink flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-brand ${
                    activeDropdown === "destination"
                      ? "border-brand ring-2 ring-brand/15"
                      : "border-hairline hover:border-brand"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedDestinationAccount ? (
                      <>
                        <AccountAvatar
                          acc={selectedDestinationAccount}
                          size="sm"
                        />
                        <span className="truncate font-semibold">
                          {selectedDestinationAccount.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-sunken text-ink-muted font-semibold shrink-0">
                          {ACCOUNT_TYPE_LABELS[
                            selectedDestinationAccount.type
                          ] || selectedDestinationAccount.type}
                        </span>
                      </>
                    ) : (
                      <span className="truncate text-ink">
                        Pilih Rekening Tujuan
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedDestinationAccount && (
                      <span className="text-xs font-bold tabular-nums text-ink-muted">
                        {formatCurrency(selectedDestinationAccount.balance)}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-150 ${
                        activeDropdown === "destination" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {activeDropdown === "destination" && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-[14px] bg-surface border border-hairline shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <AccountPickerList
                      ariaLabel="Pilih Rekening Tujuan"
                      accounts={availableDestinationAccounts}
                      selectedId={destinationAccountId}
                      onSelect={(acc) => {
                        setDestinationAccountId(acc.id);
                        setActiveDropdown(null);
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span
                    id="edit-tx-category-label"
                    className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
                  >
                    Kategori
                  </span>
                  {selectedCategory && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-surface-sunken text-[11px] font-semibold text-ink">
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
                  aria-expanded={activeDropdown === "category"}
                  aria-haspopup="listbox"
                  onClick={() => toggleDropdown("category")}
                  className={`w-full min-h-[42px] px-3.5 py-2.5 rounded-[12px] bg-canvas border text-sm font-medium text-ink flex items-center justify-between gap-2 transition-all outline-none focus-visible:outline-2 focus-visible:outline-brand ${
                    activeDropdown === "category"
                      ? "border-brand ring-2 ring-brand/15"
                      : "border-hairline hover:border-brand"
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
                        <span className="truncate font-semibold">
                          {selectedCategory.name}
                        </span>
                      </>
                    ) : (
                      <span className="truncate text-ink">Pilih Kategori</span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted shrink-0 transition-transform duration-150 ${
                      activeDropdown === "category" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "category" && (
                  <div className="absolute left-0 right-0 bottom-full mb-1.5 z-30 rounded-[14px] bg-surface border border-hairline shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <CategoryPickerList
                      ariaLabel="Pilih Kategori"
                      categories={filteredCategories}
                      selectedId={categoryId}
                      type={type}
                      onSelect={(cat) => {
                        setCategoryId(cat.id);
                        setActiveDropdown(null);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="edit-tx-notes"
              className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1"
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
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-canvas border border-hairline text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-[12px] bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-bold text-sm shadow-whisper transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

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
                  ? "Konfirmasi Hapus Transaksi Ini?"
                  : "Hapus Transaksi"}
              </span>
            </button>
          </div>
        </form>
    </ModalShell>
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
