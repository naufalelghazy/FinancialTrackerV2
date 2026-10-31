import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup, screen, within } from '@testing-library/react';
import { TransactionForm } from './TransactionForm';
import type { Account, Category } from '../../types';

afterEach(cleanup);

const accounts: Account[] = [
  { id: 'a', name: 'BCA', type: 'bank', initialBalance: 0, balance: 100000 },
];
const categories: Category[] = [
  { id: 'makan', name: 'Makan', type: 'pengeluaran', emoji: '🍜', icon: 'Utensils' },
];

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <TransactionForm
      accounts={accounts}
      categories={categories}
      onSubmit={onSubmit}
    />
  );
  return onSubmit;
}

describe('TransactionForm validation', () => {
  it('explains a missing amount instead of doing nothing', () => {
    const onSubmit = renderForm();

    // `noValidate` skips the browser's own "required" bubble, which jsdom
    // enforces before our handler ever runs.
    const form = screen.getByRole('button', { name: /simpan transaksi/i }).closest('form')!;
    form.setAttribute('novalidate', '');
    fireEvent.submit(form);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/Masukkan nominal lebih dari nol/i)).toBeTruthy();
  });

  it('says nothing about the amount before the first submit', () => {
    renderForm();
    expect(screen.queryByText(/Masukkan nominal lebih dari nol/i)).toBeNull();
  });
});

describe('TransactionForm type toggle', () => {
  it('is a single tab stop with the selected type focused', () => {
    renderForm();

    const group = screen.getByRole('radiogroup', { name: /Jenis Transaksi/i });
    const options = within(group).getAllByRole('radio');
    expect(options).toHaveLength(3);

    // Default type is "pengeluaran" -> only that option is tabbable.
    expect(options[0].getAttribute('tabindex')).toBe('0');
    expect(options[1].getAttribute('tabindex')).toBe('-1');
    expect(options[0].getAttribute('aria-checked')).toBe('true');
  });

  it('moves the selection with the arrow keys', () => {
    renderForm();

    const group = screen.getByRole('radiogroup', { name: /Jenis Transaksi/i });
    const options = within(group).getAllByRole('radio');

    options[0].focus();
    fireEvent.keyDown(group, { key: 'ArrowRight' });

    expect(options[1].getAttribute('aria-checked')).toBe('true');
    expect(options[1].getAttribute('tabindex')).toBe('0');
  });
});
