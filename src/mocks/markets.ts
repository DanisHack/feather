import type { Quote } from '../types';

// ─── Indices ───────────────────────────────────────────────

export const mockIndices: (Quote & { name: string; sparkline: number[] })[] = [
  {
    ticker: 'I:SPX',
    name: 'S&P 500',
    price: 5842.31,
    open: 5820.00,
    high: 5858.40,
    low: 5810.20,
    close: 5842.31,
    volume: 0,
    vwap: 5835.00,
    change: 28.42,
    changePercent: 0.49,
    timestamp: Date.now(),
    sparkline: [5780, 5795, 5810, 5802, 5825, 5838, 5842],
  },
  {
    ticker: 'I:NDX',
    name: 'NASDAQ',
    price: 18426.75,
    open: 18300.00,
    high: 18480.00,
    low: 18260.00,
    close: 18426.75,
    volume: 0,
    vwap: 18380.00,
    change: 142.30,
    changePercent: 0.78,
    timestamp: Date.now(),
    sparkline: [18100, 18180, 18250, 18220, 18310, 18380, 18427],
  },
  {
    ticker: 'I:DJI',
    name: 'DOW JONES',
    price: 43215.60,
    open: 43150.00,
    high: 43280.00,
    low: 43090.00,
    close: 43215.60,
    volume: 0,
    vwap: 43180.00,
    change: 84.42,
    changePercent: 0.20,
    timestamp: Date.now(),
    sparkline: [43050, 43080, 43120, 43100, 43160, 43190, 43216],
  },
  {
    ticker: 'I:RUT',
    name: 'RUSSELL 2000',
    price: 2084.32,
    open: 2098.00,
    high: 2102.00,
    low: 2078.00,
    close: 2084.32,
    volume: 0,
    vwap: 2090.00,
    change: -12.44,
    changePercent: -0.59,
    timestamp: Date.now(),
    sparkline: [2110, 2105, 2098, 2095, 2090, 2088, 2084],
  },
];

// ─── Sectors (11 GICS) — keys match constants.ts ─────────

export const mockSectorPerformance = [
  { key: 'technology', name: 'Technology', changePercent: 1.24 },
  { key: 'healthcare', name: 'Healthcare', changePercent: 0.84 },
  { key: 'financials', name: 'Financials', changePercent: 0.62 },
  { key: 'consumer-discretionary', name: 'Consumer Discretionary', changePercent: 0.44 },
  { key: 'industrials', name: 'Industrials', changePercent: 0.28 },
  { key: 'communication-services', name: 'Communication Services', changePercent: -0.12 },
  { key: 'consumer-staples', name: 'Consumer Staples', changePercent: -0.28 },
  { key: 'energy', name: 'Energy', changePercent: -0.44 },
  { key: 'materials', name: 'Materials', changePercent: -0.62 },
  { key: 'real-estate', name: 'Real Estate', changePercent: -0.84 },
  { key: 'utilities', name: 'Utilities', changePercent: -1.24 },
];

// ─── Economic Indicators ──────────────────────────────────

export const mockEconomicIndicators = [
  {
    name: 'Federal Funds Rate',
    value: '5.25 - 5.50%',
    label: 'Fed Funds Rate',
    trend: 'Held since Jul 2023',
    trendColor: 'neutral' as const,
    icon: 'building' as const,
  },
  {
    name: 'CPI Year-over-Year',
    value: '3.2%',
    label: 'CPI YoY',
    trend: '\u25BC from 3.4% last month',
    trendColor: 'positive' as const,
    icon: 'trending-down' as const,
  },
  {
    name: 'Unemployment Rate',
    value: '3.7%',
    label: 'Unemployment',
    trend: '\u25B2 from 3.6% last month',
    trendColor: 'negative' as const,
    icon: 'users' as const,
  },
  {
    name: 'GDP Growth (Q4 2023)',
    value: '+3.3%',
    label: 'GDP Growth',
    trend: 'Above 3.0% estimate',
    trendColor: 'positive' as const,
    icon: 'bar-chart' as const,
  },
];

// ─── Economic Calendar ────────────────────────────────────

export interface EconomicEvent {
  date: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  name: string;
  country: string;
  countryFlag: string;
  forecast?: string;
  previous?: string;
}

export const mockEconomicCalendar: EconomicEvent[] = [
  { date: 'Mar 18', time: '09:00', impact: 'high', name: 'Fed Chair Powell Speech', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}' },
  { date: 'Mar 18', time: '14:30', impact: 'high', name: 'Retail Sales MoM', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', forecast: '+0.3%', previous: '+0.6%' },
  { date: 'Mar 19', time: '14:30', impact: 'medium', name: 'Building Permits', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', forecast: '1.45M', previous: '1.47M' },
  { date: 'Mar 19', time: '14:30', impact: 'high', name: 'CPI Year-over-Year', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', forecast: '3.1%', previous: '3.2%' },
  { date: 'Mar 20', time: '14:30', impact: 'medium', name: 'Initial Jobless Claims', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', forecast: '218K', previous: '217K' },
  { date: 'Mar 20', time: '20:00', impact: 'high', name: 'FOMC Meeting Minutes', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}' },
  { date: 'Mar 21', time: '14:30', impact: 'high', name: 'PCE Price Index MoM', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', forecast: '+0.3%', previous: '+0.2%' },
  { date: 'Mar 21', time: '15:15', impact: 'medium', name: 'Industrial Production MoM', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', forecast: '+0.3%', previous: '+0.1%' },
  { date: 'Mar 24', time: '14:30', impact: 'medium', name: 'Chicago Fed National Activity', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', forecast: '0.05', previous: '-0.15' },
  { date: 'Mar 25', time: '14:00', impact: 'high', name: 'Consumer Confidence', country: 'US', countryFlag: '\u{1F1FA}\u{1F1F8}', forecast: '107.0', previous: '106.7' },
];
