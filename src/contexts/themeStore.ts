import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type DesignSystem = 'coinbase' | 'theverge' | 'kraken' | 'autumn' | 'mongodb';

export interface ThemeConfig {
  id: DesignSystem;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  canvasBg: { light: string; dark: string };
  pillShape: boolean;
  fontDisplay: string;
  fontSans: string;
  /** Monospace family for numerical data, where the system defines one. */
  fontMono: string;
  /** Shape of the primary call-to-action, shown in the Theme Studio. */
  buttonStyle: string;
  /** Example label rendered inside the CTA preview. */
  previewLabel: string;
  docFile: string;
}

/**
 * The single source of truth for every design system.
 * `SettingsModal` and `ThemeContext` both read from here, so a colour or label
 * can no longer drift between the theme cards and the applied theme.
 */
export const DESIGN_SYSTEMS: Record<DesignSystem, ThemeConfig> = {
  mongodb: {
    id: 'mongodb',
    name: 'MongoDB',
    tagline: 'Developer Data Platform',
    badge: 'MongoDB Edition',
    description: 'Tampilan sederhana, bersih, dan profesional dengan nuansa hijau khas MongoDB.',
    primaryColor: '#00ed64',
    accentColor: '#00684a',
    canvasBg: { light: '#ffffff', dark: '#001e2b' },
    pillShape: true,
    fontDisplay: 'Euclid Circular A',
    fontSans: 'Euclid Circular A',
    fontMono: 'Source Code Pro',
    buttonStyle: 'Green Pill + Teks Deep Teal',
    previewLabel: 'Catat Transaksi',
    docFile: 'DESIGN-mongodb.md',
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase',
    tagline: 'Financial Institutional Calm',
    badge: 'Coinbase Edition',
    description: 'Tampilan bersih, tenang, dan profesional dengan nuansa biru khas finansial modern.',
    primaryColor: '#0052ff',
    accentColor: '#003ecc',
    canvasBg: { light: '#ffffff', dark: '#0a0b0d' },
    pillShape: true,
    fontDisplay: 'Inter',
    fontSans: 'Inter',
    fontMono: 'JetBrains Mono',
    buttonStyle: 'Pill 100px (rounded-full)',
    previewLabel: 'Catat Transaksi',
    docFile: 'DESIGN-coinbase.md',
  },
  theverge: {
    id: 'theverge',
    name: 'The Verge',
    tagline: 'Cyber Editorial Newsprint',
    badge: 'The Verge Edition',
    description: 'Tampilan editorial tegas: kanvas gelap, aksen neon mint, headline Anton.',
    primaryColor: '#3cffd0',
    accentColor: '#5200ff',
    canvasBg: { light: '#f7f7f9', dark: '#131313' },
    pillShape: true,
    fontDisplay: 'Anton',
    fontSans: 'Space Grotesk',
    fontMono: 'Space Mono',
    buttonStyle: 'Neon Mint Pill + Teks Hitam Pekat',
    previewLabel: 'CATAT TRANSAKSI',
    docFile: 'DESIGN-theverge.md',
  },
  kraken: {
    id: 'kraken',
    name: 'Kraken',
    tagline: 'Crypto Modernist Classic',
    badge: 'Kraken Edition',
    description: 'Tampilan modern dan elegan dengan nuansa ungu yang nyaman di mata.',
    primaryColor: '#7132f5',
    accentColor: '#5741d8',
    canvasBg: { light: '#fafbfe', dark: '#0d0e12' },
    pillShape: false,
    fontDisplay: 'IBM Plex Sans',
    fontSans: 'IBM Plex Sans',
    fontMono: 'JetBrains Mono',
    buttonStyle: 'Rounded 12px + Bayangan Whisper',
    previewLabel: 'Catat Transaksi',
    docFile: 'DESIGN-kraken.md',
  },
  autumn: {
    id: 'autumn',
    name: 'Autumn',
    tagline: 'Warm Insight Analytics',
    badge: 'Autumn Edition',
    description: 'Tampilan hangat dengan nuansa warna oat dan aksen oranye musim gugur yang nyaman.',
    primaryColor: '#ea580c',
    accentColor: '#c2410c',
    canvasBg: { light: '#f4efea', dark: '#1c1917' },
    pillShape: false,
    fontDisplay: 'Plus Jakarta Sans',
    fontSans: 'Plus Jakarta Sans',
    fontMono: 'Plus Jakarta Sans',
    buttonStyle: 'Rounded 10px + Warm Amber Accent',
    previewLabel: 'Catat Transaksi',
    docFile: 'DESIGN-autumn.md',
  },
};

/** Display order used by the Theme Studio. */
export const DESIGN_SYSTEM_ORDER: DesignSystem[] = [
  'mongodb',
  'coinbase',
  'theverge',
  'kraken',
  'autumn',
];

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  designSystem: DesignSystem;
  setDesignSystem: (system: DesignSystem) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentConfig: ThemeConfig;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
