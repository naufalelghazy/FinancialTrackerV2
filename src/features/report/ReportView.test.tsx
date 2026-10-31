import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';
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
