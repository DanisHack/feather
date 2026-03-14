export interface NewsItem {
  id: string;
  title: string;
  description: string;
  summary?: string;
  source: string;
  author?: string;
  publishedAt: Date;
  url: string;
  imageUrl?: string;
  tickers: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}
