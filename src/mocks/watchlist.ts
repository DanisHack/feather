export interface WatchlistStockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  sparkline: number[];
}

function generateSparkline(startPrice: number, trend: 'up' | 'down', days = 30): number[] {
  const data: number[] = [];
  let price = startPrice * (1 + (trend === 'up' ? -0.05 : 0.05));
  const drift = trend === 'up' ? 0.003 : -0.003;

  for (let i = 0; i < days; i++) {
    const noise = (Math.random() - 0.48) * startPrice * 0.015;
    price += price * drift + noise;
    price = Math.max(price, startPrice * 0.85);
    data.push(Math.round(price * 100) / 100);
  }
  return data;
}

export const mockWatchlistData: Record<string, WatchlistStockData> = {
  AAPL: { ticker: 'AAPL', name: 'Apple Inc', price: 189.30, change: 1.24, changePercent: 0.66, marketCap: 2_940_000_000_000, volume: 52_300_000, sparkline: generateSparkline(189.30, 'up') },
  NVDA: { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 875.40, change: 21.20, changePercent: 2.48, marketCap: 2_160_000_000_000, volume: 45_100_000, sparkline: generateSparkline(875.40, 'up') },
  MSFT: { ticker: 'MSFT', name: 'Microsoft Corp', price: 415.20, change: -2.10, changePercent: -0.50, marketCap: 3_080_000_000_000, volume: 18_200_000, sparkline: generateSparkline(415.20, 'down') },
  GOOGL: { ticker: 'GOOGL', name: 'Alphabet Inc', price: 172.40, change: 3.20, changePercent: 1.89, marketCap: 2_140_000_000_000, volume: 22_400_000, sparkline: generateSparkline(172.40, 'up') },
  AMZN: { ticker: 'AMZN', name: 'Amazon.com Inc', price: 192.50, change: 0.80, changePercent: 0.42, marketCap: 2_020_000_000_000, volume: 31_500_000, sparkline: generateSparkline(192.50, 'up') },
  META: { ticker: 'META', name: 'Meta Platforms', price: 524.30, change: -8.40, changePercent: -1.58, marketCap: 1_330_000_000_000, volume: 14_800_000, sparkline: generateSparkline(524.30, 'down') },
  TSLA: { ticker: 'TSLA', name: 'Tesla Inc', price: 248.70, change: 5.60, changePercent: 2.30, marketCap: 792_000_000_000, volume: 89_300_000, sparkline: generateSparkline(248.70, 'up') },
  NFLX: { ticker: 'NFLX', name: 'Netflix Inc', price: 628.40, change: 12.30, changePercent: 2.00, marketCap: 269_000_000_000, volume: 5_200_000, sparkline: generateSparkline(628.40, 'up') },
  AMD: { ticker: 'AMD', name: 'Advanced Micro', price: 178.20, change: 4.30, changePercent: 2.47, marketCap: 288_000_000_000, volume: 42_100_000, sparkline: generateSparkline(178.20, 'up') },
  INTC: { ticker: 'INTC', name: 'Intel Corp', price: 43.20, change: -0.80, changePercent: -1.82, marketCap: 183_000_000_000, volume: 31_200_000, sparkline: generateSparkline(43.20, 'down') },
  QCOM: { ticker: 'QCOM', name: 'Qualcomm Inc', price: 168.40, change: 2.10, changePercent: 1.26, marketCap: 187_000_000_000, volume: 8_400_000, sparkline: generateSparkline(168.40, 'up') },
  ASML: { ticker: 'ASML', name: 'ASML Holding', price: 842.30, change: 15.20, changePercent: 1.84, marketCap: 331_000_000_000, volume: 1_200_000, sparkline: generateSparkline(842.30, 'up') },
  CRM: { ticker: 'CRM', name: 'Salesforce Inc', price: 298.40, change: -1.20, changePercent: -0.40, marketCap: 289_000_000_000, volume: 4_800_000, sparkline: generateSparkline(298.40, 'down') },
  BABA: { ticker: 'BABA', name: 'Alibaba Group', price: 78.40, change: 1.20, changePercent: 1.55, marketCap: 195_000_000_000, volume: 14_200_000, sparkline: generateSparkline(78.40, 'up') },
  SE: { ticker: 'SE', name: 'Sea Limited', price: 48.20, change: -0.80, changePercent: -1.63, marketCap: 27_000_000_000, volume: 8_100_000, sparkline: generateSparkline(48.20, 'down') },
  GRAB: { ticker: 'GRAB', name: 'Grab Holdings', price: 3.84, change: 0.12, changePercent: 3.23, marketCap: 15_000_000_000, volume: 22_400_000, sparkline: generateSparkline(3.84, 'up') },
  SHOP: { ticker: 'SHOP', name: 'Shopify Inc', price: 89.40, change: 2.10, changePercent: 2.40, marketCap: 113_000_000_000, volume: 8_200_000, sparkline: generateSparkline(89.40, 'up') },
};

export const defaultWatchlists = [
  {
    id: 'my-watchlist',
    name: 'My Watchlist',
    tickers: ['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NFLX'],
  },
  {
    id: 'tech',
    name: 'Tech',
    tickers: ['AMD', 'INTC', 'QCOM', 'ASML', 'CRM'],
  },
  {
    id: 'uae-picks',
    name: 'UAE Picks',
    tickers: ['BABA', 'SE', 'GRAB', 'SHOP'],
  },
];
