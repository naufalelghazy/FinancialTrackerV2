import React, { useState, useEffect, useMemo } from 'react';
import { X, Trash2, AlertTriangle, Layers, Search, Check } from 'lucide-react';
import type { Category } from '../../types';
import {
  CategoryIcon,
  CATEGORY_ICON_LIST,
  CATEGORY_ICON_GROUPS,
  CATEGORY_ICON_REGISTRY,
} from '../ui/CategoryIcon';

interface EditCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    type: 'pengeluaran' | 'pemasukan';
    emoji: string;
    icon?: string;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  category,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(category);

  const [name, setName] = useState('');
  const [type, setType] = useState<'pengeluaran' | 'pemasukan'>('pengeluaran');
  const [selectedIconId, setSelectedIconId] = useState<string>('Tag');
  const [selectedGroup, setSelectedGroup] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize state when modal opens or category changes
  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      // Determine initial selected icon
      if (category.icon && CATEGORY_ICON_REGISTRY[category.icon]) {
        setSelectedIconId(category.icon);
      } else if (category.emoji && CATEGORY_ICON_REGISTRY[category.emoji]) {
        setSelectedIconId(category.emoji);
      } else {
        // Try finding matching icon from category name
        const found = CATEGORY_ICON_LIST.find(
          (item) =>
            item.id.toLowerCase() === category.name.toLowerCase() ||
            category.name.toLowerCase().includes(item.id.toLowerCase())
        );
        setSelectedIconId(found ? found.id : 'Tag');
      }
    } else {
      setName('');
      setType('pengeluaran');
      setSelectedIconId('ShoppingBag');
    }
    setConfirmDelete(false);
    setErrorMsg('');
    setSearchQuery('');
    setSelectedGroup('Semua');
  }, [category, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered icon list based on active group & search query
  const filteredIcons = useMemo(() => {
    return CATEGORY_ICON_LIST.filter((item) => {
      const matchGroup = selectedGroup === 'Semua' || item.group === selectedGroup;
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama kategori tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSave({
        id: category?.id,
        name: name.trim(),
        type,
        emoji: selectedIconId,
        icon: selectedIconId,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan kategori.');
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
    setErrorMsg('');

    try {
      await onDelete(category.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus kategori.');
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white dark:bg-[#16171f] rounded-[16px] w-full max-w-lg overflow-hidden shadow-whisper border border-[#dedee5] dark:border-[#282937] flex flex-col max-h-[92vh] transition-colors duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#dedee5] dark:border-[#282937] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#855bfb]/15 flex items-center justify-center text-[#7132f5] dark:text-[#a78bfa] shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#101114] dark:text-[#f3f4f8] tracking-[-0.5px]">
                {isEditing ? 'Edit Kategori Transaksi' : 'Tambah Kategori Baru'}
              </h2>
              <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                {isEditing
                  ? 'Sesuaikan nama, tipe, dan icon visual kategori'
                  : 'Buat pos kategori baru untuk pengeluaran atau pemasukan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-[12px] bg-[#e53e3e]/10 border border-[#e53e3e]/20 text-[#e53e3e] dark:text-[#f87171] text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="p-3.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-[10px] bg-white dark:bg-[#282937] border border-[#dedee5] dark:border-[#35374d] flex items-center justify-center text-[#7132f5] dark:text-[#a78bfa] shadow-micro shrink-0">
                <CategoryIcon icon={selectedIconId} name={name} type={type} size="md" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#9497a9] tracking-wider block">
                  Pratinjau Kategori
                </span>
                <span className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8] block truncate">
                  {name.trim() || 'Nama Kategori'}
                </span>
              </div>
            </div>

            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-[6px] shrink-0 ${
                type === 'pemasukan'
                  ? 'bg-[#149e61]/12 text-[#026b3f] dark:text-[#34d399]'
                  : 'bg-[#e53e3e]/12 text-[#e53e3e] dark:text-[#f87171]'
              }`}
            >
              {type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
            </span>
          </div>

          {/* Nama Kategori */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1.5">
              Nama Kategori <span className="text-[#e53e3e]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Gym & Olahraga, Liburan, Netflix..."
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-sm font-medium text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15 transition-all"
              required
              autoFocus
            />
          </div>

          {/* Tipe Transaksi: Pengeluaran vs Pemasukan */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1.5">
              Klasifikasi Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#edeef3] dark:bg-[#1e202b] rounded-[12px] border border-[#dedee5] dark:border-[#282937]">
              <button
                type="button"
                onClick={() => setType('pengeluaran')}
                className={`py-2 px-3 rounded-[9px] text-xs font-bold transition-all text-center ${
                  type === 'pengeluaran'
                    ? 'bg-white dark:bg-[#282937] text-[#e53e3e] dark:text-[#f87171] shadow-micro'
                    : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
                }`}
              >
                Pengeluaran (Keluar)
              </button>
              <button
                type="button"
                onClick={() => setType('pemasukan')}
                className={`py-2 px-3 rounded-[9px] text-xs font-bold transition-all text-center ${
                  type === 'pemasukan'
                    ? 'bg-white dark:bg-[#282937] text-[#026b3f] dark:text-[#34d399] shadow-micro'
                    : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
                }`}
              >
                Pemasukan (Masuk)
              </button>
            </div>
          </div>

          {/* Icon Picker Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba]">
                Pilihan Ikon ({CATEGORY_ICON_LIST.length} Tersedia)
              </label>
              {selectedIconId && (
                <span className="text-[11px] font-semibold text-[#7132f5] dark:text-[#a78bfa]">
                  Dipilih: {selectedIconId}
                </span>
              )}
            </div>

            {/* Search Input for Icons */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9497a9] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ikon (contoh: kopi, mobil, uang, game)..."
                className="w-full pl-8 pr-3 py-1.5 rounded-[10px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-xs text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] transition-all"
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
                      ? 'bg-[#7132f5] text-white shadow-micro'
                      : 'bg-[#edeef3] dark:bg-[#1e202b] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] max-h-48 overflow-y-auto">
              {filteredIcons.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-[#9497a9]">
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
                          ? 'bg-[#7132f5]/15 text-[#7132f5] dark:text-[#a78bfa] ring-2 ring-[#7132f5] shadow-micro scale-105'
                          : 'bg-white dark:bg-[#1e202b] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#282937] border border-[#dedee5]/70 dark:border-[#282937]'
                      }`}
                    >
                      <IconComp className="w-4.5 h-4.5" strokeWidth={isSelected ? 2.5 : 2} />
                      {isSelected && (
                        <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#7132f5]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#dedee5] dark:border-[#282937]">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className={`text-xs py-2 px-3 rounded-[10px] font-bold flex items-center gap-1.5 transition-all ${
                  confirmDelete
                    ? 'bg-[#e53e3e] text-white hover:bg-[#c53030]'
                    : 'text-[#e53e3e] hover:bg-[#e53e3e]/10 border border-[#e53e3e]/20'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDelete ? 'Yakin Hapus?' : 'Hapus'}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2 rounded-[10px] text-xs font-bold text-[#686b82] dark:text-[#9ca0ba] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] transition-all"
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
                <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
