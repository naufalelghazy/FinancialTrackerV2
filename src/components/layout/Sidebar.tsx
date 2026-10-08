import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  History,
  Plus,
  Settings,
  RefreshCw,
  Sun,
  Moon,
  BarChart3,
} from 'lucide-react';
import type { NavTab } from './BottomNav';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
  onSync?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  onOpenSettings,
  isRefreshing = false,
  isLoading = false,
  onSync,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'riwayat', label: 'Riwayat Transaksi', icon: History },
    { id: 'report', label: 'Laporan & Grafik', icon: BarChart3 },
    { id: 'saldo', label: 'Saldo & Rekening', icon: Wallet },
    { id: 'tagihan', label: 'Tagihan & Pinjaman', icon: CreditCard },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 bg-white dark:bg-[#16171f] border-r border-[#dedee5] dark:border-[#282937] p-5 select-none shrink-0 shadow-[1px_0_12px_rgba(0,0,0,0.02)] dark:shadow-[1px_0_12px_rgba(0,0,0,0.3)] z-30 transition-colors duration-200">
      {/* Top Portion: Brand & Navigation */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div
          onClick={() => onChangeTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <div className="w-10 h-10 rounded-[12px] bg-[#7132f5] text-white flex items-center justify-center shadow-micro group-hover:bg-[#5741d8] transition-colors shrink-0">
            <Wallet className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-bold text-base text-[#101114] dark:text-[#f3f4f8] tracking-[-0.5px] block leading-tight">
              Financial Tracker
            </span>
            <span className="text-[10px] font-bold text-[#7132f5] dark:text-[#a78bfa] tracking-wider uppercase">
              Kraken Edition
            </span>
          </div>
        </div>

        {/* Primary CTA: Catat Transaksi */}
        <button
          onClick={() => onChangeTab('input')}
          className={`w-full py-3 px-4 rounded-[12px] text-xs font-bold flex items-center justify-center gap-2 shadow-whisper transition-all active:scale-[0.98] ${
            activeTab === 'input'
              ? 'bg-[#5741d8] text-white ring-2 ring-[#855bfb]/30'
              : 'btn-kraken-primary text-white'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Catat Transaksi Baru</span>
        </button>

        {/* Main Navigation Menu */}
        <nav className="space-y-1.5 pt-2">
          <span className="text-[10px] uppercase font-bold text-[#9497a9] dark:text-[#767993] tracking-wider px-3 mb-2 block">
            Menu Utama
          </span>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-xs font-bold transition-all text-left group ${
                  isActive
                    ? 'bg-[#855bfb]/15 text-[#7132f5] dark:text-[#a78bfa] shadow-micro border border-[#855bfb]/20'
                    : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] hover:bg-[#fafbfe] dark:hover:bg-[#1e202b]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-[#7132f5] text-white'
                      : 'bg-[#edeef3] dark:bg-[#232534] text-[#686b82] dark:text-[#9ca0ba] group-hover:text-[#101114] dark:group-hover:text-[#f3f4f8] group-hover:bg-[#dedee5] dark:group-hover:bg-[#2d3042]'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="tracking-tight text-[13px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Portion: Theme Toggle, Sync & Settings */}
      <div className="pt-4 border-t border-[#dedee5] dark:border-[#282937] space-y-2">
        {/* Quick Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full py-2.5 px-3 rounded-[10px] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] text-xs font-semibold flex items-center justify-between transition-colors"
          title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          <div className="flex items-center gap-2.5">
            {isDark ? (
              <Sun className="w-4 h-4 text-[#f59e0b]" />
            ) : (
              <Moon className="w-4 h-4 text-[#7132f5]" />
            )}
            <span>{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9497a9] dark:text-[#767993]">
            {isDark ? 'Gelap' : 'Terang'}
          </span>
        </button>

        {/* Sync Button */}
        {onSync && (
          <button
            onClick={onSync}
            disabled={isRefreshing || isLoading}
            className="w-full py-2.5 px-3 rounded-[10px] border border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/40 bg-[#fafbfe] dark:bg-[#1e202b] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] text-xs font-semibold flex items-center justify-between transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#7132f5] dark:text-[#a78bfa] ${
                  isRefreshing || isLoading ? 'animate-spin' : ''
                }`}
              />
              <span>{isRefreshing ? 'Menyinkronkan...' : 'Sinkron Supabase'}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#149e61]" title="Terhubung" />
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="w-full py-2.5 px-3 rounded-[10px] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] text-xs font-semibold flex items-center gap-2.5 transition-colors"
        >
          <Settings className="w-4 h-4 text-[#686b82] dark:text-[#9ca0ba]" />
          <span>Pengaturan Aplikasi</span>
        </button>
      </div>
    </aside>
  );
};
