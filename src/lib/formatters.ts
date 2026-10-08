export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('id-ID');
  return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

export function formatNumberWithDots(val: string): string {
  const raw = val.replace(/\D/g, '').replace(/^0+/, '');
  if (!raw) return '';
  return parseInt(raw, 10).toLocaleString('id-ID');
}

export const formatNumberInput = formatNumberWithDots;

export function parseRawAmount(formatted: string): number {
  const raw = formatted.replace(/\D/g, '');
  return parseInt(raw, 10) || 0;
}

export const parseNumberInput = parseRawAmount;
