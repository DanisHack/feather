import { useState } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useUserStore, type Preferences } from '../../store/userStore';
import { useSignOut } from '../../hooks/useSignOut';
import { Subscription } from './Subscription';
import { APP_VERSION } from '../../lib/constants';

export default function Settings() {
  useDocumentTitle('Settings — Feather');
  const { user } = useUserStore();
  const handleSignOut = useSignOut();

  return (
    <motion.div
      style={{
        overflowY: 'auto',
        height: '100%',
        background: colors.bg.primary,
        padding: '32px 40px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.4, 0.4, 1] }}
    >
      <h1
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: colors.text.emphasis,
          marginBottom: 32,
        }}
      >
        Settings
      </h1>

      {/* Account section */}
      <SettingsSection title="Account">
        <div className="flex items-center gap-4" style={{ marginBottom: 20 }}>
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 48,
              height: 48,
              background: colors.accent.indigoMuted,
              color: colors.accent.indigo,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {(user?.name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: colors.text.emphasis }}>
              {user?.name ?? 'Demo User'}
            </div>
            <div style={{ fontSize: 13, color: colors.text.secondary }}>
              {user?.email ?? 'investor@example.com'}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            fontSize: 13,
            color: colors.text.secondary,
            background: colors.bg.elevated[1],
            border: `1px solid ${colors.border.default}`,
            borderRadius: 6,
            padding: '6px 14px',
            cursor: 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.status.negative;
            e.currentTarget.style.borderColor = `${colors.status.negative}4D`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.text.secondary;
            e.currentTarget.style.borderColor = colors.border.default;
          }}
        >
          Sign out
        </button>
      </SettingsSection>

      {/* Billing section */}
      <SettingsSection title="Billing">
        <BillingContent />
      </SettingsSection>

      {/* Subscription section */}
      <SettingsSection title="Subscription">
        <Subscription />
      </SettingsSection>

      {/* Preferences section */}
      <SettingsSection title="Preferences">
        <PreferenceToggle
          prefKey="notifications"
          label="Desktop notifications"
          description="Get notified about earnings and price alerts"
        />
        <PreferenceToggle
          prefKey="darkMode"
          label="Dark mode"
          description="Always use dark theme"
        />
        <PreferenceToggle
          prefKey="morningBriefEmails"
          label="Morning brief emails"
          description="Receive daily market recap by email"
        />
      </SettingsSection>

      {/* Version footer */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 11,
          color: colors.text.tertiary,
          padding: '24px 0 16px',
        }}
      >
        Feather v{APP_VERSION}
      </div>
    </motion.div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginBottom: 28,
        padding: 24,
        background: colors.bg.secondary,
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function BillingContent() {
  const { user } = useUserStore();
  const sub = user?.subscription;
  const [billingMsg, setBillingMsg] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const statusLabel = sub?.status ?? 'active';
  const planLabel = sub?.plan === 'annual' ? 'Annual' : 'Monthly';
  const statusColor =
    statusLabel === 'active' || statusLabel === 'trialing'
      ? colors.status.positive
      : statusLabel === 'canceled'
        ? colors.status.negative
        : colors.accent.amber;

  const periodEnd = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  const handleManageBilling = async () => {
    setBillingMsg(null);
    try {
      const { stripeClient } = await import('../../lib/stripe');
      const url = await stripeClient.createPortalSession();
      window.open(url, '_blank');
    } catch {
      setBillingMsg('Billing portal is not available yet. We\'ll notify you when it\'s ready.');
    }
  };

  const handleCancel = async () => {
    setBillingMsg(null);
    setShowCancelConfirm(false);
    try {
      const { stripeClient } = await import('../../lib/stripe');
      await stripeClient.cancelSubscription();
      // Clear subscription → SubscriptionGate redirects to PaywallScreen
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        useUserStore.getState().setUser({ ...currentUser, subscription: undefined });
      }
    } catch {
      setBillingMsg('Cancellation is not available yet. Contact support for help.');
    }
  };

  return (
    <div>
      {/* Plan info */}
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: colors.text.emphasis, fontWeight: 500 }}>
          {planLabel} plan
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: statusColor,
            background: `${statusColor}15`,
            padding: '2px 8px',
            borderRadius: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 20 }}>
        {statusLabel === 'trialing'
          ? `Trial ends ${periodEnd}`
          : `Next billing date: ${periodEnd}`}
      </div>

      {/* Inline message */}
      {billingMsg && (
        <div style={{ fontSize: 12, color: colors.text.secondary, marginBottom: 16, padding: '8px 12px', background: colors.bg.elevated[1], borderRadius: 6, border: `1px solid ${colors.border.subtle}` }}>
          {billingMsg}
        </div>
      )}

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: `${colors.status.negative}0D`, border: `1px solid ${colors.status.negative}33`, borderRadius: 8 }}>
          <div style={{ fontSize: 13, color: colors.text.emphasis, marginBottom: 8 }}>
            Are you sure you want to cancel?
          </div>
          <div style={{ fontSize: 12, color: colors.text.secondary, marginBottom: 12 }}>
            You'll lose access at the end of your billing period.
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              style={{ fontSize: 12, fontWeight: 500, color: colors.text.primary, background: colors.status.negative, border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
            >
              Yes, cancel
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              style={{ fontSize: 12, fontWeight: 500, color: colors.text.secondary, background: 'transparent', border: `1px solid ${colors.border.default}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
            >
              Keep subscription
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleManageBilling}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: colors.text.emphasis,
            background: colors.bg.elevated[3],
            border: `1px solid ${colors.border.strong}`,
            borderRadius: 6,
            padding: '8px 16px',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.border.strong; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = colors.bg.elevated[3]; }}
        >
          Manage billing
        </button>
        {!showCancelConfirm && statusLabel !== 'canceled' && (
          <button
            onClick={() => setShowCancelConfirm(true)}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: colors.status.negative,
              background: 'transparent',
              border: `1px solid ${colors.status.negative}33`,
              borderRadius: 6,
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Cancel subscription
          </button>
        )}
      </div>
    </div>
  );
}

function PreferenceToggle({
  prefKey,
  label,
  description,
}: {
  prefKey: keyof Preferences;
  label: string;
  description: string;
}) {
  const on = useUserStore((s) => s.preferences[prefKey]);
  const updatePreference = useUserStore((s) => s.updatePreference);

  return (
    <div
      className="flex items-center justify-between"
      style={{ marginBottom: 16 }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: colors.text.emphasis }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: colors.text.secondary, marginTop: 2 }}>
          {description}
        </div>
      </div>
      <button
        onClick={() => updatePreference(prefKey, !on)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: on ? colors.accent.indigo : colors.border.strong,
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.2s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: colors.text.primary,
            position: 'absolute',
            top: 3,
            left: on ? 21 : 3,
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
}
