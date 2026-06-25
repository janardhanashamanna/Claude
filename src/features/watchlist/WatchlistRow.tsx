import { useQuote } from '../../hooks/marketDataHooks';
import { formatPercent, formatPrice } from '../../lib/format';
import { cn } from '../../lib/cn';
import { Sparkline } from './Sparkline';

interface Props {
  symbol: string;
  onSelect: (s: string) => void;
  onRemove: (s: string) => void;
}

export function WatchlistRow({ symbol, onSelect, onRemove }: Props) {
  const { data: quote, isLoading } = useQuote(symbol);
  const up = (quote?.change ?? 0) >= 0;

  return (
    <tr className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
      <td className="py-2">
        <button onClick={() => onSelect(symbol)} className="font-semibold hover:underline">
          {symbol}
        </button>
      </td>
      <td className="py-2 text-right tabular-nums">{isLoading ? '…' : formatPrice(quote?.price)}</td>
      <td className={cn('py-2 text-right tabular-nums', up ? 'text-bull' : 'text-bear')}>
        {isLoading ? '…' : formatPercent(quote?.percentChange)}
      </td>
      <td className="hidden py-2 sm:table-cell">
        <div className="flex justify-end">
          <Sparkline symbol={symbol} />
        </div>
      </td>
      <td className="py-2 text-right">
        <button
          onClick={() => onRemove(symbol)}
          aria-label={`Remove ${symbol} from watchlist`}
          className="text-zinc-400 hover:text-bear"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
