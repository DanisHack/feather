import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Portfolio, Holding, PortfolioTabId, PaperPortfolioState, PaperTrade } from '../types';
import { demoPortfolio } from '../mocks/demoPortfolio';
import { defaultPaperState } from '../mocks/paperPortfolio';
import { recalculateAccountTotals, recalculatePortfolioTotals, updateHoldingPrices } from './portfolioUtils';
import { useUserStore } from './userStore';

// Scoped storage — prefixes localStorage keys with the current user ID
// so each user's portfolio data is isolated
const userScopedStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    const userId = useUserStore.getState().user?.id ?? '_anon';
    return localStorage.getItem(`${name}:${userId}`);
  },
  setItem: (name: string, value: string) => {
    const userId = useUserStore.getState().user?.id ?? '_anon';
    localStorage.setItem(`${name}:${userId}`, value);
  },
  removeItem: (name: string) => {
    const userId = useUserStore.getState().user?.id ?? '_anon';
    localStorage.removeItem(`${name}:${userId}`);
  },
}));

interface PortfolioStore {
  // ─── Tab ──────────────────────────────────────────────
  activeTab: PortfolioTabId;
  setActiveTab: (tab: PortfolioTabId) => void;

  // ─── Demo (read-only) ────────────────────────────────
  demoPortfolio: Portfolio;

  // ─── Paper ───────────────────────────────────────────
  paper: PaperPortfolioState;
  initializePaper: (startingCash: number) => void;
  paperBuy: (ticker: string, name: string, quantity: number, price: number) => void;
  paperSell: (ticker: string, quantity: number, price: number) => void;
  refreshPaperPrices: (prices: Record<string, { price: number; change: number; changePercent: number }>) => void;
  resetPaper: () => void;

  // ─── Real ────────────────────────────────────────────
  realPortfolio: Portfolio | null;
  realLoading: boolean;
  realError: string | null;
  realConnected: boolean;
  setRealPortfolio: (portfolio: Portfolio) => void;
  setRealLoading: (loading: boolean) => void;
  setRealError: (error: string | null) => void;
  setRealConnected: (connected: boolean) => void;
  addManualPosition: (position: Holding, accountId: string) => void;
  removePosition: (ticker: string, accountId: string) => void;
  refreshRealPrices: (prices: Record<string, { price: number; change: number; changePercent: number }>) => void;

  reset: () => void;
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      // ─── Tab ────────────────────────────────────────
      activeTab: 'demo',
      setActiveTab: (tab) => set({ activeTab: tab }),

      // ─── Demo ───────────────────────────────────────
      demoPortfolio,

      // ─── Paper ──────────────────────────────────────
      paper: { ...defaultPaperState },

      initializePaper: (startingCash) =>
        set({
          paper: {
            ...defaultPaperState,
            initialized: true,
            startingCash,
            cashBalance: startingCash,
          },
        }),

      paperBuy: (ticker, name, quantity, price) =>
        set((state) => {
          const cost = price * quantity;
          if (cost > state.paper.cashBalance) return state;

          const existing = state.paper.positions.find((p) => p.ticker === ticker);
          let positions: Holding[];

          if (existing) {
            // Average up
            const newQty = existing.quantity + quantity;
            const newAvgCost = (existing.avgCost * existing.quantity + price * quantity) / newQty;
            const currentValue = existing.currentPrice * newQty;
            const totalCost = newAvgCost * newQty;
            positions = state.paper.positions.map((p) =>
              p.ticker === ticker
                ? {
                    ...p,
                    quantity: newQty,
                    avgCost: newAvgCost,
                    currentValue,
                    totalReturn: currentValue - totalCost,
                    totalReturnPercent: totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0,
                  }
                : p,
            );
          } else {
            const currentValue = price * quantity;
            positions = [
              ...state.paper.positions,
              {
                ticker,
                name,
                quantity,
                avgCost: price,
                currentPrice: price,
                currentValue,
                totalReturn: 0,
                totalReturnPercent: 0,
                dayReturn: 0,
                dayReturnPercent: 0,
                brokerName: 'Paper Trading',
              },
            ];
          }

          const trade: PaperTrade = {
            id: `pt_${Date.now()}`,
            ticker,
            name,
            type: 'buy',
            quantity,
            price,
            timestamp: new Date(),
          };

          return {
            paper: {
              ...state.paper,
              cashBalance: state.paper.cashBalance - cost,
              positions,
              tradeHistory: [...state.paper.tradeHistory, trade],
            },
          };
        }),

      paperSell: (ticker, quantity, price) =>
        set((state) => {
          const existing = state.paper.positions.find((p) => p.ticker === ticker);
          if (!existing || existing.quantity < quantity) return state;

          const proceeds = price * quantity;
          const remaining = existing.quantity - quantity;
          let positions: Holding[];

          if (remaining === 0) {
            positions = state.paper.positions.filter((p) => p.ticker !== ticker);
          } else {
            const currentValue = existing.currentPrice * remaining;
            const totalCost = existing.avgCost * remaining;
            positions = state.paper.positions.map((p) =>
              p.ticker === ticker
                ? {
                    ...p,
                    quantity: remaining,
                    currentValue,
                    totalReturn: currentValue - totalCost,
                    totalReturnPercent: totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0,
                  }
                : p,
            );
          }

          const trade: PaperTrade = {
            id: `pt_${Date.now()}`,
            ticker,
            name: existing.name,
            type: 'sell',
            quantity,
            price,
            timestamp: new Date(),
          };

          return {
            paper: {
              ...state.paper,
              cashBalance: state.paper.cashBalance + proceeds,
              positions,
              tradeHistory: [...state.paper.tradeHistory, trade],
            },
          };
        }),

      refreshPaperPrices: (prices) =>
        set((state) => {
          if (state.paper.positions.length === 0) return state;
          const positions = updateHoldingPrices(state.paper.positions, prices);
          return { paper: { ...state.paper, positions } };
        }),

      resetPaper: () => set({ paper: { ...defaultPaperState } }),

      // ─── Real ───────────────────────────────────────
      realPortfolio: null,
      realLoading: false,
      realError: null,
      realConnected: false,

      setRealPortfolio: (portfolio) => set({ realPortfolio: portfolio, realLoading: false, realError: null }),
      setRealLoading: (loading) => set({ realLoading: loading }),
      setRealError: (error) => set({ realError: error, realLoading: false }),
      setRealConnected: (connected) => set({ realConnected: connected }),

      addManualPosition: (position, accountId) =>
        set((state) => {
          if (!state.realPortfolio) return state;
          const accounts = state.realPortfolio.accounts.map((acc) => {
            if (acc.id !== accountId) return acc;
            const holdings = [...acc.holdings, position];
            return { ...acc, holdings, ...recalculateAccountTotals(holdings) };
          });
          return { realPortfolio: { ...state.realPortfolio, accounts, ...recalculatePortfolioTotals(accounts) } };
        }),

      removePosition: (ticker, accountId) =>
        set((state) => {
          if (!state.realPortfolio) return state;
          const accounts = state.realPortfolio.accounts.map((acc) => {
            if (acc.id !== accountId) return acc;
            const holdings = acc.holdings.filter((h) => h.ticker !== ticker);
            return { ...acc, holdings, ...recalculateAccountTotals(holdings) };
          });
          return { realPortfolio: { ...state.realPortfolio, accounts, ...recalculatePortfolioTotals(accounts) } };
        }),

      refreshRealPrices: (prices) =>
        set((state) => {
          if (!state.realPortfolio) return state;
          const accounts = state.realPortfolio.accounts.map((acc) => {
            const holdings = updateHoldingPrices(acc.holdings, prices);
            return { ...acc, holdings, ...recalculateAccountTotals(holdings) };
          });
          return { realPortfolio: { ...state.realPortfolio, accounts, ...recalculatePortfolioTotals(accounts) } };
        }),

      reset: () => set({ realPortfolio: null, realLoading: false, realError: null, paper: { ...defaultPaperState } }),
    }),
    {
      name: 'feather-portfolio',
      storage: userScopedStorage,
      version: 3,
      migrate: (persisted: unknown, version: number) => {
        if (version < 2) {
          return {
            activeTab: 'demo' as PortfolioTabId,
            realConnected: false,
            paper: { ...defaultPaperState },
          };
        }
        if (version < 3) {
          // v2 → v3: reset realConnected to false (no broker actually connected)
          const state = persisted as Record<string, unknown>;
          return { ...state, realConnected: false };
        }
        return persisted as Record<string, unknown>;
      },
      partialize: (state) => ({
        activeTab: state.activeTab,
        realConnected: state.realConnected,
        paper: {
          initialized: state.paper.initialized,
          startingCash: state.paper.startingCash,
          cashBalance: state.paper.cashBalance,
          positions: state.paper.positions,
          tradeHistory: state.paper.tradeHistory,
        },
      }),
    },
  ),
);
