import { useMemo } from 'react';
import type { Portfolio } from '../types';
import { usePortfolioStore } from '../store/portfolioStore';

export function usePaperPortfolio() {
  const paper = usePortfolioStore((s) => s.paper);
  const paperBuy = usePortfolioStore((s) => s.paperBuy);
  const paperSell = usePortfolioStore((s) => s.paperSell);
  const initializePaper = usePortfolioStore((s) => s.initializePaper);
  const resetPaper = usePortfolioStore((s) => s.resetPaper);
  const refreshPaperPrices = usePortfolioStore((s) => s.refreshPaperPrices);

  // Derive a Portfolio object so it can feed PortfolioView directly
  const portfolio: Portfolio | null = useMemo(() => {
    if (!paper.initialized || paper.positions.length === 0) return null;

    const positionsValue = paper.positions.reduce((s, h) => s + h.currentValue, 0);
    const dayReturn = paper.positions.reduce((s, h) => s + h.dayReturn, 0);
    const totalValue = positionsValue + paper.cashBalance;
    const totalCost = paper.startingCash;

    return {
      totalValue,
      dayReturn,
      dayReturnPercent: positionsValue > 0 ? (dayReturn / (positionsValue - dayReturn)) * 100 : 0,
      totalReturn: totalValue - totalCost,
      totalReturnPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
      accounts: [
        {
          id: 'acc_paper',
          brokerName: 'Paper Trading',
          accountType: 'Virtual',
          totalValue: positionsValue,
          dayReturn,
          dayReturnPercent: positionsValue > 0 ? (dayReturn / (positionsValue - dayReturn)) * 100 : 0,
          holdings: paper.positions,
        },
      ],
      performanceHistory: paper.performanceHistory,
    };
  }, [paper]);

  return {
    paper,
    portfolio,
    buy: paperBuy,
    sell: paperSell,
    initialize: initializePaper,
    reset: resetPaper,
    refreshPrices: refreshPaperPrices,
  };
}
