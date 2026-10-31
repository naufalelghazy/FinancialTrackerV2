import React, { useState, useMemo } from "react";
import { X, Trash2, AlertTriangle, Layers, Search, Check } from "lucide-react";
import type { Category } from "../../types";
import { CategoryIcon } from "../ui/CategoryIcon";
import { ModalShell } from "../ui/ModalShell";
import {
  CATEGORY_ICON_LIST,
  CATEGORY_ICON_GROUPS,
  CATEGORY_ICON_REGISTRY,
} from "../../lib/categoryIcons";

interface EditCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    type: "pengeluaran" | "pemasukan";
    emoji: string;
    icon?: string;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  /** How many transactions use this category; drives the delete warning. */
  transactionCount?: number;
}

function resolveInitialCategoryIconId(category: Category | null): string {
  if (!category) return "ShoppingBag";
  if (category.icon && CATEGORY_ICON_REGISTRY[category.icon]) {
    return category.icon;
  }
  if (category.emoji && CATEGORY_ICON_REGISTRY[category.emoji]) {
    return category.emoji;
  }
  const found = CATEGORY_ICON_LIST.find(
    (item) =>
      item.id.toLowerCase() === category.name.toLowerCase() ||
      category.name.toLowerCase().includes(item.id.toLowerCase()),
  );
  return found ? found.id : "Tag";
}

const EditCategoryModalContent: React.FC<
  Omit<EditCategoryModalProps, "isOpen">
> = ({ category, onClose, onSave, onDelete, transactionCount = 0 }) => {
  const isEditing = Boolean(category);

  const [name, setName] = useState(() => category?.name || "");
  const [type, setType] = useState<"pengeluaran" | "pemasukan">(
    () => category?.type || "pengeluaran",
  );
  const [selectedIconId, setSelectedIconId] = useState<string>(() =>
    resolveInitialCategoryIconId(category),
  );
  const [selectedGroup, setSelectedGroup] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filteredIcons = useMemo(() => {
    return CATEGORY_ICON_LIST.filter((item) => {
      const matchGroup =
        selectedGroup === "Semua" || item.group === selectedGroup;
      if (!matchGroup) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.id.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
      );
    });
  }, [selectedGroup, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Nama kategori tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await onSave({
        id: category?.id,
        name: name.trim(),
        type,
        emoji: selectedIconId,
        icon: selectedIconId,
      });
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyimpan kategori.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!category || !onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    setErrorMsg("");

    try {
      await onDelete(category.id);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menghapus kategori.";
      setErrorMsg(msg);
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={isEditing ? "Ubah Kategori" : "Tambah Kategori"}
      maxWidthClass="max-w-lg"
      zIndexClass="z-50"
    >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-brand-soft flex items-center justify-center text-brand-text shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-ink tracking-[-0.5px]">
                {isEditing ? "Edit Kategori Transaksi" : "Tambah Kategori Baru"}
              </h2>
              <p className="text-[11px] text-ink-muted">
                {isEditing
                  ? "Sesuaikan nama, tipe, dan icon visual kategori"
                  : "Buat pos kategori baru untuk pengeluaran atau pemasukan"}
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

        {/* Modal Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4"
        >
          {errorMsg && (
            <div className="p-3 rounded-[12px] bg-negative/10 border border-negative/20 text-negative-bright text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="p-3.5 rounded-[12px] bg-canvas border border-hairline flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[10px] bg-surface border border-hairline dark:border-[#35374d] flex items-center justify-center text-brand-text shadow-micro shrink-0">
                <CategoryIcon
                  icon={selectedIconId}
                  name={name}
                  type={type}
                  size="md"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-ink-subtle tracking-wider block">
                  Pratinjau Kategori
                </span>
                <span className="font-bold text-sm text-ink block truncate">
                  {name.trim() || "Nama Kategori"}
                </span>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-[6px] shrink-0 ${
                type === "pemasukan"
                  ? "bg-positive/12 text-positive"
                  : "bg-negative/12 text-negative-bright"
              }`}
            >
              {type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
            </span>
          </div>

          {/* Nama Kategori */}
          <div>
            <label
              htmlFor="category-name-input"
              className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1.5"
            >
              Nama Kategori <span className="text-negative-bright">*</span>
            </label>
            <input
              id="category-name-input"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Gym & Olahraga, Liburan, Netflix..."
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-canvas border border-hairline text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-all"
              required
              autoFocus
            />
          </div>

          {/* Tipe Transaksi: Pengeluaran vs Pemasukan */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1.5">
              Klasifikasi Jenis Transaksi
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-sunken rounded-[12px] border border-hairline">
              <button
                type="button"
                onClick={() => setType("pengeluaran")}
                className={`py-2 px-3 rounded-[9px] text-xs font-bold transition-all text-center ${
                  type === "pengeluaran"
                    ? "bg-surface text-negative-bright shadow-micro"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Pengeluaran (Keluar)
              </button>
              <button
                type="button"
                onClick={() => setType("pemasukan")}
                className={`py-2 px-3 rounded-[9px] text-xs font-bold transition-all text-center ${
                  type === "pemasukan"
                    ? "bg-surface text-positive shadow-micro"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Pemasukan (Masuk)
              </button>
            </div>
          </div>

          {/* Icon Picker Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="category-icon-search"
                className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
              >
                Pilihan Ikon ({CATEGORY_ICON_LIST.length} Tersedia)
              </label>
              {selectedIconId && (
                <span className="text-[11px] font-semibold text-brand-text">
                  Dipilih: {selectedIconId}
                </span>
              )}
            </div>

            {/* Search Input for Icons */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="category-icon-search"
                name="iconSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ikon (contoh: kopi, mobil, uang, game)..."
                className="w-full pl-8 pr-3 py-1.5 rounded-[10px] bg-canvas border border-hairline text-xs text-ink outline-none focus:border-brand transition-all"
              />
            </div>

            {/* Category Groups Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORY_ICON_GROUPS.map((grp) => (
                <button
                  type="button"
                  key={grp}
                  onClick={() => setSelectedGroup(grp)}
                  className={`shrink-0 px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition-all ${
                    selectedGroup === grp
                      ? "bg-brand text-white shadow-micro"
                      : "bg-surface-sunken text-ink-muted hover:text-ink"
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 rounded-[12px] bg-canvas border border-hairline max-h-48 overflow-y-auto">
              {filteredIcons.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-ink-subtle">
                  Tidak ada ikon yang sesuai dengan pencarian
                </div>
              ) : (
                filteredIcons.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = selectedIconId === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedIconId(item.id)}
                      title={`${item.label} (${item.id})`}
                      className={`relative h-10 rounded-[10px] flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-brand-soft text-brand-text ring-2 ring-brand shadow-micro scale-105"
                          : "bg-surface text-ink-muted hover:text-ink hover:bg-surface-sunken border border-hairline/70"
                      }`}
                    >
                      <IconComp
                        className="w-4.5 h-4.5"
                        strokeWidth={isSelected ? 2.5 : 2}
                      />
                      {isSelected && (
                        <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-brand" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && transactionCount > 0 && (
            <p className="text-[11px] leading-relaxed text-ink-muted bg-surface-sunken rounded-[10px] p-2.5">
              Kategori ini dipakai oleh{" "}
              <strong className="text-ink">{transactionCount} transaksi</strong>.
              Menghapusnya tidak menghapus transaksi tersebut, tapi kategori
              mereka akan kosong dan laporan per kategori kehilangan
              pecahannya.
            </p>
          )}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-hairline">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className={`text-xs py-2 px-3 rounded-[10px] font-bold flex items-center gap-1.5 transition-all ${
                  confirmDelete
                    ? "bg-negative text-white hover:bg-negative"
                    : "text-negative-bright hover:bg-negative/10 border border-negative/20"
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDelete ? "Yakin Hapus?" : "Hapus"}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2 rounded-[10px] text-xs font-bold text-ink-muted hover:bg-surface-sunken transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="btn-kraken-primary text-xs py-2 px-4 shadow-micro flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>
                  {isEditing ? "Simpan Perubahan" : "Tambah Kategori"}
                </span>
              </button>
            </div>
          </div>
        </form>
    </ModalShell>
  );
};

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  category,
  onClose,
  onSave,
  onDelete,
  transactionCount,
}) => {
  if (!isOpen) return null;

  return (
    <EditCategoryModalContent
      key={category?.id || "new-category"}
      category={category}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
      transactionCount={transactionCount}
    />
  );
};
