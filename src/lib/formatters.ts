export function formatCurrency(amount: number): string {
  // Rupiah has no minor unit in practice, and a NaN balance must not render as
  // "Rp NaN" in the UI. Round and guard instead of trusting the caller.
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  const isNegative = safe < 0;
  const formatted = Math.abs(safe).toLocaleString('id-ID');
  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

export function formatNumberWithDots(val: string): string {
  const raw = val.replace(/\D/g, '').replace(/^0+/, '');
  if (!raw) return '';
  // `Number` (not `parseInt`) so the intent is explicit and lint-safe; both
  // behave identically on a digits-only string.
  return Number(raw).toLocaleString('id-ID');
}

export const formatNumberInput = formatNumberWithDots;

export function parseRawAmount(formatted: string): number {
  const raw = formatted.replace(/\D/g, '');
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export const parseNumberInput = parseRawAmount;
