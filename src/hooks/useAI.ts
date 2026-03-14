import { useState, useCallback } from 'react';
import { claudeClient } from '../lib/claude';
import type { NewsItem, ScreenerFilter } from '../types';

export function useMorningBrief() {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (news: NewsItem[], holdings: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await claudeClient.generateMorningBrief(news, holdings);
        setBrief(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate brief'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { brief, loading, error, generate };
}

export function useScreenerAI() {
  const [filters, setFilters] = useState<ScreenerFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parse = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await claudeClient.parseScreenerQuery(query);
      setFilters(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse query');
    } finally {
      setLoading(false);
    }
  }, []);

  return { filters, loading, error, parse, setFilters };
}

export function useStockAnalysis() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (
      ticker: string,
      financials: Record<string, unknown>,
      news: NewsItem[]
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await claudeClient.analyzeStock(
          ticker,
          financials,
          news
        );
        setAnalysis(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to analyze stock'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { analysis, loading, error, analyze };
}
