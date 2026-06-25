import { Card, CardTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/States';
import { useWatchlist } from '../../hooks/useWatchlist';
import { useSymbol } from '../../state/SymbolContext';
import { WatchlistRow } from './WatchlistRow';

export function Watchlist() {
  const { symbols, remove } = useWatchlist();
  const { setSymbol } = useSymbol();

  return (
    <Card>
      <CardTitle>Watchlist</CardTitle>
      {symbols.length === 0 ? (
        <EmptyState message="No symbols yet. Add one from the quote header." />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500">
              <th className="py-1">Symbol</th>
              <th className="py-1 text-right">Price</th>
              <th className="py-1 text-right">Change</th>
              <th className="hidden py-1 text-right sm:table-cell">30d</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {symbols.map((s) => (
              <WatchlistRow key={s} symbol={s} onSelect={setSymbol} onRemove={remove} />
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
