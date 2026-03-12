import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ResearchStore {
  lastTicker: string | null;
  recentStocks: string[];
  setLastTicker: (ticker: string) => void;
  addRecentStock: (ticker: string) => void;
}

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set) => ({
      lastTicker: null,
      recentStocks: [],
      setLastTicker: (ticker) => set({ lastTicker: ticker }),
      addRecentStock: (ticker) =>
        set((state) => ({
          recentStocks: [
            ticker,
            ...state.recentStocks.filter((t) => t !== ticker),
          ].slice(0, 5),
        })),
    }),
    { name: 'feather-research' }
  )
);
