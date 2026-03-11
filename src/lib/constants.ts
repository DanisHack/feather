export const APP_NAME = 'Feather';
export const APP_VERSION = '0.1.0';

export const PRICE_MONTHLY = 99;
export const PRICE_ANNUAL = 990;
export const TRIAL_DAYS = 7;

export const INDICES = [
  { ticker: 'I:SPX', name: 'S&P 500' },
  { ticker: 'I:NDX', name: 'Nasdaq 100' },
  { ticker: 'I:DJI', name: 'Dow Jones' },
  { ticker: 'I:RUT', name: 'Russell 2000' },
  { ticker: 'I:VIX', name: 'VIX' },
] as const;

export const GICS_SECTORS = [
  { key: 'technology', name: 'Technology', color: '#6366F1' },
  { key: 'healthcare', name: 'Healthcare', color: '#EC4899' },
  { key: 'financials', name: 'Financials', color: '#F59E0B' },
  { key: 'consumer-discretionary', name: 'Consumer Discretionary', color: '#8B5CF6' },
  { key: 'communication-services', name: 'Communication Services', color: '#3B82F6' },
  { key: 'industrials', name: 'Industrials', color: '#64748B' },
  { key: 'consumer-staples', name: 'Consumer Staples', color: '#22C55E' },
  { key: 'energy', name: 'Energy', color: '#EF4444' },
  { key: 'utilities', name: 'Utilities', color: '#14B8A6' },
  { key: 'real-estate', name: 'Real Estate', color: '#F97316' },
  { key: 'materials', name: 'Materials', color: '#A78BFA' },
] as const;

export const SECTOR_ETFS: Record<string, string> = {
  technology: 'XLK',
  healthcare: 'XLV',
  financials: 'XLF',
  'consumer-discretionary': 'XLY',
  'communication-services': 'XLC',
  industrials: 'XLI',
  'consumer-staples': 'XLP',
  energy: 'XLE',
  utilities: 'XLU',
  'real-estate': 'XLRE',
  materials: 'XLB',
};

export const TIMEFRAMES = [
  { key: '1D', label: '1D', timespan: 'minute', multiplier: 5, days: 1 },
  { key: '1W', label: '1W', timespan: 'hour', multiplier: 1, days: 7 },
  { key: '1M', label: '1M', timespan: 'day', multiplier: 1, days: 30 },
  { key: '3M', label: '3M', timespan: 'day', multiplier: 1, days: 90 },
  { key: '6M', label: '6M', timespan: 'day', multiplier: 1, days: 180 },
  { key: '1Y', label: '1Y', timespan: 'day', multiplier: 1, days: 365 },
  { key: '5Y', label: '5Y', timespan: 'week', multiplier: 1, days: 1825 },
  { key: 'ALL', label: 'ALL', timespan: 'week', multiplier: 1, days: 7300 },
] as const;

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const POLYGON_BASE_URL = 'https://api.polygon.io';

export const ROUTES = {
  MORNING_BRIEF: '/',
  STOCK_RESEARCH: '/stock/:ticker',
  PORTFOLIO: '/portfolio',
  WATCHLIST: '/watchlist',
  SCREENER: '/screener',
  EARNINGS: '/earnings',
  MARKETS: '/markets',
  SETTINGS: '/settings',
} as const;

export const NAV_ITEMS = [
  { path: ROUTES.MORNING_BRIEF, label: 'Brief', icon: 'newspaper' },
  { path: ROUTES.PORTFOLIO, label: 'Portfolio', icon: 'briefcase' },
  { path: ROUTES.WATCHLIST, label: 'Watchlist', icon: 'eye' },
  { path: ROUTES.SCREENER, label: 'Screener', icon: 'search' },
  { path: ROUTES.EARNINGS, label: 'Earnings', icon: 'calendar' },
  { path: ROUTES.MARKETS, label: 'Markets', icon: 'globe' },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: 'settings' },
] as const;
