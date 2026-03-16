import type { ScreenerResult } from '../types';

export interface ScreenerRow extends ScreenerResult {
  revenueGrowth?: number;
}

// ─── 5 query-specific result sets ────────────────────────────

export const screenerQueries: Record<string, { label: string; filters: { field: string; label: string }[]; results: ScreenerRow[] }> = {
  'profitable tech under $50': {
    label: 'profitable tech under $50',
    filters: [
      { field: 'sector', label: 'Sector: Technology' },
      { field: 'price', label: 'Price < $50' },
      { field: 'netMargin', label: 'Net Margin > 0%' },
    ],
    results: [
      { ticker: 'INTC', name: 'Intel Corporation', sector: 'Technology', price: 43.20, changePercent: -1.82, marketCap: 183_000_000_000, peRatio: 12, volume: 71_000_000, revenueGrowth: -8 },
      { ticker: 'SNAP', name: 'Snap Inc.', sector: 'Technology', price: 18.40, changePercent: 3.21, marketCap: 30_000_000_000, peRatio: undefined, volume: 42_000_000, revenueGrowth: 5 },
      { ticker: 'PINS', name: 'Pinterest, Inc.', sector: 'Technology', price: 34.20, changePercent: 1.44, marketCap: 22_000_000_000, peRatio: 28, volume: 18_000_000, revenueGrowth: 18 },
      { ticker: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', price: 24.80, changePercent: 5.32, marketCap: 52_000_000_000, peRatio: undefined, volume: 97_000_000, revenueGrowth: 21 },
      { ticker: 'AFRM', name: 'Affirm Holdings, Inc.', sector: 'Technology', price: 42.10, changePercent: 2.18, marketCap: 13_000_000_000, peRatio: undefined, volume: 12_000_000, revenueGrowth: 46 },
      { ticker: 'PATH', name: 'UiPath Inc.', sector: 'Technology', price: 22.40, changePercent: 1.88, marketCap: 14_000_000_000, peRatio: undefined, volume: 8_000_000, revenueGrowth: 24 },
      { ticker: 'HOOD', name: 'Robinhood Markets, Inc.', sector: 'Technology', price: 18.20, changePercent: 4.32, marketCap: 16_000_000_000, peRatio: undefined, volume: 22_000_000, revenueGrowth: 17 },
      { ticker: 'RBLX', name: 'Roblox Corporation', sector: 'Technology', price: 38.60, changePercent: 2.14, marketCap: 24_000_000_000, peRatio: undefined, volume: 15_000_000, revenueGrowth: 25 },
    ],
  },

  'high dividend yield above 4%': {
    label: 'high dividend yield above 4%',
    filters: [
      { field: 'dividendYield', label: 'Dividend Yield > 4%' },
    ],
    results: [
      { ticker: 'T', name: 'AT&T Inc.', sector: 'Telecom', price: 17.40, changePercent: -0.28, marketCap: 124_000_000_000, peRatio: 7, volume: 38_000_000, revenueGrowth: 1 },
      { ticker: 'VZ', name: 'Verizon Communications', sector: 'Telecom', price: 40.20, changePercent: 0.44, marketCap: 169_000_000_000, peRatio: 8, volume: 22_000_000, revenueGrowth: -1 },
      { ticker: 'MO', name: 'Altria Group, Inc.', sector: 'Consumer', price: 42.80, changePercent: -0.12, marketCap: 77_000_000_000, peRatio: 9, volume: 11_000_000, revenueGrowth: -2 },
      { ticker: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', price: 28.40, changePercent: -1.24, marketCap: 161_000_000_000, peRatio: 11, volume: 34_000_000, revenueGrowth: -41 },
      { ticker: 'KHC', name: 'Kraft Heinz Company', sector: 'Consumer', price: 34.20, changePercent: -0.44, marketCap: 42_000_000_000, peRatio: 12, volume: 8_000_000, revenueGrowth: -3 },
      { ticker: 'IBM', name: 'IBM Corporation', sector: 'Technology', price: 182.40, changePercent: 0.88, marketCap: 168_000_000_000, peRatio: 21, volume: 6_000_000, revenueGrowth: 4 },
      { ticker: 'WBA', name: 'Walgreens Boots Alliance', sector: 'Healthcare', price: 18.20, changePercent: -2.14, marketCap: 16_000_000_000, peRatio: 5, volume: 14_000_000, revenueGrowth: -10 },
      { ticker: 'CVS', name: 'CVS Health Corporation', sector: 'Healthcare', price: 56.40, changePercent: 0.22, marketCap: 70_000_000_000, peRatio: 8, volume: 9_000_000, revenueGrowth: 13 },
    ],
  },

  'ai stocks with revenue growth': {
    label: 'AI stocks with revenue growth',
    filters: [
      { field: 'sector', label: 'AI / Machine Learning' },
      { field: 'revenueGrowth', label: 'Revenue Growth > 0%' },
    ],
    results: [
      { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', price: 875.40, changePercent: 2.48, marketCap: 2_160_000_000_000, peRatio: 65, volume: 165_000_000, revenueGrowth: 122 },
      { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', price: 415.20, changePercent: -0.50, marketCap: 3_080_000_000_000, peRatio: 35, volume: 22_000_000, revenueGrowth: 16 },
      { ticker: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', price: 524.30, changePercent: -1.58, marketCap: 1_330_000_000_000, peRatio: 26, volume: 19_000_000, revenueGrowth: 25 },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', price: 172.40, changePercent: 1.89, marketCap: 2_140_000_000_000, peRatio: 23, volume: 28_000_000, revenueGrowth: 14 },
      { ticker: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Consumer', price: 192.50, changePercent: 0.42, marketCap: 2_020_000_000_000, peRatio: 44, volume: 42_000_000, revenueGrowth: 13 },
      { ticker: 'CRM', name: 'Salesforce, Inc.', sector: 'Technology', price: 298.40, changePercent: -0.40, marketCap: 289_000_000_000, peRatio: 68, volume: 8_000_000, revenueGrowth: 11 },
      { ticker: 'NOW', name: 'ServiceNow, Inc.', sector: 'Technology', price: 742.80, changePercent: 1.22, marketCap: 151_000_000_000, peRatio: 58, volume: 3_000_000, revenueGrowth: 21 },
      { ticker: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', price: 178.40, changePercent: 2.44, marketCap: 59_000_000_000, peRatio: undefined, volume: 7_000_000, revenueGrowth: 38 },
    ],
  },

  'small-cap with insider buying': {
    label: 'small-cap with insider buying',
    filters: [
      { field: 'marketCap', label: 'Market Cap < $10B' },
      { field: 'insiderBuying', label: 'Insider Buying: Recent' },
    ],
    results: [
      { ticker: 'CELH', name: 'Celsius Holdings, Inc.', sector: 'Consumer', price: 42.80, changePercent: 3.22, marketCap: 4_000_000_000, peRatio: undefined, volume: 5_000_000, revenueGrowth: 18 },
      { ticker: 'DUOL', name: 'Duolingo, Inc.', sector: 'Technology', price: 224.40, changePercent: 1.88, marketCap: 9_000_000_000, peRatio: undefined, volume: 1_200_000, revenueGrowth: 43 },
      { ticker: 'SMAR', name: 'Smartsheet Inc.', sector: 'Technology', price: 44.20, changePercent: 0.88, marketCap: 6_000_000_000, peRatio: undefined, volume: 2_000_000, revenueGrowth: 19 },
      { ticker: 'GTLB', name: 'GitLab Inc.', sector: 'Technology', price: 58.40, changePercent: 2.14, marketCap: 9_000_000_000, peRatio: undefined, volume: 1_800_000, revenueGrowth: 32 },
      { ticker: 'BILL', name: 'BILL Holdings, Inc.', sector: 'Technology', price: 62.40, changePercent: 1.22, marketCap: 6_000_000_000, peRatio: undefined, volume: 2_500_000, revenueGrowth: 16 },
      { ticker: 'TOST', name: 'Toast, Inc.', sector: 'Technology', price: 28.40, changePercent: 2.88, marketCap: 16_000_000_000, peRatio: undefined, volume: 4_000_000, revenueGrowth: 28 },
      { ticker: 'GLBE', name: 'Global-e Online, Ltd.', sector: 'Technology', price: 38.20, changePercent: 1.66, marketCap: 6_200_000_000, peRatio: undefined, volume: 900_000, revenueGrowth: 30 },
      { ticker: 'CWAN', name: 'Clearwater Analytics', sector: 'Technology', price: 22.80, changePercent: 0.92, marketCap: 5_400_000_000, peRatio: undefined, volume: 1_100_000, revenueGrowth: 21 },
    ],
  },

  'recovering from 52-week low': {
    label: 'recovering from 52-week low',
    filters: [
      { field: 'change52w', label: 'Near 52-Week Low' },
      { field: 'changePercent', label: 'Trending Up (1D)' },
    ],
    results: [
      { ticker: 'INTC', name: 'Intel Corporation', sector: 'Technology', price: 43.20, changePercent: 2.44, marketCap: 183_000_000_000, peRatio: 12, volume: 71_000_000, revenueGrowth: -8 },
      { ticker: 'PYPL', name: 'PayPal Holdings, Inc.', sector: 'Technology', price: 62.40, changePercent: 3.22, marketCap: 67_000_000_000, peRatio: 17, volume: 14_000_000, revenueGrowth: 8 },
      { ticker: 'ETSY', name: 'Etsy, Inc.', sector: 'Consumer', price: 58.40, changePercent: 2.88, marketCap: 7_000_000_000, peRatio: 18, volume: 4_000_000, revenueGrowth: -2 },
      { ticker: 'ROKU', name: 'Roku, Inc.', sector: 'Technology', price: 62.80, changePercent: 4.44, marketCap: 9_000_000_000, peRatio: undefined, volume: 6_000_000, revenueGrowth: 15 },
      { ticker: 'LYFT', name: 'Lyft, Inc.', sector: 'Technology', price: 14.20, changePercent: 3.88, marketCap: 5_000_000_000, peRatio: undefined, volume: 11_000_000, revenueGrowth: 28 },
      { ticker: 'UBER', name: 'Uber Technologies, Inc.', sector: 'Technology', price: 68.40, changePercent: 1.22, marketCap: 141_000_000_000, peRatio: 33, volume: 18_000_000, revenueGrowth: 15 },
      { ticker: 'DASH', name: 'DoorDash, Inc.', sector: 'Technology', price: 154.40, changePercent: 2.44, marketCap: 62_000_000_000, peRatio: undefined, volume: 5_000_000, revenueGrowth: 27 },
      { ticker: 'ABNB', name: 'Airbnb, Inc.', sector: 'Consumer', price: 142.40, changePercent: 1.88, marketCap: 89_000_000_000, peRatio: 16, volume: 7_000_000, revenueGrowth: 12 },
    ],
  },
};

// ─── Suggestion pills ────────────────────────────────────────

export const suggestionPills = [
  'Small-cap with insider buying',
  'High dividend yield above 4%',
  'Profitable tech under $50',
  'AI stocks with revenue growth',
  'Recovering from 52-week low',
  'Strong buybacks large-cap',
  'Healthcare below book value',
  'Defense stocks beating estimates',
];

// ─── Query matching ──────────────────────────────────────────

// Extract price threshold from query like "under $30", "below $50", "< $100"
function extractPriceFilter(query: string): { max?: number; min?: number } {
  const underMatch = query.match(/(?:under|below|less than|<)\s*\$?(\d+)/i);
  if (underMatch) return { max: Number(underMatch[1]) };
  const overMatch = query.match(/(?:over|above|more than|>)\s*\$?(\d+)/i);
  if (overMatch) return { min: Number(overMatch[1]) };
  return {};
}

export function matchScreenerQuery(query: string): {
  results: ScreenerRow[];
  filters: { field: string; label: string }[];
  description: string;
} | null {
  const q = query.toLowerCase();
  const priceFilter = extractPriceFilter(q);

  let bestMatch: { results: ScreenerRow[]; filters: { field: string; label: string }[]; label: string } | null = null;

  for (const [key, data] of Object.entries(screenerQueries)) {
    const keyWords = key.split(' ');
    const matchCount = keyWords.filter((w) => q.includes(w)).length;
    if (matchCount >= keyWords.length * 0.5) {
      bestMatch = { ...data };
      break;
    }
  }

  // Fallback to first query set
  if (!bestMatch) {
    const fallback = Object.values(screenerQueries)[0];
    bestMatch = { ...fallback };
  }

  let results = bestMatch.results;
  const filters = [...bestMatch.filters];

  // Apply price filter from the query to results
  if (priceFilter.max) {
    results = results.filter((r) => r.price <= priceFilter.max!);
    // Update or add price filter label
    const priceIdx = filters.findIndex((f) => f.field === 'price');
    if (priceIdx >= 0) {
      filters[priceIdx] = { field: 'price', label: `Price < $${priceFilter.max}` };
    } else {
      filters.unshift({ field: 'price', label: `Price < $${priceFilter.max}` });
    }
  }
  if (priceFilter.min) {
    results = results.filter((r) => r.price >= priceFilter.min!);
    const priceIdx = filters.findIndex((f) => f.field === 'price');
    if (priceIdx >= 0) {
      filters[priceIdx] = { field: 'price', label: `Price > $${priceFilter.min}` };
    } else {
      filters.unshift({ field: 'price', label: `Price > $${priceFilter.min}` });
    }
  }

  return {
    results,
    filters: filters.length > 0 ? filters : [{ field: 'query', label: `"${query}"` }],
    description: `${results.length} results for "${query}"`,
  };
}
