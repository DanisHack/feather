import { useState, useEffect } from 'react';
import type { NewsItem } from '../types';
import { polygon } from '../lib/polygon';
import { mockNews } from '../mocks/news';

const hasApiKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);

export function useNews(tickers?: string[]) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (!hasApiKey) {
      // Fall back to mock data
      const timeout = setTimeout(() => {
        if (cancelled) return;
        let filtered = mockNews;
        if (tickers && tickers.length > 0) {
          filtered = mockNews.filter((n) =>
            n.tickers.some((t) => tickers.includes(t))
          );
        }
        setNews(filtered);
        setError(null);
        setLoading(false);
      }, 200);
      return () => { cancelled = true; clearTimeout(timeout); };
    }

    polygon
      .getNews(tickers, 20)
      .then((result) => {
        if (!cancelled) {
          setNews(result);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Fall back to mock data silently on error
          let filtered = mockNews;
          if (tickers && tickers.length > 0) {
            filtered = mockNews.filter((n) =>
              n.tickers.some((t) => tickers.includes(t))
            );
          }
          setNews(filtered);
          setError(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickers?.join(',')]);

  return { news, loading, error };
}
