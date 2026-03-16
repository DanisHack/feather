import { useState, useCallback } from 'react';
import axios from 'axios';
import { claudeClient } from '../lib/claude';
import { API_BASE_URL } from '../lib/constants';
import {
  matchScreenerQuery,
  type ScreenerRow,
} from '../mocks/screener';
import type { ScreenerFilter } from '../types';

interface DisplayFilter {
  field: string;
  label: string;
}

interface UseScreenerReturn {
  results: ScreenerRow[];
  filters: DisplayFilter[];
  description: string;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (query: string) => void;
  removeFilter: (index: number) => void;
  clear: () => void;
}

async function isServerAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function screenStocks(filters: ScreenerFilter[]): Promise<ScreenerRow[]> {
  const { data } = await axios.post<{ results: ScreenerRow[]; total: number }>(
    `${API_BASE_URL}/api/market/screen`,
    { filters },
    { timeout: 15000 }
  );
  return data.results ?? [];
}

export function useScreener(): UseScreenerReturn {
  const [results, setResults] = useState<ScreenerRow[]>([]);
  const [filters, setFilters] = useState<DisplayFilter[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const serverUp = await isServerAvailable();

      if (serverUp) {
        // Step 1: AI parses NL query → structured filters
        let aiFilters: ScreenerFilter[] = [];

        try {
          aiFilters = await claudeClient.parseScreenerQuery(trimmed);
        } catch {
          // AI unavailable — try direct screen with basic filters
        }

        if (aiFilters.length > 0) {
          setFilters(aiFilters.map((f) => ({ field: f.field, label: f.label })));

          // Step 2: Screen real stocks via server
          try {
            const realResults = await screenStocks(aiFilters);
            if (realResults.length > 0) {
              setResults(realResults);
              setDescription(`${realResults.length} results for "${trimmed}"`);
              setLoading(false);
              return;
            }
            // No results — show message, keep filters
            setResults([]);
            setDescription(`0 results for "${trimmed}"`);
            setLoading(false);
            return;
          } catch {
            // Server screen failed — fall through to mock
          }
        }
      }

      // Fallback: mock results (server down or AI unavailable)
      const match = matchScreenerQuery(trimmed);
      if (match) {
        setResults(match.results);
        setFilters(match.filters);
        setDescription(match.description);
      }
    } catch (err) {
      const match = matchScreenerQuery(trimmed);
      if (match) {
        setResults(match.results);
        setFilters(match.filters);
        setDescription(match.description);
      } else {
        setError(err instanceof Error ? err.message : 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setFilters([]);
    setDescription('');
    setLoading(false);
    setHasSearched(false);
  }, []);

  return {
    results,
    filters,
    description,
    loading,
    error,
    hasSearched,
    search,
    removeFilter,
    clear,
  };
}
