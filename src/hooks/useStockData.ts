import { useState, useEffect, useCallback, useRef } from 'react';
import type { Stock, Quote, KeyStats } from '../types';
import { polygon } from '../lib/polygon';

type FinancialField = { value: number };
type FinancialStatement = Record<string, FinancialField>;

function deriveKeyStats(financials: Record<string, unknown>[]): KeyStats {
  if (financials.length === 0) return {};

  const latest = financials[0] as {
    financials?: {
      income_statement?: FinancialStatement;
      balance_sheet?: FinancialStatement;
    };
  };
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
}

/**
 * Stale-while-revalidate pattern:
 * 1. If cached data exists → show instantly (no loading flash)
 * 2. Fire fresh fetches in parallel → update silently
 * 3. Critical path = quote + details only (2 calls)
 * 4. Financials deferred — lower priority, doesn't block header/chart
 */
export function useStockData(ticker: string) {
  const prevTickerRef = useRef('');

  // Initialize from cache for instant display on return visits
  const [stock, setStock] = useState<Stock | null>(() =>
    ticker ? polygon.getCachedDetails(ticker) : null
  );
  const [quote, setQuote] = useState<Quote | null>(() =>
    ticker ? polygon.getCachedQuote(ticker) : null
  );
  const [keyStats, setKeyStats] = useState<KeyStats | null>(null);
  const [financials, setFinancials] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(() =>
    !(ticker && polygon.getCachedQuote(ticker))
  );
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!ticker) return;

    // Check cache — if we have quote cached, skip loading state entirely
    const cachedQuote = polygon.getCachedQuote(ticker);
    const cachedDetails = polygon.getCachedDetails(ticker);

    if (cachedQuote) {
      setQuote(cachedQuote);
      setLoading(false);
    }
    if (cachedDetails) {
      setStock(cachedDetails);
    }
    if (!cachedQuote) {
      setLoading(true);
    }

    setError(null);

    // Critical path: quote + details (2 calls, parallel)
    const quotePromise = polygon.getQuote(ticker).then((q) => {
      setQuote(q);
      setLoading(false);
    });

    const detailsPromise = polygon.getTickerDetails(ticker).then((d) => {
      if (d) setStock(d);
    });

    // Deferred: financials (lower priority, doesn't block first paint)
    const financialsPromise = polygon.getFinancials(ticker).then((f) => {
      setFinancials(f);
      setKeyStats(deriveKeyStats(f));
    });

    const results = await Promise.allSettled([quotePromise, detailsPromise, financialsPromise]);

    const quoteResult = results[0];
    if (quoteResult.status === 'rejected') {
      setError(quoteResult.reason instanceof Error ? quoteResult.reason.message : 'Failed to fetch quote');
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    // Only reset state when ticker actually changes
    if (prevTickerRef.current !== ticker) {
      const cachedQ = ticker ? polygon.getCachedQuote(ticker) : null;
      const cachedD = ticker ? polygon.getCachedDetails(ticker) : null;

      setStock(cachedD);
      setQuote(cachedQ);
      setKeyStats(null);
      setFinancials(null);
      setLoading(!cachedQ);

      prevTickerRef.current = ticker;
    }
    fetch();
  }, [fetch, ticker]);

  return { stock, quote, keyStats, financials, loading, error };
}
