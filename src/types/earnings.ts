export interface EarningsEvent {
  ticker: string;
  companyName: string;
  logo?: string;
  reportDate: Date;
  timing: 'BMO' | 'AMC' | 'TNS';
  epsEstimate?: number;
  epsActual?: number;
  revenueEstimate?: number;
  revenueActual?: number;
  surprise?: number;
  surprisePercent?: number;
  status: 'upcoming' | 'reported';
  historicalEps?: { quarter: string; estimate: number; actual: number }[];
  aiSummary?: string;
}
