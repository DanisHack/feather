import { useState, useEffect } from 'react';
import { colors } from '../../design-system/tokens';
import { PriceChange, Skeleton } from '../../design-system';
import { polygon } from '../../lib/polygon';
import { yahooIndices } from '../../lib/yahoo';

const hasPolygonKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);

interface MarketIndex {
  label: string;
  ticker: string;
  price: number;
  change: number;
}

const mockIndices: MarketIndex[] = [
  { label: 'S&P', ticker: 'I:SPX', price: 5842.31, change: 0.87 },
  { label: 'NASDAQ', ticker: 'I:NDX', price: 18426.75, change: 1.12 },
  { label: 'DOW', ticker: 'I:DJI', price: 43215.60, change: 0.34 },
  { label: 'R2K', ticker: 'I:RUT', price: 2084.32, change: -0.59 },
];

const INDEX_TICKERS = ['I:SPX', 'I:NDX', 'I:DJI', 'I:RUT'];

const indexLabels: Record<string, string> = {
  'I:SPX': 'S&P',
  'I:NDX': 'NASDAQ',
  'I:DJI': 'DOW',
  'I:RUT': 'R2K',
};

export function MarketBar() {
  const [indices, setIndices] = useState<MarketIndex[]>(mockIndices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchIndices() {
      const quoteMap = new Map<string, { price: number; change: number }>();

      // Tier 1: Try Polygon for index tickers
      if (hasPolygonKey) {
        try {
          const quotes = await polygon.getQuotes(INDEX_TICKERS);
          for (const q of quotes) {
            if (q.price > 0) quoteMap.set(q.ticker, { price: q.price, change: q.changePercent });
          }
        } catch {
          // Continue to Yahoo fallback
        }
      }

      // Tier 2: Yahoo Finance (via server) for any missing tickers
      const missing = INDEX_TICKERS.filter((t) => !quoteMap.has(t));
      if (missing.length > 0) {
        try {
          const yhQuotes = await yahooIndices.getIndexQuotes();
          for (const q of yhQuotes) {
            if (q.price > 0 && !quoteMap.has(q.ticker)) {
              quoteMap.set(q.ticker, { price: q.price, change: q.changePercent });
            }
          }
        } catch {
          // Continue with mock fallback
        }
      }

      if (cancelled) return;

      // Tier 3: Merge real data with mock fallback
      setIndices(
        INDEX_TICKERS.map((ticker) => {
          const real = quoteMap.get(ticker);
          if (real && real.price > 0) {
            return {
              label: indexLabels[ticker] ?? ticker,
              ticker,
              price: real.price,
              change: real.change ?? 0,
            };
          }
          const mock = mockIndices.find((m) => m.ticker === ticker);
          return mock ?? { label: indexLabels[ticker] ?? ticker, ticker, price: 0, change: 0 };
        })
      );
    }

    fetchIndices()
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-6" style={{ padding: '12px 0', borderBottom: `1px solid ${colors.border.subtle}` }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width={120} height={16} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-6"
      style={{
        padding: '12px 0',
        borderBottom: `1px solid ${colors.border.subtle}`,
      }}
    >
      {indices.map((index) => (
        <div key={index.ticker} className="flex items-center gap-2 whitespace-nowrap">
          <span
            style={{
              fontSize: 12,
              color: colors.text.secondary,
              fontWeight: 500,
            }}
          >
            {index.label}
          </span>
          <span
            style={{
              fontSize: 13,
              color: colors.text.emphasis,
              fontWeight: 600,
            }}
          >
            {(index.price ?? 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <PriceChange value={index.change ?? 0} size="sm" />
        </div>
      ))}
    </div>
  );
}
