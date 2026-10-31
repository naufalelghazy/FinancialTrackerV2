import React from "react";
import {
  LayoutDashboard,
  Wallet,
  History,
  Plus,
  BarChart3,
} from "lucide-react";

export type NavTab =
  "dashboard" | "saldo" | "input" | "tagihan" | "riwayat" | "report";

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    { id: "dashboard" as NavTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "riwayat" as NavTab, label: "Riwayat", icon: History },
    { id: "input" as NavTab, label: "Catat", icon: Plus, isPrimary: true },
    { id: "report" as NavTab, label: "Laporan", icon: BarChart3 },
    { id: "saldo" as NavTab, label: "Saldo", icon: Wallet },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-hairline shadow-whisper transition-colors duration-200">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 py-1.5 safe-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-3.5 relative group"
                aria-label="Catat Transaksi"
              >
                <div
                  className={`w-11 h-11 rounded-[12px] flex items-center justify-center shadow-whisper transition-all active:scale-95 btn-kraken-primary ${
                    isActive
                      ? "ring-4 ring-black/20 dark:ring-white/30 brightness-95"
                      : ""
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-brand-text">
                  Catat
                </span>
              </button>
            );
          }

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-[10px] transition-all ${
                isActive
                  ? "text-brand-text font-bold"
                  : "text-ink-muted hover:text-ink font-medium"
              }`}
            >
              <div
                className={`p-1 rounded-[8px] transition-colors ${
                  isActive ? "bg-brand-soft text-brand-text" : ""
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
