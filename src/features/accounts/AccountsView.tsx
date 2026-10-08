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
      {/* Total Saldo Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
          <Wallet className="w-4 h-4" />
          Total Saldo
        </div>
        <div className="text-3xl font-extrabold mt-2 tracking-tight">
          {formatCurrency(totalBalance)}
        </div>
        <div className="text-xs text-indigo-200/80 mt-1">
          {bankAccounts.length} Akun (Bank & E-Wallet)
        </div>
      </div>

      {/* Account List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Daftar Rekening & Dompet
        </h3>
        {bankAccounts.map((acc) => (
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
                  {acc.emoji || '💰'}
                </div>
              )}
              <div>
                <span className="font-bold text-sm text-slate-800 block">{acc.name}</span>
                <span className="text-[11px] text-slate-400 capitalize">{acc.type}</span>
              </div>
            </div>
            <span
              className={`font-bold text-sm ${
                acc.balance >= 0 ? 'text-slate-800' : 'text-rose-500'
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
