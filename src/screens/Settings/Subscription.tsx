import { useState } from 'react';
import { colors } from '../../design-system/tokens';
import { useUserStore } from '../../store/userStore';
import { PRICE_MONTHLY, PRICE_ANNUAL } from '../../lib/constants';

const plans = [
  {
    key: 'monthly' as const,
    name: 'Monthly',
    price: PRICE_MONTHLY,
    period: '/mo',
    detail: `$${PRICE_MONTHLY}/month`,
  },
  {
    key: 'annual' as const,
    name: 'Annual',
    price: Math.round(PRICE_ANNUAL / 12),
    period: '/mo',
    detail: `$${PRICE_ANNUAL}/year`,
    badge: `Save $${PRICE_MONTHLY * 12 - PRICE_ANNUAL}`,
  },
];

export function Subscription() {
  const currentPlan = useUserStore((s) => s.user?.subscription?.plan ?? 'monthly');
  const [message, setMessage] = useState<string | null>(null);

  const handleSwitch = async (plan: 'monthly' | 'annual') => {
    if (plan === currentPlan) return;
    setMessage(null);
    try {
      const { stripeClient } = await import('../../lib/stripe');
      const url = await stripeClient.createCheckoutSession(plan);
      window.open(url, '_blank');
    } catch {
      setMessage('Plan switching is not available yet. We\'ll notify you when it\'s ready.');
    }
  };

  return (
    <div>
      <div className="flex gap-3">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          return (
            <div
              key={plan.key}
              style={{
                flex: 1,
                padding: 16,
                background: isCurrent ? colors.bg.elevated[1] : 'transparent',
                border: `1px solid ${isCurrent ? colors.accent.indigo + '66' : colors.border.subtle}`,
                borderRadius: 10,
                position: 'relative',
              }}
            >
              {plan.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: 12,
                    fontSize: 9,
                    fontWeight: 600,
                    color: colors.accent.indigo,
                    background: colors.accent.indigoMuted,
                    padding: '2px 8px',
                    borderRadius: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {plan.badge}
                </span>
              )}

              <div style={{ fontSize: 12, fontWeight: 500, color: colors.text.secondary, marginBottom: 8 }}>
                {plan.name}
              </div>
              <div className="flex items-baseline gap-1" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 600, color: colors.text.emphasis }}>
                  ${plan.price}
                </span>
                <span style={{ fontSize: 12, color: colors.text.tertiary }}>{plan.period}</span>
              </div>
              <div style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 12 }}>
                {plan.detail}
              </div>

              {isCurrent ? (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: colors.accent.indigo,
                    textAlign: 'center',
                    padding: '6px 0',
                  }}
                >
                  Current plan
                </div>
              ) : (
                <button
                  onClick={() => handleSwitch(plan.key)}
                  style={{
                    width: '100%',
                    fontSize: 12,
                    fontWeight: 500,
                    color: colors.text.emphasis,
                    background: colors.bg.elevated[3],
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: 6,
                    padding: '6px 0',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.border.strong; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colors.bg.elevated[3]; }}
                >
                  Switch to {plan.name.toLowerCase()}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {message && (
        <div style={{ fontSize: 12, color: colors.text.secondary, marginTop: 12, padding: '8px 12px', background: colors.bg.elevated[1], borderRadius: 6, border: `1px solid ${colors.border.subtle}` }}>
          {message}
        </div>
      )}
    </div>
  );
}
