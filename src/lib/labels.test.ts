import { describe, expect, it } from 'vitest';
import { accountTypeLabel, ACCOUNT_TYPE_LABELS, TRANSACTION_TYPE_LABELS } from './labels';

describe('accountTypeLabel', () => {
  it('labels every account type', () => {
    expect(accountTypeLabel('bank')).toBe('Bank');
    expect(accountTypeLabel('ewallet')).toBe('E-Wallet');
    expect(accountTypeLabel('credit')).toBe('Kartu Kredit');
    expect(accountTypeLabel('cash')).toBe('Tunai');
  });

  it('agrees with the table it reads from', () => {
    // The table used to exist in five files with three different wordings for
    // `credit` ("Kredit", "Kredit / Paylater", "Kartu Kredit"). This asserts the
    // helper cannot drift away from the single shared table.
    for (const [type, label] of Object.entries(ACCOUNT_TYPE_LABELS)) {
      expect(accountTypeLabel(type)).toBe(label);
    }
  });

  it('falls back to the raw value for an unknown type', () => {
    // Rows written before a type was renamed must still render something.
    expect(accountTypeLabel('deposito')).toBe('deposito');
  });

  it('returns an empty string for a missing type', () => {
    expect(accountTypeLabel(undefined)).toBe('');
    expect(accountTypeLabel('')).toBe('');
  });

  it('covers exactly the four supported account types', () => {
    expect(Object.keys(ACCOUNT_TYPE_LABELS)).toHaveLength(4);
  });
});

describe('TRANSACTION_TYPE_LABELS', () => {
  it('labels all three transaction types', () => {
    expect(TRANSACTION_TYPE_LABELS.pemasukan).toBe('Pemasukan');
    expect(TRANSACTION_TYPE_LABELS.pengeluaran).toBe('Pengeluaran');
    expect(TRANSACTION_TYPE_LABELS.transfer).toBe('Transfer');
  });
});
