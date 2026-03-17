import { useState } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import type { EarningsEvent as EarningsEventType } from '../../types';

interface EarningsEventProps {
  event: EarningsEventType;
  onClick: (event: EarningsEventType) => void;
}

export function EarningsEventCard({ event, onClick }: EarningsEventProps) {
  const [hovered, setHovered] = useState(false);
  const initials = event.ticker.slice(0, 2);
  const isBeat = event.status === 'reported' && (event.surprise ?? 0) > 0;
  const isMiss = event.status === 'reported' && (event.surprise ?? 0) < 0;

  return (
    <motion.div
      onClick={() => onClick(event)}
      style={{
        background: hovered ? colors.bg.elevated[4] : colors.bg.elevated[1],
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: 6,
        padding: '8px 10px',
        marginBottom: 6,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      {/* Row 1: Logo + ticker + timing badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              width: 20,
              height: 20,
              background: colors.bg.elevated[4],
              fontSize: 8,
              fontWeight: 600,
              color: colors.text.emphasis,
            }}
          >
            {initials}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: colors.text.emphasis }}>
            {event.ticker}
          </span>
        </div>

        <TimingBadge timing={event.timing} />
      </div>

      {/* Row 2: Beat/miss for reported */}
      {event.status === 'reported' && event.surprise != null && (
        <div style={{ marginTop: 4, fontSize: 11 }}>
          {isBeat && (
            <span style={{ color: colors.status.positive, fontWeight: 500 }}>
              +${event.surprise.toFixed(2)} beat
            </span>
          )}
          {isMiss && (
            <span style={{ color: colors.status.negative, fontWeight: 500 }}>
              -${Math.abs(event.surprise).toFixed(2)} miss
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

function TimingBadge({ timing }: { timing: 'BMO' | 'AMC' | 'TNS' }) {
  const config = {
    BMO: { label: 'PRE', bg: colors.accent.indigoMuted, color: colors.accent.indigo },
    AMC: { label: 'POST', bg: `${colors.accent.orange}26`, color: colors.accent.orange },
    TNS: { label: 'TNS', bg: colors.bg.elevated[4], color: colors.text.secondary },
  };
  const c = config[timing];

  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        color: c.color,
        background: c.bg,
        borderRadius: 4,
        padding: '1px 6px',
      }}
    >
      {c.label}
    </span>
  );
}
