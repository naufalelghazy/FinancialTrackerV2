import React from 'react';
import type { Account } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { AccountAvatar } from './AccountsView';

interface BillsViewProps {
  accounts: Account[];
}

export const BillsView: React.FC<BillsViewProps> = ({ accounts }) => {
  const creditAccounts = accounts.filter((a) => a.type === 'credit');
  const totalDebt = creditAccounts.reduce(
    (sum, a) => sum + (a.balance < 0 ? Math.abs(a.balance) : 0),
    0
  );

  return (
    <div className="space-y-4 pb-24">
      {/* Total Tagihan Card - Deep Solid Slate/Dark Kraken Card */}
      <div className="bg-[#101114] text-white rounded-[16px] p-6 shadow-whisper relative overflow-hidden border border-black">
        <div className="flex items-center gap-2 text-[#9497a9] text-[11px] font-semibold uppercase tracking-wider">
          <CreditCard className="w-3.5 h-3.5 text-[#7132f5]" />
          Total Tagihan & Hutang
        </div>
        <div className="text-3xl font-bold mt-2 tracking-[-0.8px]">
          {formatCurrency(totalDebt)}
        </div>
        <div className="text-xs text-[#9497a9] mt-1">
          {creditAccounts.length} Akun Kartu Kredit & Paylater
        </div>
      </div>

      {/* Credit Account List */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#686b82] px-1">
          Kartu Kredit & Paylater
        </h3>
        {creditAccounts.map((acc) => {
          const debt = acc.balance < 0 ? Math.abs(acc.balance) : 0;
          return (
            <div
              key={acc.id}
              className="flex items-center justify-between p-3.5 bg-white rounded-[12px] border border-[#dedee5] shadow-micro hover:border-[#686b82]/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <AccountAvatar acc={acc} />
                <div>
                  <span className="font-bold text-sm text-[#101114] block tracking-tight">
                    {acc.name}
                  </span>
                  <span className="text-[11px] text-[#686b82] font-medium">Tagihan berjalan</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`font-bold text-sm block tracking-tight ${
                    debt > 0 ? 'text-[#e53e3e]' : 'text-[#026b3f]'
                  }`}
                >
                  {debt > 0 ? formatCurrency(debt) : 'Rp 0'}
                </span>
                {debt === 0 && (
                  <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-[#149e61]/15 text-[#026b3f] text-[10px] font-semibold rounded-[6px]">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Lunas
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
