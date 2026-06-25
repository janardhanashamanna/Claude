import { ReactNode } from 'react';
import { Button } from './ui/Button';
import { SearchBox } from '../features/quotes/SearchBox';
import { isLiveData, marketData } from '../lib/marketData';
import { useTheme } from '../state/useTheme';

export function Layout({ children }: { children: ReactNode }) {
  const [theme, toggleTheme] = useTheme();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="text-lg font-bold">
            📈 Stock <span className="text-blue-500">Analyzer</span>
          </h1>
          <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
            <SearchBox />
          </div>
          <span
            className="hidden rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 sm:inline dark:bg-zinc-800 dark:text-zinc-400"
            title={`Data source: ${marketData.name}`}
          >
            {isLiveData ? '● Live' : '○ Demo data'}
          </span>
          <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-zinc-400">
        Data: {marketData.name}. For educational use only — not investment advice.
      </footer>
    </div>
  );
}
