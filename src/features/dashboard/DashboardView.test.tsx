import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { Account, Category, Transaction } from '../../types';
import { DashboardView } from './DashboardView';
import { currentMonthKey, shiftMonthKey } from '../../lib/date';

/**
 * Dashboard regression tests.
 *
 * Each of these covers a defect that shipped silently because the component had
 * no tests at all: a wrong month, a missing empty state, and a truncated account
 * list that looked complete.
 */

// Vitest is not running with `globals: true`, so Testing Library cannot register
// its own auto-cleanup. Without this every render accumulates in the same body
// and `getByText` reports "found multiple elements".
afterEach(cleanup);

const account = (over: Partial<Account>): Account =>
  ({
    id: 'acc-1',
    name: 'BCA',
    type: 'bank',
    balance: 100000,
    color: '#000',
    ...over,
  }) as Account;

const category = (over: Partial<Category>): Category =>
  ({ id: 'cat-1', name: 'Makan', type: 'pengeluaran', icon: 'utensils', ...over }) as Category;

const tx = (over: Partial<Transaction>): Transaction =>
  ({
    id: 'tx-1',
    date: `${currentMonthKey()}-05`,
    amount: 50000,
    type: 'pengeluaran',
    categoryId: 'cat-1',
    sourceAccountId: 'acc-1',
    notes: '',
    ...over,
  }) as Transaction;

const renderDashboard = (props: Partial<Parameters<typeof DashboardView>[0]> = {}) => {
  const onNavigateTab = vi.fn();
  const onEditTransaction = vi.fn();
  const onAddTransaction = vi.fn();

  const utils = render(
    <DashboardView
      accounts={props.accounts ?? [account({})]}
      transactions={props.transactions ?? []}
      categories={props.categories ?? [category({})]}
      templates={props.templates ?? []}
      onNavigateTab={onNavigateTab}
      onEditTransaction={onEditTransaction}
      onAddTransaction={onAddTransaction}
      // jsdom has no pointer events by default; the account row only becomes
      // interactive when this handler exists, so tests opt in explicitly.
      onSelectAccountHistory={props.onSelectAccountHistory}
      {...props}
    />
  );

  return { ...utils, onNavigateTab, onEditTransaction, onAddTransaction };
};

describe('DashboardView — active month', () => {
  it('opens on the current month, not on the month of the newest transaction', () => {
    // The reported bug: on 2 March, with the only transaction dated
    // 28 February, the card was titled "Februari" and the user saw an
    // apparently empty month with no explanation and no way to switch.
    const previousMonth = shiftMonthKey(currentMonthKey(), -1);
    renderDashboard({
      transactions: [tx({ date: `${previousMonth}-28` })],
    });

    const now = new Date();
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const currentLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    expect(screen.getAllByText(currentLabel).length).toBeGreaterThan(0);
  });

  it('can step back to the previous month', () => {
    const previousMonth = shiftMonthKey(currentMonthKey(), -1);
    renderDashboard({
      transactions: [tx({ date: `${previousMonth}-10`, amount: 120000 })],
    });

    // The current month has no expense yet.
    expect(screen.getByText('Belum ada pengeluaran')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Bulan sebelumnya'));

    // Now the previous month's expense is visible (it appears both as the
    // panel total and in the recent-transactions list).
    expect(screen.getAllByText('Rp 120.000').length).toBeGreaterThan(0);
  });

  it('refuses to navigate into the future', () => {
    renderDashboard();
    const next = screen.getByLabelText('Bulan berikutnya') as HTMLButtonElement;
    expect(next.disabled).toBe(true);
  });

  it('offers a way back to the current month once you leave it', () => {
    renderDashboard();
    expect(screen.queryByText('Kembali ke bulan ini')).toBeNull();

    fireEvent.click(screen.getByLabelText('Bulan sebelumnya'));
    expect(screen.getByText('Kembali ke bulan ini')).toBeTruthy();

    fireEvent.click(screen.getByText('Kembali ke bulan ini'));
    expect(screen.queryByText('Kembali ke bulan ini')).toBeNull();
  });

  it('excludes transfers from the month total', () => {
    renderDashboard({
      accounts: [account({}), account({ id: 'acc-2', name: 'Mandiri' })],
      transactions: [
        tx({ id: 't1', amount: 75000 }),
        tx({ id: 't2', amount: 999000, type: 'transfer', destinationAccountId: 'acc-2' }),
      ],
    });

    // The expense total is the assertion that matters: the transfer amount must
    // never be added to it.
    expect(screen.getAllByText('Rp 75.000').length).toBeGreaterThan(0);
    expect(screen.queryByText('Rp 1.074.000')).toBeNull();
  });
});

describe('DashboardView — empty states', () => {
  it('explains an empty transaction list instead of showing a blank panel', () => {
    // Transfers only: the "recent transactions" list is empty while the rest of
    // the dashboard has data, which used to render as an empty white box.
    renderDashboard({ transactions: [] });

    expect(screen.getByText('Belum ada transaksi')).toBeTruthy();
    expect(screen.getByText('Catat Transaksi')).toBeTruthy();
  });

  it('lets the user record a transaction straight from the empty state', () => {
    const { onAddTransaction } = renderDashboard({ transactions: [] });
    fireEvent.click(screen.getByText('Catat Transaksi'));
    expect(onAddTransaction).toHaveBeenCalledTimes(1);
  });

  it('explains an empty credit-account list', () => {
    renderDashboard({ accounts: [account({})] });
    expect(screen.getByText('Belum ada akun kredit atau pinjaman.')).toBeTruthy();
  });
});

describe('DashboardView — interactions', () => {
  it('opens the editor when a transaction row is tapped', () => {
    // The row is the target now, not the 28x28 pencil.
    const { onEditTransaction } = renderDashboard({
      transactions: [tx({ amount: 42000, notes: 'Kopi' })],
    });

    fireEvent.click(screen.getByText(/Kopi/));
    expect(onEditTransaction).toHaveBeenCalledTimes(1);
    expect(onEditTransaction.mock.calls[0][0].amount).toBe(42000);
  });

  it('does not nest an interactive control inside the row', () => {
    // A <button> inside role="button" makes the keyboard stop twice on one card
    // and makes screen readers announce a button within a button.
    const { container } = renderDashboard({
      transactions: [tx({ notes: 'Kopi' })],
    });
    const row = container.querySelector('[role="button"][tabindex="0"]');
    expect(row).toBeTruthy();
    expect(row?.querySelector('button')).toBeNull();
  });

  it('opens one account history when an account row is tapped', () => {
    const onSelectAccountHistory = vi.fn();
    const acc = account({ id: 'acc-9', name: 'Jenius' });
    renderDashboard({ accounts: [acc], onSelectAccountHistory });

    fireEvent.click(screen.getByText('Jenius'));
    expect(onSelectAccountHistory).toHaveBeenCalledWith(acc);
  });

  it('shows this month cash flow instead of repeating net worth', () => {
    renderDashboard({
      transactions: [
        tx({ id: 'in', type: 'pemasukan', amount: 5000000 }),
        tx({ id: 'out', type: 'pengeluaran', amount: 2000000 }),
      ],
    });

    // Net worth is totalAvailable - totalDebt, both already on screen. The
    // hero now reports +Rp 3.000.000 of cash flow instead.
    expect(screen.getAllByText('+Rp 3.000.000').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Net Worth/)).toBeNull();
  });
});

describe('DashboardView — account snapshot', () => {
  const manyAccounts = Array.from({ length: 9 }, (_, i) =>
    account({ id: `acc-${i}`, name: `Akun ${i}`, balance: 1000 * (i + 1) })
  );

  it('shows only five accounts but discloses the rest', () => {
    renderDashboard({ accounts: manyAccounts });

    expect(screen.getByText('Akun 0')).toBeTruthy();
    expect(screen.getByText('Akun 4')).toBeTruthy();
    expect(screen.queryByText('Akun 5')).toBeNull();
    // Previously the remaining four vanished with no hint at all.
    expect(screen.getByText('+4 rekening lain')).toBeTruthy();
  });

  it('hides the "+N" hint when everything fits', () => {
    renderDashboard({ accounts: manyAccounts.slice(0, 3) });
    expect(screen.queryByText(/rekening lain/)).toBeNull();
  });

  it('routes the "+N" hint to the Saldo tab', () => {
    const { onNavigateTab } = renderDashboard({ accounts: manyAccounts });
    fireEvent.click(screen.getByText('+4 rekening lain'));
    expect(onNavigateTab).toHaveBeenCalledWith('saldo');
  });
});
