import { useWatchlistStore } from '../store/watchlistStore';
import { useQuotes } from './usePolygon';
import type { Quote } from '../types';
import { mockQuotes } from '../mocks/stocks';

const hasApiKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);

export function useWatchlist() {
  const store = useWatchlistStore();

  const activeList =
    store.lists.find((l) => l.id === store.activeListId) ?? store.lists[0];

  const tickers = activeList?.tickers ?? [];

  // Fetch real quotes if API key is available
  const { data: realQuotes, loading: quotesLoading } = useQuotes(hasApiKey ? tickers : []);

  const getQuotes = (): Record<string, Quote> => {
    if (hasApiKey && realQuotes) {
      const map: Record<string, Quote> = {};
      for (const q of realQuotes) {
        map[q.ticker] = q;
      }
      return map;
    }
    // Fall back to mock quotes
    const map: Record<string, Quote> = {};
    for (const q of mockQuotes) {
      map[q.ticker] = q;
    }
    return map;
  };

  return {
    lists: store.lists,
    activeList,
    activeListId: store.activeListId,
    quotes: getQuotes(),
    quotesLoading: hasApiKey ? quotesLoading : false,
    setActiveList: store.setActiveList,
    addList: store.addList,
    removeList: store.removeList,
    addTicker: store.addTicker,
    removeTicker: store.removeTicker,
    reorderTickers: store.reorderTickers,
  };
}
