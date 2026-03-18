import { useState } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { colors } from '../../design-system/tokens';
import { PRICE_MONTHLY, PRICE_ANNUAL, TRIAL_DAYS } from '../../lib/constants';
import { stripeClient } from '../../lib/stripe';
import { useUserStore } from '../../store/userStore';

const FEATURES = [
  'Real-time US equity quotes',
  'AI-powered stock screener',
  'Earnings calendar & estimates',
  'Portfolio tracking & sync',
  'AI morning briefs',
  'Priority support',
];

const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

export function PaywallScreen() {
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clerk = hasClerk ? useClerk() : null;
  const clearUser = useUserStore((s) => s.clearUser);

  const handleSignOut = async () => {
    clearUser();
    if (clerk) await clerk.signOut();
  };

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    setLoading(plan);
    setError(null);
    try {
      const checkoutUrl = await stripeClient.createCheckoutSession(plan);
      window.open(checkoutUrl, '_blank');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center"
      style={{ background: colors.bg.primary }}
    >
      <div style={{ maxWidth: 720, width: '100%', padding: '0 24px' }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2" style={{ marginBottom: 16 }}>
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.accent.indigo}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
          </svg>
          <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.emphasis, letterSpacing: '0.08em' }}>
            FEATHER
          </span>
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: colors.text.emphasis,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Choose your plan
        </h1>
        <p
          style={{
            fontSize: 14,
            color: colors.text.secondary,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Start with a {TRIAL_DAYS}-day free trial. Cancel anytime.
        </p>

        {/* Sign out link */}
        <p style={{ textAlign: 'center', marginBottom: 12 }}>
          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: 'none',
              color: colors.text.tertiary,
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Sign in with a different account
          </button>
        </p>

        {/* Error banner */}
        {error && (
          <div
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: colors.status.negative,
              background: `${colors.status.negative}15`,
              padding: '8px 16px',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Pricing cards */}
        <div className="flex gap-4 justify-center" style={{ marginTop: 28 }}>
          <PricingCard
            name="Monthly"
            price={PRICE_MONTHLY}
            period="/mo"
            subtitle=""
            loading={loading === 'monthly'}
            disabled={loading !== null}
            onSubscribe={() => handleSubscribe('monthly')}
          />
          <PricingCard
            name="Annual"
            price={Math.round(PRICE_ANNUAL / 12)}
            period="/mo"
            subtitle={`$${PRICE_ANNUAL}/year`}
            badge={`SAVE $${PRICE_MONTHLY * 12 - PRICE_ANNUAL}`}
            recommended
            loading={loading === 'annual'}
            disabled={loading !== null}
            onSubscribe={() => handleSubscribe('annual')}
          />
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  subtitle,
  badge,
  recommended,
  loading,
  disabled,
  onSubscribe,
}: {
  name: string;
  price: number;
  period: string;
  subtitle: string;
  badge?: string;
  recommended?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onSubscribe: () => void;
}) {
  return (
    <div
      style={{
        width: 320,
        padding: 32,
        background: colors.bg.secondary,
        border: `1px solid ${recommended ? `${colors.accent.indigo}66` : colors.border.default}`,
        borderRadius: 16,
        position: 'relative',
      }}
    >
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: 20,
            background: colors.accent.indigo,
            color: colors.text.primary,
            fontSize: 10,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 10,
            letterSpacing: '0.05em',
          }}
        >
          {badge}
        </div>
      )}

      {recommended && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: colors.accent.indigo,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 8,
          }}
        >
          Recommended
        </div>
      )}

      <div style={{ fontSize: 16, fontWeight: 500, color: colors.text.emphasis, marginBottom: 12 }}>
        {name}
      </div>

      <div className="flex items-baseline gap-1" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 600, color: colors.text.emphasis }}>
          ${price}
        </span>
        <span style={{ fontSize: 14, color: colors.text.secondary }}>{period}</span>
      </div>

      {subtitle && (
        <div style={{ fontSize: 12, color: colors.text.tertiary, marginBottom: 24 }}>
          {subtitle}
        </div>
      )}
      {!subtitle && <div style={{ marginBottom: 24 }} />}

      {/* Features */}
      <div style={{ marginBottom: 24 }}>
        {FEATURES.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-2"
            style={{ marginBottom: 10 }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.status.positive}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: 13, color: colors.text.secondary }}>{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onSubscribe}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px 0',
          borderRadius: 8,
          border: 'none',
          background: recommended ? colors.accent.indigo : colors.bg.elevated[4],
          color: recommended ? colors.text.primary : colors.text.emphasis,
          fontSize: 14,
          fontWeight: 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled && !loading ? 0.5 : 1,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
      >
        {loading ? 'Redirecting...' : 'Subscribe'}
      </button>
    </div>
  );
}
