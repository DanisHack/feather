export interface Quote {
  ticker: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface Stock {
  ticker: string;
  name: string;
  description?: string;
  exchange: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  employees?: number;
  website?: string;
  logo?: string;
  quote?: Quote;
}

export interface OHLC {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface KeyStats {
  peRatio?: number;
  pbRatio?: number;
  psRatio?: number;
  evEbitda?: number;
  debtEquity?: number;
  roe?: number;
  roa?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  revenueGrowth?: number;
  earningsGrowth?: number;
  dividendYield?: number;
  beta?: number;
  week52High?: number;
  week52Low?: number;
}
