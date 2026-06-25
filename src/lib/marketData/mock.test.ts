import { describe, expect, it } from 'vitest';
import { MockProvider } from './mock';

const provider = new MockProvider();

describe('MockProvider', () => {
  it('is deterministic across calls', async () => {
    const a = await provider.getCandles('AAPL', '1M');
    const b = await provider.getCandles('AAPL', '1M');
    expect(a).toEqual(b);
  });

  it('returns the requested number of candles per range', async () => {
    const day = await provider.getCandles('MSFT', '1D');
    const year = await provider.getCandles('MSFT', '1Y');
    expect(day.length).toBe(78);
    expect(year.length).toBe(252);
  });

  it('produces a coherent quote', async () => {
    const q = await provider.getQuote('NVDA');
    expect(q.symbol).toBe('NVDA');
    expect(q.price).toBeGreaterThan(0);
    expect(Number.isFinite(q.percentChange)).toBe(true);
  });

  it('searches by symbol and name', async () => {
    const bySymbol = await provider.searchSymbols('AAPL');
    expect(bySymbol.some((m) => m.symbol === 'AAPL')).toBe(true);
    const byName = await provider.searchSymbols('Microsoft');
    expect(byName.some((m) => m.symbol === 'MSFT')).toBe(true);
  });

  it('returns fundamentals with history', async () => {
    const f = await provider.getFundamentals('AAPL');
    expect(f.history.length).toBeGreaterThan(0);
    expect(f.peRatio).toBeGreaterThan(0);
  });
});
