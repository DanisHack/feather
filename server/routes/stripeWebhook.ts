import { Router, type Request, type Response } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { stripe as stripeInstance, syncSubscriptionToClerk } from '../lib/stripe';

export const stripeWebhookRouter = Router();

// Use express.raw() — Stripe needs raw body for signature verification
stripeWebhookRouter.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    if (!stripeInstance) {
      res.status(503).json({ error: 'Stripe not configured' });
      return;
    }

    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      res.status(503).json({ error: 'Webhook secret not configured' });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripeInstance.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[Stripe] Webhook signature verification failed:', err);
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const clerkUserId = session.metadata?.clerkUserId;
          if (clerkUserId && session.subscription) {
            const subscription = await stripeInstance.subscriptions.retrieve(
              session.subscription as string
            );
            await syncSubscriptionToClerk(clerkUserId, subscription);
            console.log(`[Stripe] Checkout completed for user ${clerkUserId}`);
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const clerkUserId = subscription.metadata?.clerkUserId;
          if (clerkUserId) {
            await syncSubscriptionToClerk(clerkUserId, subscription);
            console.log(`[Stripe] Subscription updated for user ${clerkUserId}: ${subscription.status}`);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const clerkUserId = subscription.metadata?.clerkUserId;
          if (clerkUserId) {
            const { createClerkClient } = await import('@clerk/express');
            const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
            const clerkUser = await clerk.users.getUser(clerkUserId);
            await clerk.users.updateUser(clerkUserId, {
              publicMetadata: {
                ...clerkUser.publicMetadata,
                subscriptionStatus: 'canceled',
                subscriptionId: null,
                currentPeriodEnd: null,
                trialEnd: null,
              },
            });
            console.log(`[Stripe] Subscription deleted for user ${clerkUserId}`);
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionId = invoice.subscription as string;
          if (subscriptionId) {
            const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);
            const clerkUserId = subscription.metadata?.clerkUserId;
            if (clerkUserId) {
              const { createClerkClient } = await import('@clerk/express');
              const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
              const clerkUser = await clerk.users.getUser(clerkUserId);
              await clerk.users.updateUser(clerkUserId, {
                publicMetadata: {
                  ...clerkUser.publicMetadata,
                  subscriptionStatus: 'past_due',
                },
              });
              console.log(`[Stripe] Payment failed for user ${clerkUserId}`);
            }
          }
          break;
        }
      }
    } catch (err) {
      console.error('[Stripe] Webhook handler error:', err);
      // Still return 200 to prevent Stripe retries on app-level errors
    }

    res.json({ received: true });
  }
);
