import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { colors, gradients } from '../../design-system/tokens';

// Check if Clerk is available
const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

// Clerk appearance — matches Feather dark theme
const clerkAppearance = {
  variables: {
    colorPrimary: colors.accent.indigo,
    colorBackground: 'transparent',
    colorText: colors.text.emphasis,
    colorTextSecondary: colors.text.secondary,
    colorInputBackground: colors.bg.tertiary,
    colorInputText: colors.text.primary,
    borderRadius: '10px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    rootBox: {
      width: '100%',
      maxWidth: 380,
    },
    cardBox: {
      width: '100%',
    },
    card: {
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
      padding: '0',
      margin: '0',
      gap: '0',
    },
    main: {
      gap: '0',
    },
    socialButtons: {
      gap: '0',
    },
    // Hide Clerk's built-in header — we show our own branding above
    header: {
      display: 'none',
    },
    headerTitle: {
      display: 'none',
    },
    headerSubtitle: {
      display: 'none',
    },
    socialButtonsBlockButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      border: `1px solid ${colors.border.strong}`,
      color: colors.text.emphasis,
      borderRadius: '10px',
      height: '44px',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: colors.border.hover,
      },
    },
    socialButtonsBlockButtonText: {
      color: colors.text.emphasis,
      fontSize: '14px',
      fontWeight: '500',
    },
    socialButtonsProviderIcon__google: {
      width: '18px',
      height: '18px',
    },
    // Hide email form + divider — Google OAuth only
    dividerRow: {
      display: 'none',
    },
    form: {
      display: 'none',
    },
    // Hide Clerk logo inside card (we show our own above)
    logoBox: {
      display: 'none',
    },
    // Hide "Don't have an account? Sign up" — Google OAuth auto-creates accounts
    footer: {
      display: 'none',
    },
    // Hide "Secured by Clerk" / "Development mode" badge
    badge: {
      display: 'none',
    },
    // Hide the alert/info badges
    alert: {
      display: 'none',
    },
    identityPreview: {
      display: 'none',
    },
  },
} as const;

const highlights = [
  'AI-powered morning briefs',
  'Real-time market data',
  'Natural language screener',
];

export function LoginScreen() {
  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: colors.bg.primary }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          background: `radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.03) 40%, transparent 70%)`,
        }}
      />

      <motion.div
        className="flex flex-col items-center relative z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.4, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 mb-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <svg
            width={32}
            height={32}
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
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: colors.text.emphasis,
              letterSpacing: '0.12em',
            }}
          >
            FEATHER
          </span>
        </motion.div>

        <motion.p
          style={{ fontSize: 14, color: colors.text.secondary, marginBottom: 32 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Premium US equity research
        </motion.p>

        {/* Card */}
        <motion.div
          style={{
            width: 380,
            background: colors.bg.secondary,
            border: `1px solid ${colors.border.strong}`,
            borderRadius: 16,
            padding: '28px 28px 24px',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
            <p
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: colors.text.emphasis,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              Sign in to continue
            </p>

            {hasClerk ? (
              <div className="clerk-login-wrapper">
                <style>{`
                  /* Give the social buttons area room for the badge above */
                  .clerk-login-wrapper .cl-socialButtonsBlock {
                    position: relative;
                    padding-top: 22px;
                  }
                  /* Reposition "Last used" badge above the button */
                  .clerk-login-wrapper .cl-lastAuthenticationStrategyBadge {
                    position: absolute !important;
                    top: 0 !important;
                    right: 0 !important;
                    font-size: 11px !important;
                    color: ${colors.text.tertiary} !important;
                    background: none !important;
                    border: none !important;
                    padding: 0 !important;
                  }
                `}</style>
                <SignIn appearance={clerkAppearance} />
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: colors.text.secondary, marginBottom: 8 }}>
                  Clerk authentication not configured.
                </p>
                <p style={{ fontSize: 12, color: colors.text.tertiary }}>
                  Set VITE_CLERK_PUBLISHABLE_KEY in your .env file.
                </p>
              </div>
            )}
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          className="flex items-center gap-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {highlights.map((text, i) => (
            <div key={text} className="flex items-center gap-1.5">
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: gradients.premium.stops[i],
                  opacity: 0.7,
                }}
              />
              <span style={{ fontSize: 11, color: colors.text.tertiary }}>{text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
