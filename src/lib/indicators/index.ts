import { Candle } from '../marketData/types';

export interface Point {
  time: number;
  value: number;
}

const closes = (candles: Candle[]): number[] => candles.map((c) => c.close);

/** Simple Moving Average. Returns one point per candle once enough data exists. */
export function sma(candles: Candle[], period: number): Point[] {
  const out: Point[] = [];
  const values = closes(candles);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) {
      out.push({ time: candles[i].time, value: sum / period });
    }
  }
  return out;
}

/** Exponential Moving Average seeded with the SMA of the first `period` values. */
export function ema(candles: Candle[], period: number): Point[] {
  const values = closes(candles);
  if (values.length < period) return [];
  const out: Point[] = [];
  const k = 2 / (period + 1);
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out.push({ time: candles[period - 1].time, value: prev });
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out.push({ time: candles[i].time, value: prev });
  }
  return out;
}

/** Relative Strength Index (Wilder's smoothing). Values in [0, 100]. */
export function rsi(candles: Candle[], period = 14): Point[] {
  const values = closes(candles);
  if (values.length <= period) return [];
  const out: Point[] = [];
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  gain /= period;
  loss /= period;
  out.push({ time: candles[period].time, value: rsiValue(gain, loss) });
  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    gain = (gain * (period - 1) + g) / period;
    loss = (loss * (period - 1) + l) / period;
    out.push({ time: candles[i].time, value: rsiValue(gain, loss) });
  }
  return out;
}

function rsiValue(gain: number, loss: number): number {
  if (loss === 0) return 100;
  const rs = gain / loss;
  return 100 - 100 / (1 + rs);
}

export interface MacdPoint {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

/** MACD line, signal line, and histogram. */
export function macd(
  candles: Candle[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): MacdPoint[] {
  const fastEma = ema(candles, fast);
  const slowEma = ema(candles, slow);
  if (slowEma.length === 0) return [];
  // Align EMAs by time — slow EMA starts later, so index into the fast EMA.
  const fastByTime = new Map(fastEma.map((p) => [p.time, p.value]));
  const macdLine: Point[] = slowEma
    .filter((p) => fastByTime.has(p.time))
    .map((p) => ({ time: p.time, value: fastByTime.get(p.time)! - p.value }));

  if (macdLine.length < signalPeriod) {
    return macdLine.map((p) => ({ time: p.time, macd: p.value, signal: 0, histogram: p.value }));
  }

  // EMA of the MACD line for the signal line.
  const k = 2 / (signalPeriod + 1);
  const out: MacdPoint[] = [];
  let prevSignal =
    macdLine.slice(0, signalPeriod).reduce((a, b) => a + b.value, 0) / signalPeriod;
  for (let i = 0; i < macdLine.length; i++) {
    const point = macdLine[i];
    if (i < signalPeriod - 1) continue;
    if (i === signalPeriod - 1) {
      out.push({
        time: point.time,
        macd: point.value,
        signal: prevSignal,
        histogram: point.value - prevSignal,
      });
      continue;
    }
    prevSignal = point.value * k + prevSignal * (1 - k);
    out.push({
      time: point.time,
      macd: point.value,
      signal: prevSignal,
      histogram: point.value - prevSignal,
    });
  }
  return out;
}

export type SignalTone = 'bullish' | 'bearish' | 'neutral';

export interface Signal {
  label: string;
  tone: SignalTone;
}

/** Derive simple human-readable signals from the latest indicator values. */
export function signals(candles: Candle[]): Signal[] {
  const result: Signal[] = [];
  const rsiSeries = rsi(candles);
  const last = rsiSeries[rsiSeries.length - 1];
  if (last) {
    if (last.value >= 70) result.push({ label: `RSI ${last.value.toFixed(0)} · Overbought`, tone: 'bearish' });
    else if (last.value <= 30) result.push({ label: `RSI ${last.value.toFixed(0)} · Oversold`, tone: 'bullish' });
    else result.push({ label: `RSI ${last.value.toFixed(0)} · Neutral`, tone: 'neutral' });
  }

  const macdSeries = macd(candles);
  if (macdSeries.length >= 2) {
    const a = macdSeries[macdSeries.length - 2];
    const b = macdSeries[macdSeries.length - 1];
    const crossedUp = a.macd <= a.signal && b.macd > b.signal;
    const crossedDown = a.macd >= a.signal && b.macd < b.signal;
    if (crossedUp) result.push({ label: 'MACD bullish cross', tone: 'bullish' });
    else if (crossedDown) result.push({ label: 'MACD bearish cross', tone: 'bearish' });
    else result.push({ label: b.histogram >= 0 ? 'MACD above signal' : 'MACD below signal', tone: b.histogram >= 0 ? 'bullish' : 'bearish' });
  }

  const fast = sma(candles, 20);
  const slow = sma(candles, 50);
  if (fast.length && slow.length) {
    const f = fast[fast.length - 1].value;
    const s = slow[slow.length - 1].value;
    result.push({ label: f >= s ? 'Price trend up (SMA20 > SMA50)' : 'Price trend down (SMA20 < SMA50)', tone: f >= s ? 'bullish' : 'bearish' });
  }
  return result;
}

/** Latest RSI value, or null if not computable. */
export function latestRsi(candles: Candle[]): number | null {
  const series = rsi(candles);
  return series.length ? series[series.length - 1].value : null;
}
