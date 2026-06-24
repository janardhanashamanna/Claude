# Build Prompt — Stock Analyzer Web App

> Copy everything below the line into a fresh Claude Code session (or run it in
> this repo) to build the app. It is self-contained: stack, features, and a
> definition of done are all specified, so you can start building without asking
> follow-up questions.

---

## Objective

Build a **stock analyzer web app**: a single-page application where a user can
search for a stock ticker, view live quotes and interactive price charts, overlay
technical indicators, inspect company fundamentals, and maintain a watchlist with
price alerts. Ship a clean, responsive, production-quality UI with proper
loading/empty/error states and a swappable market-data layer.

## Tech stack (use these unless you hit a hard blocker)

- **Framework:** React + TypeScript + Vite
- **Styling/UI:** Tailwind CSS + shadcn/ui components, with dark mode
- **Charts:** `lightweight-charts` (TradingView) for price/candlestick charts;
  `recharts` for fundamentals bar/line charts
- **Data fetching/caching:** TanStack Query (React Query)
- **Market data:** Default provider **Finnhub** (free tier). Read the key from
  `import.meta.env.VITE_FINNHUB_API_KEY`. Abstract all data access behind a
  `MarketDataProvider` interface in `src/lib/marketData/` so Alpha Vantage or
  Yahoo Finance can be dropped in without touching feature code.
- **Persistence:** Watchlist and alert rules persisted to `localStorage`
- **Testing:** Vitest + React Testing Library

> Do **not** commit any API keys. Provide a `.env.example` with
> `VITE_FINNHUB_API_KEY=` and document signup in the README.

## Data layer contract

Define and implement this interface first, then build features against it:

```ts
// src/lib/marketData/types.ts
export interface MarketDataProvider {
  searchSymbols(query: string): Promise<SymbolMatch[]>;
  getQuote(symbol: string): Promise<Quote>;                 // price, change, %change, day hi/lo, volume
  getCandles(symbol: string, range: Range): Promise<Candle[]>; // OHLCV time series
  getCompanyProfile(symbol: string): Promise<CompanyProfile>;
  getFundamentals(symbol: string): Promise<Fundamentals>;   // P/E, EPS, revenue, market cap, etc.
}
export type Range = '1D' | '1W' | '1M' | '1Y' | '5Y';
```

Handle Finnhub rate limits gracefully (debounce search, cache via React Query,
surface a friendly "rate limited, retrying" state rather than crashing). If the
API key is missing, fall back to a small bundled **mock provider** so the app is
runnable and testable offline.

## Features (each with acceptance criteria)

### 1. Quotes & charts
- Ticker search box with debounced autocomplete (symbol + company name).
- Selected-symbol header: current price, absolute + % daily change (green/red),
  day high/low, volume, previous close.
- Interactive chart with a toggle between **candlestick** and **line** views.
- Range selector: `1D / 1W / 1M / 1Y / 5Y`, re-fetching the appropriate candles.
- Crosshair/tooltip showing price + date on hover.

### 2. Technical indicators
- Overlay toggles on the price chart: **SMA**, **EMA** (configurable period).
- Separate sub-panels for **RSI** and **MACD**.
- Compute indicators client-side from the candle series (write small, tested
  pure functions in `src/lib/indicators/`).
- Simple **signal badges** (e.g., RSI > 70 → "Overbought", MACD cross → "Bullish").
- A basic **screener**: given a small list of symbols, filter by a chosen
  indicator condition (e.g., "RSI < 30").

### 3. Fundamentals
- Company profile card: name, logo, exchange, sector/industry, description, website.
- Key metrics grid: market cap, P/E, EPS, dividend yield, 52-week high/low, beta.
- Revenue / EPS history as `recharts` bar charts (last several periods).
- Clear "data not available" handling for symbols lacking fundamentals.

### 4. Watchlist & alerts
- Add/remove the current symbol to a persisted **watchlist**.
- Watchlist table with live (polled/refreshed) quote, change %, and a sparkline.
- Click a row to load it into the main analyzer view.
- **Price-threshold alerts:** user sets "notify when AAPL ≥ $200" or "≤ $150".
  Evaluate on refresh and fire a browser **Notification** (request permission
  first) plus an in-app toast. Persist alert rules in `localStorage`.

## UX / non-functional requirements
- Responsive layout (usable on mobile and desktop); dark mode by default with a toggle.
- Every async view has explicit **loading**, **empty**, and **error** states.
- No unhandled promise rejections; network/API errors render an inline retry.
- Accessible: keyboard-navigable search, ARIA labels on interactive controls.
- Keep secrets out of the repo; `.env.example` only.

## Suggested project structure
```
src/
  components/                 # shared UI (shadcn wrappers, layout, theme toggle)
  features/
    quotes/                   # search, quote header, price chart
    indicators/               # indicator overlays, RSI/MACD panels, screener
    fundamentals/             # profile card, metrics grid, history charts
    watchlist/                # watchlist table, alerts manager
  lib/
    marketData/               # MarketDataProvider interface + finnhub & mock impls
    indicators/               # pure SMA/EMA/RSI/MACD functions (unit-tested)
  hooks/                      # useQuote, useCandles, useWatchlist, useAlerts
```

## Definition of done
- `npm install && npm run dev` starts the app; it runs with the **mock provider**
  even when no API key is set.
- With a real `VITE_FINNHUB_API_KEY`, all four feature areas work against live data.
- `npm test` passes; indicator math has unit tests, and key components have at
  least smoke tests.
- A `README.md` documents setup, how to get a free Finnhub key, env vars, and the
  provider-swap mechanism.
- The app seeds with a demo ticker (e.g., `AAPL`) so the first load is non-empty.

## Build order (recommended)
1. Scaffold Vite + TS + Tailwind + shadcn; set up the theme/layout shell.
2. Implement the `MarketDataProvider` interface + mock provider + Finnhub provider.
3. Quotes & charts (search → quote header → price chart with ranges).
4. Indicators (pure functions + overlays + RSI/MACD panels + signals + screener).
5. Fundamentals (profile + metrics + history charts).
6. Watchlist & alerts (persistence + notifications).
7. Tests, README, `.env.example`, and polish of loading/error states.
