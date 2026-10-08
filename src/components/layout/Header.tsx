import React from 'react';
import { Settings, Wallet } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
            <Wallet className="w-5 h-5 text-amber-300" />
          </div>
          <span className="font-bold text-lg tracking-tight">Financial Tracker</span>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95"
          aria-label="Pengaturan"
        >
          <Settings className="w-5 h-5 text-white/90" />
        </button>
      </div>
    </header>
  );
};
