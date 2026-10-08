import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldAlert,
  Wallet,
  Info,
  Plus,
  Edit2,
  Settings as SettingsIcon,
  Server,
  Layers,
} from 'lucide-react';
import type { Account, Category } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AccountAvatar } from '../../features/accounts/AccountsView';
import { CategoryIcon } from '../ui/CategoryIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts?: Account[];
  categories?: Category[];
  onEditAccount?: (account: Account) => void;
  onAddAccount?: () => void;
}

type SettingsTab = 'akun' | 'kategori' | 'backend' | 'info';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  accounts = [],
  categories = [],
  onEditAccount,
  onAddAccount,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('akun');

  // Supabase Backend Settings State
  const [supabaseUrl, setSupabaseUrl] = useState(
    () => localStorage.getItem('custom_supabase_url') || ''
  );
  const [supabaseKey, setSupabaseKey] = useState(
    () => localStorage.getItem('custom_supabase_key') || ''
  );
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveBackend = () => {
    localStorage.setItem('custom_supabase_url', supabaseUrl.trim());
    localStorage.setItem('custom_supabase_key', supabaseKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'akun', label: 'Akun & Rekening', icon: Wallet },
    { id: 'kategori', label: 'Kategori', icon: Layers },
    { id: 'backend', label: 'Backend Database', icon: Server },
    { id: 'info', label: 'Tentang Aplikasi', icon: Info },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-[16px] w-full max-w-xl overflow-hidden shadow-whisper border border-[#dedee5] max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#dedee5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#855bfb]/15 text-[#7132f5] flex items-center justify-center shrink-0">
              <SettingsIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-[#101114] tracking-[-0.5px]">
                Pengaturan Aplikasi
              </h2>
              <p className="text-xs text-[#686b82]">
                Kelola akun, data kategori, dan koneksi backend
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

        {/* Tab Segmented Control */}
        <div className="p-3 bg-[#f8f9fc] border-b border-[#dedee5] shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-[#edeef3] rounded-[12px]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-[9px] text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-[#7132f5] shadow-micro'
                      : 'text-[#686b82] hover:text-[#101114]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Body Content (Scrollable) */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* ================= TAB 1: AKUN & REKENING ================= */}
          {activeTab === 'akun' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#101114]">
                    Daftar Rekening & Dompet
                  </h3>
                  <p className="text-xs text-[#686b82]">
                    Total {accounts.length} akun terdaftar
                  </p>
                </div>
                {onAddAccount && (
                  <button
                    onClick={() => {
                      onAddAccount();
                      onClose();
                    }}
                    className="btn-kraken-primary text-xs py-2 px-3 shadow-micro flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Tambah Akun</span>
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#dedee5]/70 border border-[#dedee5] rounded-[12px] overflow-hidden bg-white shadow-micro">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#fafbfe] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AccountAvatar acc={acc} />
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-[#101114] block truncate">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-[#686b82] font-semibold uppercase">
                          {acc.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`font-bold text-xs sm:text-sm tabular-nums ${
                          acc.balance < 0 ? 'text-[#e53e3e]' : 'text-[#101114]'
                        }`}
                      >
                        {formatCurrency(acc.balance)}
                      </span>
                      {onEditAccount && (
                        <button
                          onClick={() => {
                            onEditAccount(acc);
                            onClose();
                          }}
                          className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#686b82] hover:text-[#7132f5] hover:bg-[#855bfb]/10 transition-colors"
                          title="Edit Akun"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: KATEGORI ================= */}
          {activeTab === 'kategori' && (
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-sm text-[#101114]">
                  Kategori Transaksi ({categories.length})
                </h3>
                <p className="text-xs text-[#686b82]">
                  Ikon dan klasifikasi pengeluaran & pemasukan
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#fafbfe] border border-[#dedee5]/80"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CategoryIcon name={cat.name} type={cat.type} size="sm" />
                      <span className="text-xs font-semibold text-[#101114] truncate">
                        {cat.name}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] shrink-0 ${
                        cat.type === 'pemasukan'
                          ? 'bg-[#149e61]/15 text-[#026b3f]'
                          : 'bg-[#edeef3] text-[#686b82]'
                      }`}
                    >
                      {cat.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: BACKEND & DATABASE ================= */}
          {activeTab === 'backend' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-[#101114]">
                  Integrasi Backend Supabase
                </h3>
                <p className="text-xs text-[#686b82]">
                  Kelola URL project dan anon key untuk sinkronisasi cloud
                </p>
              </div>

              {/* Status Badge */}
              <div
                className={`p-3.5 rounded-[12px] flex items-center gap-3 text-xs font-semibold ${
                  isSupabaseConfigured
                    ? 'bg-[#149e61]/12 text-[#026b3f] border border-[#149e61]/25'
                    : 'bg-[#fee2e2]/60 text-[#b91c1c] border border-[#fee2e2]'
                }`}
              >
                {isSupabaseConfigured ? (
                  <CheckCircle2 className="w-5 h-5 text-[#149e61] shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-[#e53e3e] shrink-0" />
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

              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#686b82] block mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-xs font-mono text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#686b82] block mb-1">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#fafbfe] border border-[#dedee5] text-xs font-mono text-[#101114] outline-none focus:border-[#7132f5] focus:ring-2 focus:ring-[#855bfb]/15"
                  />
                </div>
              </div>

              {saved && (
                <div className="p-3 rounded-[10px] bg-[#149e61]/15 text-[#026b3f] text-xs font-bold text-center border border-[#149e61]/30 animate-in fade-in">
                  Kredensial backend berhasil diperbarui!
                </div>
              )}

              <button
                onClick={handleSaveBackend}
                className="w-full btn-kraken-primary text-xs py-3 rounded-[12px] shadow-whisper"
              >
                Simpan Konfigurasi Backend
              </button>
            </div>
          )}

          {/* ================= TAB 4: INFO APLIKASI ================= */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="p-4 rounded-[14px] bg-[#fafbfe] border border-[#dedee5] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#7132f5] text-white flex items-center justify-center font-bold text-base shadow-micro">
                    FT
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#101114]">
                      Financial Tracker
                    </h3>
                    <p className="text-xs text-[#7132f5] font-semibold">
                      Kraken Edition v2.0
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#686b82] leading-relaxed">
                  Aplikasi pelacak keuangan pribadi berstandar Kraken Design System dengan arsitektur modern, dukungan responsif penuh untuk desktop dan mobile, serta integrasi Supabase Database.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-[#dedee5]/70">
                  <span className="text-[#686b82]">Mata Uang</span>
                  <span className="font-semibold text-[#101114]">Indonesian Rupiah (IDR)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#dedee5]/70">
                  <span className="text-[#686b82]">Format Tanggal</span>
                  <span className="font-semibold text-[#101114]">Bahasa Indonesia (YYYY-MM-DD)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#dedee5]/70">
                  <span className="text-[#686b82]">Framework</span>
                  <span className="font-semibold text-[#101114]">React 19 + Vite 8 + Tailwind CSS v4</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
