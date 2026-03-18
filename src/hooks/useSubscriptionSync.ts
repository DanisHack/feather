import { useEffect, useCallback } from 'react';
import { useUserStore } from '../store/userStore';
import { stripeClient } from '../lib/stripe';

/**
 * Re-syncs subscription status when the app regains focus.
 * Handles the case where user returns from Stripe Checkout in external browser.
 */
export function useSubscriptionSync() {
  const user = useUserStore((s) => s.user);
  const updateSubscription = useUserStore((s) => s.updateSubscription);

  const syncSubscription = useCallback(async () => {
    if (!user) return;
    try {
      const sub = await stripeClient.getSubscription();
      updateSubscription({
        status: sub.status,
        plan: sub.plan,
        currentPeriodEnd: new Date(sub.currentPeriodEnd),
        trialEnd: sub.trialEnd ? new Date(sub.trialEnd) : undefined,
      });
    } catch {
      // No subscription yet or server unreachable — leave state as-is
    }
  }, [user?.id, updateSubscription]);

  // Re-sync when app regains focus (user returns from browser checkout)
  useEffect(() => {
    if (!user) return;

    const handleFocus = () => { syncSubscription(); };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id, syncSubscription]);
}
