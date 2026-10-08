import React, { useState } from 'react';
import type { Account } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { Wallet, Plus, Edit2 } from 'lucide-react';
import { BANK_ICON_MAP } from '../../services/financialService';

interface AccountsViewProps {
  accounts: Account[];
  onEditAccount: (account: Account) => void;
  onAddAccount: () => void;
}

export const AccountAvatar: React.FC<{ acc: Account }> = ({ acc }) => {
  const [hasError, setHasError] = useState(false);
  const iconSrc = acc.icon || BANK_ICON_MAP[acc.name.trim().toLowerCase()];

  if (iconSrc && !hasError) {
    return (
      <img
        src={iconSrc}
        alt={acc.name}
        onError={() => setHasError(true)}
        className="w-10 h-10 object-contain rounded-[8px] bg-white p-1 border border-[#dedee5] shadow-sm"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-[8px] bg-[#f1edfe] text-[#7132f5] flex items-center justify-center text-xs font-bold border border-[#dedee5]">
      {acc.name.slice(0, 3).toUpperCase()}
    </div>
  );
};

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  onEditAccount,
  onAddAccount,
}) => {
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

      {/* Account List Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82]">
            Daftar Rekening & Dompet
          </h3>
          <button
            onClick={onAddAccount}
            className="flex items-center gap-1 text-xs font-bold text-[#7132f5] hover:text-[#5741d8] py-1 px-2.5 rounded-[8px] hover:bg-[#855bfb]/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Akun</span>
          </button>
        </div>

        {bankAccounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => onEditAccount(acc)}
            className="group flex items-center justify-between p-3.5 bg-white rounded-[12px] border border-[#dedee5] shadow-micro hover:border-[#7132f5]/50 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEditAccount(acc);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <AccountAvatar acc={acc} />
              <div>
                <span className="font-bold text-sm text-[#101114] block tracking-tight group-hover:text-[#7132f5] transition-colors">
                  {acc.name}
                </span>
                <span className="text-[11px] text-[#686b82] capitalize font-medium">
                  {acc.type}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-sm tracking-tight ${
                  acc.balance >= 0 ? 'text-[#101114]' : 'text-[#e53e3e]'
                }`}
              >
                {formatCurrency(acc.balance)}
              </span>
              <div className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#9497a9] group-hover:text-[#7132f5] group-hover:bg-[#855bfb]/10 transition-all">
                <Edit2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
