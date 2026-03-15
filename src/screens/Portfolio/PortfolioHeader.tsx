import { useState } from 'react';
import { colors } from '../../design-system/tokens';
import type { Portfolio } from '../../types';

const TIME_RANGES = ['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const;

interface PortfolioHeaderProps {
  portfolio: Portfolio;
  label?: string;
}

export function PortfolioHeader({ portfolio, label }: PortfolioHeaderProps) {
  const [activeRange, setActiveRange] = useState<string>('1Y');
  const isPositiveDay = portfolio.dayReturn >= 0;
  const isPositiveTotal = portfolio.totalReturn >= 0;
  const dayColor = isPositiveDay ? colors.status.positive : colors.status.negative;
  const totalColor = isPositiveTotal ? colors.status.positive : colors.status.negative;

  return (
    <div>
      {/* Label */}
      <div
        style={{
          fontSize: 12,
          color: colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 8,
        }}
      >
        {label ?? 'Total Portfolio Value'}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 36,
          color: colors.text.emphasis,
          fontWeight: 300,
          letterSpacing: -1,
          marginBottom: 8,
        }}
      >
        ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {/* Day return row */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 14, color: dayColor }}>
          {isPositiveDay ? '+' : ''}${portfolio.dayReturn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: 14, color: dayColor }}>
          {isPositiveDay ? '+' : ''}{portfolio.dayReturnPercent.toFixed(2)}% today
        </span>
        <span style={{ fontSize: 14, color: colors.text.tertiary }}>·</span>
        <span style={{ fontSize: 14, color: totalColor }}>
          All time: {isPositiveTotal ? '+' : ''}${portfolio.totalReturn.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {isPositiveTotal ? '+' : ''}{portfolio.totalReturnPercent.toFixed(1)}%
        </span>
      </div>

      {/* Time range selector */}
      <div className="flex items-center gap-1">
        {TIME_RANGES.map((range) => {
          const active = range === activeRange;
          return (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: active ? colors.text.emphasis : colors.text.tertiary,
                background: 'none',
                border: 'none',
                borderBottom: active ? `2px solid ${colors.text.emphasis}` : '2px solid transparent',
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = colors.text.secondary;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = colors.text.tertiary;
              }}
            >
              {range}
            </button>
          );
        })}
      </div>
    </div>
  );
}
