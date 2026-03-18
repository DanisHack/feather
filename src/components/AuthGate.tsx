import { type ReactNode, useEffect, useRef } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { colors } from '../design-system/tokens';
import { Skeleton } from '../design-system';
import { useUserStore } from '../store/userStore';
import { useWatchlistStore } from '../store/watchlistStore';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { PaywallScreen } from '../screens/Auth/PaywallScreen';
import { WelcomeScreen } from './WelcomeScreen';

interface AuthGateProps {
  children: ReactNode;
}

// Check if Clerk is available (publishable key was provided)
const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export function AuthGate({ children }: AuthGateProps) {
  // Skip auth entirely in dev mode when no Clerk key is set
  if (!hasClerk) {
    return <MockAuthGate>{children}</MockAuthGate>;
  }

  return <ClerkAuthGate>{children}</ClerkAuthGate>;
}

function ClerkAuthGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth();

  if (!isLoaded) {
    return <AuthSkeleton />;
  }

  if (!isSignedIn) {
    return <LoginScreen />;
  }

  return <SubscriptionGate>{children}</SubscriptionGate>;
}

function useOnboardingWatchlist() {
  const hasSeenWelcome = useUserStore((s) => s.hasSeenWelcome);
  const selectedStocks = useUserStore((s) => s.onboarding.selectedStocks);
  const bulkAddTickers = useWatchlistStore((s) => s.bulkAddTickers);
  const synced = useRef(false);

  useEffect(() => {
    if (hasSeenWelcome && selectedStocks.length > 0 && !synced.current) {
      synced.current = true;
      bulkAddTickers('my-watchlist', selectedStocks);
    }
  }, [hasSeenWelcome, selectedStocks, bulkAddTickers]);
}

function MockAuthGate({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading, hasSeenWelcome } = useUserStore();
  useOnboardingWatchlist();

  // Show login if user has explicitly signed out (loading=false means not initial load)
  if (!isAuthenticated && !user && !loading) {
    return <MockLoginScreen />;
  }

  // Check subscription status if user is set
  if (user?.subscription) {
    const { status } = user.subscription;
    if (status === 'canceled' || status === 'past_due') {
      return <PaywallScreen />;
    }
  }

  // First time — show welcome screen
  if (user && !hasSeenWelcome) {
    return <WelcomeScreen />;
  }

  return <>{children}</>;
}

function SubscriptionGate({ children }: { children: ReactNode }) {
  const { user, loading, hasSeenWelcome } = useUserStore();
  useOnboardingWatchlist();

  // Still loading subscription data
  if (loading) {
    return <AuthSkeleton />;
  }

  // No subscription at all (new user, post-login, pre-checkout)
  if (!user?.subscription) {
    return <PaywallScreen />;
  }

  const { status } = user.subscription;

  // Canceled or payment failed — show paywall
  if (status === 'canceled' || status === 'past_due') {
    return <PaywallScreen />;
  }

  // First time — show welcome screen
  if (!hasSeenWelcome) {
    return <WelcomeScreen />;
  }

  // Active or trialing — show app
  return <>{children}</>;
}

function MockLoginScreen() {
  const { setUser } = useUserStore();

  const handleSignIn = () => {
    setUser({
      id: 'user_001',
      email: 'investor@example.com',
      name: 'Demo User',
      subscription: {
        status: 'active',
        plan: 'monthly',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center"
      style={{ background: colors.bg.primary }}
    >
      <div style={{ textAlign: 'center' }}>
        <div className="flex items-center justify-center gap-2" style={{ marginBottom: 24 }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
          </svg>
          <span style={{ fontSize: 20, fontWeight: 600, color: colors.text.emphasis, letterSpacing: '0.08em' }}>
            FEATHER
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: colors.text.emphasis, marginBottom: 8 }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13, color: '#666666', marginBottom: 32 }}>
          Premium US equity research
        </p>
        <button
          onClick={handleSignIn}
          style={{
            padding: '10px 32px',
            borderRadius: 8,
            border: 'none',
            background: '#6366F1',
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

function AuthSkeleton() {
  return (
    <div
      className="h-screen w-screen flex items-center justify-center"
      style={{ background: colors.bg.primary }}
    >
      <div className="flex flex-col items-center gap-4">
        <Skeleton width={48} height={48} variant="circular" />
        <Skeleton width={200} height={16} />
        <Skeleton width={140} height={12} />
      </div>
    </div>
  );
}
