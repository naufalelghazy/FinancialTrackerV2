import React from 'react';
import type { Account } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { CreditCard, CheckCircle2, Edit2, Eye, EyeOff } from 'lucide-react';
import { AccountAvatar } from '../../components/ui/AccountAvatar';

interface BillsViewProps {
  accounts: Account[];
  isBalanceHidden?: boolean;
  onToggleHideBalance?: () => void;
  onEditAccount?: (account: Account) => void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  accounts,
  isBalanceHidden = false,
  onToggleHideBalance,
  onEditAccount,
}) => {
  const creditAccounts = accounts.filter((a) => a.type === 'credit');
  const totalDebt = creditAccounts.reduce(
    (sum, a) => sum + (a.balance < 0 ? Math.abs(a.balance) : 0),
    0
  );
  const maskAmount = (amount: number, prefix = '') =>
    isBalanceHidden ? `${prefix}Rp •••••••` : `${prefix}${formatCurrency(amount)}`;

  return (
    <div className="space-y-6 pb-24">
      {/* Total Tagihan Card - Red Hero Debt Card */}
      <div className="hero-debt-card bg-gradient-to-br from-[#dc2626] to-[#b91c1c] text-white rounded-[16px] p-5 sm:p-6 shadow-whisper relative overflow-hidden border border-negative/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="debt-card-header flex items-center gap-2 text-white/90 text-[11px] font-semibold uppercase tracking-wider">
            <CreditCard className="debt-card-icon w-3.5 h-3.5 text-white/90" />
            <span>Total Tagihan & Hutang</span>
            {onToggleHideBalance && (
              <button
                type="button"
                onClick={onToggleHideBalance}
                title={isBalanceHidden ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
                aria-label={isBalanceHidden ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
                className="w-6 h-6 -m-2.5 p-2.5 box-content rounded-[6px] bg-surface/15 hover:bg-surface/25 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 ml-1"
              >
                {isBalanceHidden ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
          <div className="debt-card-amount text-2xl sm:text-4xl font-bold mt-2 tracking-[-0.8px] text-white tabular-nums">
            {maskAmount(totalDebt)}
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
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted px-1">
          Rincian Kartu Kredit, Paylater & Pinjaman
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {creditAccounts.map((acc) => {
            const hasDebt = acc.balance < 0;
            const debtAmount = hasDebt ? Math.abs(acc.balance) : 0;

            return (
              <div
                key={acc.id}
                className="group p-4 bg-surface rounded-[12px] border border-hairline shadow-micro transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AccountAvatar acc={acc} />
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-ink block tracking-tight group-hover:text-brand-text transition-colors truncate">
                      {acc.name}
                    </span>
                    <span className="text-[11px] text-ink-muted font-medium flex items-center gap-1 mt-0.5">
                      {hasDebt ? (
                        <span className="text-negative-bright font-semibold">Ada Tagihan</span>
                      ) : (
                        <span className="text-positive flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-positive-bright" /> Lunas
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`font-bold text-sm sm:text-base block tracking-tight tabular-nums ${
                        hasDebt ? 'text-negative-bright' : 'text-positive'
                      }`}
                    >
                      {hasDebt ? maskAmount(debtAmount, '-') : 'Rp 0'}
                    </span>
                    <span className="text-[10px] text-ink-subtle uppercase font-semibold">
                      {hasDebt ? 'Belum Dibayar' : 'Lunas'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAccount?.(acc);
                    }}
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-ink-subtle hover:text-brand-text hover:bg-brand-soft transition-all cursor-pointer active:scale-95 border border-transparent hover:border-brand"
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
