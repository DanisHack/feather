import type { Account, Holding } from '../types';

export function recalculateAccountTotals(holdings: Holding[]): Pick<Account, 'totalValue' | 'dayReturn' | 'dayReturnPercent'> {
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const dayReturn = holdings.reduce((s, h) => s + h.dayReturn, 0);
  return {
    totalValue,
    dayReturn,
    dayReturnPercent: totalValue > 0 ? (dayReturn / (totalValue - dayReturn)) * 100 : 0,
  };
}

export function recalculatePortfolioTotals(accounts: Account[]) {
  const totalValue = accounts.reduce((s, a) => s + a.totalValue, 0);
  const dayReturn = accounts.reduce((s, a) => s + a.dayReturn, 0);
  const totalReturn = accounts.reduce(
    (s, a) => s + a.holdings.reduce((sh, h) => sh + h.totalReturn, 0),
    0,
  );
  const totalCost = totalValue - totalReturn;
  return {
    totalValue,
    dayReturn,
    dayReturnPercent: totalValue > 0 ? (dayReturn / (totalValue - dayReturn)) * 100 : 0,
    totalReturn,
    totalReturnPercent: totalCost > 0 ? (totalReturn / totalCost) * 100 : 0,
  };
}

export function updateHoldingPrices(
  holdings: Holding[],
  prices: Record<string, { price: number; change: number; changePercent: number }>,
): Holding[] {
  return holdings.map((h) => {
    const quote = prices[h.ticker];
    if (!quote) return h;
    const currentValue = quote.price * h.quantity;
    const totalCost = h.avgCost * h.quantity;
    const dayReturn = quote.change * h.quantity;
    return {
      ...h,
      currentPrice: quote.price,
      currentValue,
      totalReturn: currentValue - totalCost,
      totalReturnPercent: totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0,
      dayReturn,
      dayReturnPercent: quote.changePercent,
    };
  });
}
