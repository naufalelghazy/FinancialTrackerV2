import React, { useEffect, useState, useMemo } from 'react';
import { DESIGN_SYSTEMS, ThemeContext, type DesignSystem, type ThemeMode, type ThemeConfig } from './themeStore';

export type { DesignSystem, ThemeMode, ThemeConfig };

/**
 * Google Fonts families each design system needs, keyed by design system.
 *
 * Only the Kraken baseline is loaded by `index.html`; the rest are injected on
 * demand so first paint is not blocked by eight font families the user may
 * never see.
 */
const THEME_FONTS: Record<DesignSystem, string[]> = {
  kraken: [],
  coinbase: ['Inter:wght@300;400;500;600;700', 'JetBrains+Mono:wght@400;500;600;700'],
  theverge: [
    'Anton',
    'Space+Grotesk:wght@300;400;500;600;700',
    'Space+Mono:ital,wght@0,400;0,700;1,400',
  ],
  autumn: ['Plus+Jakarta+Sans:wght@400;500;600;700;800'],
  mongodb: ['Source+Code+Pro:wght@400;500;600;700'],
};

const loadedFontHrefs = new Set<string>();

/** Injects the stylesheet for a design system's fonts exactly once. */
function loadFontsFor(system: DesignSystem): void {
  const families = THEME_FONTS[system];
  if (families.length === 0) return;

  const href = `https://fonts.googleapis.com/css2?${families
    .map((family) => `family=${family}`)
    .join('&')}&display=swap`;

  if (loadedFontHrefs.has(href)) return;
  loadedFontHrefs.add(href);

  if (document.querySelector(`link[href="${href}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [designSystem, setDesignSystemState] = useState<DesignSystem>(() => {
    try {
      const saved = localStorage.getItem('ft_design_system') as DesignSystem | null;
      if (saved && ['coinbase', 'theverge', 'kraken', 'autumn', 'mongodb'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'coinbase';
  });

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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDark = useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return systemIsDark;
  }, [theme, systemIsDark]);

  const currentConfig = useMemo(() => DESIGN_SYSTEMS[designSystem], [designSystem]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', designSystem);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Load the family this design system actually uses, not all of them.
    loadFontsFor(designSystem);

    // `currentConfig` already knows both canvas colours, so the theme-color
    // meta tag no longer needs its own if/else chain per design system.
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        isDark ? currentConfig.canvasBg.dark : currentConfig.canvasBg.light
      );
    }
  }, [designSystem, isDark, currentConfig]);

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
