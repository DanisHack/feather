import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../../design-system/tokens';

interface BrokerConnectProps {
  onManualEntry?: () => void;
}

interface Broker {
  id: string;
  name: string;
  letter: string;
  color: string;        // brand accent
}

const BROKERS: Broker[] = [
  { id: 'robinhood',   name: 'Robinhood',          letter: 'R',  color: '#00C805' },
  { id: 'schwab',      name: 'Charles Schwab',     letter: 'CS', color: '#00A0DF' },
  { id: 'fidelity',    name: 'Fidelity',           letter: 'F',  color: '#4B8A08' },
  { id: 'ibkr',        name: 'Interactive Brokers', letter: 'IB', color: '#DC143C' },
  { id: 'etrade',      name: 'E*TRADE',            letter: 'E',  color: '#6B3FA0' },
  { id: 'td',          name: 'TD Ameritrade',      letter: 'TD', color: '#2D8C3C' },
  { id: 'webull',      name: 'Webull',             letter: 'W',  color: '#F5A623' },
  { id: 'vanguard',    name: 'Vanguard',           letter: 'V',  color: '#96151D' },
];

export function BrokerConnect({ onManualEntry }: BrokerConnectProps) {
  const [comingSoonBroker, setComingSoonBroker] = useState<string | null>(null);

  const handleBrokerClick = (broker: Broker) => {
    setComingSoonBroker(broker.name);
    setTimeout(() => setComingSoonBroker(null), 2500);
  };

  return (
    <div className="flex flex-col items-center" style={{ paddingTop: 48, paddingBottom: 48 }}>
      {/* Icon */}
      <svg
        width={36}
        height={36}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.text.faded}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>

      <div style={{ fontSize: 18, fontWeight: 500, color: colors.text.emphasis, marginTop: 16 }}>
        Connect Your Brokerage
      </div>
      <div
        style={{
          fontSize: 13,
          color: colors.text.secondary,
          marginTop: 6,
          textAlign: 'center',
          maxWidth: 380,
          lineHeight: '1.5',
        }}
      >
        Securely sync your portfolio from any major US brokerage.
        Your credentials are never stored on our servers.
      </div>

      {/* Broker grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginTop: 28,
          width: '100%',
          maxWidth: 520,
        }}
      >
        {BROKERS.map((broker) => (
          <BrokerCard
            key={broker.id}
            broker={broker}
            onClick={() => handleBrokerClick(broker)}
          />
        ))}
      </div>

      {/* Manual entry link */}
      {onManualEntry && (
        <button
          onClick={onManualEntry}
          style={{
            marginTop: 24,
            fontSize: 13,
            color: colors.text.secondary,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = colors.text.emphasis; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = colors.text.secondary; }}
        >
          Or add positions manually
        </button>
      )}

      {/* Coming soon toast */}
      <AnimatePresence>
        {comingSoonBroker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.4, 0.4, 1] }}
            style={{
              position: 'fixed',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              background: colors.bg.secondary,
              border: `1px solid ${colors.border.default}`,
              borderRadius: 10,
              padding: '12px 20px',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.accent.indigo} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span style={{ fontSize: 13, color: colors.text.emphasis, fontWeight: 500 }}>
              {comingSoonBroker} integration coming soon
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BrokerCard({ broker, onClick }: { broker: Broker; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ borderColor: colors.border.hover, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '16px 8px',
        background: colors.bg.elevated[1],
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: 10,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${broker.color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: broker.color,
          letterSpacing: '-0.02em',
        }}
      >
        {broker.letter}
      </div>
      <span style={{ fontSize: 11, color: colors.text.secondary, fontWeight: 500, textAlign: 'center', lineHeight: '1.2' }}>
        {broker.name}
      </span>
    </motion.button>
  );
}
