import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent, screen, act } from '@testing-library/react';
import { ReportView } from './ReportView';
import { ThemeProvider } from '../../contexts/ThemeContext';
import type { Account, Category, Transaction } from '../../types';
import { todayLocalISO } from '../../lib/date';

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

const renderReport = (transactions: Transaction[]) =>
  render(
    <ThemeProvider>
      <ReportView
        accounts={accounts}
        categories={categories}
        transactions={transactions}
      />
    </ThemeProvider>
  );

const accounts: Account[] = [
  { id: 'a', name: 'BCA', type: 'bank', initialBalance: 0, balance: 0 },
];
const categories: Category[] = [
  { id: 'makan', name: 'Makan', type: 'pengeluaran', emoji: '🍜', icon: 'Utensils' },
  { id: 'gaji', name: 'Gaji', type: 'pemasukan', emoji: '💰', icon: 'Wallet' },
];

function tx(id: string, type: Transaction['type'], amount: number, categoryId: string): Transaction {
  return {
    id,
    type,
    amount,
    categoryId,
    sourceAccountId: 'a',
    date: todayLocalISO(),
    notes: '',
    createdAt: new Date().toISOString(),
  };
}

describe('ReportView percentage formatting', () => {
  const transactions = [
    tx('1', 'pengeluaran', 75000, 'makan'),
    tx('2', 'pengeluaran', 25000, 'makan'),
    tx('3', 'pemasukan', 50000, 'gaji'),
  ];

  it('never renders a doubled percent sign on the category tab', () => {
    renderReport(transactions);
    // `formatPercent()` already appends "%"; seven call sites added another,
    // so the page showed "12,3%%". The per-category rows always render.
    expect(document.body.textContent).not.toContain('%%');
  });

  it('never renders a doubled percent sign in the selected-category readout', () => {
    renderReport(transactions);

    // The centre-of-donut readout only renders once a category is picked, and
    // that branch is where two of the seven broken call sites lived.
    const row = screen.getAllByText('Makan')[0].closest('[role="button"]');
    fireEvent.click(row!);

    expect(document.body.textContent).not.toContain('%%');
  });

  it('never renders a doubled percent sign on the account tab', () => {
    renderReport(transactions);
    // Each chart tab is a separate branch of JSX, so the default tab alone
    // does not prove the others are clean.
    fireEvent.click(screen.getByRole('tab', { name: /akun|rekening/i }));
    expect(document.body.textContent).not.toContain('%%');
  });
});

describe('ReportView donut driven by a finger', () => {
  // Three equal slices, so the geometry is easy to follow: slice 0 owns
  // 0-120deg (Makan), slice 1 owns 120-240deg (Transport), slice 2 the rest.
  const transactions = [
    tx('1', 'pengeluaran', 100, 'makan'),
    tx('2', 'pengeluaran', 100, 'transport'),
    tx('3', 'pengeluaran', 100, 'belanja'),
  ];
  const manyCategories: Category[] = [
    { id: 'makan', name: 'Makan', type: 'pengeluaran', emoji: '🍜', icon: 'Utensils' },
    { id: 'transport', name: 'Transport', type: 'pengeluaran', emoji: '🚌', icon: 'Car' },
    { id: 'belanja', name: 'Belanja', type: 'pengeluaran', emoji: '🛍️', icon: 'ShoppingBag' },
  ];

  const renderMany = () =>
    render(
      <ThemeProvider>
        <ReportView
          accounts={accounts}
          categories={manyCategories}
          transactions={transactions}
        />
      </ThemeProvider>
    );

  const donut = () =>
    screen.getByLabelText(/Grafik donut pengeluaran per kategori/);

  /**
   * A touch event at `angle` degrees clockwise from 12 o'clock. The radius
   * sits in the middle of the drawn ring for the radius jsdom ends up with.
   *
   * These are real `touch*` events, not `pointer*` ones, because Chromium
   * stops delivering pointer events for a finger as soon as it hands the
   * gesture to scrolling — which is what a real drag looks like.
   */
  const touchAt = (angle: number, radius = 105) => {
    const host = donut();
    // jsdom reports a zero-sized box, so give the chart a 200x200 frame.
    host.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 200,
        height: 200,
        right: 200,
        bottom: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    const rad = (angle * Math.PI) / 180;
    return { clientX: 100 + Math.sin(rad) * radius, clientY: 100 - Math.cos(rad) * radius };
  };

  /** Dispatches a `touch*` event carrying `points`. */
  const fireTouch = (type: 'touchstart' | 'touchmove' | 'touchend', points: Array<{ clientX: number; clientY: number }>) => {
    const host = donut();
    const event = new Event(type, { bubbles: true, cancelable: true });
    const touches = points.map((p, i) => ({ identifier: i, ...p, target: host }));
    Object.defineProperty(event, 'touches', { value: type === 'touchend' ? [] : touches });
    Object.defineProperty(event, 'changedTouches', { value: touches });
    // The listeners are native ones attached to the element, so React cannot
    // batch the state update for us; `act` flushes the re-render that follows.
    act(() => {
      host.dispatchEvent(event);
    });
  };

  /** The centre-of-donut readout, which names the aimed slice. */
  const readout = () =>
    donut().querySelector('.absolute.inset-0')?.textContent ?? '';

  it('shows the slice under the finger for as long as it is held', () => {
    renderMany();
    expect(readout()).toContain('Total');
    fireTouch('touchstart', [touchAt(180)]);
    expect(readout()).toContain('Transport');
    expect(readout()).not.toContain('Total');
  });

  it('stays on the same slice while the finger rests', () => {
    renderMany();

    fireTouch('touchstart', [touchAt(180)]);
    // No movement at all: the readout must not flicker back to neutral.
    expect(readout()).toContain('Transport');
    expect(readout()).toContain('Transport');
  });

  it('goes back to neutral when the finger is lifted', () => {
    renderMany();

    fireTouch('touchstart', [touchAt(180)]);
    expect(readout()).toContain('Transport');

    fireTouch('touchend', []);
    expect(readout()).toContain('Total');
    expect(readout()).not.toContain('Transport');
  });

  it('follows the finger when it slides onto another slice', () => {
    renderMany();

    fireTouch('touchstart', [touchAt(60)]); // slice 0 = Makan
    expect(readout()).toContain('Makan');

    fireTouch('touchmove', [touchAt(300)]); // slice 2 = Belanja
    expect(readout()).toContain('Belanja');
    expect(readout()).not.toContain('Makan');
  });

  it('goes neutral when the finger is pressed inside the donut hole', () => {
    renderMany();
    fireTouch('touchstart', [touchAt(180, 10)]);
    expect(readout()).toContain('Total');
  });

  it('ignores a slide that no finger started', () => {
    renderMany();
    // A stray touchmove would otherwise aim at slices never touched.
    fireTouch('touchmove', [touchAt(180)]);
    expect(readout()).toContain('Total');
  });
});