import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup, screen, within } from '@testing-library/react';
import { SettingsModal } from './SettingsModal';
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

const renderSettings = () =>
  render(
    <ThemeProvider>
      <SettingsModal isOpen onClose={vi.fn()} />
    </ThemeProvider>
  );

describe('SettingsModal tabs', () => {
  it('lays the tabs out vertically so no label is cut off', () => {
    renderSettings();

    const tablist = screen.getByRole('tablist');
    expect(tablist.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('renders the full label of every tab', () => {
    renderSettings();

    // The old horizontal grid truncated these to "Reke…", "Kateg…", "Temp…".
    for (const label of ['Rekening', 'Kategori', 'Template', 'Tema', 'Antrean', 'Backend']) {
      const tab = screen.getByRole('tab', { name: label });
      expect(within(tab).getByText(label)).toBeTruthy();
    }
  });

  it('switches panels and marks the active tab', () => {
    renderSettings();

    const tema = screen.getByRole('tab', { name: 'Tema' });
    expect(tema.getAttribute('aria-selected')).toBe('false');

    fireEvent.click(tema);
    expect(tema.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'Rekening' }).getAttribute('aria-selected')).toBe('false');
  });

  it('opens on the tab it was asked to show', () => {
    render(
      <ThemeProvider>
        <SettingsModal isOpen onClose={vi.fn()} initialTab="backend" />
      </ThemeProvider>
    );

    expect(screen.getByRole('tab', { name: 'Backend' }).getAttribute('aria-selected')).toBe('true');
  });
});
