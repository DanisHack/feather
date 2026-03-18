import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Get or create a Stripe customer for a Clerk user.
 * Stores the Stripe customer ID in Clerk's publicMetadata.
 */
export async function getOrCreateStripeCustomer(clerkUserId: string): Promise<string> {
  if (!stripe) throw new Error('Stripe not configured');

  const { createClerkClient } = await import('@clerk/express');
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

  const clerkUser = await clerk.users.getUser(clerkUserId);
  const existingCustomerId = clerkUser.publicMetadata.stripeCustomerId as string | undefined;

  if (existingCustomerId) {
    return existingCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: clerkUser.emailAddresses[0]?.emailAddress,
    name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || undefined,
    metadata: { clerkUserId },
  });

  // Store in Clerk public metadata
  await clerk.users.updateUser(clerkUserId, {
    publicMetadata: {
      ...clerkUser.publicMetadata,
      stripeCustomerId: customer.id,
    },
  });

  return customer.id;
}

/**
 * Sync a Stripe subscription's state to Clerk user metadata.
 */
export async function syncSubscriptionToClerk(
  clerkUserId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const { createClerkClient } = await import('@clerk/express');
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

  const clerkUser = await clerk.users.getUser(clerkUserId);

  const plan = subscription.items.data[0]?.price.id === process.env.STRIPE_ANNUAL_PRICE_ID
    ? 'annual'
    : 'monthly';

  await clerk.users.updateUser(clerkUserId, {
    publicMetadata: {
      ...clerkUser.publicMetadata,
      subscriptionStatus: subscription.status === 'trialing' ? 'trialing' : subscription.status,
      subscriptionPlan: plan,
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    },
  });
}
