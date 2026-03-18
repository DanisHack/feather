import { Router } from 'express';
import axios from 'axios';

export const analysisRouter = Router();

const FMP_KEY = process.env.FMP_API_KEY ?? '';
const hasFmpKey = Boolean(FMP_KEY);
const FMP_BASE = 'https://financialmodelingprep.com';

if (!hasFmpKey) {
  console.warn('[Analysis] FMP_API_KEY not set — analysis endpoints will return mock data.');
}

// ─── In-memory cache (30 min TTL) ─────────────────────────

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30 * 60_000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, ts: Date.now() });
}

// ─── Grade → consensus derivation ─────────────────────────

interface FmpGrade {
  symbol: string;
  date: string;
  gradingCompany: string;
  newGrade: string;
  previousGrade: string;
}

function deriveConsensus(grades: FmpGrade[]) {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recent = grades.filter((g) => new Date(g.date) >= threeMonthsAgo);

  const counts = { strongBuy: 0, buy: 0, hold: 0, sell: 0, strongSell: 0 };

  for (const g of recent) {
    const grade = g.newGrade.toLowerCase();
    if (grade.includes('strong buy') || grade === 'outperform' || grade === 'overweight') {
      counts.strongBuy++;
    } else if (grade.includes('buy') || grade === 'positive' || grade === 'accumulate') {
      counts.buy++;
    } else if (grade.includes('hold') || grade === 'neutral' || grade === 'equal-weight' || grade === 'market perform' || grade === 'peer perform' || grade === 'sector perform' || grade === 'in-line') {
      counts.hold++;
    } else if (grade.includes('strong sell') || grade === 'underperform' || grade === 'underweight') {
      counts.strongSell++;
    } else if (grade.includes('sell') || grade === 'negative' || grade === 'reduce') {
      counts.sell++;
    } else {
      // Default unknown grades to hold
      counts.hold++;
    }
  }

  const total = counts.strongBuy + counts.buy + counts.hold + counts.sell + counts.strongSell;
  const buyTotal = counts.strongBuy + counts.buy;
  const sellTotal = counts.sell + counts.strongSell;

  let consensus: string;
  if (total === 0) consensus = 'Hold';
  else if (buyTotal / total >= 0.7) consensus = counts.strongBuy > counts.buy ? 'Strong Buy' : 'Buy';
  else if (sellTotal / total >= 0.7) consensus = counts.strongSell > counts.sell ? 'Strong Sell' : 'Sell';
  else if (buyTotal > sellTotal) consensus = 'Buy';
  else if (sellTotal > buyTotal) consensus = 'Sell';
  else consensus = 'Hold';

  return { ...counts, total, consensus };
}

function mapGradeAction(prev: string, next: string): 'upgrade' | 'downgrade' | 'maintain' | 'init' {
  if (!prev) return 'init';

  const gradeRank: Record<string, number> = {
    'strong sell': 1, sell: 2, underperform: 2, underweight: 2, reduce: 2, negative: 2,
    hold: 3, neutral: 3, 'equal-weight': 3, 'market perform': 3, 'peer perform': 3, 'sector perform': 3, 'in-line': 3,
    buy: 4, positive: 4, accumulate: 4, outperform: 4, overweight: 4,
    'strong buy': 5,
  };

  const prevRank = gradeRank[prev.toLowerCase()] ?? 3;
  const nextRank = gradeRank[next.toLowerCase()] ?? 3;

  if (nextRank > prevRank) return 'upgrade';
  if (nextRank < prevRank) return 'downgrade';
  return 'maintain';
}

// ─── Mock data ────────────────────────────────────────────

function getMockData(ticker: string) {
  const t = ticker.toUpperCase();

  // Vary mock data slightly by ticker for realism
  const seed = t.charCodeAt(0) + (t.charCodeAt(1) ?? 0);
  const buyCount = 15 + (seed % 12);
  const holdCount = 3 + (seed % 5);
  const sellCount = seed % 3;

  return {
    consensus: {
      strongBuy: Math.floor(buyCount * 0.4),
      buy: Math.ceil(buyCount * 0.6),
      hold: holdCount,
      sell: sellCount,
      strongSell: 0,
      total: buyCount + holdCount + sellCount,
      consensus: buyCount > holdCount + sellCount ? 'Strong Buy' : 'Buy',
    },
    priceTarget: {
      targetHigh: 280 + (seed % 100),
      targetLow: 120 + (seed % 40),
      targetConsensus: 210 + (seed % 60),
      targetMedian: 200 + (seed % 55),
    },
    grades: [
      { gradingCompany: 'Morgan Stanley', newGrade: 'Overweight', previousGrade: 'Equal-Weight', action: 'upgrade', date: '2026-04-01' },
      { gradingCompany: 'Goldman Sachs', newGrade: 'Buy', previousGrade: 'Buy', action: 'maintain', date: '2026-03-25' },
      { gradingCompany: 'JP Morgan', newGrade: 'Overweight', previousGrade: 'Neutral', action: 'upgrade', date: '2026-03-18' },
      { gradingCompany: 'Bank of America', newGrade: 'Buy', previousGrade: 'Buy', action: 'maintain', date: '2026-03-10' },
      { gradingCompany: 'UBS', newGrade: 'Buy', previousGrade: 'Neutral', action: 'upgrade', date: '2026-03-03' },
      { gradingCompany: 'Barclays', newGrade: 'Overweight', previousGrade: 'Overweight', action: 'maintain', date: '2026-02-20' },
      { gradingCompany: 'Citigroup', newGrade: 'Buy', previousGrade: 'Buy', action: 'maintain', date: '2026-02-14' },
      { gradingCompany: 'Wells Fargo', newGrade: 'Equal-Weight', previousGrade: 'Overweight', action: 'downgrade', date: '2026-02-05' },
      { gradingCompany: 'Bernstein', newGrade: 'Outperform', previousGrade: 'Market Perform', action: 'upgrade', date: '2026-01-28' },
      { gradingCompany: 'Deutsche Bank', newGrade: 'Hold', previousGrade: 'Buy', action: 'downgrade', date: '2026-01-15' },
    ],
    insiderTransactions: [
      { reportingName: 'Tim Cook', transactionType: 'S-Sale', securitiesTransacted: 511000, price: 178.52, transactionDate: '2026-03-28', acquistionOrDisposition: 'D', link: '' },
      { reportingName: 'Luca Maestri', transactionType: 'S-Sale', securitiesTransacted: 176299, price: 182.10, transactionDate: '2026-03-15', acquistionOrDisposition: 'D', link: '' },
      { reportingName: 'Jeff Williams', transactionType: 'S-Sale', securitiesTransacted: 105901, price: 175.30, transactionDate: '2026-03-01', acquistionOrDisposition: 'D', link: '' },
      { reportingName: 'Deirdre O\'Brien', transactionType: 'P-Purchase', securitiesTransacted: 50000, price: 168.20, transactionDate: '2026-02-20', acquistionOrDisposition: 'A', link: '' },
      { reportingName: 'Craig Federighi', transactionType: 'S-Sale', securitiesTransacted: 88000, price: 179.45, transactionDate: '2026-02-10', acquistionOrDisposition: 'D', link: '' },
      { reportingName: 'Katherine Adams', transactionType: 'S-Sale', securitiesTransacted: 63500, price: 176.80, transactionDate: '2026-01-25', acquistionOrDisposition: 'D', link: '' },
      { reportingName: 'Tim Cook', transactionType: 'P-Purchase', securitiesTransacted: 200000, price: 165.00, transactionDate: '2026-01-10', acquistionOrDisposition: 'A', link: '' },
      { reportingName: 'Al Gore', transactionType: 'S-Sale', securitiesTransacted: 25000, price: 171.50, transactionDate: '2025-12-20', acquistionOrDisposition: 'D', link: '' },
    ],
    institutionalHolders: [
      { holder: 'Vanguard Group Inc.', shares: 1_302_456_789, dateReported: '2026-03-31', change: 12_345_678, changePercent: 0.96 },
      { holder: 'BlackRock Inc.', shares: 1_045_678_901, dateReported: '2026-03-31', change: -5_432_100, changePercent: -0.52 },
      { holder: 'Berkshire Hathaway Inc.', shares: 905_560_000, dateReported: '2026-03-31', change: 0, changePercent: 0 },
      { holder: 'State Street Corp.', shares: 623_456_789, dateReported: '2026-03-31', change: 8_900_000, changePercent: 1.45 },
      { holder: 'FMR LLC', shares: 412_345_678, dateReported: '2026-03-31', change: -15_000_000, changePercent: -3.51 },
      { holder: 'Geode Capital Management', shares: 298_765_432, dateReported: '2026-03-31', change: 3_200_000, changePercent: 1.08 },
      { holder: 'Price T Rowe Associates', shares: 245_678_901, dateReported: '2026-03-31', change: 18_500_000, changePercent: 8.14 },
      { holder: 'Northern Trust Corp.', shares: 198_765_432, dateReported: '2026-03-31', change: -2_100_000, changePercent: -1.05 },
      { holder: 'Morgan Stanley', shares: 178_901_234, dateReported: '2026-03-31', change: 7_600_000, changePercent: 4.44 },
      { holder: 'Bank of New York Mellon', shares: 156_789_012, dateReported: '2026-03-31', change: 1_200_000, changePercent: 0.77 },
    ],
  };
}

// ─── Main endpoint ────────────────────────────────────────

analysisRouter.get('/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  // Check cache
  const cached = getCached<Record<string, unknown>>(`analysis:${ticker}`);
  if (cached) {
    res.json(cached);
    return;
  }

  // No FMP key → return mock data
  if (!hasFmpKey) {
    const mock = getMockData(ticker);
    setCache(`analysis:${ticker}`, mock);
    res.json(mock);
    return;
  }

  try {
    // Fetch all 4 FMP endpoints in parallel
    const [gradesRes, priceTargetRes, insiderRes, holdersRes] = await Promise.allSettled([
      axios.get(`${FMP_BASE}/api/v3/grade/${ticker}`, {
        params: { limit: 30, apikey: FMP_KEY },
      }),
      axios.get(`${FMP_BASE}/api/v4/price-target-consensus`, {
        params: { symbol: ticker, apikey: FMP_KEY },
      }),
      axios.get(`${FMP_BASE}/api/v4/insider-trading`, {
        params: { symbol: ticker, limit: 40, apikey: FMP_KEY },
      }),
      axios.get(`${FMP_BASE}/api/v3/institutional-holder/${ticker}`, {
        params: { apikey: FMP_KEY },
      }),
    ]);

    // Parse grades → consensus
    const rawGrades: FmpGrade[] =
      gradesRes.status === 'fulfilled' ? (gradesRes.value.data ?? []) : [];

    const consensus = deriveConsensus(rawGrades);

    const grades = rawGrades.slice(0, 15).map((g) => ({
      gradingCompany: g.gradingCompany,
      newGrade: g.newGrade,
      previousGrade: g.previousGrade ?? '',
      action: mapGradeAction(g.previousGrade ?? '', g.newGrade),
      date: g.date,
    }));

    // Parse price target
    const ptRaw =
      priceTargetRes.status === 'fulfilled'
        ? Array.isArray(priceTargetRes.value.data)
          ? priceTargetRes.value.data[0]
          : priceTargetRes.value.data
        : null;

    const priceTarget = ptRaw
      ? {
          targetHigh: ptRaw.targetHigh ?? 0,
          targetLow: ptRaw.targetLow ?? 0,
          targetConsensus: ptRaw.targetConsensus ?? 0,
          targetMedian: ptRaw.targetMedian ?? 0,
        }
      : { targetHigh: 0, targetLow: 0, targetConsensus: 0, targetMedian: 0 };

    // Parse insider transactions
    const rawInsider =
      insiderRes.status === 'fulfilled' ? (insiderRes.value.data ?? []) : [];

    const insiderTransactions = rawInsider.slice(0, 20).map(
      (t: Record<string, unknown>) => ({
        reportingName: (t.reportingName as string) ?? 'Unknown',
        transactionType: (t.transactionType as string) ?? '',
        securitiesTransacted: (t.securitiesTransacted as number) ?? 0,
        price: (t.price as number) ?? 0,
        transactionDate: (t.transactionDate as string) ?? '',
        acquistionOrDisposition: ((t.acquistionOrDisposition as string) ?? 'D') as 'A' | 'D',
        link: (t.link as string) ?? '',
      })
    );

    // Parse institutional holders
    const rawHolders =
      holdersRes.status === 'fulfilled' ? (holdersRes.value.data ?? []) : [];

    const institutionalHolders = rawHolders.slice(0, 10).map(
      (h: Record<string, unknown>) => ({
        holder: (h.holder as string) ?? 'Unknown',
        shares: (h.shares as number) ?? 0,
        dateReported: (h.dateReported as string) ?? '',
        change: (h.change as number) ?? 0,
        changePercent: (h.changePercent as number) ?? 0,
      })
    );

    const result = {
      consensus,
      priceTarget,
      grades,
      insiderTransactions,
      institutionalHolders,
    };

    setCache(`analysis:${ticker}`, result);
    res.json(result);
  } catch (err) {
    console.error('[Analysis] FMP fetch error:', err);
    // Fallback to mock
    const mock = getMockData(ticker);
    res.json(mock);
  }
});
