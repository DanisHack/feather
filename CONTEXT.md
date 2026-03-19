# Feather — Project Context

> Premium US equity research Mac app for UAE-based investors. $99/mo or $990/yr.

## Stack

| Layer | Tech |
|-------|------|
| Shell | Electron 28 (frameless Mac window) |
| Frontend | React 18 + TypeScript (strict) + Vite 6 |
| Styling | Tailwind CSS (design tokens in `src/design-system/tokens.ts`) |
| Animation | Framer Motion |
| Charts | TradingView Lightweight Charts |
| State | Zustand |
| Auth | Clerk (Google OAuth only) |
| Billing | Stripe (no DB — Clerk `publicMetadata` stores subscription snapshot) |
| Market Data | Polygon.io (REST + WebSocket) + Yahoo Finance (fallback) |
| AI | Claude API (proxied through Express server) |
| Broker Sync | Plaid |
| Backend | Express/tsx (planned Railway deploy) |

## Where We Left Off (End of Day 8)

**Completed (Days 1-8):**
- Project scaffold, Electron shell, sidebar navigation, routing
- Design system extracted from Fey.com (11 components, full token set)
- Stock Research screen (chart, key stats, tabs, news, analyst estimates, financials, analysis)
- Watchlist (multi-list tabs, live WebSocket quotes, add/remove stocks, sparklines)
- Morning Brief (market bar, AI brief card, news feed with sentiment)
- Portfolio (header, performance chart, holdings, broker connect, manual entry, demo/paper/real tabs)
- AI Screener (NL search, parsed filter pills, results table, fuzzy matching, mock data)
- Earnings (calendar grid, upcoming strip, detail panel, day/week/month toggle)
- Markets (indices bar, sector heatmap, economic indicators, economic calendar)
- Command Bar (Cmd+K, fuzzy search, keyboard nav, grouped results)
- Auth + Billing (Clerk login, Stripe checkout, trial logic, settings/subscription management)

**Not yet wired (using mocks or TODO):**
- Claude API for morning brief generation & per-article summaries
- Claude API for real screener NL→filter parsing
- Polygon.io earnings endpoint (using mock earnings data)
- Plaid sandbox → real broker holdings
- Stripe webhooks for local dev
- Onboarding flow (Day 9)
- Polish pass — skeletons, error boundaries, animations (Day 9)
- Backend deploy, code signing, landing page, launch (Day 10)

## Project Structure

```
feather/
├── electron/           # Electron main process + menu
├── server/             # Express backend
│   ├── index.ts
│   ├── middleware/     # auth.ts, rateLimit.ts
│   ├── lib/            # stripe.ts
│   ├── db/             # client.ts
│   └── routes/         # ai, analysis, auth, market, portfolio,
│                       # stripeWebhook, subscriptions, watchlist
├── src/
│   ├── layout/         # AppShell, Sidebar, TitleBar, CommandBar
│   ├── components/     # AuthGate, FeatherLogo, WelcomeScreen
│   ├── design-system/
│   │   ├── tokens.ts   # All color/spacing/typography tokens
│   │   ├── index.ts
│   │   └── components/ # Badge, Button, Card, EmptyState, PriceChange,
│   │                   # Skeleton, Sparkline, StockLogo, StockRow,
│   │                   # TabBar, Tooltip
│   ├── screens/
│   │   ├── Auth/           # LoginScreen, PaywallScreen
│   │   ├── Earnings/       # Earnings, Calendar, Detail, Event, Header, Strip
│   │   ├── Markets/        # Markets, IndicesBar, SectorHeatmap,
│   │   │                   # EconomicIndicators, EconomicCalendar
│   │   ├── MorningBrief/   # MorningBrief, MarketBar, BriefCard, NewsCard, NewsFeed
│   │   ├── Portfolio/      # Portfolio, Header, Chart, Holdings, Tabs,
│   │   │                   # DemoTab, RealTab, PaperTab, BrokerConnect,
│   │   │                   # ManualEntry, PaperTradeModal
│   │   ├── Screener/       # Screener, Input, Empty, Suggestions,
│   │   │                   # ResultsTable, ParsedFilters
│   │   ├── Settings/       # Settings, Subscription, BrokerConnections
│   │   ├── StockResearch/  # StockResearch, Header, PriceChart, KeyStats,
│   │   │                   # TabBar, OverviewTab, FinancialsTab, AnalysisTab,
│   │   │                   # AnalystEstimates, StockNews, Financials,
│   │   │                   # InsiderTable, PeerComparison, PlaceholderTab
│   │   └── Watchlist/      # Watchlist, Tabs, Row, Empty, AddStock, AddToWatchlist
│   ├── hooks/          # 17 hooks (useAuth, usePolygon, usePolygonWS,
│   │                   # useStockData, useWatchlist, usePortfolio,
│   │                   # useScreener, useEarnings, useMarkets, useNews,
│   │                   # useAI, useAnalysis, useCommandBar, useSignOut,
│   │                   # useCheckoutReturn, usePaperPortfolio, useSubscriptionSync)
│   ├── store/          # Zustand stores: portfolio, research, ui, user, watchlist
│   ├── types/          # index, analysis, earnings, news, portfolio, screener, stock, user
│   ├── lib/            # api, claude, constants, dataSanity, formatters,
│   │                   # plaid, polygon, stripe, yahoo
│   └── mocks/          # demoPortfolio, earnings, markets, news, paperPortfolio,
│                       # portfolio, screener, stocks, tickers, watchlist
├── assets/             # App icons and logos
├── design-reference/   # Fey.com reference frames by section
└── screenshots/        # App screenshots
```

## Key Patterns

- **Data flow:** Component → `useXxx` hook → `src/lib/polygon.ts` or server proxy → Polygon.io/Yahoo
- **AI proxy:** Frontend → `src/lib/claude.ts` → `server/routes/ai.ts` → Claude API
- **Auth gate:** `AuthGate` wraps all routes; unauthenticated → `LoginScreen`; no subscription → `PaywallScreen`
- **Billing:** Stripe Checkout (7-day trial, card required) → Clerk `publicMetadata` stores plan/status
- **State:** Zustand stores for portfolio, watchlist, UI, user, research
- **No localStorage/sessionStorage** — all state in Zustand or Clerk

## Environment & API Keys

All in `.env` (not committed):
- `VITE_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `VITE_POLYGON_API_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY` / `VITE_STRIPE_PUBLISHABLE_KEY`
- `PLAID_CLIENT_ID` / `PLAID_SECRET`

## Stripe Test Prices

- Monthly: `price_1TH0sFBfaZpgtGkAu1VU2ZF4` ($99/mo)
- Annual: `price_1TH0sHBfaZpgtGkAgfdPhP5m` ($990/yr)

## Commands

```bash
npm run dev          # Vite dev server (browser)
npm run dev:electron # Vite + Electron
npm run server       # Express backend (tsx)
npm run typecheck    # tsc --noEmit
npm run build:mac    # Electron Builder → .dmg
```

## Known Issues

- `yahoo-finance2` v3 `yf.quote()` returns `sector: undefined` — static `SECTOR_MAP` in `server/routes/market.ts`
- Never use `require()` in frontend (Vite ESM)
- Stripe webhooks not set up for local dev — status endpoint has Stripe API fallback
- Morning Brief is the slowest screen (~2.4s) — needs parallel API calls + caching

## Next Up (Day 9-10)

1. Onboarding flow (sector select → stock pick → broker connect)
2. Polish pass (skeletons, error boundaries, transitions, app icon)
3. Wire remaining Claude API endpoints (morning brief, screener, summaries)
4. Backend deploy to Railway
5. Code signing + .dmg build
6. Landing page at getfeather.app
7. Ship to 20 founding users
