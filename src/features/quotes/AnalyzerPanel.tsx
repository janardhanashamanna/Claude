import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardTitle } from '../../components/ui/Card';
import { ErrorState, LoadingState } from '../../components/ui/States';
import { useCandles } from '../../hooks/marketDataHooks';
import { RANGES, Range } from '../../lib/marketData';
import { cn } from '../../lib/cn';
import { OverlayConfig, PriceChart } from './PriceChart';
import { QuoteHeader } from './QuoteHeader';
import { SignalBadges } from '../indicators/SignalBadges';
import { RsiPanel } from '../indicators/RsiPanel';
import { MacdPanel } from '../indicators/MacdPanel';

const OVERLAY_LABELS: Array<{ key: keyof OverlayConfig; label: string; color: string }> = [
  { key: 'sma20', label: 'SMA 20', color: '#f59e0b' },
  { key: 'sma50', label: 'SMA 50', color: '#a855f7' },
  { key: 'ema12', label: 'EMA 12', color: '#06b6d4' },
];

export function AnalyzerPanel({ symbol, dark }: { symbol: string; dark: boolean }) {
  const [range, setRange] = useState<Range>('1Y');
  const [type, setType] = useState<'candlestick' | 'line'>('candlestick');
  const [overlays, setOverlays] = useState<OverlayConfig>({ sma20: true, sma50: false, ema12: false });
  const { data: candles, isLoading, isError, refetch } = useCandles(symbol, range);

  const toggleOverlay = (key: keyof OverlayConfig) =>
    setOverlays((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      <Card>
        <QuoteHeader symbol={symbol} />
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <Button key={r} size="sm" variant="ghost" active={range === r} onClick={() => setRange(r)}>
                {r}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" active={type === 'candlestick'} onClick={() => setType('candlestick')}>
              Candles
            </Button>
            <Button size="sm" variant="ghost" active={type === 'line'} onClick={() => setType('line')}>
              Line
            </Button>
          </div>
        </div>

        <div className="mb-2 flex flex-wrap gap-1">
          {OVERLAY_LABELS.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => toggleOverlay(key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs',
                overlays[key]
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-200 text-zinc-500 dark:border-zinc-700',
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingState label="Loading chart…" />
        ) : isError || !candles || candles.length === 0 ? (
          <ErrorState message="No chart data available." onRetry={() => refetch()} />
        ) : (
          <>
            <PriceChart candles={candles} type={type} overlays={overlays} dark={dark} />
            <div className="mt-3">
              <SignalBadges candles={candles} />
            </div>
          </>
        )}
      </Card>

      {candles && candles.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardTitle>RSI (14)</CardTitle>
            <RsiPanel candles={candles} />
          </Card>
          <Card>
            <CardTitle>MACD (12, 26, 9)</CardTitle>
            <MacdPanel candles={candles} />
          </Card>
        </div>
      )}
    </div>
  );
}
