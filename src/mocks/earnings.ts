import type { EarningsEvent } from '../types';

// ─── 3 weeks of earnings data (Mar 10 – Mar 27, 2026) ────────

export const mockEarnings: EarningsEvent[] = [
  // ── Last week (reported) ─────────────────────────────────
  {
    ticker: 'ORCL',
    companyName: 'Oracle Corporation',
    reportDate: new Date('2026-03-10'),
    timing: 'BMO',
    epsEstimate: 1.47,
    epsActual: 1.65,
    revenueEstimate: 14_200_000_000,
    revenueActual: 14_890_000_000,
    surprise: 0.18,
    surprisePercent: 12.24,
    status: 'reported',
    historicalEps: [
      { quarter: 'Q1 24', estimate: 1.15, actual: 1.19 },
      { quarter: 'Q2 24', estimate: 1.25, actual: 1.34 },
      { quarter: 'Q3 24', estimate: 1.32, actual: 1.30 },
      { quarter: 'Q4 24', estimate: 1.38, actual: 1.47 },
      { quarter: 'Q1 25', estimate: 1.28, actual: 1.40 },
      { quarter: 'Q2 25', estimate: 1.35, actual: 1.44 },
      { quarter: 'Q3 25', estimate: 1.41, actual: 1.53 },
      { quarter: 'Q4 25', estimate: 1.47, actual: 1.65 },
    ],
    aiSummary: 'Oracle reported strong Q4 results driven by cloud infrastructure revenue growth of 52% YoY. Management raised FY2027 guidance citing accelerating AI workload demand across enterprise customers.',
  },
  {
    ticker: 'ADBE',
    companyName: 'Adobe Inc.',
    reportDate: new Date('2026-03-10'),
    timing: 'AMC',
    epsEstimate: 4.66,
    epsActual: 4.88,
    revenueEstimate: 5_630_000_000,
    revenueActual: 5_710_000_000,
    surprise: 0.22,
    surprisePercent: 4.72,
    status: 'reported',
    historicalEps: [
      { quarter: 'Q1 24', estimate: 4.12, actual: 4.20 },
      { quarter: 'Q2 24', estimate: 4.22, actual: 4.39 },
      { quarter: 'Q3 24', estimate: 4.31, actual: 4.45 },
      { quarter: 'Q4 24', estimate: 4.40, actual: 4.48 },
      { quarter: 'Q1 25', estimate: 4.48, actual: 4.55 },
      { quarter: 'Q2 25', estimate: 4.52, actual: 4.60 },
      { quarter: 'Q3 25', estimate: 4.58, actual: 4.72 },
      { quarter: 'Q4 25', estimate: 4.66, actual: 4.88 },
    ],
    aiSummary: 'Adobe beat expectations with Firefly AI features driving strong Creative Cloud growth. Document Cloud showed 22% YoY growth. Management highlighted expanding AI monetization in Enterprise segment.',
  },
  {
    ticker: 'ULTA',
    companyName: 'Ulta Beauty, Inc.',
    reportDate: new Date('2026-03-11'),
    timing: 'BMO',
    epsEstimate: 6.68,
    epsActual: 6.54,
    revenueEstimate: 3_470_000_000,
    revenueActual: 3_380_000_000,
    surprise: -0.14,
    surprisePercent: -2.10,
    status: 'reported',
    historicalEps: [
      { quarter: 'Q1 24', estimate: 6.12, actual: 6.47 },
      { quarter: 'Q2 24', estimate: 5.34, actual: 5.30 },
      { quarter: 'Q3 24', estimate: 5.88, actual: 5.14 },
      { quarter: 'Q4 24', estimate: 6.56, actual: 6.02 },
      { quarter: 'Q1 25', estimate: 6.78, actual: 6.48 },
      { quarter: 'Q2 25', estimate: 5.60, actual: 5.72 },
      { quarter: 'Q3 25', estimate: 6.10, actual: 6.22 },
      { quarter: 'Q4 25', estimate: 6.68, actual: 6.54 },
    ],
    aiSummary: 'Ulta missed estimates as foot traffic softened in the holiday quarter. Same-store sales declined 1.2%. Management cited increased competition from Sephora and cautious consumer spending.',
  },
  {
    ticker: 'DG',
    companyName: 'Dollar General Corp.',
    reportDate: new Date('2026-03-12'),
    timing: 'BMO',
    epsEstimate: 1.52,
    epsActual: 1.44,
    revenueEstimate: 10_200_000_000,
    revenueActual: 10_050_000_000,
    surprise: -0.08,
    surprisePercent: -5.26,
    status: 'reported',
    historicalEps: [
      { quarter: 'Q1 24', estimate: 1.58, actual: 1.65 },
      { quarter: 'Q2 24', estimate: 1.44, actual: 1.38 },
      { quarter: 'Q3 24', estimate: 1.36, actual: 1.26 },
      { quarter: 'Q4 24', estimate: 1.48, actual: 1.50 },
      { quarter: 'Q1 25', estimate: 1.62, actual: 1.56 },
      { quarter: 'Q2 25', estimate: 1.40, actual: 1.42 },
      { quarter: 'Q3 25', estimate: 1.34, actual: 1.38 },
      { quarter: 'Q4 25', estimate: 1.52, actual: 1.44 },
    ],
    aiSummary: 'Dollar General missed on both top and bottom line. Inventory shrinkage remains a challenge. Same-store sales grew 0.4% but margins compressed due to markdowns.',
  },
  {
    ticker: 'DOCU',
    companyName: 'DocuSign, Inc.',
    reportDate: new Date('2026-03-12'),
    timing: 'AMC',
    epsEstimate: 0.82,
    epsActual: 0.88,
    revenueEstimate: 756_000_000,
    revenueActual: 776_000_000,
    surprise: 0.06,
    surprisePercent: 7.32,
    status: 'reported',
    historicalEps: [
      { quarter: 'Q1 24', estimate: 0.68, actual: 0.72 },
      { quarter: 'Q2 24', estimate: 0.72, actual: 0.76 },
      { quarter: 'Q3 24', estimate: 0.74, actual: 0.78 },
      { quarter: 'Q4 24', estimate: 0.76, actual: 0.80 },
      { quarter: 'Q1 25', estimate: 0.78, actual: 0.82 },
      { quarter: 'Q2 25', estimate: 0.76, actual: 0.80 },
      { quarter: 'Q3 25', estimate: 0.80, actual: 0.84 },
      { quarter: 'Q4 25', estimate: 0.82, actual: 0.88 },
    ],
    aiSummary: 'DocuSign beat estimates with contract lifecycle management driving enterprise adoption. Billings growth accelerated to 11% YoY. International expansion contributed 30% of new bookings.',
  },
  {
    ticker: 'COST',
    companyName: 'Costco Wholesale Corp.',
    reportDate: new Date('2026-03-13'),
    timing: 'AMC',
    epsEstimate: 3.78,
    epsActual: 4.10,
    revenueEstimate: 60_800_000_000,
    revenueActual: 62_100_000_000,
    surprise: 0.32,
    surprisePercent: 8.47,
    status: 'reported',
    historicalEps: [
      { quarter: 'Q1 24', estimate: 3.32, actual: 3.58 },
      { quarter: 'Q2 24', estimate: 3.45, actual: 3.68 },
      { quarter: 'Q3 24', estimate: 3.52, actual: 3.72 },
      { quarter: 'Q4 24', estimate: 3.60, actual: 3.82 },
      { quarter: 'Q1 25', estimate: 3.48, actual: 3.75 },
      { quarter: 'Q2 25', estimate: 3.58, actual: 3.82 },
      { quarter: 'Q3 25', estimate: 3.68, actual: 3.95 },
      { quarter: 'Q4 25', estimate: 3.78, actual: 4.10 },
    ],
    aiSummary: 'Costco delivered a strong beat with membership fee income up 8% following the recent dues increase. E-commerce grew 18% YoY. Same-store sales grew 5.2% excluding fuel and FX.',
  },

  // ── This week (upcoming) ─────────────────────────────────
  {
    ticker: 'TMUS',
    companyName: 'T-Mobile US, Inc.',
    reportDate: new Date('2026-03-17'),
    timing: 'BMO',
    epsEstimate: 2.42,
    revenueEstimate: 21_200_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'SQ',
    companyName: 'Block, Inc.',
    reportDate: new Date('2026-03-17'),
    timing: 'AMC',
    epsEstimate: 0.88,
    revenueEstimate: 6_200_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'XPEV',
    companyName: 'XPeng Inc.',
    reportDate: new Date('2026-03-18'),
    timing: 'BMO',
    epsEstimate: -0.12,
    revenueEstimate: 14_800_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'GME',
    companyName: 'GameStop Corp.',
    reportDate: new Date('2026-03-18'),
    timing: 'AMC',
    epsEstimate: -0.03,
    revenueEstimate: 1_280_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'FIVE',
    companyName: 'Five Below, Inc.',
    reportDate: new Date('2026-03-18'),
    timing: 'BMO',
    epsEstimate: 3.24,
    revenueEstimate: 1_320_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'BRZE',
    companyName: 'Braze, Inc.',
    reportDate: new Date('2026-03-19'),
    timing: 'AMC',
    epsEstimate: 0.06,
    revenueEstimate: 152_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'SJM',
    companyName: 'J.M. Smucker Company',
    reportDate: new Date('2026-03-19'),
    timing: 'BMO',
    epsEstimate: 2.48,
    revenueEstimate: 2_180_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'MU',
    companyName: 'Micron Technology, Inc.',
    reportDate: new Date('2026-03-20'),
    timing: 'AMC',
    epsEstimate: 1.42,
    revenueEstimate: 8_800_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'ACN',
    companyName: 'Accenture plc',
    reportDate: new Date('2026-03-20'),
    timing: 'BMO',
    epsEstimate: 3.08,
    revenueEstimate: 16_400_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'NKE',
    companyName: 'Nike, Inc.',
    reportDate: new Date('2026-03-20'),
    timing: 'AMC',
    epsEstimate: 0.52,
    revenueEstimate: 11_200_000_000,
    status: 'upcoming',
  },

  // ── Next week ────────────────────────────────────────────
  {
    ticker: 'PAYX',
    companyName: 'Paychex, Inc.',
    reportDate: new Date('2026-03-24'),
    timing: 'BMO',
    epsEstimate: 1.14,
    revenueEstimate: 1_520_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'CHWY',
    companyName: 'Chewy, Inc.',
    reportDate: new Date('2026-03-25'),
    timing: 'AMC',
    epsEstimate: 0.18,
    revenueEstimate: 2_920_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'LULU',
    companyName: 'Lululemon Athletica',
    reportDate: new Date('2026-03-25'),
    timing: 'BMO',
    epsEstimate: 5.84,
    revenueEstimate: 3_180_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'CTAS',
    companyName: 'Cintas Corporation',
    reportDate: new Date('2026-03-26'),
    timing: 'BMO',
    epsEstimate: 3.82,
    revenueEstimate: 2_520_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'RH',
    companyName: 'RH (Restoration Hardware)',
    reportDate: new Date('2026-03-27'),
    timing: 'AMC',
    epsEstimate: 2.88,
    revenueEstimate: 830_000_000,
    status: 'upcoming',
  },
  {
    ticker: 'BURL',
    companyName: 'Burlington Stores, Inc.',
    reportDate: new Date('2026-03-27'),
    timing: 'BMO',
    epsEstimate: 4.18,
    revenueEstimate: 2_840_000_000,
    status: 'upcoming',
  },
];

// ─── Helper: group earnings by date string ─────────────────

export function groupEarningsByDate(
  earnings: EarningsEvent[],
): Record<string, EarningsEvent[]> {
  const groups: Record<string, EarningsEvent[]> = {};
  for (const e of earnings) {
    const key = e.reportDate.toISOString().split('T')[0];
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

// ─── Helper: get week dates (Mon-Fri) for a given date ─────

export function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  d.setDate(d.getDate() + diff);

  const dates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const wd = new Date(d);
    wd.setDate(d.getDate() + i);
    dates.push(wd);
  }
  return dates;
}
