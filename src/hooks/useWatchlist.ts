import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const KEY = 'stock-analyzer:watchlist';
const DEFAULT = ['AAPL', 'MSFT', 'NVDA'];

export function useWatchlist() {
  const [symbols, setSymbols] = useLocalStorage<string[]>(KEY, DEFAULT);

  const add = useCallback(
    (symbol: string) => {
      const s = symbol.toUpperCase();
      setSymbols((prev) => (prev.includes(s) ? prev : [...prev, s]));
    },
    [setSymbols],
  );

  const remove = useCallback(
    (symbol: string) => {
      const s = symbol.toUpperCase();
      setSymbols((prev) => prev.filter((x) => x !== s));
    },
    [setSymbols],
  );

  const has = useCallback((symbol: string) => symbols.includes(symbol.toUpperCase()), [symbols]);

  const toggle = useCallback(
    (symbol: string) => (has(symbol) ? remove(symbol) : add(symbol)),
    [has, add, remove],
  );

  return { symbols, add, remove, has, toggle };
}
