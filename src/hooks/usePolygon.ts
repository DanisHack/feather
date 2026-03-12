import { useState, useEffect, useCallback } from 'react';
import { polygon } from '../lib/polygon';
import type { SnapshotResult } from '../lib/polygon';
import { validateQuote, validateOHLC } from '../lib/dataSanity';
import type { Quote, Stock, OHLC, KeyStats, NewsItem } from '../types';

interface UsePolygonState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function usePolygonQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UsePolygonState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useQuote(ticker: string): UsePolygonState<Quote> {
  return usePolygonQuery(async () => {
    const quote = await polygon.getQuote(ticker);
    validateQuote(quote);
    return quote;
  }, [ticker]);
}

export function useQuotes(tickers: string[]): UsePolygonState<Quote[]> {
  const key = tickers.join(',');
  return usePolygonQuery(async () => {
    const quotes = await polygon.getQuotes(tickers);
    for (const q of quotes) validateQuote(q);
    return quotes;
  }, [key]);
}

export function useAggregates(
  ticker: string,
  timespan: string,
  from: string,
  to: string,
  multiplier = 1
): UsePolygonState<OHLC[]> {
  return usePolygonQuery(async () => {
    const bars = await polygon.getAggregates(ticker, timespan, from, to, multiplier);
    validateOHLC(bars);
    return bars;
  }, [ticker, timespan, from, to, multiplier]);
}

export function useTickerDetails(ticker: string): UsePolygonState<Stock | null> {
  return usePolygonQuery(() => polygon.getTickerDetails(ticker), [ticker]);
}

export function useKeyStats(ticker: string): UsePolygonState<KeyStats> {
  return usePolygonQuery(() => polygon.getKeyStats(ticker), [ticker]);
}

export function usePolygonNews(
  tickers?: string[],
  limit?: number
): UsePolygonState<NewsItem[]> {
  return usePolygonQuery(
    () => polygon.getNews(tickers, limit),
    [tickers?.join(','), limit]
  );
}

export function useSnapshot(ticker: string): UsePolygonState<SnapshotResult | null> {
  return usePolygonQuery(() => polygon.getSnapshot(ticker), [ticker]);
}

export function useSnapshots(tickers: string[]): UsePolygonState<SnapshotResult[]> {
  const key = tickers.join(',');
  return usePolygonQuery(async () => {
    const snapshots = await polygon.getSnapshots(tickers);
    for (const s of snapshots) validateQuote(s.quote);
    return snapshots;
  }, [key]);
}
