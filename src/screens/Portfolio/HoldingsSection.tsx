import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import type { Account } from '../../types';
import { HoldingRow } from './HoldingRow';

interface HoldingsSectionProps {
  accounts: Account[];
  onManualEntry?: () => void;
}

type SortKey = 'value' | 'dayReturn' | 'totalReturn' | 'name';

function sortHoldings(holdings: Account['holdings'], key: SortKey) {
  return [...holdings].sort((a, b) => {
    switch (key) {
      case 'value':
        return b.currentValue - a.currentValue;
      case 'dayReturn':
        return b.dayReturnPercent - a.dayReturnPercent;
      case 'totalReturn':
        return b.totalReturnPercent - a.totalReturnPercent;
      case 'name':
        return a.ticker.localeCompare(b.ticker);
      default:
        return 0;
    }
  });
}

function BrokerGroup({ account, sortKey }: { account: Account; sortKey: SortKey }) {
  const [expanded, setExpanded] = useState(true);
  const isPositiveDay = account.dayReturn >= 0;
  const dayColor = isPositiveDay ? colors.status.positive : colors.status.negative;
  const sorted = sortHoldings(account.holdings, sortKey);

  return (
    <div
      style={{
        background: colors.bg.secondary,
        borderRadius: 10,
        border: `1px solid ${colors.border.subtle}`,
        overflow: 'hidden',
      }}
    >
      {/* Group header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
        style={{
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Chevron */}
          <motion.svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.text.secondary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <polyline points="9 18 15 12 9 6" />
          </motion.svg>

          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text.emphasis }}>
            {account.brokerName}
          </span>
          <span
            style={{
              fontSize: 11,
              color: colors.text.secondary,
              background: colors.bg.elevated[1],
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {account.holdings.length} positions
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span style={{ fontSize: 14, color: colors.text.emphasis, fontWeight: 500 }}>
            ${account.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: 12, color: dayColor }}>
            {isPositiveDay ? '+' : ''}{account.dayReturnPercent.toFixed(2)}%
          </span>
        </div>
      </button>

      {/* Holdings list */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
              {sorted.map((holding, i) => (
                <HoldingRow
                  key={holding.ticker}
                  holding={holding}
                  isLast={i === sorted.length - 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HoldingsSection({ accounts, onManualEntry }: HoldingsSectionProps) {
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const totalPositions = accounts.reduce((s, a) => s + a.holdings.length, 0);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.emphasis }}>
            Holdings
          </span>
          <span style={{ fontSize: 12, color: colors.text.secondary }}>
            {totalPositions} positions
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onManualEntry && (
            <button
              onClick={onManualEntry}
              style={{
                fontSize: 12,
                color: colors.text.secondary,
                background: 'none',
                border: `1px solid ${colors.border.subtle}`,
                borderRadius: 6,
                padding: '4px 10px',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.text.emphasis;
                e.currentTarget.style.borderColor = colors.border.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.borderColor = colors.border.subtle;
              }}
            >
              + Add position
            </button>
          )}

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={{
              fontSize: 12,
              color: colors.text.secondary,
              background: colors.bg.tertiary,
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 6,
              padding: '4px 8px',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="value">Sort by Value</option>
            <option value="dayReturn">Sort by Day Return</option>
            <option value="totalReturn">Sort by Total Return</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Broker groups */}
      <div className="flex flex-col gap-4">
        {accounts.map((account) => (
          <BrokerGroup key={account.id} account={account} sortKey={sortKey} />
        ))}
      </div>
    </div>
  );
}
