# Feather — TODO

## Revenue Milestones
- [ ] First paying user → upgrade Polygon to Starter ($29/mo) for full snapshot/screener API (10,000+ stocks vs current 150 universe)
- [ ] Switch screener from Yahoo server endpoint to Polygon `/v2/snapshot/locale/us/markets/stocks/tickers`

## Performance Optimizations (Revisit Later)
- [ ] Fire Polygon + Yahoo index calls in parallel instead of sequential fallback (~0.7s saving on Morning Brief)
- [ ] Add server-side cache (2-min TTL) to `/api/market/indices` Yahoo endpoint
- [ ] Show partial data as it arrives — render indices that return first while others load
- [ ] Polygon response caching is in-memory only — consider persisting across sessions
- [ ] Morning Brief is slowest screen (~2.4s) — prioritize optimizations here
