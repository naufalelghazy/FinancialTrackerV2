import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup, screen } from '@testing-library/react';
import type { Account, Category } from '../../types';
import { AccountPickerList } from './AccountPickerList';
import { CategoryPickerList } from './CategoryPickerList';

afterEach(cleanup);

const acc = (id: string, name: string, balance: number): Account => ({
  id,
  name,
  type: 'bank',
  initialBalance: 0,
  balance,
});

const cat = (id: string, name: string, type: 'pengeluaran' | 'pemasukan'): Category => ({
  id,
  name,
  type,
  emoji: '🍜',
  icon: 'Utensils',
});

describe('AccountPickerList', () => {
  it('renders one option per account and marks the selected one', () => {
    render(
      <AccountPickerList
        ariaLabel="Pilih Akun"
        accounts={[acc('a', 'BCA', 1000), acc('b', 'DANA', 5000)]}
        selectedId="b"
        onSelect={vi.fn()}
      />
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(options[0].getAttribute('aria-selected')).toBe('false');
  });

  it('reports the tapped account', () => {
    const onSelect = vi.fn();
    render(
      <AccountPickerList
        ariaLabel="Pilih Akun"
        accounts={[acc('a', 'BCA', 1000), acc('b', 'DANA', 5000)]}
        selectedId="a"
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByText('DANA'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
  });

  it('tints a negative balance red', () => {
    render(
      <AccountPickerList
        ariaLabel="Pilih Akun"
        accounts={[acc('a', 'BCA', -1000)]}
        selectedId=""
        onSelect={vi.fn()}
      />
    );

    // The balance span is the only one carrying tabular-nums in an option.
    const balance = screen.getByText('-Rp 1.000').closest('span');
    expect(balance?.className).toContain('text-negative');
  });

  it('shows a hint instead of an empty list', () => {
    render(
      <AccountPickerList
        ariaLabel="Pilih Akun"
        accounts={[]}
        selectedId=""
        onSelect={vi.fn()}
        emptyLabel="Belum ada rekening"
      />
    );

    expect(screen.getByText('Belum ada rekening')).toBeTruthy();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});

describe('CategoryPickerList', () => {
  it('renders the categories it was given and reports a pick', () => {
    const onSelect = vi.fn();
    render(
      <CategoryPickerList
        ariaLabel="Pilih Kategori"
        categories={[cat('makan', 'Makan', 'pengeluaran'), cat('gaji', 'Gaji', 'pemasukan')]}
        selectedId="makan"
        type="pengeluaran"
        onSelect={onSelect}
      />
    );

    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByText('Makan').closest('button')?.getAttribute('aria-selected')).toBe('true');

    fireEvent.click(screen.getByText('Gaji'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'gaji' }));
  });
});
