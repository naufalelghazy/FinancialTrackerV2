import { describe, expect, it } from 'vitest';
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatNumberWithDots,
  formatPercent,
  parseRawAmount,
} from '../src/lib/formatters';
import { accountTypeLabel, ACCOUNT_TYPE_LABELS } from '../src/lib/labels';

describe('formatCurrency', () => {
  it('formats whole rupiah with dot separators', () => {
    expect(formatCurrency(1500000)).toBe('Rp 1.500.000');
    expect(formatCurrency(0)).toBe('Rp 0');
  });

  it('rounds instead of showing a decimal rupiah', () => {
    // Rupiah has no minor unit: "Rp 1.500,4" reads as a bug to every user.
    expect(formatCurrency(1500.4)).toBe('Rp 1.500');
    expect(formatCurrency(1500.6)).toBe('Rp 1.501');
  });

  it('puts the minus before the currency symbol', () => {
    expect(formatCurrency(-25000)).toBe('-Rp 25.000');
  });

  it('never renders NaN or Infinity', () => {
    expect(formatCurrency(Number.NaN)).toBe('Rp 0');
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe('Rp 0');
  });
});

describe('formatNumber', () => {
  it('groups digits', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
  });

  it('guards NaN', () => {
    expect(formatNumber(Number.NaN)).toBe('0');
  });
});

describe('formatNumberWithDots / parseRawAmount round trip', () => {
  it('formats digits as the user types', () => {
    expect(formatNumberWithDots('1500000')).toBe('1.500.000');
    expect(formatNumberWithDots('1.500.000')).toBe('1.500.000');
  });

  it('drops leading zeros so the field never shows "007"', () => {
    expect(formatNumberWithDots('007')).toBe('7');
    expect(formatNumberWithDots('0000')).toBe('');
  });

  it('ignores non-digits', () => {
    expect(formatNumberWithDots('Rp 25.000')).toBe('25.000');
    expect(formatNumberWithDots('abc')).toBe('');
  });

  it('parses back to the same number', () => {
    const formatted = formatNumberWithDots('250000');
    expect(parseRawAmount(formatted)).toBe(250000);
  });

  it('parses an empty field to zero', () => {
    expect(parseRawAmount('')).toBe(0);
    expect(parseRawAmount('Rp')).toBe(0);
  });
});

describe('formatPercent', () => {
  it('keeps one decimal by default', () => {
    expect(formatPercent(12.34)).toBe('12.3%');
  });

  it('drops a trailing .0', () => {
    expect(formatPercent(50)).toBe('50%');
  });

  it('honours the requested precision', () => {
    expect(formatPercent(12.34, 0)).toBe('12%');
    expect(formatPercent(12.345, 2)).toBe('12.35%');
  });

  it('guards NaN', () => {
    expect(formatPercent(Number.NaN)).toBe('0%');
  });
});

describe('formatCompactCurrency', () => {
  it('uses Indonesian magnitude suffixes', () => {
    expect(formatCompactCurrency(1_500_000)).toBe('1,5 jt');
    expect(formatCompactCurrency(2_000_000)).toBe('2 jt');
    expect(formatCompactCurrency(850_000)).toBe('850 rb');
  });

  it('handles billions', () => {
    expect(formatCompactCurrency(2_400_000_000)).toBe('2,4 M');
  });

  it('keeps small values exact', () => {
    expect(formatCompactCurrency(750)).toBe('750');
  });

  it('keeps the sign for negatives', () => {
    expect(formatCompactCurrency(-1_500_000)).toBe('-1,5 jt');
  });

  it('guards NaN', () => {
    expect(formatCompactCurrency(Number.NaN)).toBe('0');
  });
});

describe('accountTypeLabel', () => {
  it('labels every account type', () => {
    expect(accountTypeLabel('bank')).toBe('Bank');
    expect(accountTypeLabel('ewallet')).toBe('E-Wallet');
    expect(accountTypeLabel('credit')).toBe('Kartu Kredit');
    expect(accountTypeLabel('cash')).toBe('Tunai');
  });

  it('falls back to the raw value for unknown types', () => {
    // Rows written before a type was renamed must still render something.
    expect(accountTypeLabel('deposito')).toBe('deposito');
  });

  it('returns an empty string for a missing type', () => {
    expect(accountTypeLabel(undefined)).toBe('');
  });

  it('has exactly four labels, so a stale fifth cannot linger', () => {
    expect(Object.keys(ACCOUNT_TYPE_LABELS)).toHaveLength(4);
  });
});
