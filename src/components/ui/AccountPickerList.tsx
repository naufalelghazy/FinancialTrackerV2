import React from "react";
import { Check } from "lucide-react";
import type { Account } from "../../types";
import { formatCurrency } from "../../lib/formatters";
import { ACCOUNT_TYPE_LABELS } from "../../lib/labels";
import { AccountAvatar } from "./AccountAvatar";

/**
 * The account option list used by every account dropdown in the app.
 *
 * Seven places rendered this same markup (avatar, name, type badge, balance,
 * checkmark) with small divergences — one forgot the negative-balance colour,
 * another omitted the checkmark. One component keeps them identical, so a
 * change to how a balance is shown lands everywhere at once.
 */
interface AccountPickerListProps {
  accounts: Account[];
  selectedId: string;
  onSelect: (account: Account) => void;
  /** Shown when the list is empty, e.g. "Belum ada rekening". */
  emptyLabel?: string;
  ariaLabel: string;
}

export const AccountPickerList: React.FC<AccountPickerListProps> = ({
  accounts,
  selectedId,
  onSelect,
  emptyLabel = "Belum ada rekening",
  ariaLabel,
}) => {
  if (accounts.length === 0) {
    return (
      <div className="p-3 text-xs text-ink-muted text-center">{emptyLabel}</div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label={ariaLabel}
      className="p-1.5 max-h-60 overflow-y-auto divide-y divide-hairline/40"
    >
      {accounts.map((acc) => {
        const isSelected = selectedId === acc.id;
        return (
          <button
            key={acc.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(acc)}
            className={`w-full min-h-[44px] px-3 py-2 rounded-[10px] text-left flex items-center justify-between gap-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
              isSelected
                ? "bg-brand text-on-brand font-bold"
                : "text-ink hover:bg-surface-sunken font-medium"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <AccountAvatar acc={acc} size="sm" />
              <span className="truncate text-sm">{acc.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                  isSelected
                    ? "bg-black/15 text-current"
                    : "bg-surface-sunken text-ink-muted"
                }`}
              >
                {ACCOUNT_TYPE_LABELS[acc.type] || acc.type}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs tabular-nums ${
                  isSelected
                    ? "text-current font-bold"
                    : acc.balance < 0
                      ? "text-negative font-semibold"
                      : "text-ink-muted font-semibold"
                }`}
              >
                {formatCurrency(acc.balance)}
              </span>
              {isSelected && <Check className="w-4 h-4 shrink-0" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default AccountPickerList;
