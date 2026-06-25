import { useEffect, useRef, useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/States';
import { useDebounce } from '../../hooks/useDebounce';
import { useSymbolSearch } from '../../hooks/marketDataHooks';
import { useSymbol } from '../../state/SymbolContext';

export function SearchBox() {
  const { setSymbol } = useSymbol();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 300);
  const { data, isFetching } = useSymbolSearch(debounced);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const choose = (symbol: string) => {
    setSymbol(symbol);
    setQuery('');
    setOpen(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const first = data?.[0]?.symbol ?? query.trim().toUpperCase();
    if (first) choose(first);
  };

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <form onSubmit={onSubmit}>
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search ticker or company…"
          aria-label="Search for a stock"
        />
      </form>
      {open && debounced.trim() && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {isFetching && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500">
              <Spinner className="h-4 w-4" /> Searching…
            </div>
          )}
          {!isFetching && data?.length === 0 && (
            <div className="px-3 py-2 text-sm text-zinc-500">No matches.</div>
          )}
          {data?.map((m) => (
            <button
              key={m.symbol}
              onClick={() => choose(m.symbol)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="font-semibold">{m.symbol}</span>
              <span className="ml-3 truncate text-zinc-500">{m.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
