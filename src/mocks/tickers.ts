export interface MockTicker {
  ticker: string;
  name: string;
  exchange: string;
}

export const mockTickers: MockTicker[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ' },
  { ticker: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
  { ticker: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ' },
  { ticker: 'ASML', name: 'ASML Holding N.V.', exchange: 'NASDAQ' },
  { ticker: 'AMD', name: 'Advanced Micro Devices, Inc.', exchange: 'NASDAQ' },
  { ticker: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ' },
  { ticker: 'CRM', name: 'Salesforce, Inc.', exchange: 'NYSE' },
  { ticker: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE' },
  { ticker: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ' },
  { ticker: 'QCOM', name: 'Qualcomm Incorporated', exchange: 'NASDAQ' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
  { ticker: 'BAC', name: 'Bank of America Corporation', exchange: 'NYSE' },
  { ticker: 'GS', name: 'Goldman Sachs Group, Inc.', exchange: 'NYSE' },
  { ticker: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
  { ticker: 'MA', name: 'Mastercard Incorporated', exchange: 'NYSE' },
];

export function searchTickers(query: string): MockTicker[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];

  return mockTickers.filter(
    (t) =>
      t.ticker.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q)
  );
}
