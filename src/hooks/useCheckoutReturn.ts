import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { stripeClient } from '../lib/stripe';

/**
 * Handles the return from Stripe Checkout.
 * Checks for ?checkout=success URL param and polls for subscription status.
 */
export function useCheckoutReturn() {
  const updateSubscription = useUserStore((s) => s.updateSubscription);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get('checkout');

    if (checkoutStatus !== 'success') return;

    // Clean up URL
    window.history.replaceState({}, '', window.location.pathname);

    // Poll for subscription status (webhook may not have fired yet)
    let cancelled = false;

    const poll = async () => {
      for (let i = 0; i < 10; i++) {
        if (cancelled) return;
        try {
          const sub = await stripeClient.getSubscription();
          if (sub.status === 'trialing' || sub.status === 'active') {
            updateSubscription({
              status: sub.status,
              plan: sub.plan,
              currentPeriodEnd: new Date(sub.currentPeriodEnd),
              trialEnd: sub.trialEnd ? new Date(sub.trialEnd) : undefined,
            });
            return;
          }
        } catch {
          // Not ready yet — keep polling
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    };

    poll();

    return () => { cancelled = true; };
  }, [updateSubscription]);
}
