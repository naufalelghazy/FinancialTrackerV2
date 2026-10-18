import React, { useState, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  ShieldAlert,
  Wallet,
  Plus,
  Edit2,
  Settings as SettingsIcon,
  Server,
  Layers,
  Image,
  ExternalLink,
  Sun,
  Moon,
  Laptop,
  Palette,
  Check,
  Search,
  Zap,
} from 'lucide-react';
import type { Account, Category, QuickTemplate } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AccountAvatar } from '../ui/AccountAvatar';
import { CategoryIcon } from '../ui/CategoryIcon';
import { getLogoDevToken, setLogoDevToken } from '../../services/logoService';
import { useTheme, type DesignSystem } from '../../contexts/themeStore';
import { resolveTemplateAccount, resolveTemplateCategory } from '../../services/templateService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts?: Account[];
  categories?: Category[];
  templates?: QuickTemplate[];
  onEditAccount?: (account: Account) => void;
  onAddAccount?: () => void;
  onEditCategory?: (category: Category) => void;
  onAddCategory?: () => void;
  onEditTemplate?: (template: QuickTemplate) => void;
  onAddTemplate?: () => void;
  onDeleteTemplate?: (id: string) => void;
  initialTab?: SettingsTab;
}

export type SettingsTab = 'akun' | 'kategori' | 'template' | 'tampilan' | 'backend';

export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <SettingsModalContent key={props.initialTab || 'akun'} {...props} />;
};

const SettingsModalContent: React.FC<SettingsModalProps> = ({
  onClose,
  accounts = [],
  categories = [],
  templates = [],
  onEditAccount,
  onAddAccount,
  onEditCategory,
  onAddCategory,
  onEditTemplate,
  onAddTemplate,
  onDeleteTemplate: _onDeleteTemplate,
  initialTab = 'akun',
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const { theme, setTheme, designSystem, setDesignSystem, currentConfig } = useTheme();

  // Category Tab state
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<'semua' | 'pengeluaran' | 'pemasukan'>('semua');

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (categoryTypeFilter !== 'semua' && c.type !== categoryTypeFilter) {
        return false;
      }
      if (!categorySearch.trim()) return true;
      const q = categorySearch.toLowerCase().trim();
      return c.name.toLowerCase().includes(q);
    });
  }, [categories, categoryTypeFilter, categorySearch]);

  const expenseCategoryCount = useMemo(
    () => categories.filter((c) => c.type === 'pengeluaran').length,
    [categories]
  );
  const incomeCategoryCount = useMemo(
    () => categories.filter((c) => c.type === 'pemasukan').length,
    [categories]
  );

  // Supabase Backend Settings State
  const [supabaseUrl, setSupabaseUrl] = useState(
    () => localStorage.getItem('custom_supabase_url') || ''
  );
  const [supabaseKey, setSupabaseKey] = useState(
    () => localStorage.getItem('custom_supabase_key') || ''
  );
  // Logo.dev Token State
  const [logoToken, setLogoToken] = useState(() => getLogoDevToken());
  const [saved, setSaved] = useState(false);


  const designThemes: {
    id: DesignSystem;
    name: string;
    edition: string;
    tagline: string;
    description: string;
    primaryColor: string;
    accentColor: string;
    darkCanvas: string;
    lightCanvas: string;
    typography: { display: string; body: string; mono: string };
    buttonStyle: string;
    previewLabel: string;
  }[] = [
    {
      id: 'mongodb',
      name: 'MongoDB',
      edition: 'MongoDB Edition',
      tagline: 'Developer Data Platform',
      description: 'Tampilan sederhana, bersih, dan profesional dengan nuansa hijau khas MongoDB.',
      primaryColor: '#00ed64',
      accentColor: '#00684a',
      darkCanvas: '#001e2b',
      lightCanvas: '#ffffff',
      typography: { display: 'Euclid Circular A', body: 'Euclid Circular A', mono: 'Source Code Pro' },
      buttonStyle: 'Green Pill + Deep Teal Text',
      previewLabel: 'Catat Transaksi',
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      edition: 'Coinbase Edition',
      tagline: 'Financial Institutional Calm',
      description: 'Tampilan bersih, tenang, dan profesional dengan nuansa biru khas finansial modern.',
      primaryColor: '#0052ff',
      accentColor: '#003ecc',
      darkCanvas: '#0a0b0d',
      lightCanvas: '#ffffff',
      typography: { display: 'Inter (400 Calm)', body: 'Inter', mono: 'JetBrains Mono' },
      buttonStyle: 'Pill 100px (rounded-full)',
      previewLabel: 'Catat Transaksi',
    },
    {
      id: 'theverge',
      name: 'The Verge',
      edition: 'The Verge Edition',
      tagline: 'Cyber Editorial Newsprint',
      description: 'Tampilan bertema gelap dengan sentuhan warna neon yang tegas dan berani.',
      primaryColor: '#3cffd0',
      accentColor: '#5200ff',
      darkCanvas: '#131313',
      lightCanvas: '#131313',
      typography: { display: 'Anton (Condensed Heavy)', body: 'Space Grotesk', mono: 'Space Mono' },
      buttonStyle: 'Neon Mint Pill + Teks Hitam Pekat',
      previewLabel: 'CATAT TRANSAKSI',
    },
    {
      id: 'kraken',
      name: 'Kraken',
      edition: 'Kraken Edition',
      tagline: 'Crypto Modernist Classic',
      description: 'Tampilan modern dan elegan dengan nuansa ungu yang nyaman di mata.',
      primaryColor: '#7132f5',
      accentColor: '#5741d8',
      darkCanvas: '#0d0e12',
      lightCanvas: '#fafbfe',
      typography: { display: 'IBM Plex Sans', body: 'IBM Plex Sans', mono: 'JetBrains Mono' },
      buttonStyle: 'Rounded 12px + Bayangan Whisper',
      previewLabel: 'Catat Transaksi',
    },
    {
      id: 'autumn',
      name: 'Autumn',
      edition: 'Autumn Edition',
      tagline: 'Warm Insight Analytics',
      description: 'Tampilan hangat dengan nuansa warna oat dan aksen oranye musim gugur yang nyaman.',
      primaryColor: '#ea580c',
      accentColor: '#c2410c',
      darkCanvas: '#1c1917',
      lightCanvas: '#f4efea',
      typography: { display: 'Plus Jakarta Sans', body: 'Plus Jakarta Sans', mono: 'Plus Jakarta Sans' },
      buttonStyle: 'Rounded 10px + Warm Amber Accent',
      previewLabel: 'Catat Transaksi',
    },
  ];

  const handleSaveBackend = () => {
    localStorage.setItem('custom_supabase_url', supabaseUrl.trim());
    localStorage.setItem('custom_supabase_key', supabaseKey.trim());
    setLogoDevToken(logoToken.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'akun', label: 'Rekening', icon: Wallet },
    { id: 'kategori', label: 'Kategori', icon: Layers },
    { id: 'template', label: 'Template', icon: Zap },
    { id: 'tampilan', label: 'Tema', icon: Palette },
    { id: 'backend', label: 'Backend', icon: Server },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/55 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white dark:bg-[#16171f] rounded-[16px] w-full max-w-xl overflow-hidden shadow-whisper border border-[#dedee5] dark:border-[#282937] flex flex-col max-h-[90vh] transition-colors duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#dedee5] dark:border-[#282937] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-[#855bfb]/15 flex items-center justify-center text-[#7132f5] dark:text-[#a78bfa] shrink-0">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#101114] dark:text-[#f3f4f8] tracking-[-0.5px]">
                Pengaturan Aplikasi
              </h2>
              <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                Kelola rekening, kategori, template cepat, tema, dan koneksi backend
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

        {/* Tab Navigation */}
        <div className="p-2 sm:px-5 sm:pt-3 border-b border-[#dedee5] dark:border-[#282937] bg-[#fafbfe] dark:bg-[#13141c] shrink-0">
          <div className="grid grid-cols-5 gap-1 p-1 bg-[#edeef3] dark:bg-[#1e202b] rounded-[11px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1.5 sm:px-2.5 rounded-[9px] text-[11px] sm:text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-[#282937] text-[#7132f5] dark:text-[#a78bfa] shadow-micro'
                      : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* ================= TAB 1: AKUN & REKENING ================= */}
          {activeTab === 'akun' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8]">
                    Daftar Rekening & Dompet
                  </h3>
                  <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                    Total {accounts.length} akun terdaftar
                  </p>
                </div>
                {onAddAccount && (
                  <button
                    onClick={onAddAccount}
                    className="btn-kraken-primary text-xs py-2 px-3 shadow-micro flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Tambah Akun</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {accounts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#686b82] dark:text-[#9ca0ba]">
                    Belum ada akun terdaftar
                  </div>
                ) : (
                  accounts.map((acc) => {
                    const isCredit = acc.type === 'credit';
                    const bal = acc.balance ?? 0;
                    return (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-3 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937] hover:border-[#855bfb]/30 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <AccountAvatar acc={acc} />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-[#101114] dark:text-[#f3f4f8] truncate">
                              {acc.name}
                            </h4>
                            <span className="text-[10px] font-bold text-[#686b82] dark:text-[#9ca0ba] uppercase tracking-wider block">
                              {acc.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isCredit
                                ? 'text-[#101114] dark:text-[#f3f4f8]'
                                : bal < 0
                                ? 'text-[#e53e3e] dark:text-[#f87171]'
                                : 'text-[#101114] dark:text-[#f3f4f8]'
                            }`}
                          >
                            {formatCurrency(bal)}
                          </span>
                          {onEditAccount && (
                            <button
                              onClick={() => onEditAccount(acc)}
                              className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#686b82] dark:text-[#9ca0ba] hover:text-[#7132f5] dark:hover:text-[#a78bfa] hover:bg-[#855bfb]/10 transition-colors"
                              title="Edit Akun"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: KATEGORI ================= */}
          {activeTab === 'kategori' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8]">
                    Kategori Transaksi ({categories.length})
                  </h3>
                  <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                    Kelola kategori transaksi dan kustomisasi ikon sesuai kebutuhan
                  </p>
                </div>
                {onAddCategory && (
                  <button
                    type="button"
                    onClick={onAddCategory}
                    className="btn-kraken-primary text-xs py-2 px-3 shadow-micro flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Tambah Kategori</span>
                  </button>
                )}
              </div>

              {/* Search & Type Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9497a9]" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Cari nama kategori..."
                    className="w-full pl-8.5 pr-3 py-1.5 rounded-[10px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-xs text-[#101114] dark:text-[#f3f4f8] placeholder-[#9497a9] outline-none focus:border-[#7132f5] transition-all"
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={() => setCategorySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9497a9] hover:text-[#101114] dark:hover:text-[#f3f4f8]"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-[#edeef3] dark:bg-[#13141c] p-1 rounded-[10px] shrink-0">
                  <button
                    type="button"
                    onClick={() => setCategoryTypeFilter('semua')}
                    className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition-all ${
                      categoryTypeFilter === 'semua'
                        ? 'bg-white dark:bg-[#282937] text-[#101114] dark:text-[#f3f4f8] shadow-micro'
                        : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
                    }`}
                  >
                    Semua ({categories.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryTypeFilter('pengeluaran')}
                    className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition-all ${
                      categoryTypeFilter === 'pengeluaran'
                        ? 'bg-white dark:bg-[#282937] text-[#101114] dark:text-[#f3f4f8] shadow-micro'
                        : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
                    }`}
                  >
                    Keluar ({expenseCategoryCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryTypeFilter('pemasukan')}
                    className={`px-2.5 py-1 rounded-[8px] text-[11px] font-bold transition-all ${
                      categoryTypeFilter === 'pemasukan'
                        ? 'bg-white dark:bg-[#282937] text-[#101114] dark:text-[#f3f4f8] shadow-micro'
                        : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
                    }`}
                  >
                    Masuk ({incomeCategoryCount})
                  </button>
                </div>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredCategories.length === 0 ? (
                  <div className="col-span-full py-8 text-center bg-[#fafbfe] dark:bg-[#1e202b]/40 rounded-[12px] border border-dashed border-[#dedee5] dark:border-[#282937]">
                    <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                      Tidak ada kategori yang sesuai filter
                    </p>
                  </div>
                ) : (
                  filteredCategories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => onEditCategory?.(cat)}
                      className={`flex items-center justify-between p-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937] transition-all group ${
                        onEditCategory
                          ? 'hover:border-[#7132f5]/50 hover:bg-white dark:hover:bg-[#232534] cursor-pointer shadow-none hover:shadow-micro'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-[8px] bg-white dark:bg-[#282937] border border-[#dedee5] dark:border-[#35374d] flex items-center justify-center text-[#7132f5] dark:text-[#a78bfa] shadow-micro shrink-0 group-hover:scale-105 transition-transform">
                          <CategoryIcon
                            icon={cat.icon}
                            emoji={cat.emoji}
                            name={cat.name}
                            type={cat.type}
                            className="w-4 h-4"
                          />
                        </div>
                        <span className="font-bold text-xs text-[#101114] dark:text-[#f3f4f8] truncate group-hover:text-[#7132f5] dark:group-hover:text-[#a78bfa] transition-colors">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] ${
                            cat.type === 'pemasukan'
                              ? 'bg-[#149e61]/12 text-[#026b3f] dark:text-[#34d399]'
                              : 'bg-[#dedee5]/50 dark:bg-[#282937] text-[#686b82] dark:text-[#9ca0ba]'
                          }`}
                        >
                          {cat.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                        </span>
                        {onEditCategory && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCategory(cat);
                            }}
                            className="p-1 rounded-[6px] text-[#9497a9] group-hover:text-[#7132f5] dark:group-hover:text-[#a78bfa] hover:bg-[#edeef3] dark:hover:bg-[#282937] transition-colors"
                            title="Edit Kategori"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2.5: TEMPLATE FAVORIT ================= */}
          {activeTab === 'template' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8]">
                    Daftar Template Favorit ({templates.length})
                  </h3>
                  <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                    Kelola pintasan transaksi untuk pencatatan cepat di Dashboard dan Form
                  </p>
                </div>
                {onAddTemplate && (
                  <button
                    type="button"
                    onClick={onAddTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] bg-[#7132f5] hover:bg-[#5b1ecf] text-white text-xs font-bold transition-all shadow-micro self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Template</span>
                  </button>
                )}
              </div>

              {/* Template List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {templates.length === 0 ? (
                  <div className="py-8 text-center bg-[#fafbfe] dark:bg-[#1e202b]/40 rounded-[12px] border border-dashed border-[#dedee5] dark:border-[#282937]">
                    <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                      Belum ada template transaksi favorit.
                    </p>
                    {onAddTemplate && (
                      <button
                        type="button"
                        onClick={onAddTemplate}
                        className="mt-2 text-xs font-bold text-[#7132f5] dark:text-[#a78bfa] hover:underline"
                      >
                        Buat Template Baru
                      </button>
                    )}
                  </div>
                ) : (
                  templates.map((tpl) => {
                    const srcAcc = resolveTemplateAccount(accounts, tpl.sourceAccountId);
                    const dstAcc = tpl.destinationAccountId
                      ? resolveTemplateAccount(accounts, tpl.destinationAccountId)
                      : null;
                    const cat = tpl.categoryId ? resolveTemplateCategory(categories, tpl.categoryId) : null;

                    return (
                      <div
                        key={tpl.id}
                        className="flex items-center justify-between p-3 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/40 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl w-9 h-9 rounded-[9px] bg-white dark:bg-[#282937] border border-[#dedee5] dark:border-[#35374d] flex items-center justify-center shrink-0 shadow-2xs">
                            {tpl.emoji || '⚡'}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs sm:text-sm text-[#101114] dark:text-[#f3f4f8] truncate">
                                {tpl.name}
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] uppercase ${
                                  tpl.type === 'pengeluaran'
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                    : tpl.type === 'transfer'
                                    ? 'bg-[#7132f5]/10 text-[#7132f5] dark:text-[#a78bfa]'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {tpl.type === 'pengeluaran' ? 'Keluar' : tpl.type === 'transfer' ? 'Transfer' : 'Masuk'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] truncate mt-0.5">
                              {srcAcc?.name || 'Akun'}
                              {tpl.type === 'transfer' ? ` → ${dstAcc?.name || 'Tujuan'}` : cat ? ` • ${cat.name}` : ''}
                              {tpl.notes ? ` (${tpl.notes})` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-[#101114] dark:text-[#f3f4f8] tabular-nums whitespace-nowrap">
                            {formatCurrency(tpl.amount)}
                          </span>
                          {onEditTemplate && (
                            <button
                              type="button"
                              onClick={() => onEditTemplate(tpl)}
                              className="p-1.5 rounded-[8px] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#7132f5] hover:bg-white dark:hover:bg-[#282937] transition-colors"
                              title="Edit template"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: TEMA & TAMPILAN ================= */}
          {activeTab === 'tampilan' && (
            <div className="space-y-6">
              {/* Header Tab */}
              <div>
                <h3 className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8]">
                  Menu Pilihan Sistem Desain & Tema
                </h3>
                <p className="text-xs text-[#686b82] dark:text-[#9ca0ba] mt-0.5">
                  Pilih arsitektur desain yang Anda inginkan sesuai dokumentasi desain resmi platform
                </p>
              </div>

              {/* Design Systems Cards Showroom */}
              <div className="space-y-3.5">
                {designThemes.map((themeItem) => {
                  const isSelected = designSystem === themeItem.id;
                  return (
                    <div
                      key={themeItem.id}
                      onClick={() => setDesignSystem(themeItem.id)}
                      data-selected={isSelected ? "true" : "false"}
                      data-theme-id={themeItem.id}
                      className={`theme-card-container p-4 rounded-[18px] border-2 cursor-pointer transition-all relative ${
                        isSelected
                          ? 'bg-[#fafbfe] dark:bg-[#1a1c26] border-[#7132f5] dark:border-[#a78bfa] shadow-md'
                          : 'bg-[#fafbfe]/60 dark:bg-[#16171f] border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/40'
                      }`}
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3">
                          {/* Main Color Swatch */}
                          <div
                            className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm"
                            style={{
                              backgroundColor: themeItem.id === 'theverge' ? '#131313' : themeItem.primaryColor,
                              border: themeItem.id === 'theverge' ? '2px solid #3cffd0' : 'none',
                            }}
                          >
                            <span
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: themeItem.id === 'theverge' ? '#3cffd0' : themeItem.id === 'mongodb' ? '#001e2b' : '#ffffff' }}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8]">
                                {themeItem.name}
                              </h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#dedee5]/80 dark:bg-[#282937] text-[#686b82] dark:text-[#9ca0ba] font-bold">
                                {themeItem.edition}
                              </span>
                            </div>
                            <span className="theme-card-tagline text-xs font-semibold block" data-theme-id={themeItem.id}>
                              {themeItem.tagline}
                            </span>
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        <div className="shrink-0">
                          {isSelected ? (
                            <span className="theme-active-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-micro" data-active-theme={designSystem}>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Sedang Digunakan</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDesignSystem(themeItem.id);
                              }}
                              className="px-3 py-1 rounded-full border border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5] text-xs font-semibold text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] transition-colors"
                            >
                              Gunakan Tema
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#686b82] dark:text-[#9ca0ba] leading-relaxed mb-3">
                        {themeItem.description}
                      </p>

                      {/* Live Mini Preview Bar */}
                      <div className="pt-3 border-t border-[#dedee5]/70 dark:border-[#282937] flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-[#12131a] -mx-4 -mb-4 p-3.5 rounded-b-[16px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9497a9] dark:text-[#767993]">
                            Preview CTA:
                          </span>
                          <button
                            type="button"
                            data-preview-theme={themeItem.id}
                            className={`theme-preview-cta py-1.5 px-4 text-xs font-bold transition-all shadow-micro ${
                              themeItem.id === 'coinbase' || themeItem.id === 'mongodb'
                                ? 'rounded-full'
                                : themeItem.id === 'theverge'
                                ? 'font-extrabold rounded-full'
                                : 'rounded-[10px]'
                            }`}
                          >
                            {themeItem.previewLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mode Tampilan (Light / Dark / Auto) */}
              <div className="p-4 rounded-[16px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#101114] dark:text-[#f3f4f8]">
                      Mode Warna Tampilan
                    </h4>
                    <span className="text-[11px] text-[#686b82] dark:text-[#9ca0ba]">
                      Sesuaikan tingkat keterangan antarmuka
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-[12px] border text-left transition-all ${
                      theme === 'light'
                        ? 'bg-white dark:bg-[#282937] border-[#7132f5] shadow-micro'
                        : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/40'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-[#f59e0b] mb-1.5" />
                    <span className="block font-bold text-xs text-[#101114] dark:text-[#f3f4f8]">
                      Terang
                    </span>
                    <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba]">
                      Kanvas putih bersih
                    </span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-[12px] border text-left transition-all ${
                      theme === 'dark'
                        ? 'bg-white dark:bg-[#282937] border-[#7132f5] shadow-micro'
                        : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/40'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-[#7132f5] dark:text-[#a78bfa] mb-1.5" />
                    <span className="block font-bold text-xs text-[#101114] dark:text-[#f3f4f8]">
                      Gelap
                    </span>
                    <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba]">
                      Kenyamanan malam hari
                    </span>
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`p-3 rounded-[12px] border text-left transition-all ${
                      theme === 'system'
                        ? 'bg-white dark:bg-[#282937] border-[#7132f5] shadow-micro'
                        : 'border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/40'
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-[#686b82] mb-1.5" />
                    <span className="block font-bold text-xs text-[#101114] dark:text-[#f3f4f8]">
                      Sistem
                    </span>
                    <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba]">
                      Otomatis sistem OS
                    </span>
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-3.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9497a9] dark:text-[#767993] block">
                  Informasi Tema Aktif
                </span>
                <div className="flex justify-between text-xs text-[#686b82] dark:text-[#9ca0ba]">
                  <span>Sistem Desain Aktif</span>
                  <span className="font-bold text-[#101114] dark:text-[#f3f4f8]">{currentConfig.badge}</span>
                </div>
                <div className="flex justify-between text-xs text-[#686b82] dark:text-[#9ca0ba]">
                  <span>Aksen Warna Utama</span>
                  <span className="font-mono font-bold" style={{ color: currentConfig.primaryColor }}>
                    {currentConfig.primaryColor}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: BACKEND & INTEGRASI ================= */}
          {activeTab === 'backend' && (
            <div className="space-y-5">
              {/* Supabase Section */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8]">
                    Integrasi Database Supabase
                  </h3>
                  <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                    Koneksi cloud database untuk mutasi dan saldo rekening
                  </p>
                </div>

                {/* Status Badge */}
                <div
                  className={`p-3.5 rounded-[12px] flex items-center gap-3 text-xs font-semibold ${
                    isSupabaseConfigured
                      ? 'bg-[#149e61]/12 text-[#026b3f] dark:text-[#34d399] border border-[#149e61]/25'
                      : 'bg-[#fee2e2]/60 dark:bg-[#e53e3e]/15 text-[#b91c1c] dark:text-[#fca5a5] border border-[#fee2e2] dark:border-[#e53e3e]/30'
                  }`}
                >
                  {isSupabaseConfigured ? (
                    <CheckCircle2 className="w-5 h-5 text-[#149e61] dark:text-[#34d399] shrink-0" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-[#e53e3e] dark:text-[#f87171] shrink-0" />
                  )}
                  <div>
                    <span className="block font-bold">
                      {isSupabaseConfigured
                        ? 'Supabase Cloud Terhubung'
                        : 'Kredensial Belum Terpasang (Mode Offline)'}
                    </span>
                    <span className="text-[11px] font-normal opacity-90 block mt-0.5">
                      {isSupabaseConfigured
                        ? 'Seluruh mutasi, saldo rekening, dan kategori tersinkronisasi otomatis.'
                        : 'Data sementara hanya tersimpan di memori browser lokal (localStorage).'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-xs font-mono text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1">
                      Supabase Anon Key
                    </label>
                    <input
                      type="password"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-xs font-mono text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15"
                    />
                  </div>
                </div>
              </div>

              {/* Logo.dev CDN Section */}
              <div className="space-y-3 pt-3 border-t border-[#dedee5] dark:border-[#282937]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-[#7132f5] dark:text-[#a78bfa]" />
                      <h3 className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8]">
                        Logo Provider CDN (img.logo.dev)
                      </h3>
                    </div>
                    <p className="text-xs text-[#686b82] dark:text-[#9ca0ba] mt-0.5">
                      Ambil logo bank & e-wallet langsung dari API CDN <code>img.logo.dev</code>
                    </p>
                  </div>
                  <a
                    href="https://www.logo.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#7132f5] dark:text-[#a78bfa] hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>logo.dev</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Logo Token Status */}
                <div
                  className={`p-3 rounded-[10px] flex items-center gap-2.5 text-xs font-medium ${
                    logoToken.trim()
                      ? 'bg-[#149e61]/12 text-[#026b3f] dark:text-[#34d399] border border-[#149e61]/25'
                      : 'bg-[#edeef3] dark:bg-[#1e202b] text-[#686b82] dark:text-[#9ca0ba] border border-[#dedee5] dark:border-[#282937]'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      logoToken.trim() ? 'text-[#149e61] dark:text-[#34d399]' : 'text-[#9497a9] dark:text-[#767993]'
                    }`}
                  />
                  <span>
                    {logoToken.trim()
                      ? 'Token img.logo.dev terpasang (CDN live aktif).'
                      : 'Token belum diisi. Menggunakan fallback logo lokal & monogram.'}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] block mb-1">
                    Logo.dev Publishable Key (Token pk_...)
                  </label>
                  <input
                    type="text"
                    value={logoToken}
                    onChange={(e) => setLogoToken(e.target.value)}
                    placeholder="pk_xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#13141c] border border-[#dedee5] dark:border-[#282937] text-xs font-mono text-[#101114] dark:text-[#f3f4f8] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15"
                  />
                  <p className="text-[11px] text-[#9497a9] dark:text-[#767993] mt-1.5 leading-relaxed">
                    Dapat diisi di sini atau diatur melalui <code>.env</code> dengan nama key{' '}
                    <code className="text-[#7132f5] dark:text-[#a78bfa] font-mono">VITE_LOGODEV_TOKEN</code>.
                  </p>
                </div>
              </div>

              {saved && (
                <div className="p-3 rounded-[10px] bg-[#149e61]/15 text-[#026b3f] dark:text-[#34d399] text-xs font-bold text-center border border-[#149e61]/30 animate-in fade-in">
                  Konfigurasi berhasil disimpan!
                </div>
              )}

              <button
                onClick={handleSaveBackend}
                className="w-full btn-kraken-primary text-xs py-3 rounded-[12px] shadow-whisper"
              >
                Simpan Konfigurasi Backend & Logo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
