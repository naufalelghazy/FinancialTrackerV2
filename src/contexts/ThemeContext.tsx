import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type DesignSystem = 'coinbase' | 'theverge' | 'kraken';

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
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase',
    tagline: 'Financial Institutional Edition',
    badge: 'Coinbase Edition',
    description: 'Aksen Coinbase Blue (#0052ff), tombol pill, kartu 24px, dan tipografi Inter & JetBrains Mono.',
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
    description: 'Kanvas cyber gelap #131313, aksen neon Jelly Mint (#3cffd0), headline Anton, dan border flat 1px.',
    primaryColor: '#3cffd0',
    accentColor: '#5200ff',
    canvasBg: { light: '#131313', dark: '#131313' },
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
    description: 'Aksen Kraken Purple (#7132f5), sudut rounded 12px, font IBM Plex Sans, dan bayangan lembut.',
    primaryColor: '#7132f5',
    accentColor: '#5741d8',
    canvasBg: { light: '#fafbfe', dark: '#0d0e12' },
    pillShape: false,
    fontDisplay: 'IBM Plex Sans',
    fontSans: 'IBM Plex Sans',
    docFile: 'DESIGN-kraken.md',
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  designSystem: DesignSystem;
  setDesignSystem: (system: DesignSystem) => void;
  isDark: boolean;
  toggleTheme: () => void;
  currentConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Design system state: coinbase | theverge | kraken
  const [designSystem, setDesignSystemState] = useState<DesignSystem>(() => {
    try {
      const saved = localStorage.getItem('ft_design_system') as DesignSystem | null;
      if (saved && ['coinbase', 'theverge', 'kraken'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'coinbase';
  });

  // Theme mode: light | dark | system
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('ft_theme') as ThemeMode | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'system';
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Determine actual active dark state
  const isDark = useMemo(() => {
    if (designSystem === 'theverge') {
      // The Verge is an inherently dark editorial canvas (#131313) as specified in DESIGN-theverge.md
      return true;
    }
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return systemIsDark;
  }, [theme, systemIsDark, designSystem]);

  // Sync data-theme and dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', designSystem);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update browser theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
 if (metaThemeColor) {
 if (designSystem === 'coinbase') {
 metaThemeColor.setAttribute('content', isDark ? '#0a0b0d' : '#0052ff');
 } else if (designSystem === 'theverge') {
 metaThemeColor.setAttribute('content', '#131313');
 } else {
 metaThemeColor.setAttribute('content', isDark ? '#0d0e12' : '#7132f5');
 }
 }
 }, [designSystem, isDark]);

 const setDesignSystem = (newSystem: DesignSystem) => {
 setDesignSystemState(newSystem);
 try {
 localStorage.setItem('ft_design_system', newSystem);
 } catch {}
 };

 const setTheme = (newTheme: ThemeMode) => {
 setThemeState(newTheme);
 try {
 localStorage.setItem('ft_theme', newTheme);
 } catch {}
 };

 const toggleTheme = () => {
 if (isDark) {
 setTheme('light');
 } else {
 setTheme('dark');
 }
 };

 const currentConfig = useMemo(() => DESIGN_SYSTEMS[designSystem], [designSystem]);

 return (
 <ThemeContext.Provider
 value={{
 theme,
 setTheme,
 designSystem,
 setDesignSystem,
 isDark,
 toggleTheme,
 currentConfig,
 }}
 >
 {children}
 </ThemeContext.Provider>
 );
};

export function useTheme(): ThemeContextType {
 const context = useContext(ThemeContext);
 if (!context) {
 throw new Error('useTheme must be used within a ThemeProvider');
 }
 return context;
}
