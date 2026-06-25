import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  LineStyle,
  UTCTimestamp,
} from 'lightweight-charts';
import { Candle } from '../../lib/marketData';
import { ema, sma } from '../../lib/indicators';

export interface OverlayConfig {
  sma20: boolean;
  sma50: boolean;
  ema12: boolean;
}

interface Props {
  candles: Candle[];
  type: 'candlestick' | 'line';
  overlays: OverlayConfig;
  dark: boolean;
}

export function PriceChart({ candles, type, overlays, dark }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: dark ? '#a1a1aa' : '#52525b',
      },
      grid: {
        vertLines: { color: dark ? '#27272a' : '#f4f4f5' },
        horzLines: { color: dark ? '#27272a' : '#f4f4f5' },
      },
      rightPriceScale: { borderColor: dark ? '#3f3f46' : '#e4e4e7' },
      timeScale: { borderColor: dark ? '#3f3f46' : '#e4e4e7', timeVisible: true },
      crosshair: { mode: 1 },
    });
    chartRef.current = chart;

    let main: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>;
    if (type === 'candlestick') {
      main = chart.addCandlestickSeries({
        upColor: '#16a34a',
        downColor: '#dc2626',
        borderVisible: false,
        wickUpColor: '#16a34a',
        wickDownColor: '#dc2626',
      });
      main.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        })),
      );
    } else {
      main = chart.addLineSeries({ color: '#2563eb', lineWidth: 2 });
      main.setData(candles.map((c) => ({ time: c.time as UTCTimestamp, value: c.close })));
    }

    const addOverlay = (points: { time: number; value: number }[], color: string) => {
      const series = chart.addLineSeries({
        color,
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      series.setData(points.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
    };

    if (overlays.sma20) addOverlay(sma(candles, 20), '#f59e0b');
    if (overlays.sma50) addOverlay(sma(candles, 50), '#a855f7');
    if (overlays.ema12) addOverlay(ema(candles, 12), '#06b6d4');

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, type, overlays, dark]);

  return <div ref={containerRef} className="h-[360px] w-full" />;
}
