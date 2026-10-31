import React from "react";
import { Check } from "lucide-react";
import type { Category, TransactionType } from "../../types";
import { CategoryIcon } from "./CategoryIcon";

/**
 * The category option list used by every category dropdown.
 *
 * Same story as AccountPickerList: four copies of this markup had drifted
 * apart (one used a 42px row, another 44px; one dropped the icon tint).
 */
interface CategoryPickerListProps {
  categories: Category[];
  selectedId: string;
  type: TransactionType;
  onSelect: (category: Category) => void;
  emptyLabel?: string;
  ariaLabel: string;
}

export const CategoryPickerList: React.FC<CategoryPickerListProps> = ({
  categories,
  selectedId,
  type,
  onSelect,
  emptyLabel = "Belum ada kategori",
  ariaLabel,
}) => {
  if (categories.length === 0) {
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
      {categories.map((cat) => {
        const isSelected = selectedId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(cat)}
            className={`w-full min-h-[44px] px-3 py-2 rounded-[10px] text-left flex items-center justify-between gap-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
              isSelected
                ? "bg-brand text-on-brand font-bold"
                : "text-ink hover:bg-surface-sunken font-medium"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-black/15 text-current" : "bg-surface-sunken"
                }`}
              >
                <CategoryIcon
                  name={cat.name}
                  type={type}
                  icon={cat.icon}
                  emoji={cat.emoji}
                  size="sm"
                  className={isSelected ? "!text-current" : ""}
                />
              </span>
              <span className="truncate text-sm">{cat.name}</span>
            </div>
            {isSelected && <Check className="w-4 h-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPickerList;
