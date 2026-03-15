import { useState, useEffect, useCallback } from 'react';
import type { Portfolio } from '../types';
import { mockPortfolio } from '../mocks/portfolio';
import { polygon } from '../lib/polygon';
import { usePortfolioStore } from '../store/portfolioStore';

const hasApiKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);

export function usePortfolio() {
  const { realPortfolio, setRealPortfolio, refreshRealPrices } = usePortfolioStore();
  const [portfolio, setLocalPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with mock data, then enrich with real prices
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);

      // Start with mock portfolio
      const base = realPortfolio ?? mockPortfolio;
      setLocalPortfolio(base);
      if (!realPortfolio) {
        setRealPortfolio(base);
      }
      setLoading(false);

      if (!hasApiKey) return;

      // Collect unique tickers across all accounts
      const tickers = [
        ...new Set(base.accounts.flatMap((a) => a.holdings.map((h) => h.ticker))),
      ];
      if (tickers.length === 0) return;

      try {
        const quotes = await polygon.getQuotes(tickers);
        if (cancelled) return;

        const priceMap: Record<string, { price: number; change: number; changePercent: number }> = {};
        for (const q of quotes) {
          if (q.price > 0) {
            priceMap[q.ticker] = {
              price: q.price,
              change: q.change,
              changePercent: q.changePercent,
            };
          }
        }

        if (Object.keys(priceMap).length > 0) {
          refreshRealPrices(priceMap);
        }
      } catch {
        // Silent fail — mock prices remain
      }
    }

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync local state with store changes
  useEffect(() => {
    if (realPortfolio) {
      setLocalPortfolio(realPortfolio);
    }
  }, [realPortfolio]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const current = realPortfolio ?? mockPortfolio;
    const tickers = [
      ...new Set(current.accounts.flatMap((a) => a.holdings.map((h) => h.ticker))),
    ];

    if (hasApiKey && tickers.length > 0) {
      try {
        const quotes = await polygon.getQuotes(tickers);
        const priceMap: Record<string, { price: number; change: number; changePercent: number }> = {};
        for (const q of quotes) {
          if (q.price > 0) {
            priceMap[q.ticker] = {
              price: q.price,
              change: q.change,
              changePercent: q.changePercent,
            };
          }
        }
        if (Object.keys(priceMap).length > 0) {
          refreshRealPrices(priceMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh prices');
      }
    }

    setLoading(false);
  }, [realPortfolio, refreshRealPrices]);

  return { portfolio, loading, error, refetch };
}
