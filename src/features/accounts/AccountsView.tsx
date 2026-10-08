import React from 'react';
import type { Account } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { Wallet } from 'lucide-react';

interface AccountsViewProps {
  accounts: Account[];
}

export const AccountsView: React.FC<AccountsViewProps> = ({ accounts }) => {
  const bankAccounts = accounts.filter((a) => a.type !== 'credit');
  const totalBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Total Saldo Card - Kraken Purple Commanding Hero */}
      <div className="bg-[#7132f5] text-white rounded-[16px] p-6 shadow-whisper relative overflow-hidden border border-[#5741d8]">
        <div className="flex items-center gap-2 text-white/80 text-[11px] font-semibold uppercase tracking-wider">
          <Wallet className="w-3.5 h-3.5" />
          Total Saldo Tersedia
        </div>
        <div className="text-3xl font-bold mt-2 tracking-[-0.8px]">
          {formatCurrency(totalBalance)}
        </div>
        <div className="text-xs text-white/70 mt-1">
          {bankAccounts.length} Akun (Bank & E-Wallet)
        </div>
      </div>

      {/* Account List */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] px-1">
          Daftar Rekening & Dompet
        </h3>
        {bankAccounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center justify-between p-3.5 bg-white rounded-[12px] border border-[#dedee5] shadow-micro hover:border-[#686b82]/40 transition-all"
          >
            <div className="flex items-center gap-3">
              {acc.icon ? (
                <img
                  src={acc.icon}
                  alt={acc.name}
                  className="w-10 h-10 object-contain rounded-[8px] bg-[#fafbfe] p-1 border border-[#dedee5]"
                />
              ) : (
                <div className="w-10 h-10 rounded-[8px] bg-[#edeef3] flex items-center justify-center text-lg">
                  {acc.emoji || '💰'}
                </div>
              )}
              <div>
                <span className="font-bold text-sm text-[#101114] block tracking-tight">
                  {acc.name}
                </span>
                <span className="text-[11px] text-[#686b82] capitalize font-medium">
                  {acc.type}
                </span>
              </div>
            </div>
            <span
              className={`font-bold text-sm tracking-tight ${
                acc.balance >= 0 ? 'text-[#101114]' : 'text-[#e53e3e]'
              }`}
            >
              {formatCurrency(acc.balance)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
