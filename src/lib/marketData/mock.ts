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

interface SeedInfo {
  name: string;
  basePrice: number;
  industry: string;
  exchange: string;
}

const UNIVERSE: Record<string, SeedInfo> = {
  AAPL: { name: 'Apple Inc.', basePrice: 195, industry: 'Consumer Electronics', exchange: 'NASDAQ' },
  MSFT: { name: 'Microsoft Corporation', basePrice: 420, industry: 'Software', exchange: 'NASDAQ' },
  GOOGL: { name: 'Alphabet Inc.', basePrice: 175, industry: 'Internet Content', exchange: 'NASDAQ' },
  AMZN: { name: 'Amazon.com, Inc.', basePrice: 185, industry: 'Internet Retail', exchange: 'NASDAQ' },
  TSLA: { name: 'Tesla, Inc.', basePrice: 250, industry: 'Auto Manufacturers', exchange: 'NASDAQ' },
  NVDA: { name: 'NVIDIA Corporation', basePrice: 125, industry: 'Semiconductors', exchange: 'NASDAQ' },
  META: { name: 'Meta Platforms, Inc.', basePrice: 500, industry: 'Internet Content', exchange: 'NASDAQ' },
  NFLX: { name: 'Netflix, Inc.', basePrice: 650, industry: 'Entertainment', exchange: 'NASDAQ' },
};

/** Deterministic hash so the same symbol always produces the same series. */
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG — small, fast, seedable. */
function makeRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedInfo(symbol: string): SeedInfo {
  return (
    UNIVERSE[symbol] ?? {
      name: `${symbol} Holdings`,
      basePrice: 50 + (hashSeed(symbol) % 400),
      industry: 'Diversified',
      exchange: 'NYSE',
    }
  );
}

function generateCandles(symbol: string, range: Range): Candle[] {
  const { points, stepSeconds } = RANGE_CONFIG[range];
  const info = seedInfo(symbol);
  // Seed combines symbol + range so each range looks distinct but stable.
  const rng = makeRng(hashSeed(`${symbol}:${range}`));
  const now = Math.floor(Date.now() / 1000);
  const candles: Candle[] = [];
  let price = info.basePrice * (0.85 + rng() * 0.1);
  const drift = (info.basePrice - price) / points;

  for (let i = points - 1; i >= 0; i--) {
    const time = now - i * stepSeconds;
    const volatility = info.basePrice * 0.015;
    const open = price;
    const move = (rng() - 0.5) * volatility * 2 + drift;
    const close = Math.max(1, open + move);
    const high = Math.max(open, close) + rng() * volatility;
    const low = Math.min(open, close) - rng() * volatility;
    const volume = Math.floor(1_000_000 + rng() * 9_000_000);
    candles.push({ time, open, high, low, close, volume });
    price = close;
  }
  return candles;
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class MockProvider implements MarketDataProvider {
  readonly name = 'Mock (offline demo data)';

  searchSymbols(query: string): Promise<SymbolMatch[]> {
    const q = query.trim().toUpperCase();
    const matches = Object.entries(UNIVERSE)
      .filter(([sym, info]) => sym.includes(q) || info.name.toUpperCase().includes(q))
      .map(([symbol, info]) => ({ symbol, description: info.name }));
    return delay(matches.slice(0, 8));
  }

  getQuote(symbol: string): Promise<Quote> {
    const candles = generateCandles(symbol, '1M');
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2] ?? last;
    const change = last.close - prev.close;
    return delay({
      symbol,
      price: round(last.close),
      change: round(change),
      percentChange: round((change / prev.close) * 100),
      high: round(last.high),
      low: round(last.low),
      open: round(last.open),
      previousClose: round(prev.close),
      volume: last.volume,
    });
  }

  getCandles(symbol: string, range: Range): Promise<Candle[]> {
    return delay(
      generateCandles(symbol, range).map((c) => ({
        ...c,
        open: round(c.open),
        high: round(c.high),
        low: round(c.low),
        close: round(c.close),
      })),
    );
  }

  getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const info = seedInfo(symbol);
    return delay({
      symbol,
      name: info.name,
      exchange: info.exchange,
      industry: info.industry,
      country: 'US',
      currency: 'USD',
      weburl: `https://example.com/${symbol.toLowerCase()}`,
      description: `${info.name} operates in the ${info.industry} industry. This profile is generated offline demo data for development and testing.`,
    });
  }

  getFundamentals(symbol: string): Promise<Fundamentals> {
    const info = seedInfo(symbol);
    const rng = makeRng(hashSeed(`${symbol}:fundamentals`));
    const history = ['FY-3', 'FY-2', 'FY-1', 'FY0'].map((period, i) => ({
      period,
      revenue: round((20 + rng() * 80) * (1 + i * 0.08), 1),
      eps: round((1 + rng() * 6) * (1 + i * 0.05), 2),
    }));
    return delay({
      symbol,
      marketCap: round(info.basePrice * (1 + rng()) * 1e9, 0),
      peRatio: round(12 + rng() * 30, 1),
      eps: history[history.length - 1].eps,
      dividendYield: round(rng() * 3, 2),
      high52Week: round(info.basePrice * 1.25),
      low52Week: round(info.basePrice * 0.7),
      beta: round(0.7 + rng() * 1.1, 2),
      history,
    });
  }
}

function round(n: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
