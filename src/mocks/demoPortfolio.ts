import type { Portfolio } from '../types';

// ─── Curated "dream portfolio" — 10 holdings showcasing Feather ──

const demoHoldings = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', quantity: 55, avgCost: 380.00, currentPrice: 920.50, dayReturn: 1210.00, dayReturnPercent: 2.45 },
  { ticker: 'AAPL', name: 'Apple Inc.', quantity: 120, avgCost: 145.00, currentPrice: 192.80, dayReturn: 158.40, dayReturnPercent: 0.69 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', quantity: 60, avgCost: 280.00, currentPrice: 422.30, dayReturn: -126.00, dayReturnPercent: -0.50 },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', quantity: 80, avgCost: 105.00, currentPrice: 198.40, dayReturn: 96.00, dayReturnPercent: 0.61 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', quantity: 70, avgCost: 110.00, currentPrice: 178.20, dayReturn: 231.00, dayReturnPercent: 1.88 },
  { ticker: 'META', name: 'Meta Platforms, Inc.', quantity: 30, avgCost: 290.00, currentPrice: 535.40, dayReturn: -214.50, dayReturnPercent: -1.32 },
  { ticker: 'AVGO', name: 'Broadcom Inc.', quantity: 18, avgCost: 680.00, currentPrice: 1340.00, dayReturn: 410.40, dayReturnPercent: 1.73 },
  { ticker: 'LLY', name: 'Eli Lilly and Company', quantity: 22, avgCost: 420.00, currentPrice: 790.00, dayReturn: -138.60, dayReturnPercent: -0.79 },
  { ticker: 'COST', name: 'Costco Wholesale', quantity: 25, avgCost: 510.00, currentPrice: 735.60, dayReturn: 87.50, dayReturnPercent: 0.48 },
  { ticker: 'V', name: 'Visa Inc.', quantity: 40, avgCost: 225.00, currentPrice: 292.50, dayReturn: 60.00, dayReturnPercent: 0.52 },
].map((h) => {
  const currentValue = h.currentPrice * h.quantity;
  const totalCost = h.avgCost * h.quantity;
  return {
    ...h,
    currentValue,
    totalReturn: currentValue - totalCost,
    totalReturnPercent: ((currentValue - totalCost) / totalCost) * 100,
    brokerName: 'Demo Portfolio',
  };
});

const totalValue = demoHoldings.reduce((s, h) => s + h.currentValue, 0);
const dayReturn = demoHoldings.reduce((s, h) => s + h.dayReturn, 0);
const totalReturn = demoHoldings.reduce((s, h) => s + h.totalReturn, 0);
const totalCost = totalValue - totalReturn;

// ─── 365-day performance history ──────────────────────

function generateDemoPerformanceHistory() {
  const days = 365;
  const startValue = totalCost;
  const endValue = totalValue;
  const startSPY = 4200;
  const endSPY = 5234;

  const history: { date: Date; value: number; benchmark: number }[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const t = i / (days - 1);

    const portfolioTrend = startValue + (endValue - startValue) * t;
    const portfolioNoise =
      Math.sin(i * 0.15) * 1200 +
      Math.sin(i * 0.08) * 700 +
      Math.cos(i * 0.22) * 400;

    const spyTrend = startSPY + (endSPY - startSPY) * t;
    const spyNoise = Math.sin(i * 0.12) * 30 + Math.cos(i * 0.18) * 20;
    const spyNormalized = ((spyTrend + spyNoise) / startSPY) * startValue;

    history.push({
      date,
      value: Math.round((portfolioTrend + portfolioNoise) * 100) / 100,
      benchmark: Math.round(spyNormalized * 100) / 100,
    });
  }

  return history;
}

export const demoPortfolio: Portfolio = {
  totalValue,
  dayReturn,
  dayReturnPercent: (dayReturn / (totalValue - dayReturn)) * 100,
  totalReturn,
  totalReturnPercent: (totalReturn / totalCost) * 100,
  accounts: [
    {
      id: 'acc_demo',
      brokerName: 'Demo Portfolio',
      accountType: 'Curated',
      totalValue,
      dayReturn,
      dayReturnPercent: (dayReturn / (totalValue - dayReturn)) * 100,
      holdings: demoHoldings,
    },
  ],
  performanceHistory: generateDemoPerformanceHistory(),
};
