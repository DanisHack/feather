import { Router } from 'express';
import YahooFinance from 'yahoo-finance2';

export const marketRouter = Router();

const yf = new YahooFinance();

// ─── Index Quotes ────────────────────────────────────────────

const INDICES: Record<string, string> = {
  '^GSPC': 'I:SPX',
  '^DJI': 'I:DJI',
  '^IXIC': 'I:NDX',
  '^RUT': 'I:RUT',
  '^VIX': 'I:VIX',
};

const YAHOO_SYMBOLS = Object.keys(INDICES);

marketRouter.get('/indices', async (_req, res) => {
  try {
    const results = await Promise.allSettled(
      YAHOO_SYMBOLS.map((symbol) => yf.quote(symbol))
    );

    const quotes = results
      .map((r, i) => {
        if (r.status !== 'fulfilled' || !r.value) return null;
        const q = r.value;
        const price = q.regularMarketPrice ?? 0;
        const change = q.regularMarketChange ?? 0;
        const changePercent = q.regularMarketChangePercent ?? 0;
        if (price === 0) return null;

        return {
          ticker: INDICES[YAHOO_SYMBOLS[i]],
          price: Math.round(price * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
        };
      })
      .filter(Boolean);

    res.json({ quotes });
  } catch (err) {
    console.error('[Market] Failed to fetch indices:', err);
    res.status(500).json({ quotes: [], error: 'Failed to fetch index data' });
  }
});

// ─── Stock Screener ──────────────────────────────────────────

// Sector mapping — yf.quote() doesn't return sector, so we map it statically
const SECTOR_MAP: Record<string, string> = {
  // Technology
  AAPL: 'technology', MSFT: 'technology', GOOGL: 'technology', AMZN: 'technology', META: 'technology',
  NVDA: 'technology', TSLA: 'technology', AVGO: 'technology', ORCL: 'technology', CRM: 'technology',
  AMD: 'technology', ADBE: 'technology', INTC: 'technology', CSCO: 'technology', QCOM: 'technology',
  TXN: 'technology', NOW: 'technology', INTU: 'technology', AMAT: 'technology', MU: 'technology',
  LRCX: 'technology', SNPS: 'technology', CDNS: 'technology', KLAC: 'technology', MRVL: 'technology',
  PANW: 'technology', CRWD: 'technology', SNOW: 'technology', DDOG: 'technology', ZS: 'technology',
  NET: 'technology', PLTR: 'technology', SHOP: 'technology', SQ: 'technology', COIN: 'technology',
  HOOD: 'technology', PATH: 'technology', SNAP: 'technology', PINS: 'technology', RBLX: 'technology',
  U: 'technology', TWLO: 'technology', OKTA: 'technology', MDB: 'technology', BILL: 'technology',
  GTLB: 'technology', DUOL: 'technology', SMAR: 'technology',
  // Financials
  JPM: 'financial', V: 'financial', MA: 'financial', BAC: 'financial', WFC: 'financial',
  GS: 'financial', MS: 'financial', BLK: 'financial', SCHW: 'financial', AXP: 'financial',
  C: 'financial', USB: 'financial', PNC: 'financial', TFC: 'financial', BK: 'financial',
  COF: 'financial', PYPL: 'financial', FIS: 'financial', FISV: 'financial', AFRM: 'financial',
  // Healthcare
  UNH: 'healthcare', JNJ: 'healthcare', LLY: 'healthcare', ABBV: 'healthcare', MRK: 'healthcare',
  PFE: 'healthcare', TMO: 'healthcare', ABT: 'healthcare', DHR: 'healthcare', BMY: 'healthcare',
  AMGN: 'healthcare', GILD: 'healthcare', ISRG: 'healthcare', CVS: 'healthcare', CI: 'healthcare',
  ELV: 'healthcare', HCA: 'healthcare', DXCM: 'healthcare', VEEV: 'healthcare', ZTS: 'healthcare',
  // Consumer Discretionary
  HD: 'consumer discretionary', MCD: 'consumer discretionary', NKE: 'consumer discretionary',
  LOW: 'consumer discretionary', SBUX: 'consumer discretionary', TJX: 'consumer discretionary',
  BKNG: 'consumer discretionary', CMG: 'consumer discretionary', ABNB: 'consumer discretionary',
  LULU: 'consumer discretionary', ETSY: 'consumer discretionary', DASH: 'consumer discretionary',
  UBER: 'consumer discretionary', LYFT: 'consumer discretionary', RIVN: 'consumer discretionary',
  LCID: 'consumer discretionary',
  // Consumer Staples
  PG: 'consumer staples', KO: 'consumer staples', PEP: 'consumer staples', COST: 'consumer staples',
  WMT: 'consumer staples', PM: 'consumer staples', MO: 'consumer staples', CL: 'consumer staples',
  KHC: 'consumer staples', GIS: 'consumer staples',
  // Energy
  XOM: 'energy', CVX: 'energy', COP: 'energy', SLB: 'energy', EOG: 'energy',
  MPC: 'energy', PSX: 'energy', VLO: 'energy', OXY: 'energy', HAL: 'energy',
  // Industrials
  CAT: 'industrials', DE: 'industrials', HON: 'industrials', UPS: 'industrials', BA: 'industrials',
  RTX: 'industrials', LMT: 'industrials', GE: 'industrials', MMM: 'industrials', WM: 'industrials',
  // Communication Services
  DIS: 'communication', NFLX: 'communication', T: 'communication', VZ: 'communication',
  TMUS: 'communication', CMCSA: 'communication',
  // Utilities / Real Estate / Materials
  NEE: 'utilities', DUK: 'utilities', SO: 'utilities',
  AMT: 'real estate', PLD: 'real estate', SPG: 'real estate',
  LIN: 'materials', APD: 'materials', FCX: 'materials', NEM: 'materials',
};

// Universe: ~150 widely-held US stocks across all sectors
const STOCK_UNIVERSE = [
  // Tech
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AVGO', 'ORCL', 'CRM',
  'AMD', 'ADBE', 'INTC', 'CSCO', 'QCOM', 'TXN', 'NOW', 'INTU', 'AMAT', 'MU',
  'LRCX', 'SNPS', 'CDNS', 'KLAC', 'MRVL', 'PANW', 'CRWD', 'SNOW', 'DDOG', 'ZS',
  'NET', 'PLTR', 'SHOP', 'SQ', 'COIN', 'HOOD', 'PATH', 'SNAP', 'PINS', 'RBLX',
  'U', 'TWLO', 'OKTA', 'MDB', 'BILL', 'GTLB', 'DUOL', 'SMAR',
  // Financials
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'SCHW', 'AXP',
  'C', 'USB', 'PNC', 'TFC', 'BK', 'COF', 'PYPL', 'FIS', 'FISV', 'AFRM',
  // Healthcare
  'UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE', 'TMO', 'ABT', 'DHR', 'BMY',
  'AMGN', 'GILD', 'ISRG', 'CVS', 'CI', 'ELV', 'HCA', 'DXCM', 'VEEV', 'ZTS',
  // Consumer Discretionary
  'HD', 'MCD', 'NKE', 'LOW', 'SBUX', 'TJX', 'BKNG', 'CMG', 'ABNB', 'LULU',
  'ETSY', 'DASH', 'UBER', 'LYFT', 'RIVN', 'LCID',
  // Consumer Staples
  'PG', 'KO', 'PEP', 'COST', 'WMT', 'PM', 'MO', 'CL', 'KHC', 'GIS',
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL',
  // Industrials
  'CAT', 'DE', 'HON', 'UPS', 'BA', 'RTX', 'LMT', 'GE', 'MMM', 'WM',
  // Communication
  'DIS', 'NFLX', 'T', 'VZ', 'TMUS', 'CMCSA',
  // Utilities / Real Estate / Materials
  'NEE', 'DUK', 'SO', 'AMT', 'PLD', 'SPG', 'LIN', 'APD', 'FCX', 'NEM',
];

interface CachedQuote {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  changePercent: number;
  marketCap: number;
  peRatio: number | undefined;
  volume: number;
  dividendYield: number | undefined;
  fiftyTwoWeekHigh: number | undefined;
  fiftyTwoWeekLow: number | undefined;
}

let quoteCache: CachedQuote[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cacheLoading = false;

async function refreshCache(): Promise<CachedQuote[]> {
  if (cacheLoading) {
    // Wait for existing refresh
    while (cacheLoading) {
      await new Promise((r) => setTimeout(r, 200));
    }
    return quoteCache;
  }

  if (Date.now() - cacheTimestamp < CACHE_TTL && quoteCache.length > 0) {
    return quoteCache;
  }

  cacheLoading = true;
  console.log('[Screener] Refreshing stock universe cache...');

  try {
    // Fetch in batches of 30 to avoid rate limits
    const BATCH_SIZE = 30;
    const allQuotes: CachedQuote[] = [];

    for (let i = 0; i < STOCK_UNIVERSE.length; i += BATCH_SIZE) {
      const batch = STOCK_UNIVERSE.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((symbol) => yf.quote(symbol))
      );

      for (const r of results) {
        if (r.status !== 'fulfilled' || !r.value) continue;
        const q = r.value;
        if (!q.regularMarketPrice || q.regularMarketPrice === 0) continue;

        allQuotes.push({
          ticker: q.symbol ?? '',
          name: q.shortName ?? q.longName ?? '',
          sector: SECTOR_MAP[q.symbol ?? ''] ?? '',
          price: Math.round((q.regularMarketPrice ?? 0) * 100) / 100,
          changePercent: Math.round((q.regularMarketChangePercent ?? 0) * 100) / 100,
          marketCap: q.marketCap ?? 0,
          peRatio: q.trailingPE ? Math.round(q.trailingPE * 10) / 10 : undefined,
          volume: q.regularMarketVolume ?? 0,
          dividendYield: q.dividendYield ? Math.round(q.dividendYield * 100) / 100 : undefined,
          fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: q.fiftyTwoWeekLow,
        });
      }
    }

    quoteCache = allQuotes;
    cacheTimestamp = Date.now();
    console.log(`[Screener] Cached ${allQuotes.length} stocks`);
  } catch (err) {
    console.error('[Screener] Cache refresh failed:', err);
  } finally {
    cacheLoading = false;
  }

  return quoteCache;
}

interface ScreenerFilter {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'between' | 'in';
  value: number | string | number[];
}

function applyFilter(stock: CachedQuote, filter: ScreenerFilter): boolean {
  const { field, operator, value } = filter;

  let fieldValue: number | string | undefined;
  switch (field) {
    case 'price': fieldValue = stock.price; break;
    case 'marketCap': fieldValue = stock.marketCap; break;
    case 'peRatio': fieldValue = stock.peRatio; break;
    case 'changePercent': fieldValue = stock.changePercent; break;
    case 'volume': fieldValue = stock.volume; break;
    case 'dividendYield': fieldValue = stock.dividendYield; break;
    case 'sector': fieldValue = stock.sector?.toLowerCase(); break;
    default: return true; // Unknown field, don't filter
  }

  if (fieldValue === undefined || fieldValue === null) return false;

  switch (operator) {
    case 'gt': return typeof fieldValue === 'number' && fieldValue > (value as number);
    case 'lt': return typeof fieldValue === 'number' && fieldValue < (value as number);
    case 'eq': return fieldValue === value;
    case 'between': {
      const [min, max] = value as number[];
      return typeof fieldValue === 'number' && fieldValue >= min && fieldValue <= max;
    }
    case 'in': {
      if (typeof value === 'string') return String(fieldValue).includes(value.toLowerCase());
      if (Array.isArray(value)) return value.includes(fieldValue);
      return false;
    }
    default: return true;
  }
}

// POST /api/market/screen — real-time stock screener
marketRouter.post('/screen', async (req, res) => {
  try {
    const filters: ScreenerFilter[] = req.body.filters ?? [];
    const stocks = await refreshCache();

    if (stocks.length === 0) {
      res.status(503).json({ results: [], error: 'Stock data not available' });
      return;
    }

    let results = stocks;

    // Apply each filter
    for (const filter of filters) {
      results = results.filter((s) => applyFilter(s, filter));
    }

    // Sort by market cap descending (most relevant first)
    results.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));

    // Limit to 50 results
    const limited = results.slice(0, 50).map((s) => ({
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      price: s.price,
      changePercent: s.changePercent,
      marketCap: s.marketCap,
      peRatio: s.peRatio,
      volume: s.volume,
    }));

    res.json({ results: limited, total: results.length });
  } catch (err) {
    console.error('[Screener] Screen failed:', err);
    res.status(500).json({ results: [], error: 'Screener failed' });
  }
});
