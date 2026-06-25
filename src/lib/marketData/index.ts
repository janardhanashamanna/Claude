import { FinnhubProvider } from './finnhub';
import { MockProvider } from './mock';
import { MarketDataProvider } from './types';

export * from './types';

function createProvider(): MarketDataProvider {
  const key = import.meta.env.VITE_FINNHUB_API_KEY;
  if (key && key.trim().length > 0) {
    return new FinnhubProvider(key.trim());
  }
  return new MockProvider();
}

/** App-wide singleton. Swap the implementation here to change data sources. */
export const marketData: MarketDataProvider = createProvider();

/** True when running against live data rather than the offline mock. */
export const isLiveData = marketData.name !== new MockProvider().name;
