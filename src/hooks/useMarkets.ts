import { useState, useEffect } from 'react';
import { polygon } from '../lib/polygon';
import { yahooIndices } from '../lib/yahoo';
import { SECTOR_ETFS, GICS_SECTORS } from '../lib/constants';
import {
  mockIndices,
  mockSectorPerformance,
  mockEconomicIndicators,
} from '../mocks/markets';

const hasPolygonKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);

export interface IndexData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

export interface SectorData {
  key: string;
  name: string;
  changePercent: number;
}

export function useMarkets() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [sectors, setSectors] = useState<SectorData[]>(mockSectorPerformance);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const indexTickers = ['I:SPX', 'I:NDX', 'I:DJI', 'I:RUT'];
        const indexNames: Record<string, string> = {
          'I:SPX': 'S&P 500',
          'I:NDX': 'NASDAQ',
          'I:DJI': 'DOW JONES',
          'I:RUT': 'RUSSELL 2000',
        };

        // Fetch Polygon data (indices + sectors in parallel)
        let indexSnapshots: Awaited<ReturnType<typeof polygon.getSnapshots>> = [];
        let sectorSnapshots: Awaited<ReturnType<typeof polygon.getSnapshots>> = [];

        if (hasPolygonKey) {
          [indexSnapshots, sectorSnapshots] = await Promise.all([
            polygon.getSnapshots(indexTickers),
            polygon.getSnapshots(Object.values(SECTOR_ETFS)),
          ]);
        }

        if (cancelled) return;

        // Map indices — merge real data with mock fallback per-ticker
        const snapMap = new Map(
          indexSnapshots.filter((s) => s.quote.price > 0).map((s) => [s.quote.ticker, s])
        );

        // Tier 2: Yahoo Finance fallback for missing index tickers
        const missingTickers = indexTickers.filter((t) => !snapMap.has(t));
        if (missingTickers.length > 0) {
          try {
            const yhQuotes = await yahooIndices.getIndexQuotes();
            for (const q of yhQuotes) {
              if (q.price > 0 && !snapMap.has(q.ticker)) {
                snapMap.set(q.ticker, {
                  quote: {
                    ticker: q.ticker,
                    price: q.price,
                    change: q.change,
                    changePercent: q.changePercent,
                    open: 0, high: 0, low: 0, close: q.price,
                    volume: 0, vwap: 0, timestamp: Date.now(),
                  },
                  prevClose: q.price,
                });
              }
            }
          } catch {
            // Continue with mock fallback
          }
        }

        if (cancelled) return;

        const indexData: IndexData[] = indexTickers.map((ticker) => {
          const snap = snapMap.get(ticker);
          if (snap) {
            return {
              ticker,
              name: indexNames[ticker] ?? ticker,
              price: snap.quote.price,
              change: snap.quote.change,
              changePercent: snap.quote.changePercent,
              sparkline: [],
            };
          }
          // Tier 3: Fall back to mock for this ticker
          const mock = mockIndices.find((m) => m.ticker === ticker);
          return {
            ticker,
            name: indexNames[ticker] ?? ticker,
            price: mock?.price ?? 0,
            change: mock?.change ?? 0,
            changePercent: mock?.changePercent ?? 0,
            sparkline: mock?.sparkline ?? [],
          };
        });
        setIndices(indexData);

        // Map sectors (only if Polygon returned data)
        if (sectorSnapshots.length > 0) {
          const sectorEtfEntries = Object.entries(SECTOR_ETFS);
          const sectorData: SectorData[] = sectorEtfEntries
            .map(([key, etfTicker]) => {
              const snap = sectorSnapshots.find((s) => s.quote.ticker === etfTicker);
              const gics = GICS_SECTORS.find((g) => g.key === key);
              return {
                key,
                name: gics?.name ?? key,
                changePercent: snap?.quote.changePercent ?? 0,
              };
            })
            .sort((a, b) => b.changePercent - a.changePercent);
          setSectors(sectorData);
        }

        setError(null);
        setLoading(false);

        // Fetch 7-day sparklines for indices (deferred, non-blocking — Polygon only)
        if (!hasPolygonKey) return;

        const to = new Date().toISOString().slice(0, 10);
        const from = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

        const sparkResults = await Promise.allSettled(
          indexTickers.map((t) => polygon.getAggregates(t, 'day', from, to))
        );

        if (cancelled) return;

        const withSparklines = indexData.map((idx, i) => {
          const result = sparkResults[i];
          const bars = result.status === 'fulfilled' ? result.value : [];
          return { ...idx, sparkline: bars.map((b) => b.close) };
        });
        setIndices(withSparklines);
      } catch (err) {
        if (cancelled) return;
        // Fall back to mock data on error
        setIndices(mockIndices.map((i) => ({
          ticker: i.ticker,
          name: i.name,
          price: i.price,
          change: i.change,
          changePercent: i.changePercent,
          sparkline: i.sparkline,
        })));
        setSectors(mockSectorPerformance);
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return {
    indices,
    sectors,
    economicIndicators: mockEconomicIndicators,
    loading,
    error,
  };
}
