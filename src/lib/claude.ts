import { api } from './api';
import type { NewsItem, ScreenerFilter } from '../types';

export const claudeClient = {
  async generateMorningBrief(
    news: NewsItem[],
    holdings: string[]
  ): Promise<string> {
    const { data } = await api.post('/api/ai/morning-brief', {
      news: news.map((n) => ({
        title: n.title,
        description: n.description,
        source: n.source,
        tickers: n.tickers,
        publishedAt: n.publishedAt,
      })),
      holdings,
    });
    return data.brief;
  },

  async summarizeNews(article: NewsItem): Promise<string> {
    const { data } = await api.post('/api/ai/summarize', {
      title: article.title,
      description: article.description,
      source: article.source,
    });
    return data.summary;
  },

  async parseScreenerQuery(query: string): Promise<ScreenerFilter[]> {
    const { data } = await api.post('/api/ai/parse-screener', { query });
    return data.filters;
  },

  async analyzeEarnings(
    pressRelease: string,
    ticker: string
  ): Promise<{
    summary: string;
    keyPoints: string[];
    beat: boolean;
    guidance: string;
  }> {
    const { data } = await api.post('/api/ai/analyze-earnings', {
      pressRelease,
      ticker,
    });
    return data;
  },

  async analyzeStock(
    ticker: string,
    financials: Record<string, unknown>,
    news: NewsItem[]
  ): Promise<string> {
    const { data } = await api.post('/api/ai/analyze-stock', {
      ticker,
      financials,
      news: news.map((n) => ({
        title: n.title,
        description: n.description,
        tickers: n.tickers,
      })),
    });
    return data.analysis;
  },
};
