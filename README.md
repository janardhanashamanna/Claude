# Stock Analyzer

A single-page stock analyzer web app: search tickers, view live quotes and
interactive price charts, overlay technical indicators, inspect company
fundamentals, and maintain a watchlist with price alerts.

Built from the spec in [`PROMPT.md`](./PROMPT.md).

> ⚠️ For educational use only — not investment advice.

## Features

- **Quotes & charts** — debounced symbol search, live quote header (price,
  change, day high/low, volume), candlestick/line chart with `1D / 1W / 1M / 1Y / 5Y`
  ranges (TradingView `lightweight-charts`).
- **Technical indicators** — SMA/EMA overlays, RSI and MACD sub-panels, signal
  badges (overbought/oversold, MACD cross, trend), and a multi-symbol RSI screener.
- **Fundamentals** — company profile, key metrics (market cap, P/E, EPS, dividend
  yield, 52-week range, beta), and revenue/EPS history bar charts.
- **Watchlist & alerts** — localStorage-persisted watchlist with live quotes and
  sparklines, plus price-threshold alerts that fire a browser notification and
  in-app toast.

## Tech stack

React + TypeScript + Vite · Tailwind CSS (dark mode) · TanStack Query ·
`lightweight-charts` + `recharts` · Vitest + React Testing Library.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

The app runs out of the box with **no API key** using a built-in offline mock
data provider (deterministic, seeded demo data for AAPL, MSFT, GOOGL, etc.).

### Using live data (Finnhub)

1. Get a free API key at <https://finnhub.io/register>.
2. Copy the example env file and add your key:
   ```bash
   cp .env.example .env
   # edit .env → VITE_FINNHUB_API_KEY=your_key_here
   ```
3. Restart the dev server. The header badge switches from `○ Demo data` to `● Live`.

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start the Vite dev server            |
| `npm run build`  | Type-check and build for production  |
| `npm run preview`| Preview the production build         |
| `npm test`       | Run the Vitest suite                 |

## Swapping the data provider

All market data flows through the `MarketDataProvider` interface in
[`src/lib/marketData/types.ts`](./src/lib/marketData/types.ts). Two
implementations ship today:

- `FinnhubProvider` (`finnhub.ts`) — live REST data.
- `MockProvider` (`mock.ts`) — offline, deterministic demo data.

The active provider is selected in
[`src/lib/marketData/index.ts`](./src/lib/marketData/index.ts) (Finnhub when
`VITE_FINNHUB_API_KEY` is set, otherwise the mock). To add Alpha Vantage, Yahoo,
etc., implement the interface and wire it up there — no feature code changes.

## Project structure

```
src/
  components/      shared UI primitives + layout
  features/
    quotes/        search, quote header, price chart, analyzer panel
    indicators/    RSI/MACD panels, signal badges, screener
    fundamentals/  profile, metrics, history charts
    watchlist/     watchlist table, sparkline, alerts
  hooks/           React Query + localStorage hooks
  lib/
    marketData/    provider interface + finnhub & mock implementations
    indicators/    pure SMA/EMA/RSI/MACD/signals (unit-tested)
  state/           symbol, theme, and toast contexts
```
