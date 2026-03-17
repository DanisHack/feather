import { useState, useEffect } from 'react';
import type { EarningsEvent } from '../types';
import { mockEarnings } from '../mocks/earnings';
import { polygon } from '../lib/polygon';

const hasApiKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);

export function useEarnings(from?: Date, to?: Date) {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Start with mock calendar immediately
    let filtered = mockEarnings;
    if (from) filtered = filtered.filter((e) => e.reportDate >= from);
    if (to) filtered = filtered.filter((e) => e.reportDate <= to);

    setEarnings(filtered);
    setLoading(false);

    if (!hasApiKey) return;

    // Enrich reported events with real financial data in background
    const reported = filtered.filter((e) => e.status === 'reported');
    if (reported.length === 0) return;

    const tickers = [...new Set(reported.map((e) => e.ticker))];

    Promise.allSettled(tickers.map((t) => polygon.getFinancials(t)))
      .then((results) => {
        if (cancelled) return;

        type FinancialField = { value: number };
        type FinancialStatement = Record<string, FinancialField>;

        const financialsMap = new Map<string, { eps?: number; revenue?: number }>();
        tickers.forEach((ticker, i) => {
          const result = results[i];
          if (result.status !== 'fulfilled' || result.value.length === 0) return;

          const latest = result.value[0] as {
            financials?: { income_statement?: FinancialStatement };
          };
          const income = latest?.financials?.income_statement;
          if (!income) return;

          financialsMap.set(ticker, {
            eps: income.basic_earnings_per_share?.value,
            revenue: income.revenues?.value,
          });
        });

        if (financialsMap.size === 0) return;

        const enriched = filtered.map((event) => {
          if (event.status !== 'reported') return event;
          const data = financialsMap.get(event.ticker);
          if (!data) return event;

          return {
            ...event,
            ...(data.eps != null ? { epsActual: data.eps } : {}),
            ...(data.revenue != null ? { revenueActual: data.revenue } : {}),
          };
        });

        setEarnings(enriched);
      })
      .catch(() => {
        // Silent fail — mock data stays
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from?.getTime(), to?.getTime()]);

  return { earnings, loading, error };
}
