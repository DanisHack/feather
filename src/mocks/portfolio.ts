import type { Portfolio } from '../types';

// ─── Two broker accounts with 4 positions each ───────────

const ibHoldings = [
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    quantity: 42,
    avgCost: 428.20,
    currentPrice: 875.40,
    currentValue: 36766.80,
    totalReturn: 18782.40,
    totalReturnPercent: 104.4,
    dayReturn: 891.00,
    dayReturnPercent: 2.48,
    brokerName: 'Interactive Brokers',
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    quantity: 85,
    avgCost: 142.30,
    currentPrice: 189.30,
    currentValue: 16090.50,
    totalReturn: 3995.00,
    totalReturnPercent: 33.0,
    dayReturn: 105.40,
    dayReturnPercent: 0.66,
    brokerName: 'Interactive Brokers',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    quantity: 48,
    avgCost: 298.40,
    currentPrice: 415.20,
    currentValue: 19929.60,
    totalReturn: 5606.40,
    totalReturnPercent: 39.1,
    dayReturn: -100.80,
    dayReturnPercent: -0.50,
    brokerName: 'Interactive Brokers',
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com, Inc.',
    quantity: 65,
    avgCost: 118.20,
    currentPrice: 192.50,
    currentValue: 12512.50,
    totalReturn: 4829.50,
    totalReturnPercent: 62.9,
    dayReturn: 52.00,
    dayReturnPercent: 0.42,
    brokerName: 'Interactive Brokers',
  },
];

const rhHoldings = [
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    quantity: 52,
    avgCost: 128.40,
    currentPrice: 172.40,
    currentValue: 8964.80,
    totalReturn: 2288.00,
    totalReturnPercent: 34.3,
    dayReturn: 166.40,
    dayReturnPercent: 1.89,
    brokerName: 'Robinhood',
  },
  {
    ticker: 'META',
    name: 'Meta Platforms, Inc.',
    quantity: 22,
    avgCost: 312.80,
    currentPrice: 524.30,
    currentValue: 11534.60,
    totalReturn: 4653.00,
    totalReturnPercent: 67.6,
    dayReturn: -184.80,
    dayReturnPercent: -1.58,
    brokerName: 'Robinhood',
  },
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    quantity: 38,
    avgCost: 198.40,
    currentPrice: 248.70,
    currentValue: 9450.60,
    totalReturn: 1911.40,
    totalReturnPercent: 25.3,
    dayReturn: 212.80,
    dayReturnPercent: 2.30,
    brokerName: 'Robinhood',
  },
  {
    ticker: 'NFLX',
    name: 'Netflix, Inc.',
    quantity: 12,
    avgCost: 482.10,
    currentPrice: 628.40,
    currentValue: 7540.80,
    totalReturn: 1755.60,
    totalReturnPercent: 30.3,
    dayReturn: 147.60,
    dayReturnPercent: 2.00,
    brokerName: 'Robinhood',
  },
];

const ibTotal = ibHoldings.reduce((s, h) => s + h.currentValue, 0);
const ibDayReturn = ibHoldings.reduce((s, h) => s + h.dayReturn, 0);

const rhTotal = rhHoldings.reduce((s, h) => s + h.currentValue, 0);
const rhDayReturn = rhHoldings.reduce((s, h) => s + h.dayReturn, 0);

const totalValue = ibTotal + rhTotal;
const totalDayReturn = ibDayReturn + rhDayReturn;
const totalAllTimeReturn = [...ibHoldings, ...rhHoldings].reduce((s, h) => s + h.totalReturn, 0);
const totalCost = totalValue - totalAllTimeReturn;

// ─── 365-day performance history ──────────────────────────

function generatePerformanceHistory() {
  const days = 365;
  const startPortfolio = totalCost; // cost basis — portfolio grew from here to totalValue
  const endPortfolio = totalValue;
  const startSPY = 4200;
  const endSPY = 5234;

  const history: { date: Date; value: number; benchmark: number }[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));

    const t = i / (days - 1);

    // Portfolio: clear upward trend with mild volatility
    const portfolioTrend = startPortfolio + (endPortfolio - startPortfolio) * t;
    const portfolioNoise =
      Math.sin(i * 0.15) * 800 +
      Math.sin(i * 0.08) * 500 +
      Math.cos(i * 0.22) * 300;
    const portfolioValue = portfolioTrend + portfolioNoise;

    // SPY: normalized to same start as portfolio, slightly underperforms
    const spyTrend = startSPY + (endSPY - startSPY) * t;
    const spyNoise =
      Math.sin(i * 0.12) * 30 +
      Math.cos(i * 0.18) * 20;
    const spyNormalized = ((spyTrend + spyNoise) / startSPY) * startPortfolio;

    history.push({
      date,
      value: Math.round(portfolioValue * 100) / 100,
      benchmark: Math.round(spyNormalized * 100) / 100,
    });
  }

  return history;
}

export const mockPortfolio: Portfolio = {
  totalValue,
  dayReturn: totalDayReturn,
  dayReturnPercent: (totalDayReturn / (totalValue - totalDayReturn)) * 100,
  totalReturn: totalAllTimeReturn,
  totalReturnPercent: (totalAllTimeReturn / totalCost) * 100,
  accounts: [
    {
      id: 'acc_ib',
      brokerName: 'Interactive Brokers',
      accountType: 'Individual Brokerage',
      totalValue: ibTotal,
      dayReturn: ibDayReturn,
      dayReturnPercent: (ibDayReturn / (ibTotal - ibDayReturn)) * 100,
      holdings: ibHoldings,
    },
    {
      id: 'acc_rh',
      brokerName: 'Robinhood',
      accountType: 'Individual Brokerage',
      totalValue: rhTotal,
      dayReturn: rhDayReturn,
      dayReturnPercent: (rhDayReturn / (rhTotal - rhDayReturn)) * 100,
      holdings: rhHoldings,
    },
  ],
  performanceHistory: generatePerformanceHistory(),
};
