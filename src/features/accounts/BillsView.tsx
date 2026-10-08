import React from 'react';
import type { Account } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { CreditCard, CheckCircle2 } from 'lucide-react';

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
      {/* Total Tagihan Card */}
      <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-2 text-rose-100 text-xs font-semibold uppercase tracking-wider">
          <CreditCard className="w-4 h-4" />
          Total Tagihan
        </div>
        <div className="text-3xl font-extrabold mt-2 tracking-tight">
          {formatCurrency(totalDebt)}
        </div>
        <div className="text-xs text-rose-100/80 mt-1">
          {creditAccounts.length} Akun Kartu Kredit & Paylater
        </div>
      </div>

      {/* Credit Account List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Kartu Kredit & Paylater
        </h3>
        {creditAccounts.map((acc) => {
          const debt = acc.balance < 0 ? Math.abs(acc.balance) : 0;
          return (
            <div
              key={acc.id}
              className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all"
            >
              <div className="flex items-center gap-3">
                {acc.icon ? (
                  <img
                    src={acc.icon}
                    alt={acc.name}
                    className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                    {acc.emoji || '💳'}
                  </div>
                )}
                <div>
                  <span className="font-bold text-sm text-slate-800 block">{acc.name}</span>
                  <span className="text-[11px] text-slate-400">Tagihan berjalan</span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`font-bold text-sm block ${
                    debt > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {debt > 0 ? formatCurrency(debt) : 'Rp 0'}
                </span>
                {debt === 0 && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 justify-end">
                    <CheckCircle2 className="w-3 h-3" /> Lunas
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
