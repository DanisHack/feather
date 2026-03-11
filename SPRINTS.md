# Feather — 10-Day Sprint Plan
**Goal:** Ship to 20 founding users at getfeather.app
**Price:** $99/month | $799/year
**Stack:** Electron + React + TypeScript + Polygon.io + Claude API

---

## CURRENT STATUS
- [x] Project scaffold generated
- [x] Design system extracted from Fey.com
- [x] Domain purchased: getfeather.app
- [x] Electron shell + Sidebar (Screen 1) ✅

---

## DAY 1 — Foundation ✅ DONE
- [x] Run scaffold prompt → full project structure
- [x] npm install → compiles cleanly
- [x] Design system extracted from Fey.com CSS
- [x] tailwind.config.js updated with real Fey tokens
- [x] tokens.ts updated with real values
- [x] Electron shell opens as frameless Mac window
- [x] Sidebar with 7 icons + settings pinned bottom
- [x] Dark #0A0A0A background
- [x] FEATHER in titlebar
- [x] Active nav state (indigo left border)
- [x] Routing between placeholder screens
- [x] Rename project Flint → Feather everywhere

---

## DAY 2 — Stock Research Screen
> Most important screen. Most reusable components.

- [x] StockHeader (logo, name, ticker, price, change)
- [x] Time range selector (1D 1W 1M 3M 1Y ALL)
- [x] PriceChart (TradingView, area chart, indigo color)
- [x] KeyStats grid (8 stats, glass cards)
- [x] TabBar (Overview / Financials / Earnings / Insiders / News)
- [x] Overview tab (description + about grid)
- [x] Right panel: News feed with AI summaries
- [x] Right panel: Analyst estimates section
- [x] All with mock data from src/mocks/stocks.ts
- [x] Sidebar Research icon navigates here
- [x] Visual match to design-reference/frames/graphs/

---

## DAY 3 — Watchlist + Real-Time Quotes
- [x] WatchlistTabs (multiple named lists)
- [x] WatchlistRow (logo, ticker, name, price, % change, sparkline)
- [x] Add ticker flow (search modal)
- [x] Remove ticker (right click or swipe)
- [ ] Drag to reorder within list
- [x] Empty state ("Add your first stock")
- [x] Wire Polygon.io WebSocket for live quotes
- [x] Replace mock prices with real-time data
- [x] Test with AAPL, NVDA, MSFT, GOOGL
- [x] Visual match to design-reference/frames/watchlist/

---

## DAY 4 — Morning Brief + News Feed
- [x] MarketBar strip (SPY, QQQ, BTC, VIX — top of screen)
- [x] BriefCard (AI-generated daily recap)
- [ ] Wire Claude API for morning brief generation
- [x] NewsCard component (source, headline, time, AI summary)
- [x] NewsFeed virtualized list
- [x] Wire Polygon.io news endpoint
- [ ] Per-article Claude API summaries (1 sentence)
- [x] Group by Today / This Week
- [x] Sentiment indicator (positive/negative/neutral dot)
- [x] Empty state
- [x] Visual match to design-reference/frames/news/
  and design-reference/frames/daily-recap/

---

## DAY 5 — Portfolio + Plaid Integration
> Hardest integration day. Budget extra time.

- [x] PortfolioHeader (total value, day P&L, total return)
- [x] PerformanceChart (portfolio vs SPY benchmark)
- [x] HoldingRow (logo, ticker, value, avg cost, return, broker badge)
- [x] HoldingsSection (collapsible groups by broker, sort dropdown)
- [x] BrokerConnect flow (Plaid Link in Electron)
- [x] Manual entry fallback (add position manually)
- [ ] Wire Plaid sandbox → real holdings
- [x] Wire Polygon.io live prices to holdings
- [x] Empty state ("Connect your broker")
- [x] Visual match to design-reference/frames/fey-ui/

---

## DAY 6 — AI Screener
- [x] ScreenerEmpty (centered "Find any stock", large input with indigo glow, 8 suggestion pills)
- [x] ScreenerInput (top-of-page search bar in results state)
- [x] Suggestions list (8 preset queries in 2 rows of 4)
- [ ] Wire Claude API: NL query → ScreenerFilter[]
- [x] ParsedFilters (editable pill tags with remove, stagger animation)
- [x] ResultsTable (company, price, change, mkt cap, P/E, revenue, sector)
- [x] ResultsTableSkeleton (loading state with animated skeleton rows)
- [x] useScreener hook (results, filters, loading, search, clear)
- [x] Mock data (5 query-specific result sets, 40 stocks, matchScreenerQuery)
- [x] Client-side fuzzy query matching
- [x] Two-state architecture (empty → results with AnimatePresence)
- [x] Loading state ("Analyzing your query..." with pulsing dots)
- [x] Stagger animations on result rows (50ms delay each)
- [x] Keyboard shortcuts (/ to focus, Escape to clear)
- [x] Test queries:
  - "profitable tech stocks under $50"
  - "high dividend yield above 4%"
  - "AI stocks with revenue growth"
  - "small-cap with insider buying"
  - "recovering from 52-week low"
- [x] Visual match to design-reference/frames/finder/

---

## DAY 7 — Earnings Calendar + Markets
**Earnings:**
- [x] EarningsHeader (title, month label, Day/Week/Month toggle pills)
- [x] UpcomingStrip (7-day horizontal scrollable strip, today highlighted indigo)
- [x] EarningsCalendar (5-column Mon-Fri grid, week navigation arrows)
- [x] EarningsEvent card (logo, ticker, BMO/AMC badge, beat/miss indicator)
- [x] EarningsDetail panel (estimates/actuals, historical EPS bar chart, AI summary)
- [x] Two-column layout (65%/35%) when detail open
- [x] Mock data: 23 earnings across 3 weeks (Mar 10-27)
- [x] Loading skeleton + error state
- [ ] Wire Polygon.io earnings endpoint
- [x] Visual match to design-reference/frames/earnings/

**Markets:**
- [x] IndicesBar (S&P 500, NASDAQ, DOW, RUSSELL 2000 — cards with sparklines)
- [x] SectorHeatmap (11 GICS sectors, color by % change, 6-tier green/red)
- [x] EconomicIndicators (Fed Funds, CPI, Unemployment, GDP — 4 cards with icons)
- [x] EconomicCalendar (10 upcoming macro events, impact dots, forecast/previous)
- [x] Loading skeleton + error state
- [x] Wire Polygon.io indices + sector ETFs
- [x] Visual match to design-reference/frames/markets/
  and design-reference/frames/economics/

---

## DAY 8 — ⌘K Command Bar + Auth + Stripe
**Command Bar:**
- [x] Global ⌘K shortcut registered in Electron
- [x] Full-screen overlay, dark blur background
- [x] Search input (large, centered)
- [x] Results grouped: Stocks | Screens | Recent | Actions
- [x] Fuzzy search across all tickers
- [x] Keyboard navigation (↑↓ arrows, Enter, Esc)
- [x] Navigate to stock research on select
- [x] Visual match to design-reference/frames/fey-ui/

**Auth + Payments:**
- [x] Clerk auth integration
- [x] Login / signup screen
- [x] Protect all routes (redirect to login if not authed)
- [x] Stripe monthly plan ($99/month)
- [x] Stripe annual plan ($799/year)
- [x] 14-day free trial logic
- [x] Trial expired screen + upgrade CTA
- [x] Settings screen (billing, subscription status)
- [x] Cancel subscription flow

---

## DAY 9 — Onboarding + Polish
**Onboarding:**
- [ ] First launch detection
- [ ] Step 1: "What sectors do you follow?" (multi-select)
- [ ] Step 2: "Pick 5 stocks to watch" (search + select)
- [ ] Step 3: "Connect your broker or add manually"
- [ ] Pre-populate watchlist from selections
- [ ] Pre-populate morning brief based on selections
- [ ] Skip option on every step

**Polish:**
- [ ] Loading skeletons on every data-fetching component
- [ ] Error boundaries on every screen
- [ ] Empty states on every screen
- [ ] Framer Motion: screen transitions (fade in)
- [ ] Framer Motion: card hover micro-interactions
- [ ] Framer Motion: sidebar active state transition
- [ ] App icon (feather icon, dark background)
- [ ] Mac dock icon
- [ ] Window title updates per screen
- [ ] Keyboard shortcuts documented

---

## DAY 10 — Backend + Deploy + Ship 🚀
**Backend (Railway):**
- [ ] Railway account setup
- [ ] PostgreSQL provisioned
- [ ] Redis provisioned
- [ ] Node.js API server deployed
- [ ] All env vars configured in Railway
- [ ] Auth routes live (Clerk webhooks)
- [ ] Stripe webhooks live
- [ ] Plaid routes live
- [ ] Claude API proxy live
- [ ] Watchlist CRUD live

**App Distribution:**
- [ ] Apple Developer Program enrolled ($99)
- [ ] Code signing configured
- [ ] Build .dmg installer
- [ ] Test clean install on fresh Mac
- [ ] Notarization (Apple requirement for distribution)

**Landing Page (getfeather.app):**
- [ ] Single HTML page deployed to Vercel
- [ ] Hero with real app screenshot
- [ ] 6 feature sections
- [ ] Pricing section ($99/month or $799/year)
- [ ] "Start 14-day free trial" CTA
- [ ] FAQ (8 questions)
- [ ] Point getfeather.app DNS to Vercel

**Launch:**
- [ ] Send .dmg to 20 founding users
- [ ] Personal LinkedIn post
- [ ] Personal WhatsApp/DM to UAE contacts
- [ ] Set up support@getfeather.app
- [ ] Monitor first signups

---

## BACKLOG (Post-Launch)
These are real features but not needed for first 20 users.
Build these once you have paying users and feedback.

- [ ] Financials tab (income statement, balance sheet, cash flow)
- [ ] Insiders tab (SEC Form 4 transactions)
- [ ] Peer comparison table
- [ ] Stock comparison chart (overlay multiple tickers)
- [ ] Earnings call audio player
- [ ] Press release instant summaries
- [ ] Price alerts (desktop notifications)
- [ ] Analyze screen (AI document analysis)
- [ ] Shared watchlists (social layer)
- [ ] Weekly email digest
- [ ] Mobile companion app
- [ ] Saudi Tadawul data (GCC expansion)
- [ ] Dark/light theme toggle
- [ ] CSV export of holdings/watchlist

---

## METRICS TO TRACK FROM DAY 1

| Metric | Target | Current |
|--------|--------|---------|
| Founding users | 20 | 0 |
| Paying users | 20 | 0 |
| MRR | $1,980 | $0 |
| Daily opens (DAU) | >80% of users | - |
| Trial → Paid conversion | >30% | - |
| Month 1 churn | <5% | - |

---

## QUICK REFERENCE

**Run app:** `npm run dev`
**Type check:** `npm run typecheck`
**Build dmg:** `npm run build:mac`
**Deploy backend:** `railway up`

**Key files:**
- `CLAUDE.md` — project bible, read every session
- `DESIGN_SYSTEM.md` — design spec
- `src/design-system/tokens.ts` — all color tokens
- `design-reference/frames/` — Fey screen references

**APIs:**
- Polygon.io — market data
- Claude API — AI features (proxy via backend)
- Plaid — broker sync
- Stripe — billing
- Clerk — auth
- Railway — backend hosting

**Support:** support@getfeather.app
**Domain:** getfeather.app
**Pricing:** $99/month | $799/year | 14-day trial
```
