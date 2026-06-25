import {
  Candle,
  CompanyProfile,
  Fundamentals,
  MarketDataProvider,
  Quote,
  Range,
  RANGE_CONFIG,
  SymbolMatch,
} from './types';

const BASE = 'https://finnhub.io/api/v1';

const RESOLUTION: Record<Range, string> = {
  '1D': '5',
  '1W': '30',
  '1M': 'D',
  '1Y': 'D',
  '5Y': 'W',
};

/** Provider backed by the Finnhub REST API (free tier). */
export class FinnhubProvider implements MarketDataProvider {
  readonly name = 'Finnhub';
  constructor(private readonly apiKey: string) {}

  private async get<T>(path: string, params: Record<string, string | number>): Promise<T> {
    const url = new URL(BASE + path);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    url.searchParams.set('token', this.apiKey);
    const res = await fetch(url.toString());
    if (res.status === 429) {
      throw new Error('Finnhub rate limit reached. Please wait a moment and retry.');
    }
    if (!res.ok) {
      throw new Error(`Finnhub request failed (${res.status})`);
    }
    return (await res.json()) as T;
  }

  async searchSymbols(query: string): Promise<SymbolMatch[]> {
    const data = await this.get<{ result: Array<{ symbol: string; description: string }> }>(
      '/search',
      { q: query },
    );
    return (data.result ?? [])
      .filter((r) => !r.symbol.includes('.'))
      .slice(0, 8)
      .map((r) => ({ symbol: r.symbol, description: r.description }));
  }

  async getQuote(symbol: string): Promise<Quote> {
    const q = await this.get<{
      c: number;
      d: number;
      dp: number;
      h: number;
      l: number;
      o: number;
      pc: number;
    }>('/quote', { symbol });
    return {
      symbol,
      price: q.c,
      change: q.d,
      percentChange: q.dp,
      high: q.h,
      low: q.l,
      open: q.o,
      previousClose: q.pc,
      volume: 0,
    };
  }

  async getCandles(symbol: string, range: Range): Promise<Candle[]> {
    const { points, stepSeconds } = RANGE_CONFIG[range];
    const to = Math.floor(Date.now() / 1000);
    const from = to - points * stepSeconds;
    const data = await this.get<{
      s: string;
      t: number[];
      o: number[];
      h: number[];
      l: number[];
      c: number[];
      v: number[];
    }>('/stock/candle', { symbol, resolution: RESOLUTION[range], from, to });
    if (data.s !== 'ok' || !data.t) return [];
    return data.t.map((time, i) => ({
      time,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const p = await this.get<{
      name: string;
      logo: string;
      exchange: string;
      finnhubIndustry: string;
      country: string;
      currency: string;
      weburl: string;
    }>('/stock/profile2', { symbol });
    return {
      symbol,
      name: p.name ?? symbol,
      logo: p.logo,
      exchange: p.exchange,
      industry: p.finnhubIndustry,
      country: p.country,
      currency: p.currency,
      weburl: p.weburl,
    };
  }

  async getFundamentals(symbol: string): Promise<Fundamentals> {
    const data = await this.get<{
      metric: Record<string, number>;
    }>('/stock/metric', { symbol, metric: 'all' });
    const m = data.metric ?? {};
    return {
      symbol,
      marketCap: m.marketCapitalization ? m.marketCapitalization * 1e6 : undefined,
      peRatio: m.peTTM,
      eps: m.epsTTM,
      dividendYield: m.dividendYieldIndicatedAnnual,
      high52Week: m['52WeekHigh'],
      low52Week: m['52WeekLow'],
      beta: m.beta,
      history: [],
    };
  }
}
