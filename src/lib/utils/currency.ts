export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN')}`;
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = Number(((part / total) * 100).toFixed(2));
  return Math.min(100, Math.max(0, pct));
}
