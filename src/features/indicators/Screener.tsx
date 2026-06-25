import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/States';
import { marketData } from '../../lib/marketData';
import { latestRsi } from '../../lib/indicators';
import { useSymbol } from '../../state/SymbolContext';

type Condition = 'oversold' | 'overbought' | 'any';

interface Row {
  symbol: string;
  rsi: number | null;
}

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];

export function Screener() {
  const { setSymbol } = useSymbol();
  const [symbolsText, setSymbolsText] = useState(DEFAULT_SYMBOLS.join(', '));
  const [condition, setCondition] = useState<Condition>('any');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const symbols = symbolsText
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 12);
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const candles = await marketData.getCandles(symbol, '1Y');
          return { symbol, rsi: latestRsi(candles) };
        } catch {
          return { symbol, rsi: null };
        }
      }),
    );
    setRows(results);
    setLoading(false);
  };

  // Run once on mount so the panel isn't empty.
  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = rows.filter((r) => {
    if (r.rsi === null) return false;
    if (condition === 'oversold') return r.rsi <= 30;
    if (condition === 'overbought') return r.rsi >= 70;
    return true;
  });

  return (
    <Card>
      <CardTitle>RSI Screener</CardTitle>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={symbolsText}
          onChange={(e) => setSymbolsText(e.target.value)}
          placeholder="Comma-separated tickers"
          aria-label="Screener symbols"
        />
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as Condition)}
          aria-label="Screener condition"
          className="rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="any">All</option>
          <option value="oversold">RSI ≤ 30 (oversold)</option>
          <option value="overbought">RSI ≥ 70 (overbought)</option>
        </select>
        <Button onClick={run} disabled={loading}>
          {loading ? 'Scanning…' : 'Scan'}
        </Button>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">
            <Spinner className="h-4 w-4" /> Scanning…
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-4 text-sm text-zinc-500">No symbols match this condition.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500">
                <th className="py-1">Symbol</th>
                <th className="py-1 text-right">RSI(14)</th>
                <th className="py-1 text-right">Signal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.symbol}
                  onClick={() => setSymbol(r.symbol)}
                  className="cursor-pointer border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <td className="py-1.5 font-medium">{r.symbol}</td>
                  <td className="py-1.5 text-right tabular-nums">{r.rsi?.toFixed(1)}</td>
                  <td className="py-1.5 text-right">
                    {r.rsi! >= 70 ? (
                      <span className="text-bear">Overbought</span>
                    ) : r.rsi! <= 30 ? (
                      <span className="text-bull">Oversold</span>
                    ) : (
                      <span className="text-zinc-500">Neutral</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
