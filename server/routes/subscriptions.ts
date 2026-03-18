import { Router, type Request, type Response } from 'express';
import { stripe, getOrCreateStripeCustomer, syncSubscriptionToClerk } from '../lib/stripe';
import type Stripe from 'stripe';

export const subscriptionsRouter = Router();

const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);

// ─── POST /checkout ────────────────────────────────────────
subscriptionsRouter.post('/checkout', async (req: Request, res: Response) => {
  if (!hasStripe || !stripe) {
    res.status(503).json({ error: 'Stripe not configured' });
    return;
  }

  const clerkUserId = req.clerkUserId!;
  const { plan } = req.body as { plan: 'monthly' | 'annual' };

  const priceId = plan === 'annual'
    ? process.env.STRIPE_ANNUAL_PRICE_ID
    : process.env.STRIPE_MONTHLY_PRICE_ID;

  if (!priceId) {
    res.status(500).json({ error: 'Price ID not configured' });
    return;
  }

  try {
    const customerId = await getOrCreateStripeCustomer(clerkUserId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { clerkUserId },
      },
      success_url: `${process.env.VITE_APP_URL ?? 'http://localhost:5173'}/?checkout=success`,
      cancel_url: `${process.env.VITE_APP_URL ?? 'http://localhost:5173'}/?checkout=canceled`,
      metadata: { clerkUserId },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe] Checkout session error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ─── POST /portal ──────────────────────────────────────────
subscriptionsRouter.post('/portal', async (req: Request, res: Response) => {
  if (!hasStripe || !stripe) {
    res.status(503).json({ error: 'Stripe not configured' });
    return;
  }

  const clerkUserId = req.clerkUserId!;

  try {
    const customerId = await getOrCreateStripeCustomer(clerkUserId);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.VITE_APP_URL ?? 'http://localhost:5173'}/settings`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe] Portal session error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// ─── GET /status ───────────────────────────────────────────
subscriptionsRouter.get('/status', async (req: Request, res: Response) => {
  const clerkUserId = req.clerkUserId!;

  // Dev mode — return mock active subscription
  if (!process.env.CLERK_SECRET_KEY) {
    res.json({
      status: 'active',
      plan: 'monthly',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    return;
  }

  try {
    const { createClerkClient } = await import('@clerk/express');
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const meta = clerkUser.publicMetadata as Record<string, unknown>;

    // Always check Stripe directly (source of truth) — no stale metadata issues
    const stripeCustomerId = meta.stripeCustomerId as string | undefined;
    if (stripe && stripeCustomerId) {
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
        limit: 1,
      });

      const sub = subs.data[0] as Stripe.Subscription | undefined;
      if (sub) {
        // Sync latest state to Clerk metadata
        await syncSubscriptionToClerk(clerkUserId, sub);

        const plan = sub.items.data[0]?.price.id === process.env.STRIPE_ANNUAL_PRICE_ID
          ? 'annual' : 'monthly';

        const status = sub.cancel_at_period_end ? 'canceled' : sub.status;

        res.json({
          status: status === 'trialing' ? 'trialing' : status,
          plan,
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          trialEnd: sub.trial_end
            ? new Date(sub.trial_end * 1000).toISOString()
            : null,
        });
        return;
      }
    }

    res.status(404).json({ error: 'No subscription found' });
  } catch (err) {
    console.error('[Stripe] Subscription status error:', err);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// ─── POST /cancel ──────────────────────────────────────────
subscriptionsRouter.post('/cancel', async (req: Request, res: Response) => {
  if (!hasStripe || !stripe) {
    res.status(503).json({ error: 'Stripe not configured' });
    return;
  }

  const clerkUserId = req.clerkUserId!;

  try {
    const { createClerkClient } = await import('@clerk/express');
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
    const clerkUser = await clerk.users.getUser(clerkUserId);
    const subscriptionId = clerkUser.publicMetadata.subscriptionId as string | undefined;

    if (!subscriptionId) {
      res.status(404).json({ error: 'No active subscription' });
      return;
    }

    // Cancel at period end (user keeps access until billing cycle ends)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    await syncSubscriptionToClerk(clerkUserId, subscription);
    res.json({ canceled: true });
  } catch (err) {
    console.error('[Stripe] Cancel subscription error:', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});
