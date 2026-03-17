import { colors } from '../../design-system/tokens';
import { PriceChange, Sparkline } from '../../design-system';
import type { IndexData } from '../../hooks/useMarkets';

interface IndicesBarProps {
  indices: IndexData[];
}

export function IndicesBar({ indices }: IndicesBarProps) {
  return (
    <div className="flex gap-3" style={{ marginBottom: 24 }}>
      {indices.map((index) => {
        const isPositive = index.changePercent >= 0;
        const sparkColor = isPositive ? colors.status.positive : colors.status.negative;

        return (
          <div
            key={index.ticker}
            style={{
              flex: 1,
              background: colors.bg.elevated[1],
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 10,
              padding: 16,
            }}
          >
            {/* Index name */}
            <div
              style={{
                fontSize: 11,
                color: colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 6,
              }}
            >
              {index.name}
            </div>

            {/* Value + sparkline row */}
            <div className="flex items-center justify-between">
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 300,
                    color: colors.text.emphasis,
                    marginBottom: 4,
                  }}
                >
                  {index.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <PriceChange value={index.changePercent} size="sm" />
              </div>

              {/* Sparkline */}
              {index.sparkline.length > 0 && (
                <div style={{ width: 60, height: 32 }}>
                  <Sparkline
                    data={index.sparkline}
                    color={sparkColor}
                    width={60}
                    height={32}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
