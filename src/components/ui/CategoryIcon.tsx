import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Utensils,
  Coffee,
  ShoppingCart,
  CookingPot,
  Pizza,
  Apple,
  Wine,
  Beer,
  Cake,
  IceCream,
  Soup,
  Sandwich,
  Droplets,
  Car,
  Fuel,
  Bike,
  Bus,
  Train,
  Plane,
  Ship,
  Wrench,
  Navigation,
  Compass,
  ShoppingBag,
  Shirt,
  Package,
  Tag,
  Gem,
  Glasses,
  Footprints,
  Sparkles,
  Scissors,
  Watch,
  ShowerHead,
  Home,
  Zap,
  Wifi,
  Smartphone,
  Tv,
  Plug,
  Trash2,
  Shield,
  Key,
  Hammer,
  HeartPulse,
  Pill,
  Stethoscope,
  Dumbbell,
  Activity,
  Flame,
  Gamepad2,
  Film,
  Music,
  Camera,
  BookOpen,
  Palette,
  Trophy,
  Headphones,
  Ticket,
  GraduationCap,
  Book,
  School,
  Pencil,
  Users,
  User,
  Baby,
  Heart,
  Briefcase,
  Wallet,
  CreditCard,
  Building2,
  TrendingUp,
  HandCoins,
  Coins,
  PiggyBank,
  Receipt,
  ReceiptText,
  Percent,
  DollarSign,
  Landmark,
  HeartHandshake,
  Gift,
  PartyPopper,
  Church,
  Award,
  AlertCircle,
  CalendarDays,
  Star,
  Bookmark,
  Globe,
  Sun,
  Moon,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';

export interface CategoryIconOption {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
}

export const CATEGORY_ICON_GROUPS = [
  'Semua',
  'Makanan & Minuman',
  'Transportasi',
  'Belanja & Gaya Hidup',
  'Rumah & Tagihan',
  'Kesehatan & Olahraga',
  'Hiburan & Hobi',
  'Pendidikan & Keluarga',
  'Keuangan & Bisnis',
  'Sosial & Ibadah',
  'Lainnya',
] as const;

export const CATEGORY_ICON_LIST: CategoryIconOption[] = [
  // Makanan & Minuman
  { id: 'Utensils', label: 'Makan / Restoran', group: 'Makanan & Minuman', icon: Utensils },
  { id: 'Coffee', label: 'Kopi / Kafe', group: 'Makanan & Minuman', icon: Coffee },
  { id: 'ShoppingCart', label: 'Belanja Pokok', group: 'Makanan & Minuman', icon: ShoppingCart },
  { id: 'CookingPot', label: 'Masak / Dapur', group: 'Makanan & Minuman', icon: CookingPot },
  { id: 'Pizza', label: 'Pizza / Fast Food', group: 'Makanan & Minuman', icon: Pizza },
  { id: 'Apple', label: 'Buah / Makanan Sehat', group: 'Makanan & Minuman', icon: Apple },
  { id: 'Sandwich', label: 'Roti / Sarapan', group: 'Makanan & Minuman', icon: Sandwich },
  { id: 'Soup', label: 'Sup / Kuah', group: 'Makanan & Minuman', icon: Soup },
  { id: 'Cake', label: 'Kue / Bakery', group: 'Makanan & Minuman', icon: Cake },
  { id: 'IceCream', label: 'Es Krim / Dessert', group: 'Makanan & Minuman', icon: IceCream },
  { id: 'Wine', label: 'Minuman / Bar', group: 'Makanan & Minuman', icon: Wine },
  { id: 'Beer', label: 'Hangout / Minuman', group: 'Makanan & Minuman', icon: Beer },
  { id: 'Droplets', label: 'Air Minum', group: 'Makanan & Minuman', icon: Droplets },

  // Transportasi
  { id: 'Car', label: 'Mobil', group: 'Transportasi', icon: Car },
  { id: 'Fuel', label: 'Bensin / BBM', group: 'Transportasi', icon: Fuel },
  { id: 'Bike', label: 'Motor / Sepeda', group: 'Transportasi', icon: Bike },
  { id: 'Bus', label: 'Bus / Angkot', group: 'Transportasi', icon: Bus },
  { id: 'Train', label: 'Kereta Api / MRT', group: 'Transportasi', icon: Train },
  { id: 'Plane', label: 'Pesawat / Penerbangan', group: 'Transportasi', icon: Plane },
  { id: 'Ship', label: 'Kapal Laut', group: 'Transportasi', icon: Ship },
  { id: 'Wrench', label: 'Service / Bengkel', group: 'Transportasi', icon: Wrench },
  { id: 'Navigation', label: 'Tol / Navigasi', group: 'Transportasi', icon: Navigation },
  { id: 'Compass', label: 'Perjalanan / Travel', group: 'Transportasi', icon: Compass },

  // Belanja & Gaya Hidup
  { id: 'ShoppingBag', label: 'Belanja / Mall', group: 'Belanja & Gaya Hidup', icon: ShoppingBag },
  { id: 'Shirt', label: 'Pakaian / Fashion', group: 'Belanja & Gaya Hidup', icon: Shirt },
  { id: 'Package', label: 'Paket / Online Shop', group: 'Belanja & Gaya Hidup', icon: Package },
  { id: 'Tag', label: 'Diskon / Promo', group: 'Belanja & Gaya Hidup', icon: Tag },
  { id: 'Gem', label: 'Perhiasan / Mewah', group: 'Belanja & Gaya Hidup', icon: Gem },
  { id: 'Glasses', label: 'Kacamata / Optik', group: 'Belanja & Gaya Hidup', icon: Glasses },
  { id: 'Sparkles', label: 'Skincare / Kosmetik', group: 'Belanja & Gaya Hidup', icon: Sparkles },
  { id: 'Scissors', label: 'Salon / Barbershop', group: 'Belanja & Gaya Hidup', icon: Scissors },
  { id: 'Watch', label: 'Jam Tangan / Aksesoris', group: 'Belanja & Gaya Hidup', icon: Watch },
  { id: 'Footprints', label: 'Sepatu / Sandal', group: 'Belanja & Gaya Hidup', icon: Footprints },

  // Rumah & Tagihan
  { id: 'Home', label: 'Rumah / Kost', group: 'Rumah & Tagihan', icon: Home },
  { id: 'Zap', label: 'Listrik / Token PLN', group: 'Rumah & Tagihan', icon: Zap },
  { id: 'Wifi', label: 'Internet / WiFi', group: 'Rumah & Tagihan', icon: Wifi },
  { id: 'Smartphone', label: 'Pulsa / Paket Data', group: 'Rumah & Tagihan', icon: Smartphone },
  { id: 'Tv', label: 'TV Kabel / Streaming', group: 'Rumah & Tagihan', icon: Tv },
  { id: 'Plug', label: 'Elektronik / Peralatan', group: 'Rumah & Tagihan', icon: Plug },
  { id: 'Trash2', label: 'Kebersihan / Iuran', group: 'Rumah & Tagihan', icon: Trash2 },
  { id: 'Shield', label: 'Keamanan / Asuransi', group: 'Rumah & Tagihan', icon: Shield },
  { id: 'Key', label: 'Sewa / Kontrak', group: 'Rumah & Tagihan', icon: Key },
  { id: 'Hammer', label: 'Perkakas / Renovasi', group: 'Rumah & Tagihan', icon: Hammer },

  // Kesehatan & Olahraga
  { id: 'HeartPulse', label: 'Kesehatan / Medis', group: 'Kesehatan & Olahraga', icon: HeartPulse },
  { id: 'Pill', label: 'Obat / Farmasi', group: 'Kesehatan & Olahraga', icon: Pill },
  { id: 'Stethoscope', label: 'Dokter / Rumah Sakit', group: 'Kesehatan & Olahraga', icon: Stethoscope },
  { id: 'Dumbbell', label: 'Gym / Fitness', group: 'Kesehatan & Olahraga', icon: Dumbbell },
  { id: 'Activity', label: 'Olahraga / Senam', group: 'Kesehatan & Olahraga', icon: Activity },
  { id: 'Flame', label: 'Kalori / Diet', group: 'Kesehatan & Olahraga', icon: Flame },
  { id: 'ShowerHead', label: 'Perawatan Tubuh', group: 'Kesehatan & Olahraga', icon: ShowerHead },

  // Hiburan & Hobi
  { id: 'Gamepad2', label: 'Game / Gaming', group: 'Hiburan & Hobi', icon: Gamepad2 },
  { id: 'Film', label: 'Bioskop / Nonton', group: 'Hiburan & Hobi', icon: Film },
  { id: 'Music', label: 'Musik / Konser', group: 'Hiburan & Hobi', icon: Music },
  { id: 'Camera', label: 'Fotografi / Video', group: 'Hiburan & Hobi', icon: Camera },
  { id: 'BookOpen', label: 'Buku / Membaca', group: 'Hiburan & Hobi', icon: BookOpen },
  { id: 'Palette', label: 'Seni / Hobi Kreatif', group: 'Hiburan & Hobi', icon: Palette },
  { id: 'Trophy', label: 'Kompetisi / Turnamen', group: 'Hiburan & Hobi', icon: Trophy },
  { id: 'Headphones', label: 'Podcast / Audio', group: 'Hiburan & Hobi', icon: Headphones },
  { id: 'Ticket', label: 'Tiket Event / Rekreasi', group: 'Hiburan & Hobi', icon: Ticket },

  // Pendidikan & Keluarga
  { id: 'GraduationCap', label: 'Kuliah / Kuliah S1/S2', group: 'Pendidikan & Keluarga', icon: GraduationCap },
  { id: 'Book', label: 'Buku Pelajaran / Modul', group: 'Pendidikan & Keluarga', icon: Book },
  { id: 'School', label: 'Sekolah / SPP', group: 'Pendidikan & Keluarga', icon: School },
  { id: 'Pencil', label: 'Alat Tulis / Kursus', group: 'Pendidikan & Keluarga', icon: Pencil },
  { id: 'Users', label: 'Keluarga / Orang Tua', group: 'Pendidikan & Keluarga', icon: Users },
  { id: 'User', label: 'Pribadi', group: 'Pendidikan & Keluarga', icon: User },
  { id: 'Baby', label: 'Bayi / Perlengkapan Anak', group: 'Pendidikan & Keluarga', icon: Baby },
  { id: 'Heart', label: 'Pasangan / Kencan', group: 'Pendidikan & Keluarga', icon: Heart },

  // Keuangan & Bisnis
  { id: 'Briefcase', label: 'Gaji / Bisnis Utama', group: 'Keuangan & Bisnis', icon: Briefcase },
  { id: 'Wallet', label: 'Dompet / Kas Tunai', group: 'Keuangan & Bisnis', icon: Wallet },
  { id: 'CreditCard', label: 'Kartu Kredit / Paylater', group: 'Keuangan & Bisnis', icon: CreditCard },
  { id: 'Building2', label: 'Bank / Perusahaan', group: 'Keuangan & Bisnis', icon: Building2 },
  { id: 'TrendingUp', label: 'Investasi / Saham', group: 'Keuangan & Bisnis', icon: TrendingUp },
  { id: 'HandCoins', label: 'Bonus / Kembalian', group: 'Keuangan & Bisnis', icon: HandCoins },
  { id: 'Coins', label: 'Cashback / Koin', group: 'Keuangan & Bisnis', icon: Coins },
  { id: 'PiggyBank', label: 'Tabungan / Celengan', group: 'Keuangan & Bisnis', icon: PiggyBank },
  { id: 'Receipt', label: 'Struk / Tagihan Bulanan', group: 'Keuangan & Bisnis', icon: Receipt },
  { id: 'ReceiptText', label: 'Biaya Admin', group: 'Keuangan & Bisnis', icon: ReceiptText },
  { id: 'Percent', label: 'Bunga / Pajak', group: 'Keuangan & Bisnis', icon: Percent },
  { id: 'DollarSign', label: 'Mata Uang / Valas', group: 'Keuangan & Bisnis', icon: DollarSign },
  { id: 'Landmark', label: 'Pajak Negara / Instansi', group: 'Keuangan & Bisnis', icon: Landmark },

  // Sosial & Ibadah
  { id: 'HeartHandshake', label: 'Donasi / Sedekah', group: 'Sosial & Ibadah', icon: HeartHandshake },
  { id: 'Gift', label: 'Kado / Hadiah', group: 'Sosial & Ibadah', icon: Gift },
  { id: 'PartyPopper', label: 'Pesta / Kondangan', group: 'Sosial & Ibadah', icon: PartyPopper },
  { id: 'Church', label: 'Ibadah / Keagamaan', group: 'Sosial & Ibadah', icon: Church },
  { id: 'Award', label: 'Zakat / Syukuran', group: 'Sosial & Ibadah', icon: Award },

  // Lainnya
  { id: 'AlertCircle', label: 'Biaya Tak Terduga', group: 'Lainnya', icon: AlertCircle },
  { id: 'CalendarDays', label: 'Pengeluaran Tahunan', group: 'Lainnya', icon: CalendarDays },
  { id: 'Star', label: 'Favorit / Prioritas', group: 'Lainnya', icon: Star },
  { id: 'Bookmark', label: 'Catatan Khusus', group: 'Lainnya', icon: Bookmark },
  { id: 'Globe', label: 'Online / Internasional', group: 'Lainnya', icon: Globe },
  { id: 'Sun', label: 'Kebutuhan Siang', group: 'Lainnya', icon: Sun },
  { id: 'Moon', label: 'Aktivitas Malam', group: 'Lainnya', icon: Moon },
  { id: 'Layers', label: 'Lain-lain / Aneka', group: 'Lainnya', icon: Layers },
];

export const CATEGORY_ICON_REGISTRY: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICON_LIST.map((item) => [item.id, item.icon])
);

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
  type?: 'pengeluaran' | 'pemasukan' | 'transfer',
  iconId?: string,
  emoji?: string
): CategoryVisualConfig {
  if (type === 'transfer') {
    return CATEGORY_MAP['pindah akun'];
  }

  // 1. Direct Lucide icon resolution from iconId or emoji if it matches a registered ID
  const directIconKey = iconId || (emoji && CATEGORY_ICON_REGISTRY[emoji] ? emoji : undefined);
  if (directIconKey && CATEGORY_ICON_REGISTRY[directIconKey]) {
    const IconComponent = CATEGORY_ICON_REGISTRY[directIconKey];
    const color =
      type === 'pemasukan'
        ? 'text-[#059669] dark:text-[#34d399]'
        : 'text-[#7132f5] dark:text-[#a78bfa]';
    return {
      icon: IconComponent,
      color,
      label: name || directIconKey,
    };
  }

  // 2. Lookup by category name in default map
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

  // 3. Fallback by type
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
      aria-label={config.label}
    >
      <IconComponent className={iconSizes} strokeWidth={2.2} />
    </div>
  );
};
