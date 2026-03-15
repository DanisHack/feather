export interface Holding {
  ticker: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayReturn: number;
  dayReturnPercent: number;
  logo?: string;
  brokerName?: string;
  brokerLogo?: string;
}

export interface Account {
  id: string;
  brokerName: string;
  brokerLogo?: string;
  accountType: string;
  totalValue: number;
  dayReturn: number;
  dayReturnPercent: number;
  holdings: Holding[];
}

export interface Portfolio {
  totalValue: number;
  dayReturn: number;
  dayReturnPercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  accounts: Account[];
  performanceHistory: { date: Date; value: number; benchmark: number }[];
}

export type PortfolioTabId = 'demo' | 'paper' | 'real';

export interface PaperTrade {
  id: string;
  ticker: string;
  name: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: Date;
}

export interface PaperPortfolioState {
  initialized: boolean;
  startingCash: number;
  cashBalance: number;
  positions: Holding[];
  tradeHistory: PaperTrade[];
  performanceHistory: { date: Date; value: number; benchmark: number }[];
}
