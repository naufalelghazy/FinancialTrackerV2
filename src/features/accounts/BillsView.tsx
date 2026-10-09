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
      {/* Total Tagihan Card - Red Hero Debt Card */}
      <div className="hero-debt-card bg-gradient-to-br from-[#dc2626] to-[#b91c1c] text-white rounded-[16px] p-6 shadow-whisper relative overflow-hidden border border-[#ef4444]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="debt-card-header flex items-center gap-2 text-white/90 text-[11px] font-semibold uppercase tracking-wider">
            <CreditCard className="debt-card-icon w-3.5 h-3.5 text-white/90" />
            Total Tagihan & Hutang
          </div>
          <div className="debt-card-amount text-3xl sm:text-4xl font-bold mt-2 tracking-[-0.8px] text-white">
            {formatCurrency(totalDebt)}
          </div>
          <div className="debt-card-sub text-xs text-white/80 mt-1">
            {creditAccounts.length} Akun Kartu Kredit & Pinjaman
          </div>
        </div>

        <div className="debt-card-badge px-3 py-1.5 rounded-[8px] bg-black/25 text-xs font-semibold text-white border border-white/20 self-start sm:self-auto">
          {totalDebt === 0 ? 'Semua Tagihan Lunas' : 'Wajib Dibayarkan'}
        </div>
      </div>

      {/* Credit Account Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#686b82] dark:text-[#9ca0ba] px-1">
          Rincian Kartu Kredit, Paylater & Pinjaman
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {creditAccounts.map((acc) => {
            const hasDebt = acc.balance < 0;
            const debtAmount = hasDebt ? Math.abs(acc.balance) : 0;

            return (
              <div
                key={acc.id}
                className="group p-4 bg-white dark:bg-[#16171f] rounded-[12px] border border-[#dedee5] dark:border-[#282937] shadow-micro transition-all flex items-center justify-between"
              >
                  <div className="flex items-center gap-3 min-w-0">
                  <AccountAvatar acc={acc} />
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-[#101114] dark:text-[#f3f4f8] block tracking-tight group-hover:text-[#7132f5] transition-colors truncate">
                      {acc.name}
                    </span>
                    <span className="text-[11px] text-[#686b82] dark:text-[#9ca0ba] font-medium flex items-center gap-1 mt-0.5">
                      {hasDebt ? (
                        <span className="text-[#e53e3e] dark:text-[#f87171] font-semibold">Ada Tagihan</span>
                      ) : (
                        <span className="text-[#026b3f] dark:text-[#34d399] flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-[#149e61] dark:text-[#34d399]" /> Lunas
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`font-bold text-sm sm:text-base block tracking-tight tabular-nums ${
                        hasDebt ? 'text-[#e53e3e] dark:text-[#f87171]' : 'text-[#026b3f] dark:text-[#34d399]'
                      }`}
                    >
                      {hasDebt ? `-${formatCurrency(debtAmount)}` : 'Rp 0'}
                    </span>
                    <span className="text-[10px] text-[#9497a9] dark:text-[#7d8299] uppercase font-semibold">
                      {hasDebt ? 'Belum Dibayar' : 'Lunas'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAccount && onEditAccount(acc);
                    }}
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#9497a9] hover:text-[#7132f5] dark:hover:text-[#a78bfa] hover:bg-[#855bfb]/15 transition-all cursor-pointer active:scale-95 border border-transparent hover:border-[#855bfb]/30"
                    title="Ubah Tagihan / Akun"
                    aria-label="Ubah Tagihan / Akun"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
