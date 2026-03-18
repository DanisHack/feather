// Analysis tab types — analyst, insider, institutional data

export interface AnalystConsensus {
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  total: number;
  consensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
}

export interface PriceTarget {
  targetHigh: number;
  targetLow: number;
  targetConsensus: number;
  targetMedian: number;
}

export interface AnalystGrade {
  gradingCompany: string;
  newGrade: string;
  previousGrade: string;
  action: 'upgrade' | 'downgrade' | 'maintain' | 'init';
  date: string;
}

export interface InsiderTransaction {
  reportingName: string;
  transactionType: string;
  securitiesTransacted: number;
  price: number;
  transactionDate: string;
  acquistionOrDisposition: 'A' | 'D';
  link: string;
}

export interface InstitutionalHolder {
  holder: string;
  shares: number;
  dateReported: string;
  change: number;
  changePercent: number;
}

export interface AnalysisData {
  consensus: AnalystConsensus;
  priceTarget: PriceTarget;
  grades: AnalystGrade[];
  insiderTransactions: InsiderTransaction[];
  institutionalHolders: InstitutionalHolder[];
  aiSummary?: string;
}
