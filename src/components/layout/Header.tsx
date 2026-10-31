import React from 'react';
import { Wallet, LayoutDashboard, CreditCard, History, Plus, Sun, Moon, BarChart3, Settings, Mic } from 'lucide-react';
import type { NavTab } from './BottomNav';
import { SyncBadge } from './SyncBadge';
import { useTheme } from '../../contexts/themeStore';

interface HeaderProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenSettings: (tab?: 'akun' | 'kategori' | 'tampilan' | 'backend') => void;
  onOpenVoiceModal?: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
  onSync?: () => void;
  pendingSyncCount?: number;
  isOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  onOpenSettings,
  onOpenVoiceModal,
  isRefreshing = false,
  isLoading = false,
  onSync,
  pendingSyncCount = 0,
  isOnline = true,
}) => {
  const { isDark, toggleTheme, currentConfig } = useTheme();

  const desktopNavItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'riwayat', label: 'Riwayat', icon: History },
    { id: 'report', label: 'Laporan', icon: BarChart3 },
    { id: 'saldo', label: 'Saldo & Rekening', icon: Wallet },
    { id: 'tagihan', label: 'Tagihan', icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#16171f]/95 backdrop-blur-sm border-b border-hairline dark:border-[#282937] shadow-micro transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onChangeTab('dashboard')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChangeTab('dashboard');
            }
          }}
          className="flex items-center gap-3 cursor-pointer select-none"
          role="button"
          tabIndex={0}
          aria-label="Buka dashboard"
        >
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center shadow-micro shrink-0 transition-colors"
            style={{ backgroundColor: currentConfig.primaryColor }}
          >
            <Wallet className={`w-5 h-5 stroke-[2.2] ${currentConfig.id === 'theverge' ? 'text-black' : 'text-white'}`} />
          </div>
          <span className="font-bold text-base sm:text-lg text-ink dark:text-[#f3f4f8] tracking-[-0.5px] block leading-none">
            Financial Tracker
          </span>
        </div>

        {/* Desktop Navigation Tabs (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-sunken dark:bg-[#1e202b] p-1 rounded-[12px] border border-hairline dark:border-[#282937]">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[9px] text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#282937] text-ink dark:text-[#f3f4f8] shadow-micro'
                    : 'text-ink-muted dark:text-[#9ca0ba] hover:text-ink dark:hover:text-[#f3f4f8]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-text dark:text-[#a78bfa]' : 'text-ink-muted dark:text-[#9ca0ba]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Theme Menu Dropdown, Theme Toggle, Sync, Catat Transaksi CTA & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Catat Transaksi Button on Desktop */}
          <button
            onClick={() => onChangeTab('input')}
            className={`hidden sm:flex items-center gap-1.5 py-2 px-3.5 rounded-[12px] text-xs font-bold transition-all shadow-micro btn-kraken-primary ${
              activeTab === 'input'
                ? 'ring-2 ring-black/25 dark:ring-white/30 brightness-95'
                : ''
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Catat Transaksi</span>
          </button>

          {/* Quick Voice Input Button */}
          {onOpenVoiceModal && (
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-brand-text dark:text-[#3cffd0] hover:bg-surface-sunken dark:hover:bg-[#1e202b] transition-colors border border-hairline dark:border-[#282937]"
              title="Input Transaksi Pakai Suara"
              aria-label="Input Transaksi Pakai Suara"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          {/* Theme Quick Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-ink-muted dark:text-[#9ca0ba] hover:text-ink dark:hover:text-[#f3f4f8] hover:bg-surface-sunken dark:hover:bg-[#1e202b] transition-colors border border-hairline dark:border-[#282937]"
            title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            aria-label="Ganti Mode Tampilan"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#f59e0b]" />
            ) : (
              <Moon className="w-4 h-4 text-brand-text" />
            )}
          </button>

          {/* Sync Button with Visual Offline Outbox Badge */}
          {onSync && (
            <SyncBadge
              isOnline={isOnline}
              pendingSyncCount={pendingSyncCount}
              isRefreshing={isRefreshing}
              isLoading={isLoading}
              onSync={onSync}
              testId="pending-sync-badge"
            />
          )}

          {/* Settings Button */}
          <button
            onClick={() => onOpenSettings()}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-ink-muted dark:text-[#9ca0ba] hover:text-ink dark:hover:text-[#f3f4f8] hover:bg-surface-sunken dark:hover:bg-[#1e202b] transition-colors active:scale-95 border border-hairline dark:border-[#282937]"
            aria-label="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};