import { Button } from '../../components/ui/Button';
import { ErrorState, LoadingState } from '../../components/ui/States';
import { useProfile, useQuote } from '../../hooks/marketDataHooks';
import { useWatchlist } from '../../hooks/useWatchlist';
import { formatCompact, formatPercent, formatPrice, formatSigned } from '../../lib/format';
import { cn } from '../../lib/cn';

export function QuoteHeader({ symbol }: { symbol: string }) {
  const { data: quote, isLoading, isError, refetch } = useQuote(symbol);
  const { data: profile } = useProfile(symbol);
  const { has, toggle } = useWatchlist();

  if (isLoading) return <LoadingState label="Loading quote…" />;
  if (isError || !quote) return <ErrorState message="Could not load quote." onRetry={() => refetch()} />;

  const up = quote.change >= 0;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{quote.symbol}</h1>
          {profile?.name && <span className="text-zinc-500">{profile.name}</span>}
        </div>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="text-3xl font-semibold tabular-nums">{formatPrice(quote.price)}</span>
          <span className={cn('text-lg font-medium tabular-nums', up ? 'text-bull' : 'text-bear')}>
            {formatSigned(quote.change)} ({formatPercent(quote.percentChange)})
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Button variant={has(symbol) ? 'default' : 'outline'} onClick={() => toggle(symbol)}>
          {has(symbol) ? '★ In watchlist' : '☆ Add to watchlist'}
        </Button>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-right text-xs text-zinc-500">
          <Stat label="Open" value={formatPrice(quote.open)} />
          <Stat label="Prev close" value={formatPrice(quote.previousClose)} />
          <Stat label="Day high" value={formatPrice(quote.high)} />
          <Stat label="Day low" value={formatPrice(quote.low)} />
          {quote.volume > 0 && <Stat label="Volume" value={formatCompact(quote.volume)} />}
        </dl>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt>{label}</dt>
      <dd className="font-medium text-zinc-700 tabular-nums dark:text-zinc-200">{value}</dd>
    </div>
  );
}
