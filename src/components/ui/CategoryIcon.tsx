import React from 'react';
import { getCategoryVisualConfig } from '../../lib/categoryIcons';

export interface CategoryIconProps {
  name?: string;
  type?: 'pengeluaran' | 'pemasukan' | 'transfer';
  icon?: string;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = '',
  type,
  icon,
  emoji,
  size = 'md',
  className = '',
}) => {
  const config = getCategoryVisualConfig(name, type, icon, emoji);
  const IconComponent = config.icon;

  const containerSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6 sm:w-7 sm:h-7',
    lg: 'w-8 h-8',
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5 sm:w-5.5 sm:h-5.5',
    lg: 'w-6 h-6 sm:w-6.5 sm:h-6.5',
  }[size];

  return (
    <div
      className={`${containerSizes} flex items-center justify-center shrink-0 ${config.color} transition-colors ${className}`}
      title={config.label}
      aria-hidden="true"
    >
      <IconComponent className={iconSizes} strokeWidth={2.2} />
    </div>
  );
};
