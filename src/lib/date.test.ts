import { describe, expect, it } from 'vitest';
import {
  MONTH_NAMES,
  currentMonthKey,
  formatIndonesianDate,
  formatIndonesianDateLong,
  formatMonthLabel,
  monthRange,
  parseISODate,
  shiftLocalDays,
  shiftMonthKey,
  startOfLocalMonth,
  toLocalISODate,
  todayLocalISO,
} from './date';

describe('toLocalISODate', () => {
  it('formats a Date using local calendar fields', () => {
    expect(toLocalISODate(new Date(2026, 1, 14, 15, 30))).toBe('2026-02-14');
  });

  it('keeps the local day just after midnight (the UTC off-by-one bug)', () => {
    // 00:30 WIB is still the previous day in UTC. `toISOString().slice(0,10)`
    // would return 2026-01-31 here; the helper must return 2026-02-01.
    expect(toLocalISODate(new Date(2026, 1, 1, 0, 30))).toBe('2026-02-01');
  });

  it('keeps the local day just before midnight', () => {
    expect(toLocalISODate(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });

  it('pads single-digit months and days', () => {
    expect(toLocalISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('defaults to now', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    expect(toLocalISODate()).toBe(expected);
  });
});

describe('todayLocalISO', () => {
  it('matches the local calendar date', () => {
    const now = new Date();
    expect(todayLocalISO()).toBe(toLocalISODate(now));
  });

  it('never returns a UTC-shifted date', () => {
    const local = todayLocalISO();
    const utc = new Date().toISOString().slice(0, 10);
    // They are equal except during the hours where UTC has not rolled over.
    const localDate = parseISODate(local)!;
    const utcDate = parseISODate(utc)!;
    expect(Math.abs(localDate.getTime() - utcDate.getTime())).toBeLessThanOrEqual(86400000);
  });
});

describe('shiftLocalDays', () => {
  it('shifts forward across a month boundary', () => {
    expect(shiftLocalDays(1, new Date(2026, 0, 31, 12))).toBe('2026-02-01');
  });

  it('shifts backward across a month boundary', () => {
    expect(shiftLocalDays(-1, new Date(2026, 2, 1, 0, 30))).toBe('2026-02-28');
  });

  it('handles a leap day', () => {
    expect(shiftLocalDays(1, new Date(2028, 1, 28))).toBe('2028-02-29');
  });

  it('handles a year boundary', () => {
    expect(shiftLocalDays(1, new Date(2026, 11, 31))).toBe('2027-01-01');
  });
});

describe('startOfLocalMonth / currentMonthKey', () => {
  it('returns the first day of the local month', () => {
    expect(startOfLocalMonth(new Date(2026, 6, 23))).toBe('2026-07-01');
  });

  it('returns a padded month key', () => {
    expect(currentMonthKey(new Date(2026, 2, 9))).toBe('2026-03');
    expect(currentMonthKey(new Date(2026, 11, 9))).toBe('2026-12');
  });
});

describe('parseISODate', () => {
  it('parses a valid date at local midnight', () => {
    const parsed = parseISODate('2026-02-14')!;
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(1);
    expect(parsed.getDate()).toBe(14);
    expect(parsed.getHours()).toBe(0);
  });

  it('accepts a full timestamp by reading the date part', () => {
    expect(parseISODate('2026-02-14T10:00:00Z')?.getDate()).toBe(14);
  });

  it.each([null, undefined, '', 'bukan-tanggal', '2026-13-01', '2026-02-30', '2026-02'])(
    'returns null for invalid input %s',
    (input) => {
      expect(parseISODate(input)).toBeNull();
    }
  );
});

describe('formatIndonesianDate', () => {
  it('formats as "14 Februari 2026"', () => {
    expect(formatIndonesianDate('2026-02-14')).toBe('14 Februari 2026');
  });

  it('falls back to the raw value when unparseable', () => {
    expect(formatIndonesianDate('aneh')).toBe('aneh');
  });

  it('falls back to a dash for empty input', () => {
    expect(formatIndonesianDate(null)).toBe('-');
    expect(formatIndonesianDate('')).toBe('-');
  });
});

describe('formatIndonesianDateLong', () => {
  it('uses "Hari Ini" for today', () => {
    const today = todayLocalISO();
    expect(formatIndonesianDateLong(today)).toMatch(/^Hari Ini, /);
  });

  it('uses "Kemarin" for yesterday', () => {
    expect(formatIndonesianDateLong(shiftLocalDays(-1))).toMatch(/^Kemarin, /);
  });

  it('uses a weekday name for older dates', () => {
    expect(formatIndonesianDateLong('2026-02-14')).toBe('Sabtu, 14 Februari 2026');
  });
});

describe('formatMonthLabel', () => {
  it('turns 2026-02 into Februari 2026', () => {
    expect(formatMonthLabel('2026-02')).toBe('Februari 2026');
  });

  it('returns the key unchanged when malformed', () => {
    expect(formatMonthLabel('2026')).toBe('2026');
    expect(formatMonthLabel('2026-13')).toBe('2026-13');
  });

  it('covers all twelve month names', () => {
    MONTH_NAMES.forEach((name, index) => {
      expect(formatMonthLabel(`2026-${String(index + 1).padStart(2, '0')}`)).toBe(`${name} 2026`);
    });
  });
});

describe('monthRange', () => {
  it('returns an inclusive range', () => {
    expect(monthRange('2026-02')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
  });

  it('handles a leap February', () => {
    expect(monthRange('2028-02')).toEqual({ start: '2028-02-01', end: '2028-02-29' });
  });

  it('handles a 31-day month', () => {
    expect(monthRange('2026-12')).toEqual({ start: '2026-12-01', end: '2026-12-31' });
  });

  it('returns null for a malformed key', () => {
    expect(monthRange('2026')).toBeNull();
    expect(monthRange('2026-00')).toBeNull();
    expect(monthRange('2026-13')).toBeNull();
  });
});

describe('shiftMonthKey', () => {
  it('moves forward within a year', () => {
    expect(shiftMonthKey('2026-03', 1)).toBe('2026-04');
  });

  it('moves backward within a year', () => {
    expect(shiftMonthKey('2026-03', -1)).toBe('2026-02');
  });

  it('rolls the year over going back from January', () => {
    // Hand-rolled `month - 1` arithmetic produces "2026-00" here.
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12');
  });

  it('rolls the year over going forward from December', () => {
    expect(shiftMonthKey('2026-12', 1)).toBe('2027-01');
  });

  it('handles offsets larger than a year', () => {
    expect(shiftMonthKey('2026-05', 14)).toBe('2027-07');
    expect(shiftMonthKey('2026-05', -14)).toBe('2025-03');
  });

  it('pads single-digit months', () => {
    expect(shiftMonthKey('2026-09', 1)).toBe('2026-10');
    expect(shiftMonthKey('2026-10', -1)).toBe('2026-09');
  });

  it('returns a malformed key untouched instead of NaN-NaN', () => {
    expect(shiftMonthKey('', -1)).toBe('');
    expect(shiftMonthKey('2026', -1)).toBe('2026');
    expect(shiftMonthKey('2026-00', -1)).toBe('2026-00');
    expect(shiftMonthKey('2026-13', 1)).toBe('2026-13');
  });

  it('round-trips: two opposite shifts land on the original key', () => {
    expect(shiftMonthKey(shiftMonthKey('2026-01', -1), 1)).toBe('2026-01');
  });
});
