import React from 'react';
import type { Account } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { CreditCard, CheckCircle2, Edit2 } from 'lucide-react';
import { AccountAvatar } from './AccountsView';

interface BillsViewProps {
  accounts: Account[];
  onEditAccount?: (account: Account) => void;
}

export const BillsView: React.FC<BillsViewProps> = ({ accounts, onEditAccount }) => {
  const creditAccounts = accounts.filter((a) => a.type === 'credit');
  const totalDebt = creditAccounts.reduce(
    (sum, a) => sum + (a.balance < 0 ? Math.abs(a.balance) : 0),
    0
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Total Tagihan Card - Deep Solid Slate/Dark Kraken Card */}
      <div className="bg-[#101114] text-white rounded-[16px] p-6 shadow-whisper relative overflow-hidden border border-black flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#9497a9] text-[11px] font-semibold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5 text-[#7132f5]" />
            Total Tagihan & Hutang
          </div>
          <div className="text-3xl sm:text-4xl font-bold mt-2 tracking-[-0.8px]">
            {formatCurrency(totalDebt)}
          </div>
          <div className="text-xs text-[#9497a9] mt-1">
            {creditAccounts.length} Akun Kartu Kredit & Pinjaman
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-[8px] bg-white/10 text-xs font-semibold text-[#dedee5] self-start sm:self-auto">
          {totalDebt === 0 ? 'Semua Tagihan Lunas' : 'Wajib Dibayarkan'}
        </div>
      </div>

      {/* Credit Account Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#686b82] px-1">
          Rincian Kartu Kredit, Paylater & Pinjaman
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {creditAccounts.map((acc) => {
            const hasDebt = acc.balance < 0;
            const debtAmount = hasDebt ? Math.abs(acc.balance) : 0;

            return (
              <div
                key={acc.id}
                onClick={() => onEditAccount && onEditAccount(acc)}
                className="group p-4 bg-white rounded-[12px] border border-[#dedee5] shadow-micro hover:border-[#7132f5]/50 hover:shadow-md cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onEditAccount && onEditAccount(acc);
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AccountAvatar acc={acc} />
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-[#101114] block tracking-tight group-hover:text-[#7132f5] transition-colors truncate">
                      {acc.name}
                    </span>
                    <span className="text-[11px] text-[#686b82] font-medium flex items-center gap-1 mt-0.5">
                      {hasDebt ? (
                        <span className="text-[#e53e3e] font-semibold">Ada Tagihan</span>
                      ) : (
                        <span className="text-[#026b3f] flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-[#149e61]" /> Lunas
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`font-bold text-sm sm:text-base block tracking-tight tabular-nums ${
                        hasDebt ? 'text-[#e53e3e]' : 'text-[#026b3f]'
                      }`}
                    >
                      {hasDebt ? `-${formatCurrency(debtAmount)}` : 'Rp 0'}
                    </span>
                    <span className="text-[10px] text-[#9497a9] uppercase font-semibold">
                      {hasDebt ? 'Belum Dibayar' : 'Lunas'}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#9497a9] group-hover:text-[#7132f5] group-hover:bg-[#855bfb]/10 transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
