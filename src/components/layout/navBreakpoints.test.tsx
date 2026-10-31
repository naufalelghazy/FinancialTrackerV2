import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ThemeProvider } from '../../contexts/ThemeContext';

afterEach(cleanup);

// ThemeProvider reads the OS colour scheme; jsdom has no matchMedia.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

/**
 * Only one navigation surface may be visible at a time.
 *
 * The bug this guards: the header's tab strip switched on at `md` (768px)
 * while the bottom nav kept going until `lg` (1024px). Between those widths a
 * tablet showed both, and the sixth tab was squeezed under the action buttons.
 *
 * jsdom does not apply media queries, so these assertions read the classes that
 * decide visibility rather than measuring the layout.
 */

const BREAKPOINTS = ['sm', 'md', 'lg', 'xl'] as const;

/** The Tailwind prefix that hides an element at, or above, a breakpoint. */
function hiddenAtOrAbove(className: string): string | null {
  for (const bp of BREAKPOINTS) {
    if (className.includes(`${bp}:hidden`)) return bp;
  }
  return null;
}

/** The Tailwind prefix that shows an element at, or above, a breakpoint. */
function shownAtOrAbove(className: string): string | null {
  for (const bp of BREAKPOINTS) {
    const match = className.match(new RegExp(`(?:^|\\s)${bp}:flex(?:\\s|$)`));
    if (match) return bp;
  }
  return null;
}

const navProps = {
  activeTab: 'dashboard' as const,
  onChangeTab: vi.fn(),
  onOpenSettings: vi.fn(),
};

describe('navigation surfaces do not overlap', () => {
  it('the header tabs appear only once the sidebar takes over', () => {
    const { container } = render(
      <ThemeProvider>
        <Header {...navProps} />
      </ThemeProvider>
    );

    const tabs = container.querySelector('nav');
    expect(tabs).toBeTruthy();
    // Both strips must hand over at the same breakpoint.
    expect(shownAtOrAbove(tabs!.className)).toBe('lg');
  });

  it('the sidebar shows at the same breakpoint as the header tabs', () => {
    const { container } = render(
      <ThemeProvider>
        <Sidebar {...navProps} />
      </ThemeProvider>
    );

    const aside = container.querySelector('aside');
    expect(shownAtOrAbove(aside!.className)).toBe('lg');
  });

  it('the bottom nav hides exactly when the sidebar appears', () => {
    const { container } = render(
      <ThemeProvider>
        <BottomNav {...navProps} />
      </ThemeProvider>
    );

    const nav = container.querySelector('nav');
    // `lg:hidden` means: gone from lg upwards, i.e. where the sidebar starts.
    expect(hiddenAtOrAbove(nav!.className)).toBe('lg');
  });

  it('the header tabs are the only surface that is exclusive to desktop', () => {
    const header = render(
      <ThemeProvider>
        <Header {...navProps} />
      </ThemeProvider>
    );
    const headerTabsAt = shownAtOrAbove(header.container.querySelector('nav')!.className);
    cleanup();

    const bottom = render(
      <ThemeProvider>
        <BottomNav {...navProps} />
      </ThemeProvider>
    );
    const bottomNavHiddenAt = hiddenAtOrAbove(bottom.container.querySelector('nav')!.className);

    // Matching breakpoints is what removes the tablet dead zone.
    expect(headerTabsAt).toBe(bottomNavHiddenAt);
  });
});
