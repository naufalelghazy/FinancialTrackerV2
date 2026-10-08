import React from 'react';
import { Settings, Wallet } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#dedee5] shadow-micro">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#7132f5] flex items-center justify-center text-white shadow-micro">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-base text-[#101114] tracking-[-0.5px] block leading-none">
              Financial Tracker
            </span>
            <span className="text-[10px] font-medium text-[#686b82] tracking-wider uppercase">
              Kraken Edition
            </span>
          </div>
        </div>
        
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[#686b82] hover:text-[#101114] hover:bg-[#686b82]/10 transition-colors active:scale-95 border border-[#dedee5]"
          aria-label="Pengaturan"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
