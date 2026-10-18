import React from 'react';
import type { Account } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { Wallet, Plus, Edit2, ArrowUpRight } from 'lucide-react';
import { AccountAvatar } from '../../components/ui/AccountAvatar';

interface AccountsViewProps {
  accounts: Account[];
  onEditAccount: (account: Account) => void;
  onAddAccount: () => void;
  onSelectAccountHistory?: (account: Account) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  onEditAccount,
  onAddAccount,
  onSelectAccountHistory,
}) => {
  const bankAccounts = accounts.filter((a) => a.type !== 'credit');
  const totalBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Total Saldo Card - Kraken Purple Commanding Hero */}
      <div className="hero-balance-card bg-[#7132f5] text-white rounded-[16px] p-6 shadow-whisper relative overflow-hidden border border-[#5741d8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          {onSelectAccountHistory && (
            <span className="text-[11px] font-medium text-[#686b82] dark:text-[#9ca0ba]">
              Klik kartu untuk melihat mutasi
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {bankAccounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => onSelectAccountHistory?.(acc)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectAccountHistory?.(acc);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Lihat mutasi rekening ${acc.name}`}
              className="group flex items-center justify-between p-3.5 bg-white dark:bg-[#16171f] rounded-[12px] border border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/50 dark:hover:border-[#855bfb]/50 shadow-micro hover:shadow-whisper transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <AccountAvatar acc={acc} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8] block tracking-tight group-hover:text-[#7132f5] dark:group-hover:text-[#a78bfa] transition-colors truncate">
                      {acc.name}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#7132f5] dark:text-[#a78bfa] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] capitalize font-medium">
                      {acc.type}
                    </span>
                    <span className="text-[10px] text-[#7132f5] dark:text-[#a78bfa] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      • Mutasi
                    </span>
                  </div>
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
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditAccount(acc);
                  }}
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#9497a9] hover:text-[#7132f5] dark:hover:text-[#a78bfa] hover:bg-[#855bfb]/15 transition-all cursor-pointer active:scale-95 border border-transparent hover:border-[#855bfb]/30"
                  title="Ubah Akun"
                  aria-label={`Ubah Akun ${acc.name}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
