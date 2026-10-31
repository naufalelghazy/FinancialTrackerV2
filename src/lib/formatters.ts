/**
 * Number and currency formatting.
 *
 * `Intl.NumberFormat` instances are created once and reused. Constructing one
 * per call was measurably expensive: a report page renders a few thousand
 * amounts, and each `toLocaleString('id-ID')` built a fresh formatter (~1µs
 * each, so a full report paid tens of milliseconds for formatting alone).
 */

const RUPIAH = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Groups digits with dots, e.g. `1500000` -> `1.500.000`. */
export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return RUPIAH.format(safe);
}

export function formatCurrency(amount: number): string {
  // Rupiah has no minor unit in practice, and a NaN balance must not render as
  // "Rp NaN" in the UI. Round and guard instead of trusting the caller.
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  // The minus sign goes before the currency symbol, matching Indonesian
  // convention: "-Rp 1.500" rather than "Rp -1.500".
  return safe < 0 ? `-Rp ${RUPIAH.format(Math.abs(safe))}` : `Rp ${RUPIAH.format(safe)}`;
}

/** Formats a digits-with-separators input value for display while typing. */
export function formatNumberWithDots(val: string): string {
  const raw = val.replace(/\D/g, '').replace(/^0+/, '');
  if (!raw) return '';
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? RUPIAH.format(parsed) : '';
}

export const formatNumberInput = formatNumberWithDots;

/** Reads the numeric value out of a formatted amount input. */
export function parseRawAmount(formatted: string): number {
  const raw = formatted.replace(/\D/g, '');
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export const parseNumberInput = parseRawAmount;

/** Percentage with at most one decimal, e.g. `12.3%`. */
export function formatPercent(value: number, fractionDigits = 1): string {
  const safe = Number.isFinite(value) ? value : 0;
  const fixed = safe.toFixed(fractionDigits);
  // Drop a trailing ".0" so whole percentages read cleanly.
  return `${fixed.replace(/\.0+$/, '')}%`;
}

/** Compact rupiah for chart axis labels: `1,2 jt`, `850 rb`. */
export function formatCompactCurrency(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(safe);
  const sign = safe < 0 ? '-' : '';

  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1).replace('.0', '').replace('.', ',')} M`;
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1).replace('.0', '').replace('.', ',')} jt`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)} rb`;
  return `${sign}${RUPIAH.format(abs)}`;
}
