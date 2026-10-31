import { describe, expect, it } from 'vitest';
import {
  isExpense,
  isIncome,
  isInternalTransfer,
  isTransferCategoryLabel,
  signedAmount,
  sumByType,
} from './transactions';
import type { Category, Transaction } from '../types';

function tx(partial: Partial<Transaction> = {}): Transaction {
  return {
    id: 't1',
    date: '2026-01-01',
    type: 'pengeluaran',
    amount: 1000,
    sourceAccountId: 'a',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

const categories: Category[] = [
  { id: 'c-makan', name: 'Makan', type: 'pengeluaran', emoji: '🍜' },
  { id: 'c-pindah', name: 'Pindah Akun', type: 'pengeluaran', emoji: '🔄' },
];

describe('isTransferCategoryLabel', () => {
  it.each(['Pindah Akun', 'pindah akun', 'PINDAH AKUN', '  Pindah Akun  '])(
    'recognises %s',
    (label) => {
      expect(isTransferCategoryLabel(label)).toBe(true);
    }
  );

  it('recognises the legacy snake_case id', () => {
    expect(isTransferCategoryLabel('pindah_akun')).toBe(true);
  });

  it('recognises a plain transfer label', () => {
    expect(isTransferCategoryLabel('Transfer Saldo')).toBe(true);
  });

  it.each(['Makan', 'Transport', 'Gaji', ''])('rejects %s', (label) => {
    expect(isTransferCategoryLabel(label)).toBe(false);
  });

  it('handles null and undefined', () => {
    expect(isTransferCategoryLabel(null)).toBe(false);
    expect(isTransferCategoryLabel(undefined)).toBe(false);
  });
});

describe('isInternalTransfer', () => {
  it('treats the transfer type as an internal transfer', () => {
    expect(isInternalTransfer({ type: 'transfer' })).toBe(true);
  });

  it('treats any transaction with a destination account as internal', () => {
    expect(isInternalTransfer({ type: 'pengeluaran', destinationAccountId: 'b' })).toBe(true);
  });

  it('detects a legacy transfer category id sentinel', () => {
    expect(isInternalTransfer({ type: 'pengeluaran', categoryId: 'pindah_akun' })).toBe(true);
  });

  it('detects a legacy transfer category by name lookup', () => {
    expect(
      isInternalTransfer({ type: 'pengeluaran', categoryId: 'c-pindah' }, { categories })
    ).toBe(true);
  });

  it('does not treat a normal expense as a transfer', () => {
    expect(isInternalTransfer({ type: 'pengeluaran', categoryId: 'c-makan' }, { categories })).toBe(
      false
    );
  });

  it('treats income as non-transfer', () => {
    expect(isInternalTransfer({ type: 'pemasukan', categoryId: 'c-makan' }, { categories })).toBe(
      false
    );
  });

  it('is not fooled by an unknown category id', () => {
    expect(isInternalTransfer({ type: 'pengeluaran', categoryId: 'c-hilang' }, { categories })).toBe(
      false
    );
  });

  it('works without a category list', () => {
    expect(isInternalTransfer({ type: 'pengeluaran', categoryId: 'c-pindah' })).toBe(false);
  });
});

describe('isIncome / isExpense', () => {
  it('marks pemasukan as income only', () => {
    expect(isIncome({ type: 'pemasukan' })).toBe(true);
    expect(isExpense({ type: 'pemasukan' })).toBe(false);
  });

  it('marks pengeluaran as expense only', () => {
    expect(isExpense({ type: 'pengeluaran' })).toBe(true);
    expect(isIncome({ type: 'pengeluaran' })).toBe(false);
  });

  it('does not count a balanced transfer as income or expense', () => {
    expect(isIncome({ type: 'transfer', destinationAccountId: 'b' })).toBe(false);
    expect(isExpense({ type: 'transfer', destinationAccountId: 'b' })).toBe(false);
  });

  it('counts a dangling transfer (no destination) as an expense', () => {
    expect(isExpense({ type: 'transfer' })).toBe(true);
  });
});

describe('signedAmount', () => {
  it('is positive for income', () => {
    expect(signedAmount(tx({ type: 'pemasukan', amount: 5000 }))).toBe(5000);
  });

  it('is negative for an expense', () => {
    expect(signedAmount(tx({ type: 'pengeluaran', amount: 5000 }))).toBe(-5000);
  });

  it('is zero for an internal transfer', () => {
    expect(signedAmount(tx({ type: 'transfer', amount: 5000, destinationAccountId: 'b' }))).toBe(0);
  });

  it('is zero for a legacy transfer category', () => {
    expect(signedAmount(tx({ type: 'pengeluaran', amount: 5000, categoryId: 'pindah_akun' }))).toBe(
      0
    );
  });

  it('is zero for a corrupt amount', () => {
    expect(signedAmount(tx({ type: 'pengeluaran', amount: Number.NaN }))).toBe(0);
  });
});

describe('sumByType', () => {
  const list: Transaction[] = [
    tx({ id: '1', type: 'pemasukan', amount: 1000, categoryId: 'c-makan' }),
    tx({ id: '2', type: 'pengeluaran', amount: 200, categoryId: 'c-makan' }),
    tx({ id: '3', type: 'pengeluaran', amount: 300, categoryId: 'c-makan' }),
    tx({ id: '4', type: 'transfer', amount: 999, destinationAccountId: 'b' }),
    tx({ id: '5', type: 'pengeluaran', amount: 50, categoryId: 'c-pindah' }),
  ];

  it('sums income', () => {
    expect(sumByType(list, 'pemasukan', { categories })).toBe(1000);
  });

  it('sums expenses while excluding transfers', () => {
    expect(sumByType(list, 'pengeluaran', { categories })).toBe(500);
  });

  it('sums transfers when asked for them explicitly', () => {
    expect(sumByType(list, 'transfer', { categories })).toBe(999);
  });

  it('ignores corrupt amounts', () => {
    const withCorrupt = [...list, tx({ id: '6', type: 'pengeluaran', amount: 'abc' as unknown as number })];
    expect(sumByType(withCorrupt, 'pengeluaran', { categories })).toBe(500);
  });
});
