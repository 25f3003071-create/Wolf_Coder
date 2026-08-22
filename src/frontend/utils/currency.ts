export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

export function calculatePercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = Math.round((part / total) * 100);
  return Math.min(100, Math.max(0, pct));
}
