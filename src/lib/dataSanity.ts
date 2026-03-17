import type { Quote, OHLC } from '../types';

const isDev = import.meta.env.DEV;

function warn(msg: string) {
  if (isDev) {
    console.warn(`[DataSanity] ${msg}`);
  }
}

export function validateQuote(q: Quote): string[] {
  const warnings: string[] = [];

  if (q.price <= 0) warnings.push(`${q.ticker}: price is ${q.price}`);
  if (q.volume < 0) warnings.push(`${q.ticker}: negative volume ${q.volume}`);
  if (Math.abs(q.changePercent) > 50) {
    warnings.push(`${q.ticker}: extreme changePercent ${q.changePercent}%`);
  }
  if (q.high > 0 && q.low > 0 && q.high < q.low) {
    warnings.push(`${q.ticker}: high (${q.high}) < low (${q.low})`);
  }

  for (const w of warnings) warn(w);
  return warnings;
}

export function validateOHLC(bars: OHLC[]): string[] {
  const warnings: string[] = [];

  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    if (bar.high < bar.low) {
      warnings.push(`Bar ${i}: high (${bar.high}) < low (${bar.low})`);
    }
    if (i > 0 && bars[i].timestamp <= bars[i - 1].timestamp) {
      warnings.push(`Bar ${i}: timestamp not ascending`);
    }
  }

  for (const w of warnings) warn(w);
  return warnings;
}

export function sanitizeQuote(raw: Partial<Quote>): Quote {
  return {
    ticker: raw.ticker ?? '',
    price: Math.max(raw.price ?? 0, 0),
    open: Math.max(raw.open ?? 0, 0),
    high: Math.max(raw.high ?? 0, 0),
    low: Math.max(raw.low ?? 0, 0),
    close: Math.max(raw.close ?? 0, 0),
    volume: Math.max(raw.volume ?? 0, 0),
    vwap: Math.max(raw.vwap ?? 0, 0),
    change: raw.change ?? 0,
    changePercent: raw.changePercent ?? 0,
    timestamp: raw.timestamp ?? Date.now(),
  };
}
