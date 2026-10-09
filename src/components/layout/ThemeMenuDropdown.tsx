import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Check,
  Sun,
  Moon,
  Laptop,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { useTheme, type DesignSystem } from '../../contexts/ThemeContext';

interface ThemeMenuDropdownProps {
  onOpenSettings?: (tab?: 'akun' | 'kategori' | 'tampilan' | 'backend') => void;
  align?: 'left' | 'right';
  variant?: 'header' | 'sidebar' | 'pill';
  direction?: 'up' | 'down' | 'auto';
}

export const ThemeMenuDropdown: React.FC<ThemeMenuDropdownProps> = ({
  onOpenSettings,
  align = 'left',
  variant = 'header',
  direction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { designSystem, setDesignSystem, theme, setTheme, currentConfig } = useTheme();

  // Automatic direction: sidebar defaults to 'up' so it never overflows offscreen downwards
  const effectiveDirection = direction || (variant === 'sidebar' ? 'up' : 'down');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const systems: {
    id: DesignSystem;
    name: string;
    badge: string;
    tagline: string;
    color: string;
    accent: string;
    doc: string;
    isPill: boolean;
  }[] = [
    {
      id: 'coinbase',
      name: 'Coinbase',
      badge: 'Coinbase Edition',
      tagline: 'Financial Calm & Blue Pill',
      color: '#0052ff',
      accent: '#003ecc',
      doc: 'DESIGN-coinbase.md',
      isPill: true,
    },
    {
      id: 'theverge',
      name: 'The Verge',
      badge: 'The Verge Edition',
      tagline: 'Cyber Editorial Newsprint',
      color: '#3cffd0',
      accent: '#5200ff',
      doc: 'DESIGN-theverge.md',
      isPill: true,
    },
    {
      id: 'kraken',
      name: 'Kraken',
      badge: 'Kraken Edition',
      tagline: 'Crypto Classic Purple',
      color: '#7132f5',
      accent: '#5741d8',
      doc: 'DESIGN-kraken.md',
      isPill: false,
    },
    {
      id: 'autumn',
      name: 'Autumn',
      badge: 'Autumn Edition',
      tagline: 'Warm Insight Analytics',
      color: '#ea580c',
      accent: '#c2410c',
      doc: 'DESIGN-autumn.md',
      isPill: false,
    },
  ];

  // Width classes:
  // For sidebar and pill variants (inside the sidebar), it must be w-full (matching the sidebar width exactly)
  // so it NEVER overflows horizontally outside the sidebar boundary!
  const popoverWidthClass =
    variant === 'sidebar' || variant === 'pill'
      ? 'w-full left-0 right-0 min-w-0'
      : 'w-[280px] sm:w-[300px] ' + (align === 'right' ? 'right-0' : 'left-0');

  const popoverVerticalClass =
    effectiveDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <div
      className={`relative ${
        variant === 'sidebar' ? 'w-full block' : 'inline-block text-left w-full sm:w-auto'
      }`}
      ref={dropdownRef}
    >
      {/* Trigger Button Variants */}
      {variant === 'header' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Pilih Tema Desain"
          className={`h-9 px-2.5 sm:px-3 rounded-[10px] border border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/40 dark:hover:border-[#7132f5]/40 bg-[#fafbfe] dark:bg-[#1e202b] text-[#101114] dark:text-[#f3f4f8] text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-micro ${
            isOpen ? 'ring-2 ring-[#7132f5]/25 border-[#7132f5]' : ''
          }`}
          title="Pilih Tema & Sistem Desain"
        >
          <div className="relative flex items-center justify-center">
            <Palette className="w-3.5 h-3.5 text-[#7132f5] dark:text-[#a78bfa]" />
            <span
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white dark:ring-[#1e202b]"
              style={{ backgroundColor: currentConfig.primaryColor }}
            />
          </div>
          <span className="hidden sm:inline font-bold tracking-tight text-[11px]">
            {currentConfig.name}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-[#686b82] dark:text-[#9ca0ba] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {variant === 'pill' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Ganti Tema"
          className={`group inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[#edeef3]/80 dark:bg-[#1e202b] border border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/50 transition-all text-left ${
            isOpen ? 'ring-2 ring-[#7132f5]/25 border-[#7132f5]' : ''
          }`}
          title="Ganti Tema Sistem Desain"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: currentConfig.primaryColor }}
          />
          <span
            className="text-[10px] font-bold tracking-wider uppercase transition-colors"
            style={{ color: currentConfig.primaryColor }}
          >
            {currentConfig.badge}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-[#686b82] dark:text-[#9ca0ba] group-hover:text-[#101114] dark:group-hover:text-white transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full py-2.5 px-3 rounded-[12px] border border-[#dedee5] dark:border-[#282937] hover:border-[#7132f5]/40 bg-[#fafbfe] dark:bg-[#1e202b] text-[#101114] dark:text-[#f3f4f8] text-xs font-semibold flex items-center justify-between transition-all shadow-micro ${
            isOpen ? 'ring-2 ring-[#7132f5]/25 border-[#7132f5]' : ''
          }`}
          title="Pilih Tema Sistem Desain"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 shadow-sm transition-colors"
              style={{
                backgroundColor: currentConfig.id === 'theverge' ? '#131313' : currentConfig.primaryColor,
                border: currentConfig.id === 'theverge' ? '1.5px solid #3cffd0' : 'none',
              }}
            >
              <Palette className={`w-3.5 h-3.5 ${currentConfig.id === 'theverge' ? 'text-[#3cffd0]' : 'text-white'}`} />
            </div>
            <div className="text-left leading-tight min-w-0">
              <span className="block font-bold text-xs truncate">{currentConfig.name} Edition</span>
              <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba] font-normal truncate block">
                {currentConfig.tagline}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#686b82] dark:text-[#9ca0ba] transition-transform duration-200 shrink-0 ${
              isOpen ? (effectiveDirection === 'up' ? '' : 'rotate-180') : (effectiveDirection === 'up' ? 'rotate-180' : '')
            }`}
          />
        </button>
      )}

      {/* Dropdown / Dropup Popover */}
      {isOpen && (
        <div
          className={`absolute ${popoverWidthClass} ${popoverVerticalClass} rounded-[16px] bg-white dark:bg-[#16171f] border border-[#dedee5] dark:border-[#282937] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md max-h-[80vh] overflow-y-auto box-border`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1.5 pt-0.5 pb-2 border-b border-[#dedee5] dark:border-[#282937]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-[#7132f5] dark:text-[#a78bfa] shrink-0" />
              <span className="text-xs font-bold text-[#101114] dark:text-[#f3f4f8] leading-none truncate">
                Pilihan Tema
              </span>
            </div>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-[4px] bg-[#855bfb]/10 dark:bg-[#855bfb]/20 text-[#7132f5] dark:text-[#a78bfa] font-bold shrink-0">
              v2.0
            </span>
          </div>

          {/* Design Systems List */}
          <div className="py-1.5 space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#9497a9] dark:text-[#767993] tracking-wider px-1.5 block">
              Sistem Desain
            </span>

            {systems.map((s) => {
              const isSelected = designSystem === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setDesignSystem(s.id);
                  }}
                  className={`w-full text-left p-2 rounded-[10px] transition-all flex items-center justify-between gap-2 border ${
                    isSelected
                      ? 'bg-[#855bfb]/10 dark:bg-[#855bfb]/15 border-[#7132f5]/50 dark:border-[#a78bfa]/50 shadow-micro'
                      : 'hover:bg-[#fafbfe] dark:hover:bg-[#1e202b] border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-[7px] flex items-center justify-center shrink-0 shadow-sm"
                      style={{
                        backgroundColor: s.id === 'theverge' ? '#131313' : s.color,
                        border: s.id === 'theverge' ? '1.5px solid #3cffd0' : 'none',
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: s.id === 'theverge' ? '#3cffd0' : '#ffffff' }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#101114] dark:text-[#f3f4f8] truncate">
                          {s.name}
                        </span>
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#dedee5]/70 dark:bg-[#282937] text-[#686b82] dark:text-[#9ca0ba] shrink-0">
                          {s.id === 'autumn' ? 'Warm' : s.isPill ? 'Pill' : 'Classic'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba] block truncate">
                        {s.tagline}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-[#7132f5] dark:bg-[#a78bfa] text-white dark:text-[#101114] flex items-center justify-center shrink-0 shadow-micro">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#dedee5] dark:border-[#282937] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mode Tampilan */}
          <div className="pt-2 pb-1 border-t border-[#dedee5] dark:border-[#282937]">
            <div className="flex items-center justify-between px-1.5 mb-1.5">
              <span className="text-[9px] uppercase font-bold text-[#9497a9] dark:text-[#767993] tracking-wider">
                Mode Tampilan
              </span>
              {designSystem === 'theverge' && (
                <span className="text-[8px] text-[#3cffd0] font-mono">Cyber Dark</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1 bg-[#edeef3] dark:bg-[#1e202b] p-1 rounded-[8px] border border-[#dedee5] dark:border-[#282937]">
              <button
                disabled={designSystem === 'theverge'}
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1 py-1 px-1 rounded-[6px] text-[10px] font-bold transition-all ${
                  theme === 'light' && designSystem !== 'theverge'
                    ? 'bg-white text-[#101114] shadow-micro'
                    : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114]'
                } ${designSystem === 'theverge' ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Mode Terang"
              >
                <Sun className="w-3 h-3 text-[#f59e0b] shrink-0" />
                <span className="truncate">Terang</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1 py-1 px-1 rounded-[6px] text-[10px] font-bold transition-all ${
                  theme === 'dark' || designSystem === 'theverge'
                    ? 'bg-white dark:bg-[#282937] text-[#101114] dark:text-[#f3f4f8] shadow-micro'
                    : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114]'
                }`}
                title="Mode Gelap"
              >
                <Moon className="w-3 h-3 text-[#7132f5] dark:text-[#a78bfa] shrink-0" />
                <span className="truncate">Gelap</span>
              </button>

              <button
                disabled={designSystem === 'theverge'}
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center gap-1 py-1 px-1 rounded-[6px] text-[10px] font-bold transition-all ${
                  theme === 'system' && designSystem !== 'theverge'
                    ? 'bg-white dark:bg-[#282937] text-[#101114] dark:text-[#f3f4f8] shadow-micro'
                    : 'text-[#686b82] dark:text-[#9ca0ba] hover:text-[#101114]'
                } ${designSystem === 'theverge' ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Ikuti Tema Sistem"
              >
                <Laptop className="w-3 h-3 text-[#686b82] shrink-0" />
                <span className="truncate">Auto</span>
              </button>
            </div>
          </div>

          {/* Showroom CTA */}
          {onOpenSettings && (
            <div className="pt-1.5 border-t border-[#dedee5] dark:border-[#282937] mt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings('tampilan');
                }}
                className="w-full py-1.5 px-2 rounded-[8px] hover:bg-[#fafbfe] dark:hover:bg-[#1e202b] text-[11px] font-bold text-[#7132f5] dark:text-[#a78bfa] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <SlidersHorizontal className="w-3 h-3 shrink-0" />
                  <span className="truncate">Showroom Tema</span>
                </div>
                <span className="text-[10px] text-[#686b82] dark:text-[#9ca0ba] group-hover:translate-x-0.5 transition-transform shrink-0">
                  &rarr;
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};