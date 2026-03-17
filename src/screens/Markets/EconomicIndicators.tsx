import { colors } from '../../design-system/tokens';
import { mockEconomicIndicators } from '../../mocks/markets';

const trendColors: Record<string, string> = {
  positive: colors.status.positive,
  negative: colors.status.negative,
  neutral: colors.text.secondary,
};

export function EconomicIndicators() {
  return (
    <div style={{ marginTop: 24 }}>
      {/* Section label */}
      <div
        style={{
          fontSize: 11,
          color: colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 12,
        }}
      >
        Economic Indicators
      </div>

      {/* 4 cards */}
      <div className="flex gap-3">
        {mockEconomicIndicators.map((indicator) => (
          <div
            key={indicator.name}
            style={{
              flex: 1,
              background: colors.bg.elevated[1],
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 10,
              padding: 16,
            }}
          >
            {/* Icon */}
            <div style={{ marginBottom: 10 }}>
              <IndicatorIcon type={indicator.icon} />
            </div>

            {/* Value */}
            <div
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: colors.text.emphasis,
                marginBottom: 4,
              }}
            >
              {indicator.value}
            </div>

            {/* Label */}
            <div style={{ fontSize: 12, color: colors.text.secondary, marginBottom: 6 }}>
              {indicator.label}
            </div>

            {/* Trend */}
            <div style={{ fontSize: 11, color: trendColors[indicator.trendColor] ?? colors.text.secondary }}>
              {indicator.trend}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IndicatorIcon({ type }: { type: string }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: colors.text.secondary,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'building':
      return (
        <svg {...props}>
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
        </svg>
      );
    case 'trending-down':
      return (
        <svg {...props}>
          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
          <polyline points="16 17 22 17 22 11" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'bar-chart':
      return (
        <svg {...props}>
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
      );
    default:
      return null;
  }
}
