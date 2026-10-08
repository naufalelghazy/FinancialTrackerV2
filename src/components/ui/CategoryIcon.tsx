import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Utensils,
  Coffee,
  ShoppingCart,
  Droplets,
  CookingPot,
  Fuel,
  Car,
  Wrench,
  Zap,
  Wifi,
  Smartphone,
  Shirt,
  HeartPulse,
  Sparkles,
  Gamepad2,
  GraduationCap,
  Users,
  Tv,
  ReceiptText,
  CreditCard,
  Building2,
  TrendingUp,
  AlertCircle,
  CalendarDays,
  HeartHandshake,
  Gift,
  Briefcase,
  HandCoins,
  Percent,
  Coins,
  ArrowLeftRight,
  Tag,
} from 'lucide-react';

export interface CategoryVisualConfig {
  icon: LucideIcon;
  bg?: string;
  color: string;
  border?: string;
  label: string;
}

export const CATEGORY_MAP: Record<string, CategoryVisualConfig> = {
  // Food & Beverage
  makan: {
    icon: Utensils,
    color: 'text-[#d97706] dark:text-[#fbbf24]',
    label: 'Makan',
  },
  'coffee/snack': {
    icon: Coffee,
    color: 'text-[#b45309] dark:text-[#f59e0b]',
    label: 'Coffee/Snack',
  },
  coffee: {
    icon: Coffee,
    color: 'text-[#b45309] dark:text-[#f59e0b]',
    label: 'Coffee',
  },
  'makanan pokok': {
    icon: ShoppingCart,
    color: 'text-[#059669] dark:text-[#34d399]',
    label: 'Makanan Pokok',
  },
  'minuman pokok': {
    icon: Droplets,
    color: 'text-[#0284c7] dark:text-[#38bdf8]',
    label: 'Minuman Pokok',
  },
  'kitchen essential': {
    icon: CookingPot,
    color: 'text-[#ea580c] dark:text-[#fb923c]',
    label: 'Kitchen Essential',
  },

  // Transport & Mobility
  bensin: {
    icon: Fuel,
    color: 'text-[#dc2626] dark:text-[#f87171]',
    label: 'Bensin',
  },
  parkir: {
    icon: Car,
    color: 'text-[#4f46e5] dark:text-[#818cf8]',
    label: 'Parkir',
  },
  'service motor': {
    icon: Wrench,
    color: 'text-[#0891b2] dark:text-[#22d3ee]',
    label: 'Service Motor',
  },

  // Utilities & Housing
  listrik: {
    icon: Zap,
    color: 'text-[#d97706] dark:text-[#facc15]',
    label: 'Listrik',
  },
  wifi: {
    icon: Wifi,
    color: 'text-[#2563eb] dark:text-[#60a5fa]',
    label: 'WIFI',
  },
  'internet package': {
    icon: Smartphone,
    color: 'text-[#0284c7] dark:text-[#38bdf8]',
    label: 'Internet Package',
  },
  laundry: {
    icon: Shirt,
    color: 'text-[#0284c7] dark:text-[#38bdf8]',
    label: 'Laundry',
  },

  // Health, Selfcare, Social
  'kesehatan/healthcare': {
    icon: HeartPulse,
    color: 'text-[#e11d48] dark:text-[#fb7185]',
    label: 'Kesehatan/Healthcare',
  },
  kesehatan: {
    icon: HeartPulse,
    color: 'text-[#e11d48] dark:text-[#fb7185]',
    label: 'Kesehatan',
  },
  selfcare: {
    icon: Sparkles,
    color: 'text-[#7c3aed] dark:text-[#a78bfa]',
    label: 'Selfcare',
  },
  toiletries: {
    icon: Sparkles,
    color: 'text-[#7c3aed] dark:text-[#a78bfa]',
    label: 'Toiletries',
  },
  'hobby/entertainment': {
    icon: Gamepad2,
    color: 'text-[#9333ea] dark:text-[#c084fc]',
    label: 'Hobby/Entertainment',
  },
  kuliah: {
    icon: GraduationCap,
    color: 'text-[#2563eb] dark:text-[#60a5fa]',
    label: 'Kuliah',
  },
  keluarga: {
    icon: Users,
    color: 'text-[#4f46e5] dark:text-[#818cf8]',
    label: 'Keluarga',
  },

  // Finance, Bills, Obligations
  subscriptions: {
    icon: Tv,
    color: 'text-[#7132f5] dark:text-[#a78bfa]',
    label: 'Subscriptions',
  },
  admin: {
    icon: ReceiptText,
    color: 'text-[#64748b] dark:text-[#94a3b8]',
    label: 'Admin',
  },
  'bayar paylatter': {
    icon: CreditCard,
    color: 'text-[#e11d48] dark:text-[#f43f5e]',
    label: 'Bayar Paylatter',
  },
  loan: {
    icon: Building2,
    color: 'text-[#e11d48] dark:text-[#f43f5e]',
    label: 'Loan',
  },
  'nabung/invest': {
    icon: TrendingUp,
    color: 'text-[#0d9488] dark:text-[#2dd4bf]',
    label: 'Nabung/Invest',
  },
  'biaya tak terduga': {
    icon: AlertCircle,
    color: 'text-[#ea580c] dark:text-[#fb923c]',
    label: 'Biaya Tak Terduga',
  },
  'annual expenses': {
    icon: CalendarDays,
    color: 'text-[#64748b] dark:text-[#94a3b8]',
    label: 'Annual Expenses',
  },

  // Social & Giving
  donate: {
    icon: HeartHandshake,
    color: 'text-[#059669] dark:text-[#34d399]',
    label: 'Donate',
  },
  'kondangan/kado': {
    icon: Gift,
    color: 'text-[#db2777] dark:text-[#f472b6]',
    label: 'Kondangan/Kado',
  },
  gift: {
    icon: Gift,
    color: 'text-[#db2777] dark:text-[#f472b6]',
    label: 'Gift',
  },

  // Incomes (Green)
  gaji: {
    icon: Briefcase,
    color: 'text-[#059669] dark:text-[#34d399]',
    label: 'Gaji',
  },
  'kembalian hutang': {
    icon: HandCoins,
    color: 'text-[#059669] dark:text-[#34d399]',
    label: 'Kembalian Hutang',
  },
  interest: {
    icon: Percent,
    color: 'text-[#059669] dark:text-[#34d399]',
    label: 'Interest',
  },
  cashback: {
    icon: Coins,
    color: 'text-[#059669] dark:text-[#34d399]',
    label: 'Cashback',
  },

  // Transfers (Purple)
  'pindah akun': {
    icon: ArrowLeftRight,
    color: 'text-[#7132f5] dark:text-[#a78bfa]',
    label: 'Pindah Akun',
  },
  transfer: {
    icon: ArrowLeftRight,
    color: 'text-[#7132f5] dark:text-[#a78bfa]',
    label: 'Transfer',
  },
};

export const DEFAULT_CATEGORY_CONFIG: CategoryVisualConfig = {
  icon: Tag,
  color: 'text-[#64748b] dark:text-[#94a3b8]',
  label: 'Lainnya',
};

export function getCategoryVisualConfig(
  name?: string,
  type?: 'pengeluaran' | 'pemasukan' | 'transfer'
): CategoryVisualConfig {
  if (type === 'transfer') {
    return CATEGORY_MAP['pindah akun'];
  }

  if (name) {
    const normalized = name.trim().toLowerCase();
    if (CATEGORY_MAP[normalized]) {
      return CATEGORY_MAP[normalized];
    }
    // Partial search
    for (const [key, config] of Object.entries(CATEGORY_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return config;
      }
    }
  }

  if (type === 'pemasukan') {
    return {
      icon: HandCoins,
      color: 'text-[#059669] dark:text-[#34d399]',
      label: name || 'Pemasukan',
    };
  }

  return {
    ...DEFAULT_CATEGORY_CONFIG,
    label: name || DEFAULT_CATEGORY_CONFIG.label,
  };
}

export interface CategoryIconProps {
  name?: string;
  type?: 'pengeluaran' | 'pemasukan' | 'transfer';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = '',
  type,
  size = 'md',
  className = '',
}) => {
  const config = getCategoryVisualConfig(name, type);
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
      aria-label={config.label}
    >
      <IconComponent className={iconSizes} strokeWidth={2.2} />
    </div>
  );
};
