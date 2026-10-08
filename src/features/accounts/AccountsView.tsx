import React, { useState } from 'react';
import type { Account } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { Wallet, Plus, Edit2 } from 'lucide-react';

interface AccountsViewProps {
  accounts: Account[];
  onEditAccount: (account: Account) => void;
  onAddAccount: () => void;
}

import { getLogoDevUrl, getLocalFallback } from '../../services/logoService';

export const AccountAvatar: React.FC<{ acc: Account }> = ({ acc }) => {
  const [hasError, setHasError] = useState(false);
  const logoDevUrl = getLogoDevUrl(acc.name, acc.website);
  const localFallback = getLocalFallback(acc.name);
  const candidateUrl = !hasError && (acc.icon || logoDevUrl);

  if (candidateUrl) {
    return (
      <img
        src={candidateUrl}
        alt={acc.name}
        onError={() => setHasError(true)}
        className="w-10 h-10 object-contain rounded-[8px] bg-white dark:bg-[#252836] p-1 border border-[#dedee5] dark:border-[#282937] shadow-sm shrink-0"
      />
    );
  }

  if (localFallback) {
    return (
      <img
        src={localFallback}
        alt={acc.name}
        className="w-10 h-10 object-contain rounded-[8px] bg-white dark:bg-[#252836] p-1 border border-[#dedee5] dark:border-[#282937] shadow-sm shrink-0"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-[8px] bg-[#f1edfe] text-[#7132f5] flex items-center justify-center text-xs font-bold border border-[#dedee5] dark:border-[#282937] shrink-0">
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
    <div className="space-y-6 pb-24">
      {/* Total Saldo Card - Kraken Purple Commanding Hero */}
      <div className="bg-[#7132f5] text-white rounded-[16px] p-6 shadow-whisper relative overflow-hidden border border-[#5741d8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/80 text-[11px] font-semibold uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5" />
            Total Saldo Tersedia
          </div>
          <div className="text-3xl sm:text-4xl font-bold mt-2 tracking-[-0.8px]">
            {formatCurrency(totalBalance)}
          </div>
          <div className="text-xs text-white/70 mt-1">
            {bankAccounts.length} Akun (Bank, E-Wallet & Kas Tunai)
          </div>
        </div>

        <button
          onClick={onAddAccount}
          className="self-start sm:self-auto py-2.5 px-4 rounded-[12px] bg-white text-[#7132f5] hover:bg-white/90 text-xs font-bold shadow-whisper flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Account List Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba]">
            Daftar Rekening & Dompet ({bankAccounts.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {bankAccounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => onEditAccount(acc)}
              className="group flex items-center justify-between p-3.5 bg-white dark:bg-[#16171f] rounded-[12px] border border-[#dedee5] dark:border-[#282937] shadow-micro hover:border-[#7132f5]/50 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onEditAccount(acc);
                }
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <AccountAvatar acc={acc} />
                <div className="min-w-0">
                  <span className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8] block tracking-tight group-hover:text-[#7132f5] transition-colors truncate">
                    {acc.name}
                  </span>
                  <span className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] capitalize font-medium">
                    {acc.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`font-bold text-sm tracking-tight tabular-nums ${
                    acc.balance >= 0 ? 'text-[#101114] dark:text-[#f3f4f8]' : 'text-[#e53e3e]'
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
    </div>
  );
};
