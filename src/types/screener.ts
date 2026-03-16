export interface ScreenerFilter {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'between' | 'in';
  value: number | string | number[];
  label: string;
}

export interface ScreenerResult {
  ticker: string;
  name: string;
  sector?: string;
  logo?: string;
  price: number;
  changePercent: number;
  marketCap?: number;
  peRatio?: number;
  revenueGrowth?: number;
  volume: number;
}
