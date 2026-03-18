import { useCallback, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useUserStore } from '../store/userStore';
import { setTokenGetter } from '../lib/api';
import { stripeClient } from '../lib/stripe';
import type { User } from '../types';

const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const MOCK_USER: User = {
  id: 'user_001',
  email: 'investor@example.com',
  name: 'Demo User',
  subscription: {
    status: 'active',
    plan: 'monthly',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
};

// Exported hook — delegates to the correct implementation
export const useAuth = hasClerk ? useClerkAuthSetup : useMockAuth;

// ─── Mock auth (dev mode, no Clerk key) ──────────────────
function useMockAuth() {
  const { user, isAuthenticated, loading, setUser, clearUser, setLoading } =
    useUserStore();

  useEffect(() => {
    if (!user && loading) {
      setUser(MOCK_USER);
    }
  }, [user, loading, setUser]);

  const signIn = useCallback(async () => {
    setLoading(true);
    setUser(MOCK_USER);
  }, [setUser, setLoading]);

  const signOut = useCallback(async () => {
    clearUser();
  }, [clearUser]);

  return { user, isAuthenticated, loading, signIn, signOut };
}

// ─── Real Clerk auth ─────────────────────────────────────
function useClerkAuthSetup() {
  const { getToken, isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { setUser, clearUser, setLoading } = useUserStore();
  const storeUser = useUserStore((s) => s.user);

  // Register token getter for the shared API client
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);

  // Sync Clerk user → Zustand store + fetch subscription
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !clerkUser) {
      clearUser();
      return;
    }

    // Only sync once when user signs in (avoid infinite loops)
    if (storeUser?.id === clerkUser.id) return;

    const syncUser = async () => {
      setLoading(true);

      const baseUser: User = {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        name: clerkUser.fullName ?? undefined,
        avatarUrl: clerkUser.imageUrl ?? undefined,
      };

      // Try to fetch subscription status
      try {
        const sub = await stripeClient.getSubscription();
        baseUser.subscription = {
          status: sub.status,
          plan: sub.plan,
          currentPeriodEnd: new Date(sub.currentPeriodEnd),
          trialEnd: sub.trialEnd ? new Date(sub.trialEnd) : undefined,
        };
      } catch {
        // 404 = no subscription yet (new user), which is fine
      }

      setUser(baseUser);
    };

    syncUser();
  }, [isLoaded, isSignedIn, clerkUser?.id, storeUser?.id, clearUser, setLoading, setUser]);

  return {
    user: storeUser,
    isAuthenticated: isSignedIn ?? false,
    loading: !isLoaded || useUserStore.getState().loading,
    signIn: async () => {},
    signOut: async () => { clearUser(); },
  };
}
