# Feather — Project Bible

## What we're building
Premium US equity research Mac app for UAE-based investors.
Fey.com-inspired design. $99/month. Electron + React + TypeScript.

## Core principle
Every screen must have: loading state → error state → empty state → data state.
Never show raw data without formatting. Never show spinners — use skeletons.

## Stack
- Electron 28 + React 18 + TypeScript (strict)
- Tailwind CSS (no custom CSS files ever)
- Framer Motion (all animations)
- TradingView Lightweight Charts (all charts)
- Zustand (all global state)

## APIs
- Polygon.io: all market data → use /src/lib/polygon.ts client
- Claude API: all AI features → proxy through /server/routes/ai.ts
- Plaid: broker sync → use /src/lib/plaid.ts
- Stripe: billing → use /src/lib/stripe.ts
- Clerk: auth → use /src/hooks/useAuth.ts

## Design tokens
All in /src/design-system/tokens.ts and tailwind.config.js
NEVER hardcode hex colors in components. ALWAYS use design tokens.

## Design reference
Visual reference frames extracted from Fey.com live site are at:
  ./design-reference/frames/<section>/
Sections: analyze, daily-recap, earnings, economics, fey-ui, finder, graphs, markets, news, watchlist.
Each folder has timestamped PNGs (at_0s, at_3s …) plus sequential frames.
When building any screen, ALWAYS open the matching reference folder first and study every frame before writing JSX.

## Critical rules
1. NEVER use localStorage or sessionStorage
2. NEVER call APIs directly in components — use hooks in /src/hooks/
3. NEVER use 'any' TypeScript type
4. ALWAYS use components from /src/design-system/ before creating new ones
5. ALWAYS handle loading + error + empty states
6. ALL new UI components go in /src/design-system/components/ first
7. Use mock data from /src/mocks/ during development, flag with // TODO: wire real data

## File naming
- Components: PascalCase.tsx
- Hooks: camelCase.ts with 'use' prefix
- Utils: camelCase.ts
- Types: camelCase.ts

## Current build status
[Update this section after each session]
- [x] Project scaffold
- [x] Design system (Fey.com tokens integrated)
- [x] Electron shell + sidebar
- [ ] Morning Brief screen
- [x] Stock Research screen
- [ ] Portfolio screen
- [x] Watchlist screen
- [ ] Screener screen
- [ ] Earnings screen
- [ ] Markets screen
- [ ] Settings screen
- [ ] Auth + Stripe
- [ ] Backend (Railway)
