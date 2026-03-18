// PostgreSQL schema for Feather
// TODO: implement with Drizzle ORM or Prisma

export const schema = `
  -- Users (synced from Clerk)
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Subscriptions
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'trialing',
    plan TEXT NOT NULL DEFAULT 'monthly',
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Watchlists
  CREATE TABLE IF NOT EXISTS watchlists (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Watchlist items
  CREATE TABLE IF NOT EXISTS watchlist_items (
    id TEXT PRIMARY KEY,
    watchlist_id TEXT REFERENCES watchlists(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(watchlist_id, ticker)
  );

  -- Broker connections (Plaid)
  CREATE TABLE IF NOT EXISTS broker_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    plaid_access_token TEXT NOT NULL,
    plaid_item_id TEXT NOT NULL,
    broker_name TEXT,
    account_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
  CREATE INDEX IF NOT EXISTS idx_watchlist_items_list ON watchlist_items(watchlist_id);
  CREATE INDEX IF NOT EXISTS idx_broker_connections_user ON broker_connections(user_id);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
`;
