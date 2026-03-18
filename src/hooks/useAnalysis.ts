import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import type { AnalysisData } from '../types/analysis';

// Simple in-memory cache (matches polygon.ts pattern)
const cache = new Map<string, { data: AnalysisData; ts: number }>();
const CACHE_TTL = 30 * 60_000; // 30 min

export function useAnalysis(ticker: string) {
  const prevTickerRef = useRef('');

  const [data, setData] = useState<AnalysisData | null>(() => {
    if (!ticker) return null;
    const cached = cache.get(ticker);
    return cached && Date.now() - cached.ts < CACHE_TTL ? cached.data : null;
  });
  const [loading, setLoading] = useState(() => {
    if (!ticker) return false;
    const cached = cache.get(ticker);
    return !(cached && Date.now() - cached.ts < CACHE_TTL);
  });
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!ticker) return;

    // Check cache first
    const cached = cache.get(ticker);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: result } = await api.get<AnalysisData>(`/api/analysis/${ticker}`);
      cache.set(ticker, { data: result, ts: Date.now() });
      setData(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch analysis data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    if (prevTickerRef.current !== ticker) {
      const cached = ticker ? cache.get(ticker) : null;
      const hasFresh = cached && Date.now() - cached.ts < CACHE_TTL;
      setData(hasFresh ? cached.data : null);
      setLoading(!hasFresh && Boolean(ticker));
      setError(null);
      prevTickerRef.current = ticker;
    }
    fetchData();
  }, [fetchData, ticker]);

  return { data, loading, error };
}
