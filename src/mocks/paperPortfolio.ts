import type { PaperPortfolioState } from '../types';

export const defaultPaperState: PaperPortfolioState = {
  initialized: false,
  startingCash: 100_000,
  cashBalance: 100_000,
  positions: [],
  tradeHistory: [],
  performanceHistory: [],
};
