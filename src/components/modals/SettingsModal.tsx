import React, { useState } from 'react';
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
} from 'lucide-react';
import type { Account, Category } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AccountAvatar } from '../../features/accounts/AccountsView';
import { CategoryIcon } from '../ui/CategoryIcon';
import { getLogoDevToken, setLogoDevToken } from '../../services/logoService';
import { useTheme } from '../../contexts/ThemeContext';
import type { ThemeMode } from '../../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts?: Account[];
  categories?: Category[];
  onEditAccount?: (account: Account) => void;
  onAddAccount?: () => void;
}

type SettingsTab = 'akun' | 'kategori' | 'tampilan' | 'backend';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  accounts = [],
  categories = [],
  onEditAccount,
  onAddAccount,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('akun');
  const { theme, setTheme } = useTheme();

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

  if (!isOpen) return null;

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
    { id: 'akun', label: 'Akun & Rekening', icon: Wallet },
    { id: 'kategori', label: 'Kategori', icon: Layers },
    { id: 'tampilan', label: 'Tema & Tampilan', icon: Palette },
    { id: 'backend', label: 'Backend Database', icon: Server },
  ];

  const themeOptions: {
    id: ThemeMode;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'light',
      label: 'Tema Terang (Light Mode)',
      description: 'Latar putih bersih khas Kraken, kontras tinggi dan cerah.',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Tema Gelap (Dark Mode)',
      description: 'Mode malam bernuansa deep Kraken dark (#0d0e12), nyaman di mata.',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'Ikuti Sistem Perangkat',
      description: 'Menyesuaikan otomatis dengan preferensi tema sistem operasi Anda.',
      icon: Laptop,
    },
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
                Kelola akun, data kategori, tema tampilan, dan koneksi backend
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
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#edeef3] dark:bg-[#1e202b] rounded-[11px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-[9px] text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-[#282937] text-[#7132f5] dark:text-[#a78bfa] shadow-micro'
                      : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
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
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8]">
                  Kategori Transaksi ({categories.length})
                </h3>
                <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                  Ikon dan klasifikasi pengeluaran & pemasukan
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[8px] bg-white dark:bg-[#282937] border border-[#dedee5] dark:border-[#35374d] flex items-center justify-center text-[#7132f5] dark:text-[#a78bfa] shadow-micro shrink-0">
                        <CategoryIcon name={cat.name} type={cat.type} className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-[#101114] dark:text-[#f3f4f8] truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] ${
                        cat.type === 'pemasukan'
                          ? 'bg-[#149e61]/12 text-[#026b3f] dark:text-[#34d399]'
                          : 'bg-[#dedee5]/50 dark:bg-[#282937] text-[#686b82] dark:text-[#9ca0ba]'
                      }`}
                    >
                      {cat.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: TEMA & TAMPILAN ================= */}
          {activeTab === 'tampilan' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8]">
                  Pilihan Tema Aplikasi
                </h3>
                <p className="text-xs text-[#686b82] dark:text-[#9ca0ba]">
                  Sesuaikan kenyamanan visual sesuai selera atau kondisi pencahayaan
                </p>
              </div>

              {/* Theme Options Grid */}
              <div className="space-y-2.5">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = theme === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      className={`p-3.5 rounded-[14px] border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'bg-[#855bfb]/10 dark:bg-[#855bfb]/15 border-[#7132f5] shadow-micro'
                          : 'bg-[#fafbfe] dark:bg-[#1e202b] border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/40'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#7132f5] text-white shadow-micro'
                            : 'bg-white dark:bg-[#282937] border border-[#dedee5] dark:border-[#35374d] text-[#686b82] dark:text-[#9ca0ba]'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-[#101114] dark:text-[#f3f4f8]">
                            {opt.label}
                          </h4>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-[#7132f5] dark:text-[#a78bfa] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aktif</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info Box */}
              <div className="p-3.5 rounded-[12px] bg-[#fafbfe] dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937] space-y-2 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9497a9] dark:text-[#767993] block">
                  Informasi Sistem
                </span>
                <div className="flex justify-between text-xs text-[#686b82] dark:text-[#9ca0ba]">
                  <span>Versi Aplikasi</span>
                  <span className="font-bold text-[#101114] dark:text-[#f3f4f8]">Kraken Edition v2.0</span>
                </div>
                <div className="flex justify-between text-xs text-[#686b82] dark:text-[#9ca0ba]">
                  <span>Mata Uang</span>
                  <span className="font-bold text-[#101114] dark:text-[#f3f4f8]">IDR (Rp)</span>
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
