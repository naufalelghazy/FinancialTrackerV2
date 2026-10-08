import React from 'react';
import { Settings, Wallet, LayoutDashboard, CreditCard, History, Plus, RefreshCw, Sun, Moon, BarChart3 } from 'lucide-react';
import type { NavTab } from './BottomNav';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
  onSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  onOpenSettings,
  isRefreshing = false,
  isLoading = false,
  onSync,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const desktopNavItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'riwayat', label: 'Riwayat', icon: History },
    { id: 'report', label: 'Laporan', icon: BarChart3 },
    { id: 'saldo', label: 'Saldo & Rekening', icon: Wallet },
    { id: 'tagihan', label: 'Tagihan', icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#16171f]/95 backdrop-blur-sm border-b border-[#dedee5] dark:border-[#282937] shadow-micro transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onChangeTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none"
          role="button"
          tabIndex={0}
        >
          <div className="w-9 h-9 rounded-[10px] bg-[#7132f5] flex items-center justify-center text-white shadow-micro shrink-0">
            <Wallet className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg text-[#101114] dark:text-[#f3f4f8] tracking-[-0.5px] block leading-none">
              Financial Tracker
            </span>
            <span className="text-[10px] font-semibold text-[#7132f5] dark:text-[#a78bfa] tracking-wider uppercase">
              Kraken Edition
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#edeef3] dark:bg-[#1e202b] p-1 rounded-[12px] border border-[#dedee5] dark:border-[#282937]">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[9px] text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#282937] text-[#101114] dark:text-[#f3f4f8] shadow-micro'
                    : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#7132f5] dark:text-[#a78bfa]' : 'text-[#686b82] dark:text-[#9ca0ba]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle, Sync, Catat Transaksi CTA & Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Catat Transaksi Button on Desktop */}
          <button
            onClick={() => onChangeTab('input')}
            className={`hidden sm:flex items-center gap-1.5 py-2 px-3.5 rounded-[12px] text-xs font-bold transition-all shadow-micro ${
              activeTab === 'input'
                ? 'bg-[#5741d8] text-white'
                : 'bg-[#7132f5] hover:bg-[#5741d8] text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Catat Transaksi</span>
          </button>

          {/* Theme Quick Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] transition-colors border border-[#dedee5] dark:border-[#282937]"
            title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Ganti Tema"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#f59e0b]" />
            ) : (
              <Moon className="w-4 h-4 text-[#7132f5]" />
            )}
          </button>

          {/* Sync Button */}
          {onSync && (
            <button
              onClick={onSync}
              disabled={isRefreshing || isLoading}
              title="Sinkronkan data dengan Supabase"
              className="h-9 px-2.5 sm:px-3 rounded-[10px] border border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/40 bg-[#fafbfe] dark:bg-[#1e202b] text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#7132f5] dark:text-[#a78bfa] ${isRefreshing || isLoading ? 'animate-spin' : ''}`}
              />
              <span className="hidden lg:inline">{isRefreshing ? 'Sinkron...' : 'Sinkronkan'}</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] hover:bg-[#edeef3] dark:hover:bg-[#1e202b] transition-colors active:scale-95 border border-[#dedee5] dark:border-[#282937]"
            aria-label="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
