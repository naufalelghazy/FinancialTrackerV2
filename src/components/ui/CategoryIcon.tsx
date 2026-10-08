import React from 'react';
import {
  Utensils,
  Coffee,
  ShoppingCart,
  Droplets,
  Fuel,
  Car,
  Wrench,
  HeartPulse,
  Sparkles,
  Tv,
  ReceiptText,
  CookingPot,
  TrendingUp,
  Zap,
  Wifi,
  Smartphone,
  Shirt,
  Users,
  CreditCard,
  GraduationCap,
  Gamepad2,
  HeartHandshake,
  Gift,
  CalendarDays,
  AlertCircle,
  Briefcase,
  HandCoins,
  Percent,
  Building2,
  Coins,
  ArrowLeftRight,
  Tag,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryVisualConfig {
  icon: LucideIcon;
  bg: string;
  color: string;
  border?: string;
  label: string;
}

// Kraken Design System palette:
// Primary Brand: #7132f5, Dark #5741d8
// Semantic Positive (Income): #149e61, Text #026b3f, Bg rgba(20,158,97,0.14)
// Semantic Purple (Transfer): #7132f5, Text #7132f5, Bg rgba(133,91,251,0.14)
// Neutral: #101114 (Text), #686b82 (Muted), #dedee5 (Border)
// Radii: 8px (sm), 10px (md), 12px (lg)

export const CATEGORY_MAP: Record<string, CategoryVisualConfig> = {
  // Food & Beverage
  makan: {
    icon: Utensils,
    bg: 'bg-[#f59e0b]/14',
    color: 'text-[#b45309]',
    border: 'border-[#f59e0b]/25',
    label: 'Makan',
  },
  'coffee/snack': {
    icon: Coffee,
    bg: 'bg-[#b45309]/14',
    color: 'text-[#92400e]',
    border: 'border-[#b45309]/25',
    label: 'Coffee/Snack',
  },
  coffee: {
    icon: Coffee,
    bg: 'bg-[#b45309]/14',
    color: 'text-[#92400e]',
    border: 'border-[#b45309]/25',
    label: 'Coffee',
  },
  'makanan pokok': {
    icon: ShoppingCart,
    bg: 'bg-[#10b981]/14',
    color: 'text-[#047857]',
    border: 'border-[#10b981]/25',
    label: 'Makanan Pokok',
  },
  'minuman pokok': {
    icon: Droplets,
    bg: 'bg-[#0284c7]/14',
    color: 'text-[#0369a1]',
    border: 'border-[#0284c7]/25',
    label: 'Minuman Pokok',
  },
  'kitchen essential': {
    icon: CookingPot,
    bg: 'bg-[#ea580c]/14',
    color: 'text-[#c2410c]',
    border: 'border-[#ea580c]/25',
    label: 'Kitchen Essential',
  },

  // Transport & Mobility
  bensin: {
    icon: Fuel,
    bg: 'bg-[#ef4444]/14',
    color: 'text-[#b91c1c]',
    border: 'border-[#ef4444]/25',
    label: 'Bensin',
  },
  parkir: {
    icon: Car,
    bg: 'bg-[#6366f1]/14',
    color: 'text-[#4338ca]',
    border: 'border-[#6366f1]/25',
    label: 'Parkir',
  },
  'service motor': {
    icon: Wrench,
    bg: 'bg-[#0891b2]/14',
    color: 'text-[#0e7490]',
    border: 'border-[#0891b2]/25',
    label: 'Service Motor',
  },

  // Utilities & Housing
  listrik: {
    icon: Zap,
    bg: 'bg-[#eab308]/15',
    color: 'text-[#a16207]',
    border: 'border-[#eab308]/30',
    label: 'Listrik',
  },
  wifi: {
    icon: Wifi,
    bg: 'bg-[#2563eb]/14',
    color: 'text-[#1d4ed8]',
    border: 'border-[#2563eb]/25',
    label: 'WIFI',
  },
  'internet package': {
    icon: Smartphone,
    bg: 'bg-[#0284c7]/14',
    color: 'text-[#0284c7]',
    border: 'border-[#0284c7]/25',
    label: 'Internet Package',
  },
  laundry: {
    icon: Shirt,
    bg: 'bg-[#38bdf8]/15',
    color: 'text-[#0284c7]',
    border: 'border-[#38bdf8]/30',
    label: 'Laundry',
  },

  // Health, Selfcare, Social
  'kesehatan/healthcare': {
    icon: HeartPulse,
    bg: 'bg-[#f43f5e]/14',
    color: 'text-[#be123c]',
    border: 'border-[#f43f5e]/25',
    label: 'Kesehatan/Healthcare',
  },
  kesehatan: {
    icon: HeartPulse,
    bg: 'bg-[#f43f5e]/14',
    color: 'text-[#be123c]',
    border: 'border-[#f43f5e]/25',
    label: 'Kesehatan',
  },
  selfcare: {
    icon: Sparkles,
    bg: 'bg-[#8b5cf6]/14',
    color: 'text-[#6d28d9]',
    border: 'border-[#8b5cf6]/25',
    label: 'Selfcare',
  },
  toiletries: {
    icon: Sparkles,
    bg: 'bg-[#8b5cf6]/14',
    color: 'text-[#6d28d9]',
    border: 'border-[#8b5cf6]/25',
    label: 'Toiletries',
  },
  'hobby/entertainment': {
    icon: Gamepad2,
    bg: 'bg-[#9333ea]/14',
    color: 'text-[#7e22ce]',
    border: 'border-[#9333ea]/25',
    label: 'Hobby/Entertainment',
  },
  kuliah: {
    icon: GraduationCap,
    bg: 'bg-[#1d4ed8]/14',
    color: 'text-[#1e40af]',
    border: 'border-[#1d4ed8]/25',
    label: 'Kuliah',
  },
  keluarga: {
    icon: Users,
    bg: 'bg-[#4f46e5]/14',
    color: 'text-[#3730a3]',
    border: 'border-[#4f46e5]/25',
    label: 'Keluarga',
  },

  // Finance, Bills, Obligations
  subscriptions: {
    icon: Tv,
    bg: 'bg-[#855bfb]/15',
    color: 'text-[#7132f5]',
    border: 'border-[#855bfb]/25',
    label: 'Subscriptions',
  },
  admin: {
    icon: ReceiptText,
    bg: 'bg-[#686b82]/14',
    color: 'text-[#484b5e]',
    border: 'border-[#686b82]/25',
    label: 'Admin',
  },
  'bayar paylatter': {
    icon: CreditCard,
    bg: 'bg-[#e11d48]/14',
    color: 'text-[#be123c]',
    border: 'border-[#e11d48]/25',
    label: 'Bayar Paylatter',
  },
  loan: {
    icon: Building2,
    bg: 'bg-[#e11d48]/14',
    color: 'text-[#be123c]',
    border: 'border-[#e11d48]/25',
    label: 'Loan',
  },
  'nabung/invest': {
    icon: TrendingUp,
    bg: 'bg-[#0d9488]/14',
    color: 'text-[#0f766e]',
    border: 'border-[#0d9488]/25',
    label: 'Nabung/Invest',
  },
  'biaya tak terduga': {
    icon: AlertCircle,
    bg: 'bg-[#f97316]/14',
    color: 'text-[#c2410c]',
    border: 'border-[#f97316]/25',
    label: 'Biaya Tak Terduga',
  },
  'annual expenses': {
    icon: CalendarDays,
    bg: 'bg-[#686b82]/14',
    color: 'text-[#484b5e]',
    border: 'border-[#686b82]/25',
    label: 'Annual Expenses',
  },

  // Social & Giving
  donate: {
    icon: HeartHandshake,
    bg: 'bg-[#149e61]/14',
    color: 'text-[#026b3f]',
    border: 'border-[#149e61]/25',
    label: 'Donate',
  },
  'kondangan/kado': {
    icon: Gift,
    bg: 'bg-[#db2777]/14',
    color: 'text-[#be185d]',
    border: 'border-[#db2777]/25',
    label: 'Kondangan/Kado',
  },
  gift: {
    icon: Gift,
    bg: 'bg-[#db2777]/14',
    color: 'text-[#be185d]',
    border: 'border-[#db2777]/25',
    label: 'Gift',
  },

  // Kraken Green Incomes (#149e61 bg / #026b3f text)
  gaji: {
    icon: Briefcase,
    bg: 'bg-[#149e61]/15',
    color: 'text-[#026b3f]',
    border: 'border-[#149e61]/25',
    label: 'Gaji',
  },
  'kembalian hutang': {
    icon: HandCoins,
    bg: 'bg-[#149e61]/15',
    color: 'text-[#026b3f]',
    border: 'border-[#149e61]/25',
    label: 'Kembalian Hutang',
  },
  interest: {
    icon: Percent,
    bg: 'bg-[#149e61]/15',
    color: 'text-[#026b3f]',
    border: 'border-[#149e61]/25',
    label: 'Interest',
  },
  cashback: {
    icon: Coins,
    bg: 'bg-[#149e61]/15',
    color: 'text-[#026b3f]',
    border: 'border-[#149e61]/25',
    label: 'Cashback',
  },

  // Kraken Purple Transfer
  'pindah akun': {
    icon: ArrowLeftRight,
    bg: 'bg-[#855bfb]/15',
    color: 'text-[#7132f5]',
    border: 'border-[#855bfb]/25',
    label: 'Pindah Akun',
  },
  transfer: {
    icon: ArrowLeftRight,
    bg: 'bg-[#855bfb]/15',
    color: 'text-[#7132f5]',
    border: 'border-[#855bfb]/25',
    label: 'Transfer',
  },
};

export const DEFAULT_CATEGORY_CONFIG: CategoryVisualConfig = {
  icon: Tag,
  bg: 'bg-[#686b82]/12',
  color: 'text-[#484b5e]',
  border: 'border-[#686b82]/20',
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
      bg: 'bg-[#149e61]/15',
      color: 'text-[#026b3f]',
      border: 'border-[#149e61]/25',
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

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-[8px]',
    md: 'w-10 h-10 rounded-[10px]',
    lg: 'w-12 h-12 rounded-[12px]',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-5.5 h-5.5',
  }[size];

  return (
    <div
      className={`${sizeClasses} ${config.bg} ${config.color} ${config.border || 'border-black/5'} flex items-center justify-center shrink-0 border shadow-micro transition-all ${className}`}
      title={config.label}
      aria-label={config.label}
    >
      <IconComponent className={iconSizes} strokeWidth={2.2} />
    </div>
  );
};
