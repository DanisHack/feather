import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultWatchlists } from '../mocks/watchlist';

interface WatchlistList {
  id: string;
  name: string;
  tickers: string[];
}

interface WatchlistStore {
  lists: WatchlistList[];
  activeListId: string;
  setActiveList: (id: string) => void;
  addList: (name: string) => void;
  removeList: (id: string) => void;
  renameList: (id: string, name: string) => void;
  addTicker: (listId: string, ticker: string) => void;
  removeTicker: (listId: string, ticker: string) => void;
  reorderTickers: (listId: string, tickers: string[]) => void;
  bulkAddTickers: (listId: string, tickers: string[]) => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set) => ({
      lists: defaultWatchlists,
      activeListId: 'my-watchlist',

      setActiveList: (id) => set({ activeListId: id }),

      addList: (name) =>
        set((state) => {
          const newList = { id: crypto.randomUUID(), name, tickers: [] };
          return {
            lists: [...state.lists, newList],
            activeListId: newList.id,
          };
        }),

      removeList: (id) =>
        set((state) => ({
          lists: state.lists.filter((l) => l.id !== id),
          activeListId:
            state.activeListId === id
              ? state.lists[0]?.id ?? ''
              : state.activeListId,
        })),

      renameList: (id, name) =>
        set((state) => ({
          lists: state.lists.map((l) => (l.id === id ? { ...l, name } : l)),
        })),

      addTicker: (listId, ticker) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId && !l.tickers.includes(ticker)
              ? { ...l, tickers: [...l.tickers, ticker] }
              : l
          ),
        })),

      removeTicker: (listId, ticker) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? { ...l, tickers: l.tickers.filter((t) => t !== ticker) }
              : l
          ),
        })),

      reorderTickers: (listId, tickers) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId ? { ...l, tickers } : l
          ),
        })),

      bulkAddTickers: (listId, tickers) =>
        set((state) => ({
          lists: state.lists.map((l) => {
            if (l.id !== listId) return l;
            const existing = new Set(l.tickers);
            const newTickers = tickers.filter((t) => !existing.has(t));
            return { ...l, tickers: [...l.tickers, ...newTickers] };
          }),
        })),
    }),
    { name: 'feather-watchlist' }
  )
);
