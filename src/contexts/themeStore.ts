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
  docFile: string;
}

export const DESIGN_SYSTEMS: Record<DesignSystem, ThemeConfig> = {
  mongodb: {
    id: 'mongodb',
    name: 'MongoDB',
    tagline: 'Developer Data Platform',
    badge: 'MongoDB Edition',
    description: 'Aksen hijau MongoDB, kanvas deep-teal, tombol pill, dan tipografi Euclid Circular',
    primaryColor: '#00ed64',
    accentColor: '#00684a',
    canvasBg: { light: '#ffffff', dark: '#001e2b' },
    pillShape: true,
    fontDisplay: 'Euclid Circular A',
    fontSans: 'Euclid Circular A',
    docFile: 'DESIGN-mongodb.md',
  },
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase',
    tagline: 'Financial Institutional Edition',
    badge: 'Coinbase Edition',
    description: 'Aksen Coinbase Blue, tombol pill, dan tipografi Inter & JetBrains Mono.',
    primaryColor: '#0052ff',
    accentColor: '#003ecc',
    canvasBg: { light: '#ffffff', dark: '#0a0b0d' },
    pillShape: true,
    fontDisplay: 'Inter',
    fontSans: 'Inter',
    docFile: 'DESIGN-coinbase.md',
  },
  theverge: {
    id: 'theverge',
    name: 'The Verge',
    tagline: 'Cyber Editorial Edition',
    badge: 'The Verge Edition',
    description: 'Aksen neon Jelly Mint & Ultraviolet, kanvas editorial, dan headline Anton.',
    primaryColor: '#3cffd0',
    accentColor: '#5200ff',
    canvasBg: { light: '#f7f7f9', dark: '#131313' },
    pillShape: true,
    fontDisplay: 'Anton',
    fontSans: 'Space Grotesk',
    docFile: 'DESIGN-theverge.md',
  },
  kraken: {
    id: 'kraken',
    name: 'Kraken',
    tagline: 'Crypto Classic Edition',
    badge: 'Kraken Edition',
    description: 'Aksen Kraken Purple, font IBM Plex Sans, dan bayangan lembut.',
    primaryColor: '#7132f5',
    accentColor: '#5741d8',
    canvasBg: { light: '#fafbfe', dark: '#0d0e12' },
    pillShape: false,
    fontDisplay: 'IBM Plex Sans',
    fontSans: 'IBM Plex Sans',
    docFile: 'DESIGN-kraken.md',
  },
  autumn: {
    id: 'autumn',
    name: 'Autumn',
    tagline: 'Warm Insight Edition',
    badge: 'Autumn Edition',
    description: 'Tampilan hangat dengan nuansa warna oat dan aksen oranye musim gugur yang nyaman.',
    primaryColor: '#ea580c',
    accentColor: '#c2410c',
    canvasBg: { light: '#f4efea', dark: '#1c1917' },
    pillShape: false,
    fontDisplay: 'Plus Jakarta Sans',
    fontSans: 'Plus Jakarta Sans',
    docFile: 'DESIGN-autumn.md',
  },
};

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
