import React from 'react';
import { Settings, Wallet, LayoutDashboard, CreditCard, History, Plus, RefreshCw } from 'lucide-react';
import type { NavTab } from './BottomNav';

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
  const desktopNavItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'saldo', label: 'Saldo & Rekening', icon: Wallet },
    { id: 'tagihan', label: 'Tagihan', icon: CreditCard },
    { id: 'riwayat', label: 'Riwayat', icon: History },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#dedee5] shadow-micro">
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
            <span className="font-bold text-base sm:text-lg text-[#101114] tracking-[-0.5px] block leading-none">
              Financial Tracker
            </span>
            <span className="text-[10px] font-semibold text-[#7132f5] tracking-wider uppercase">
              Kraken Edition
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#edeef3] p-1 rounded-[12px] border border-[#dedee5]">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[9px] text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-[#101114] shadow-micro'
                    : 'text-[#686b82] hover:text-[#101114]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#7132f5]' : 'text-[#686b82]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Sync, Catat Transaksi CTA & Settings */}
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

          {/* Sync Button */}
          {onSync && (
            <button
              onClick={onSync}
              disabled={isRefreshing || isLoading}
              title="Sinkronkan data dengan Supabase"
              className="h-9 px-2.5 sm:px-3 rounded-[10px] border border-[#dedee5] hover:border-[#7132f5]/40 bg-[#fafbfe] text-[#686b82] hover:text-[#101114] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#7132f5] ${isRefreshing || isLoading ? 'animate-spin' : ''}`}
              />
              <span className="hidden lg:inline">{isRefreshing ? 'Sinkron...' : 'Sinkronkan'}</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#686b82] hover:text-[#101114] hover:bg-[#edeef3] transition-colors active:scale-95 border border-[#dedee5]"
            aria-label="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
