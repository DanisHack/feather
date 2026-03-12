import { Skeleton } from '../../design-system';
import { colors } from '../../design-system/tokens';
import { formatMargin, formatRatio } from '../../lib/formatters';
import type { KeyStats as KeyStatsType } from '../../types';

interface KeyStatsProps {
  ticker: string;
  data?: KeyStatsType | null;
}

interface StatItem {
  label: string;
  value: string;
  type: 'positive' | 'negative' | 'neutral';
}

function buildStats(stats: KeyStatsType): StatItem[] {
  const items: StatItem[] = [
    { label: 'Gross Margin', value: formatMargin(stats.grossMargin), type: 'neutral' },
    { label: 'Operating Margin', value: formatMargin(stats.operatingMargin), type: 'neutral' },
    { label: 'Net Margin', value: formatMargin(stats.netMargin), type: 'neutral' },
    { label: 'ROE', value: formatMargin(stats.roe), type: 'neutral' },
    { label: 'ROA', value: formatMargin(stats.roa), type: 'neutral' },
    { label: 'Debt/Equity', value: stats.debtEquity != null ? formatRatio(stats.debtEquity) + 'x' : '--', type: 'neutral' },
    { label: 'P/E Ratio', value: stats.peRatio != null ? formatRatio(stats.peRatio) + 'x' : '--', type: 'neutral' },
    { label: 'Beta', value: stats.beta != null ? formatRatio(stats.beta) : '--', type: 'neutral' },
  ];

  // Determine positive/negative for margin-like values
  for (const item of items) {
    if (item.value === '--') continue;
    const numVal = parseFloat(item.value);
    if (!isNaN(numVal)) {
      if (item.label.includes('Margin') || item.label === 'ROE' || item.label === 'ROA') {
        item.type = numVal > 0 ? 'positive' : numVal < 0 ? 'negative' : 'neutral';
      }
    }
  }

  return items;
}

const valueColors = {
  positive: colors.status.positive,
  negative: colors.status.negative,
  neutral: colors.text.emphasis,
};

export function KeyStats({ data: keyStats }: KeyStatsProps) {
  if (!keyStats) {
    return (
      <div className="grid grid-cols-4 gap-2" style={{ marginTop: 20 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={60} variant="rounded" />
        ))}
      </div>
    );
  }

  const stats = buildStats(keyStats ?? {});

  return (
    <div
      className="grid grid-cols-4 gap-2"
      style={{ marginTop: 20 }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            background: colors.bg.elevated[1],
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: 8,
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: colors.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            {stat.label}
          </div>
          <div
            style={{
              fontSize: 15,
              color: valueColors[stat.type],
              fontWeight: 500,
            }}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
