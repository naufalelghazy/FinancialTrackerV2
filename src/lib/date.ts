/**
 * Date helpers.
 *
 * Everything here works in the user's LOCAL timezone on purpose.
 * `new Date().toISOString().slice(0, 10)` returns the UTC date, which is one day
 * behind between 00:00 and 06:59 for users in Western Indonesia Time (UTC+7) and
 * makes a transaction entered "today" land on yesterday. Never use it for a
 * calendar date again — use `todayLocalISO()`.
 */

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Local calendar date as `YYYY-MM-DD`. */
export function toLocalISODate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Today's local calendar date as `YYYY-MM-DD`. */
export function todayLocalISO(): string {
  return toLocalISODate();
}

/** Offset a date by whole days, staying in local time. */
export function shiftLocalDays(days: number, from: Date = new Date()): string {
  const shifted = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return toLocalISODate(shifted);
}

/** First day of the current local month as `YYYY-MM-DD`. */
export function startOfLocalMonth(ref: Date = new Date()): string {
  return toLocalISODate(new Date(ref.getFullYear(), ref.getMonth(), 1));
}

/** Current local month key, e.g. `2026-02`. */
export function currentMonthKey(ref: Date = new Date()): string {
  return `${ref.getFullYear()}-${pad2(ref.getMonth() + 1)}`;
}

/**
 * Parses a `YYYY-MM-DD` string into a Date at local midnight.
 * Returns null for malformed input instead of an Invalid Date.
 */
export function parseISODate(value: string | undefined | null): Date | null {
  if (!value || !ISO_DATE_RE.test(value.slice(0, 10))) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    return null;
  }
  return parsed;
}

/** `2026-02-14` -> `14 Februari 2026`. Falls back to the raw value. */
export function formatIndonesianDate(value: string | undefined | null): string {
  const date = parseISODate(value);
  if (!date) return value || '-';
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/** `2026-02-14` -> `Sabtu, 14 Februari 2026` with Hari Ini / Kemarin shortcuts. */
export function formatIndonesianDateLong(value: string | undefined | null): string {
  const date = parseISODate(value);
  if (!date) return value || '-';

  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const md = `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  if (isSameDay(date, today)) return `Hari Ini, ${md}`;
  if (isSameDay(date, yesterday)) return `Kemarin, ${md}`;
  return `${DAY_NAMES[date.getDay()]}, ${md}`;
}

/** `2026-02` -> `Februari 2026`. Falls back to the raw key. */
export function formatMonthLabel(monthKey: string): string {
  const parts = monthKey.split('-');
  if (parts.length !== 2) return monthKey;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (!year || !month || month < 1 || month > 12) return monthKey;
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Inclusive local-month range for a `YYYY-MM` key, as ISO dates. */
export function monthRange(monthKey: string): { start: string; end: string } | null {
  const parts = monthKey.split('-');
  if (parts.length !== 2) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (!year || !month || month < 1 || month > 12) return null;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start: toLocalISODate(start), end: toLocalISODate(end) };
}

/**
 * Moves a `YYYY-MM` key by whole months.
 *
 * `2026-01` shifted by -1 is `2025-12`: the year has to roll over, which is the
 * part hand-rolled `month - 1` arithmetic gets wrong. A malformed input is
 * returned untouched so a bad stored value cannot turn into `NaN-NaN`.
 */
export function shiftMonthKey(monthKey: string, deltaMonths: number): string {
  const parts = monthKey.split('-');
  if (parts.length !== 2) return monthKey;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  if (!year || !month || month < 1 || month > 12) return monthKey;

  // Normalise through a Date at local midnight on the 1st: `setMonth` handles
  // negative and >12 offsets, including the year boundary.
  const shifted = new Date(year, month - 1 + deltaMonths, 1);
  return `${shifted.getFullYear()}-${pad2(shifted.getMonth() + 1)}`;
}
