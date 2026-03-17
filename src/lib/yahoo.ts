import axios from 'axios';
import { API_BASE_URL } from './constants';

export interface IndexQuote {
  ticker: string;   // Polygon-style ticker (I:SPX)
  price: number;
  change: number;
  changePercent: number;
}

/**
 * Fetch index quotes from our server (powered by Yahoo Finance).
 * Returns quotes for all major indices — no API key needed.
 */
async function getIndexQuotes(): Promise<IndexQuote[]> {
  try {
    const { data } = await axios.get<{ quotes: IndexQuote[] }>(
      `${API_BASE_URL}/api/market/indices`,
      { timeout: 5000 }
    );
    return data.quotes ?? [];
  } catch {
    return [];
  }
}

export const yahooIndices = {
  getIndexQuotes,
};
