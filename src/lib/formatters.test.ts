import { describe, expect, it } from 'vitest';
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatNumberInput,
  formatNumberWithDots,
  formatPercent,
  parseNumberInput,
  parseRawAmount,
} from './formatters';

describe('formatCurrency', () => {
  it('prefixes positive amounts with Rp', () => {
    expect(formatCurrency(150000)).toBe('Rp 150.000');
  });

  it('places the minus sign before Rp', () => {
    expect(formatCurrency(-2500)).toBe('-Rp 2.500');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('Rp 0');
  });

  it('groups thousands', () => {
    expect(formatCurrency(1234567890)).toBe('Rp 1.234.567.890');
  });

  it('rounds fractional values', () => {
    expect(formatCurrency(1500.4)).toBe('Rp 1.500');
    expect(formatCurrency(1500.6)).toBe('Rp 1.501');
  });

  it('never renders NaN or Infinity', () => {
    expect(formatCurrency(Number.NaN)).toBe('Rp 0');
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe('Rp 0');
  });
});

describe('formatNumberWithDots', () => {
  it('strips non-digits and groups', () => {
    expect(formatNumberWithDots('1500000')).toBe('1.500.000');
  });

  it('drops leading zeros', () => {
    expect(formatNumberWithDots('0001500')).toBe('1.500');
  });

  it('ignores letters and symbols', () => {
    expect(formatNumberWithDots('Rp 1.500.000')).toBe('1.500.000');
  });

  it('returns empty for empty input', () => {
    expect(formatNumberWithDots('')).toBe('');
  });

  it('returns empty when only zeros are entered', () => {
    expect(formatNumberWithDots('0000')).toBe('');
  });

  it('re-groups an already formatted value', () => {
    expect(formatNumberWithDots('1.500.000')).toBe('1.500.000');
  });

  it('is aliased as formatNumberInput', () => {
    expect(formatNumberInput('2500')).toBe('2.500');
  });

  it('does not lose precision on large values', () => {
    // parseInt would work here, but explicit check guards the refactor to Number.
    expect(formatNumberWithDots('9007199254740991')).toBe(
      Number(9007199254740991).toLocaleString('id-ID')
    );
  });
});

describe('parseRawAmount', () => {
  it('parses a grouped string', () => {
    expect(parseRawAmount('1.500.000')).toBe(1500000);
  });

  it('parses a plain string', () => {
    expect(parseRawAmount('2500')).toBe(2500);
  });

  it('returns 0 for empty input', () => {
    expect(parseRawAmount('')).toBe(0);
  });

  it('returns 0 for non-numeric input', () => {
    expect(parseRawAmount('abc')).toBe(0);
  });

  it('ignores currency prefixes', () => {
    expect(parseRawAmount('Rp 75.000')).toBe(75000);
  });

  it('is aliased as parseNumberInput', () => {
    expect(parseNumberInput('3.000')).toBe(3000);
  });

  it('round-trips through the formatter', () => {
    const original = 4250000;
    expect(parseRawAmount(formatNumberWithDots(String(original)))).toBe(original);
  });
});

describe('formatNumber', () => {
  it('groups digits without a currency prefix', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
  });

  it('guards NaN', () => {
    expect(formatNumber(Number.NaN)).toBe('0');
  });
});

describe('formatPercent', () => {
  it('keeps one decimal by default', () => {
    expect(formatPercent(12.34)).toBe('12.3%');
  });

  it('drops a trailing .0 so whole percentages read cleanly', () => {
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

  it('keeps small values exact so an axis is not rounded to 0', () => {
    expect(formatCompactCurrency(750)).toBe('750');
  });

  it('keeps the sign for negatives', () => {
    expect(formatCompactCurrency(-1_500_000)).toBe('-1,5 jt');
  });

  it('guards NaN', () => {
    expect(formatCompactCurrency(Number.NaN)).toBe('0');
  });
});
