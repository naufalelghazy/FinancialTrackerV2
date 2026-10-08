import React from 'react';
import { PenSquare, Wallet, CreditCard, History } from 'lucide-react';

export type NavTab = 'input' | 'saldo' | 'tagihan' | 'riwayat';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'input' as NavTab, label: 'Input', icon: PenSquare },
    { id: 'saldo' as NavTab, label: 'Saldo', icon: Wallet },
    { id: 'tagihan' as NavTab, label: 'Tagihan', icon: CreditCard },
    { id: 'riwayat' as NavTab, label: 'Riwayat', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#dedee5] shadow-micro">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-[12px] transition-all ${
                isActive
                  ? 'text-[#7132f5] font-semibold'
                  : 'text-[#686b82] hover:text-[#101114] font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-[8px] transition-colors ${
                  isActive ? 'bg-[#855bfb]/15 text-[#7132f5]' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
