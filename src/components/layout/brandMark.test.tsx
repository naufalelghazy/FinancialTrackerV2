/**
 * Regresi: logo merek di header/sidebar dulu bisa diklik dan langsung
 * melempar pengguna ke Dashboard.
 *
 * Bedanya tipis tapi fatal di ponsel: header berada di paling atas layar, dan
 * tepat di bawahnya ada input form. Menyentuh area logo -- atau menggulir dari
 * sana -- membuat tab berganti sebelum sempat mengetik, sehingga form terasa
 * "tiba-tiba pindah halaman sendiri".
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

vi.mock('../../contexts/themeStore', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: vi.fn(),
    currentConfig: { id: 'kraken', primaryColor: '#7132f5', name: 'Kraken' },
  }),
}));

const shared = {
  activeTab: 'input' as const,
  onOpenSettings: vi.fn(),
  isRefreshing: false,
  isLoading: false,
  onSync: vi.fn(),
  pendingSyncCount: 0,
  isOnline: true,
};

describe('brand mark is not a navigation control', () => {
  it('Header no longer renders a "Buka dashboard" button', () => {
    const onChangeTab = vi.fn();
    render(<Header {...shared} onChangeTab={onChangeTab} />);

    expect(screen.queryByRole('button', { name: /buka dashboard/i })).toBeNull();
  });

  it('Header keeps the app name visible', () => {
    render(<Header {...shared} onChangeTab={vi.fn()} />);
    expect(screen.getAllByText('Financial Tracker').length).toBeGreaterThan(0);
  });

  it('Sidebar no longer renders a "Buka dashboard" button', () => {
    const onChangeTab = vi.fn();
    render(<Sidebar {...shared} onChangeTab={onChangeTab} />);

    expect(screen.queryByRole('button', { name: /buka dashboard/i })).toBeNull();
  });

  it('Sidebar still has an explicit Dashboard nav item', () => {
    const onChangeTab = vi.fn();
    render(<Sidebar {...shared} onChangeTab={onChangeTab} />);

    const navItems = screen.getAllByRole('button');
    expect(navItems.some((el) => el.textContent?.includes('Dashboard'))).toBe(true);
  });
});
