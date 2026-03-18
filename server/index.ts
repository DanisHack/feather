import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { stripeWebhookRouter } from './routes/stripeWebhook';
import { authRouter } from './routes/auth';
import { subscriptionsRouter } from './routes/subscriptions';
import { portfolioRouter } from './routes/portfolio';
import { aiRouter } from './routes/ai';
import { watchlistRouter } from './routes/watchlist';
import { marketRouter } from './routes/market';
import { analysisRouter } from './routes/analysis';
import { verifyAuth } from './middleware/auth';
import { rateLimit } from './middleware/rateLimit';

const app = express();
const PORT = process.env.PORT ?? 3001;

// Security + CORS
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'app://feather'] }));
app.use(rateLimit);

// ── Webhook routes BEFORE express.json() (need raw body) ──
app.use('/api/subscriptions/webhook', stripeWebhookRouter);
app.use('/api/auth/webhook', authRouter);

// ── JSON body parsing for everything else ──
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/market', marketRouter);
app.use('/api/analysis', analysisRouter);

// Protected routes
app.use('/api/subscriptions', verifyAuth, subscriptionsRouter);
app.use('/api/portfolio', verifyAuth, portfolioRouter);
app.use('/api/ai', verifyAuth, aiRouter);
app.use('/api/watchlist', verifyAuth, watchlistRouter);

app.listen(PORT, () => {
  console.log(`Feather server running on port ${PORT}`);
});
