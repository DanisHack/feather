import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { Quote, Stock, OHLC, KeyStats, NewsItem, ScreenerFilter, ScreenerResult, EarningsEvent } from '../types';
import { POLYGON_BASE_URL } from './constants';

const apiKey = import.meta.env.VITE_POLYGON_API_KEY ?? '';

const client = axios.create({
  baseURL: POLYGON_BASE_URL,
  params: { apiKey },
});

// ─── Retry interceptor (429 rate limit) ────────────────────
const MAX_RETRIES = 3;

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (!config) return Promise.reject(error);

    const status = error.response?.status;

    // 429 — rate limited, retry with exponential backoff
    if (status === 429) {
      const retryCount = config._retryCount ?? 0;
      if (retryCount < MAX_RETRIES) {
        config._retryCount = retryCount + 1;
        const delay = 1000 * 2 ** retryCount; // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
        return client(config);
      }
      return Promise.reject(new Error('Rate limited — too many requests. Try again shortly.'));
    }

    // 404 — not found, return null results
    if (status === 404) {
      return { data: { results: null, ticker: null, tickers: null } };
    }

    // 401/403 — invalid API key
    if (status === 401 || status === 403) {
      return Promise.reject(new Error('Invalid Polygon API key'));
    }

    // Network error
    if (!error.response) {
      return Promise.reject(new Error('Network error — check your connection'));
    }

    return Promise.reject(error);
  }
);

// ─── Response Cache ─────────────────────────────────────────
// Simple in-memory cache with TTL. Makes return visits instant
// and avoids duplicate network calls within the same session.

const _cache = new Map<string, { data: unknown; ts: number }>();

const TTL = {
  quote: 2 * 60_000,        // 2 min  — price changes daily on free tier
  details: 30 * 60_000,     // 30 min — company info rarely changes
  financials: 30 * 60_000,  // 30 min — quarterly data
  aggregates: 5 * 60_000,   // 5 min  — chart data
  news: 5 * 60_000,         // 5 min
};

function _get<T>(key: string, ttl: number): T | null {
  const e = _cache.get(key);
  return e && Date.now() - e.ts < ttl ? (e.data as T) : null;
}

function _set(key: string, data: unknown): void {
  _cache.set(key, { data, ts: Date.now() });
}

// ─── Mappers ───────────────────────────────────────────────

function mapQuote(
  bar: Record<string, unknown>,
  prevDay?: Record<string, unknown>,
  tickerStr?: string,
): Quote {
  const close = (bar.c as number) ?? 0;
  const open = (bar.o as number) ?? 0;
  const prevClose = prevDay ? ((prevDay.c as number) ?? 0) : 0;
  // Price = close of the bar. For prev-day endpoint this is last close.
  const price = close > 0 ? close : (prevClose > 0 ? prevClose : 0);
  // Change calculated from open to close (intraday change of last trading day)
  const basePrice = prevClose > 0 ? prevClose : open;

  return {
    ticker: tickerStr ?? (bar.T as string) ?? (bar.ticker as string) ?? '',
    price,
    open,
    high: (bar.h as number) ?? 0,
    low: (bar.l as number) ?? 0,
    close,
    volume: (bar.v as number) ?? 0,
    vwap: (bar.vw as number) ?? 0,
    change: basePrice > 0 ? Math.round((price - basePrice) * 100) / 100 : 0,
    changePercent:
      basePrice > 0
        ? Math.round(((price - basePrice) / basePrice) * 10000) / 100
        : 0,
    timestamp: (bar.t as number) ?? Date.now(),
  };
}

interface SnapshotResult {
  quote: Quote;
  prevClose: number;
  marketCap?: number;
  name?: string;
}

// ─── API Methods ───────────────────────────────────────────

export const polygon = {
  // ── Synchronous cache reads (for instant UI init) ──────
  getCachedQuote(ticker: string): Quote | null {
    return _get<Quote>(`q:${ticker}`, TTL.quote);
  },
  getCachedDetails(ticker: string): Stock | null {
    return _get<Stock | null>(`d:${ticker}`, TTL.details);
  },

  // Uses /v2/aggs/ticker/{ticker}/prev — works on free tier
  async getQuote(ticker: string): Promise<Quote> {
    const ck = `q:${ticker}`;
    const hit = _get<Quote>(ck, TTL.quote);
    if (hit) return hit;

    const { data } = await client.get(`/v2/aggs/ticker/${ticker}/prev`);
    const results = data.results;
    if (!results || results.length === 0) {
      return mapQuote({}, undefined, ticker);
    }
    const bar = results[0] as Record<string, unknown>;
    const quote = mapQuote(bar, undefined, ticker);
    _set(ck, quote);
    return quote;
  },

  // Fetch previous close for multiple tickers in parallel
  async getQuotes(tickers: string[]): Promise<Quote[]> {
    if (tickers.length === 0) return [];
    const results = await Promise.allSettled(
      tickers.map((t) => polygon.getQuote(t))
    );
    return results
      .filter((r): r is PromiseFulfilledResult<Quote> => r.status === 'fulfilled')
      .map((r) => r.value);
  },

  // Previous close as snapshot (free tier compatible)
  async getSnapshot(ticker: string): Promise<SnapshotResult | null> {
    const quote = await polygon.getQuote(ticker);
    if (quote.price === 0) return null;
    return {
      quote,
      prevClose: quote.close, // prev day close IS the price
    };
  },

  // Batch snapshots via parallel prev-close calls
  async getSnapshots(tickers: string[]): Promise<SnapshotResult[]> {
    if (tickers.length === 0) return [];
    const quotes = await polygon.getQuotes(tickers);
    return quotes.map((q) => ({
      quote: q,
      prevClose: q.close,
    }));
  },

  async getAggregates(
    ticker: string,
    timespan: string,
    from: string,
    to: string,
    multiplier = 1
  ): Promise<OHLC[]> {
    const ck = `a:${ticker}:${timespan}:${multiplier}:${from}:${to}`;
    const hit = _get<OHLC[]>(ck, TTL.aggregates);
    if (hit) return hit;

    const { data } = await client.get(
      `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`,
      { params: { adjusted: true, sort: 'asc', limit: 5000 } }
    );
    const bars: OHLC[] = (data.results ?? []).map((r: Record<string, number>) => ({
      timestamp: r.t,
      open: r.o,
      high: r.h,
      low: r.l,
      close: r.c,
      volume: r.v,
    }));
    _set(ck, bars);
    return bars;
  },

  async getTickerDetails(ticker: string): Promise<Stock | null> {
    const ck = `d:${ticker}`;
    const hit = _get<Stock | null>(ck, TTL.details);
    if (hit) return hit;

    const { data } = await client.get(`/v3/reference/tickers/${ticker}`);
    const r = data.results;
    if (!r) return null;
    const stock: Stock = {
      ticker: r.ticker ?? ticker,
      name: r.name ?? '',
      description: r.description,
      exchange: r.primary_exchange ?? '',
      sector: r.sic_description,
      industry: r.sic_description,
      marketCap: r.market_cap,
      employees: r.total_employees,
      website: r.homepage_url,
      logo: r.branding?.icon_url
        ? `${r.branding.icon_url}?apiKey=${apiKey}`
        : undefined,
    };
    _set(ck, stock);
    return stock;
  },

  async getFinancials(ticker: string): Promise<Record<string, unknown>[]> {
    const ck = `f:${ticker}`;
    const hit = _get<Record<string, unknown>[]>(ck, TTL.financials);
    if (hit) return hit;

    const { data } = await client.get('/vX/reference/financials', {
      params: { ticker, limit: 4, sort: 'period_of_report_date', order: 'desc' },
    });
    const results = data.results ?? [];
    _set(ck, results);
    return results;
  },

  async getKeyStats(ticker: string): Promise<KeyStats> {
    const financials = await polygon.getFinancials(ticker);
    if (financials.length === 0) return {};

    type FinancialField = { value: number };
    type FinancialStatement = Record<string, FinancialField>;
    const latest = financials[0] as { financials?: { income_statement?: FinancialStatement; balance_sheet?: FinancialStatement } };
    const income = latest?.financials?.income_statement ?? {};
    const balance = latest?.financials?.balance_sheet ?? {};

    const revenue = income.revenues?.value ?? 0;
    const netIncome = income.net_income_loss?.value ?? 0;
    const grossProfit = income.gross_profit?.value ?? 0;
    const operatingIncome = income.operating_income_loss?.value ?? 0;
    const totalEquity = balance.equity?.value ?? 1;
    const totalAssets = balance.assets?.value ?? 1;
    const totalDebt = balance.long_term_debt?.value ?? 0;

    return {
      grossMargin: revenue > 0 ? grossProfit / revenue : undefined,
      operatingMargin: revenue > 0 ? operatingIncome / revenue : undefined,
      netMargin: revenue > 0 ? netIncome / revenue : undefined,
      roe: totalEquity > 0 ? netIncome / totalEquity : undefined,
      roa: totalAssets > 0 ? netIncome / totalAssets : undefined,
      debtEquity: totalEquity > 0 ? totalDebt / totalEquity : undefined,
    };
  },

  async getNews(tickers?: string[], limit = 20): Promise<NewsItem[]> {
    const ck = `n:${tickers?.join(',') ?? 'all'}:${limit}`;
    const hit = _get<NewsItem[]>(ck, TTL.news);
    if (hit) return hit;

    const params: Record<string, unknown> = { limit, order: 'desc', sort: 'published_utc' };
    if (tickers && tickers.length > 0) {
      params['ticker'] = tickers.join(',');
    }
    const { data } = await client.get('/v2/reference/news', { params });
    const items: NewsItem[] = (data.results ?? []).map((n: Record<string, unknown>) => ({
      id: (n.id as string) ?? crypto.randomUUID(),
      title: (n.title as string) ?? '',
      description: (n.description as string) ?? '',
      source: (n.publisher as Record<string, string>)?.name ?? '',
      author: n.author as string,
      publishedAt: new Date(n.published_utc as string),
      url: (n.article_url as string) ?? '',
      imageUrl: n.image_url as string,
      tickers: (n.tickers as string[]) ?? [],
      sentiment: undefined,
    }));
    _set(ck, items);
    return items;
  },

  async searchTickers(query: string, limit = 10): Promise<{ ticker: string; name: string; exchange: string }[]> {
    const { data } = await client.get('/v3/reference/tickers', {
      params: { search: query, active: true, limit, market: 'stocks' },
    });
    return (data.results ?? []).map((r: Record<string, string>) => ({
      ticker: r.ticker ?? '',
      name: r.name ?? '',
      exchange: r.primary_exchange ?? '',
    }));
  },

  async getScreenerResults(filters: ScreenerFilter[]): Promise<ScreenerResult[]> {
    const { data } = await client.get('/v2/snapshot/locale/us/markets/stocks/tickers');
    const allTickers = data.tickers ?? [];

    return allTickers
      .filter((t: Record<string, unknown>) => {
        return filters.every((f) => {
          const day = (t.day ?? {}) as Record<string, number>;
          const val = day[f.field];
          if (val == null) return false;
          switch (f.operator) {
            case 'gt': return val > (f.value as number);
            case 'lt': return val < (f.value as number);
            case 'eq': return val === f.value;
            default: return true;
          }
        });
      })
      .slice(0, 50)
      .map((t: Record<string, Record<string, number> & { ticker: string }>) => ({
        ticker: t.ticker as unknown as string,
        name: '',
        price: t.day?.c ?? 0,
        changePercent:
          t.day?.o > 0
            ? ((t.day.c - t.day.o) / t.day.o) * 100
            : 0,
        volume: t.day?.v ?? 0,
      }));
  },

  async getEarningsCalendar(_from: Date, _to: Date): Promise<EarningsEvent[]> {
    // Polygon doesn't have a direct earnings calendar endpoint
    // TODO: wire real data via /vX/reference/financials or third-party calendar
    return [];
  },

  async getInsiderTransactions(ticker: string): Promise<Record<string, unknown>[]> {
    const { data } = await client.get(`/v2/reference/news`, {
      params: { ticker, limit: 10, type: 'insider' },
    });
    return data.results ?? [];
  },

  async getMarketStatus(): Promise<{ market: string; serverTime: string }> {
    const { data } = await client.get('/v1/marketstatus/now');
    return {
      market: data.market ?? 'closed',
      serverTime: data.serverTime ?? new Date().toISOString(),
    };
  },

  async getIndicesSnapshot(): Promise<Quote[]> {
    const tickers = ['I:SPX', 'I:NDX', 'I:DJI', 'I:RUT'];
    return polygon.getQuotes(tickers);
  },
};

export type { SnapshotResult };
