import { Layout } from './components/Layout';
import { AnalyzerPanel } from './features/quotes/AnalyzerPanel';
import { Fundamentals } from './features/fundamentals/Fundamentals';
import { Watchlist } from './features/watchlist/Watchlist';
import { AlertsManager } from './features/watchlist/AlertsManager';
import { Screener } from './features/indicators/Screener';
import { useSymbol } from './state/SymbolContext';
import { useTheme } from './state/useTheme';

export function App() {
  const { symbol } = useSymbol();
  const [theme] = useTheme();

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AnalyzerPanel symbol={symbol} dark={theme === 'dark'} />
          <Fundamentals symbol={symbol} />
        </div>
        <aside className="space-y-4">
          <Watchlist />
          <AlertsManager symbol={symbol} />
          <Screener />
        </aside>
      </div>
    </Layout>
  );
}
