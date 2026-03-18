import { Router } from 'express';

export const portfolioRouter = Router();

// Create Plaid link token
portfolioRouter.post('/link-token', (_req, res) => {
  // TODO: create Plaid link token
  res.json({ linkToken: 'link-sandbox-placeholder' });
});

// Exchange public token for access token
portfolioRouter.post('/exchange-token', (req, res) => {
  const { publicToken } = req.body;
  // TODO: exchange via Plaid API, store access token in DB
  res.json({ accessToken: `access-${publicToken}` });
});

// Get connected accounts
portfolioRouter.get('/accounts', (_req, res) => {
  // TODO: fetch from database + Plaid
  res.json({ accounts: [] });
});

// Get holdings for a specific account
portfolioRouter.get('/accounts/:id/holdings', (req, res) => {
  // TODO: fetch from Plaid
  res.json({ id: req.params.id, holdings: [] });
});

// Disconnect broker
portfolioRouter.delete('/accounts/:id', (req, res) => {
  // TODO: remove from database, revoke Plaid access token
  res.json({ deleted: req.params.id });
});
