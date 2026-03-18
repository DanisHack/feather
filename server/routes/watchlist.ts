import { Router } from 'express';

export const watchlistRouter = Router();

// Get all watchlists for user
watchlistRouter.get('/', (_req, res) => {
  // TODO: fetch from database
  res.json({
    lists: [
      { id: 'default', name: 'Main', tickers: ['AAPL', 'NVDA', 'MSFT', 'GOOGL'] },
    ],
  });
});

// Create watchlist
watchlistRouter.post('/', (req, res) => {
  const { name } = req.body;
  // TODO: save to database
  res.json({ id: crypto.randomUUID(), name, tickers: [] });
});

// Update watchlist
watchlistRouter.put('/:id', (req, res) => {
  const { name, tickers } = req.body;
  // TODO: update in database
  res.json({ id: req.params.id, name, tickers });
});

// Delete watchlist
watchlistRouter.delete('/:id', (req, res) => {
  // TODO: delete from database
  res.json({ deleted: req.params.id });
});

// Add ticker to watchlist
watchlistRouter.post('/:id/tickers', (req, res) => {
  const { ticker } = req.body;
  // TODO: add to database
  res.json({ added: ticker });
});

// Remove ticker from watchlist
watchlistRouter.delete('/:id/tickers/:ticker', (req, res) => {
  // TODO: remove from database
  res.json({ removed: req.params.ticker });
});
