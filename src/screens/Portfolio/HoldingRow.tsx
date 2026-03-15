import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../design-system/tokens';
import type { Holding } from '../../types';

interface HoldingRowProps {
  holding: Holding;
  isLast?: boolean;
}

export function HoldingRow({ holding, isLast }: HoldingRowProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const isPositiveTotal = holding.totalReturn >= 0;
  const isPositiveDay = holding.dayReturn >= 0;
  const totalColor = isPositiveTotal ? colors.status.positive : colors.status.negative;
  const dayColor = isPositiveDay ? colors.status.positive : colors.status.negative;
  const initials = holding.ticker.slice(0, 2);

  return (
    <div
      className="flex items-center cursor-pointer"
      style={{
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : `1px solid ${colors.border.hairline}`,
        backgroundColor: hovered ? colors.bg.elevated[1] : 'transparent',
        transition: 'background-color 0.15s',
      }}
      onClick={() => navigate(`/research/${holding.ticker}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Name column */}
      <div className="flex items-center flex-1 min-w-0">
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{
            width: 32,
            height: 32,
            background: colors.bg.elevated[4],
            fontSize: 12,
            fontWeight: 600,
            color: colors.text.emphasis,
            marginRight: 12,
          }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14, color: colors.text.emphasis, fontWeight: 600 }}>
              {holding.ticker}
            </span>
            {holding.brokerName && (
              <span
                style={{
                  fontSize: 10,
                  color: colors.text.tertiary,
                  background: colors.bg.elevated[1],
                  padding: '1px 5px',
                  borderRadius: 3,
                }}
              >
                {holding.brokerName === 'Interactive Brokers' ? 'IBKR' : holding.brokerName}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 12,
              color: colors.text.tertiary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {holding.name}
          </div>
        </div>
      </div>

      {/* Current Value */}
      <div style={{ width: 120, textAlign: 'right' }}>
        <div style={{ fontSize: 14, color: colors.text.emphasis, fontWeight: 500 }}>
          ${holding.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 11, color: colors.text.tertiary }}>
          {holding.quantity} shares
        </div>
      </div>

      {/* Avg Cost */}
      <div style={{ width: 100, textAlign: 'right' }}>
        <div style={{ fontSize: 14, color: colors.text.secondary }}>
          ${holding.avgCost.toFixed(2)}
        </div>
        <div style={{ fontSize: 11, color: colors.text.tertiary }}>
          avg cost
        </div>
      </div>

      {/* Total Return */}
      <div style={{ width: 110, textAlign: 'right' }}>
        <div style={{ fontSize: 13, color: totalColor }}>
          {isPositiveTotal ? '+' : ''}${holding.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 12, color: totalColor }}>
          {isPositiveTotal ? '+' : ''}{holding.totalReturnPercent.toFixed(1)}%
        </div>
      </div>

      {/* Day Return */}
      <div style={{ width: 100, textAlign: 'right' }}>
        <div style={{ fontSize: 13, color: dayColor }}>
          {isPositiveDay ? '+' : ''}${holding.dayReturn.toFixed(2)}
        </div>
        <div style={{ fontSize: 11, color: dayColor }}>
          {isPositiveDay ? '+' : ''}{holding.dayReturnPercent.toFixed(2)}% today
        </div>
      </div>
    </div>
  );
}
