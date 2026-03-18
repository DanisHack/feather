import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { useResearchStore } from '../store/researchStore';
import { polygon } from '../lib/polygon';
import { mockTickers } from '../mocks/tickers';
import { NAV_ITEMS } from '../lib/constants';

const hasApiKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);
const DEBOUNCE_MS = 300;

export interface CommandItem {
  id: string;
  type: 'stock' | 'navigation' | 'recent' | 'action';
  label: string;
  sublabel?: string;
  shortcut?: string;
  action: () => void;
}

export interface CommandSection {
  title: string;
  items: CommandItem[];
}

interface TickerResult {
  ticker: string;
  name: string;
}

export function useCommandBar() {
  const { commandBarOpen, closeCommandBar } = useUIStore();
  const { recentStocks, addRecentStock } = useResearchStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<TickerResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  // Reset query + selection when opening/closing
  useEffect(() => {
    if (commandBarOpen) {
      setQuery('');
      setSelectedIndex(0);
      setSearchResults([]);
      setSearching(false);
    }
  }, [commandBarOpen]);

  // Debounced search against Polygon API
  useEffect(() => {
    const q = query.trim();

    if (!q || !hasApiKey) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await polygon.searchTickers(q, 8);
        setSearchResults(results.map((r) => ({ ticker: r.ticker, name: r.name })));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const close = useCallback(() => {
    closeCommandBar();
    setQuery('');
    setSelectedIndex(0);
    setSearchResults([]);
    setSearching(false);
  }, [closeCommandBar]);

  const selectStock = useCallback(
    (ticker: string) => {
      addRecentStock(ticker);
      navigate(`/research/${ticker}`);
      close();
    },
    [navigate, close, addRecentStock],
  );

  const sections = useMemo((): CommandSection[] => {
    const q = query.toLowerCase().trim();
    const result: CommandSection[] = [];

    // Recent stocks (only when no query)
    if (!q && recentStocks.length > 0) {
      const recentItems: CommandItem[] = recentStocks.map((ticker) => ({
        id: `recent-${ticker}`,
        type: 'recent' as const,
        label: ticker,
        sublabel: '',
        action: () => selectStock(ticker),
      }));
      result.push({ title: 'Recent', items: recentItems });
    }

    // Stocks — use API results when available, fall back to mock
    const stockItems: CommandItem[] = [];
    if (q && hasApiKey && searchResults.length > 0) {
      for (const r of searchResults) {
        stockItems.push({
          id: `stock-${r.ticker}`,
          type: 'stock',
          label: r.ticker,
          sublabel: r.name,
          action: () => selectStock(r.ticker),
        });
      }
    } else {
      // Fall back to local mock filtering
      for (const ticker of mockTickers) {
        if (
          !q ||
          ticker.ticker.toLowerCase().includes(q) ||
          ticker.name.toLowerCase().includes(q)
        ) {
          stockItems.push({
            id: `stock-${ticker.ticker}`,
            type: 'stock',
            label: ticker.ticker,
            sublabel: ticker.name,
            action: () => selectStock(ticker.ticker),
          });
        }
        if (stockItems.length >= 5) break;
      }
    }
    if (stockItems.length > 0) {
      result.push({ title: 'Stocks', items: stockItems });
    }

    // Navigate
    const navItems: CommandItem[] = [];
    for (const nav of NAV_ITEMS) {
      if (!q || nav.label.toLowerCase().includes(q)) {
        navItems.push({
          id: `nav-${nav.path}`,
          type: 'navigation',
          label: nav.label,
          sublabel: nav.path,
          action: () => {
            navigate(nav.path);
            close();
          },
        });
      }
    }
    if (navItems.length > 0) {
      result.push({ title: 'Navigate', items: navItems });
    }

    // Actions (only when no query or matching)
    if (!q || 'theme'.includes(q) || 'dark'.includes(q) || 'light'.includes(q)) {
      result.push({
        title: 'Actions',
        items: [
          {
            id: 'action-theme',
            type: 'action',
            label: 'Toggle theme',
            sublabel: 'Switch dark/light mode',
            action: () => {
              // TODO: wire theme toggle
              close();
            },
          },
        ],
      });
    }

    return result;
  }, [query, recentStocks, searchResults, navigate, close, selectStock]);

  // Flat list of all items for keyboard nav
  const allItems = useMemo(
    () => sections.flatMap((s) => s.items),
    [sections],
  );

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [allItems.length]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && allItems.length > 0) {
        e.preventDefault();
        allItems[selectedIndex]?.action();
      } else if (e.key === 'Escape') {
        close();
      }
    },
    [allItems, selectedIndex, close],
  );

  return {
    open: commandBarOpen,
    query,
    sections,
    allItems,
    selectedIndex,
    searching,
    setQuery,
    setSelectedIndex,
    handleKeyDown,
    close,
  };
}
