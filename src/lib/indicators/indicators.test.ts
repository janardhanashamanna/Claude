import { describe, expect, it } from 'vitest';
import { Candle } from '../marketData/types';
import { ema, latestRsi, macd, rsi, signals, sma } from './index';

function candlesFromCloses(closes: number[]): Candle[] {
  return closes.map((close, i) => ({
    time: i * 86400,
    open: close,
    high: close,
    low: close,
    close,
    volume: 0,
  }));
}

describe('sma', () => {
  it('averages over the window', () => {
    const c = candlesFromCloses([1, 2, 3, 4, 5]);
    const result = sma(c, 3);
    expect(result).toHaveLength(3);
    expect(result[0].value).toBe(2); // (1+2+3)/3
    expect(result[1].value).toBe(3); // (2+3+4)/3
    expect(result[2].value).toBe(4); // (3+4+5)/3
  });

  it('returns empty when not enough data', () => {
    expect(sma(candlesFromCloses([1, 2]), 5)).toHaveLength(0);
  });
});

describe('ema', () => {
  it('seeds with the SMA and weights recent values more', () => {
    const c = candlesFromCloses([1, 2, 3, 4, 5]);
    const result = ema(c, 3);
    // First EMA == SMA of first 3 == 2
    expect(result[0].value).toBe(2);
    // EMA rises toward the latest prices
    expect(result[result.length - 1].value).toBeGreaterThan(3);
    expect(result[result.length - 1].value).toBeLessThan(5);
  });
});

describe('rsi', () => {
  it('returns 100 for a monotonically rising series', () => {
    const c = candlesFromCloses(Array.from({ length: 20 }, (_, i) => i + 1));
    const last = latestRsi(c);
    expect(last).toBe(100);
  });

  it('stays within [0, 100]', () => {
    const closes = [44, 44.3, 44.1, 43.6, 44.3, 44.8, 45.1, 45.4, 45, 44.7, 44.9, 45.4, 46, 45.6, 46.2, 46.8];
    const series = rsi(candlesFromCloses(closes));
    expect(series.length).toBeGreaterThan(0);
    for (const p of series) {
      expect(p.value).toBeGreaterThanOrEqual(0);
      expect(p.value).toBeLessThanOrEqual(100);
    }
  });
});

describe('macd', () => {
  it('produces aligned macd/signal/histogram points', () => {
    const c = candlesFromCloses(Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i / 3) * 5));
    const series = macd(c);
    expect(series.length).toBeGreaterThan(0);
    const last = series[series.length - 1];
    expect(last.histogram).toBeCloseTo(last.macd - last.signal, 6);
  });
});

describe('signals', () => {
  it('flags an oversold RSI as bullish', () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 - i); // steadily falling
    const result = signals(candlesFromCloses(closes));
    expect(result.some((s) => s.label.includes('Oversold') && s.tone === 'bullish')).toBe(true);
  });
});
