export type Range = '1D' | '1W' | '1M' | '1Y' | '5Y';

export const RANGES: Range[] = ['1D', '1W', '1M', '1Y', '5Y'];

export interface SymbolMatch {
  symbol: string;
  description: string;
}

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
}

export interface Candle {
  /** Unix seconds */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  logo?: string;
  exchange?: string;
  industry?: string;
  country?: string;
  currency?: string;
  weburl?: string;
  description?: string;
}

export interface FinancialPeriod {
  period: string;
  revenue: number;
  eps: number;
}

export interface Fundamentals {
  symbol: string;
  marketCap?: number;
  peRatio?: number;
  eps?: number;
  dividendYield?: number;
  high52Week?: number;
  low52Week?: number;
  beta?: number;
  history: FinancialPeriod[];
}

export interface MarketDataProvider {
  /** Human-readable provider name, surfaced in the UI. */
  readonly name: string;
  searchSymbols(query: string): Promise<SymbolMatch[]>;
  getQuote(symbol: string): Promise<Quote>;
  getCandles(symbol: string, range: Range): Promise<Candle[]>;
  getCompanyProfile(symbol: string): Promise<CompanyProfile>;
  getFundamentals(symbol: string): Promise<Fundamentals>;
}

/** Number of candles and bar resolution (seconds) for each range. */
export const RANGE_CONFIG: Record<Range, { points: number; stepSeconds: number }> = {
  '1D': { points: 78, stepSeconds: 5 * 60 },
  '1W': { points: 7 * 13, stepSeconds: 30 * 60 },
  '1M': { points: 30, stepSeconds: 24 * 60 * 60 },
  '1Y': { points: 252, stepSeconds: 24 * 60 * 60 },
  '5Y': { points: 60, stepSeconds: 30 * 24 * 60 * 60 },
};
