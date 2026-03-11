import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatPrice(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '--';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPriceLarge(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '--';
  if (value >= 1000) {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return formatPrice(value);
}

export function formatPercent(value: number | undefined | null, showSign = true): string {
  if (value == null || isNaN(value)) return '--';
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatChange(value: number | undefined | null, showSign = true): string {
  if (value == null || isNaN(value)) return '--';
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

export function formatVolume(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '--';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function formatMarketCap(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '--';
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

export function formatNumber(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '--';
  return value.toLocaleString('en-US');
}

export function formatCompactNumber(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '--';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function formatRatio(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '--';
  return value.toFixed(2);
}

export function formatMargin(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '--';
  return `${(value * 100).toFixed(1)}%`;
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatTimeAgo(date: Date | string | number): string {
  const d = new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatRelativeDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

export function formatEarningsTime(timing: 'BMO' | 'AMC' | 'TNS'): string {
  switch (timing) {
    case 'BMO':
      return 'Before Open';
    case 'AMC':
      return 'After Close';
    case 'TNS':
      return 'Time N/A';
  }
}
