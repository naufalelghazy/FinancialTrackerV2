import React, { useEffect, useState, useMemo } from 'react';
import {
  DESIGN_SYSTEMS,
  ThemeContext,
  type DesignSystem,
  type ThemeMode,
  type ThemeConfig,
} from './themeStore';

export type { DesignSystem, ThemeMode, ThemeConfig };

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

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', designSystem);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (designSystem === 'coinbase') {
        metaThemeColor.setAttribute('content', isDark ? '#0a0b0d' : '#0052ff');
      } else if (designSystem === 'theverge') {
        metaThemeColor.setAttribute('content', isDark ? '#131313' : '#f7f7f9');
      } else if (designSystem === 'autumn') {
        metaThemeColor.setAttribute('content', isDark ? '#1c1917' : '#ea580c');
      } else if (designSystem === 'mongodb') {
        metaThemeColor.setAttribute('content', isDark ? '#001e2b' : '#00ed64');
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
