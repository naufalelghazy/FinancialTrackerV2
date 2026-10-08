import React from 'react';
import { LayoutDashboard, Wallet, CreditCard, History, Plus } from 'lucide-react';

export type NavTab = 'dashboard' | 'saldo' | 'input' | 'tagihan' | 'riwayat';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'saldo' as NavTab, label: 'Saldo', icon: Wallet },
    { id: 'input' as NavTab, label: 'Catat', icon: Plus, isPrimary: true },
    { id: 'tagihan' as NavTab, label: 'Tagihan', icon: CreditCard },
    { id: 'riwayat' as NavTab, label: 'Riwayat', icon: History },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#16171f]/95 backdrop-blur-md border-t border-[#dedee5] dark:border-[#282937] shadow-whisper transition-colors duration-200">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 py-1.5 safe-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-3.5 relative group"
                aria-label="Catat Transaksi"
              >
                <div
                  className={`w-11 h-11 rounded-[12px] flex items-center justify-center text-white shadow-whisper transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#5741d8] ring-4 ring-[#855bfb]/20'
                      : 'bg-[#7132f5] hover:bg-[#5741d8]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-[#7132f5] dark:text-[#a78bfa]">
                  Catat
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-[10px] transition-all ${
                isActive
                  ? 'text-[#7132f5] dark:text-[#a78bfa] font-bold'
                  : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114] dark:hover:text-[#f3f4f8] font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-[8px] transition-colors ${
                  isActive ? 'bg-[#855bfb]/15 text-[#7132f5] dark:text-[#a78bfa]' : ''
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
