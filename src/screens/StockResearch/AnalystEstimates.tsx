import { colors } from '../../design-system/tokens';

const ratings = [
  { label: 'Buy', count: 25, percent: 78, color: colors.status.positive },
  { label: 'Hold', count: 6, percent: 18, color: colors.text.secondary },
  { label: 'Sell', count: 1, percent: 4, color: colors.status.negative },
];

export function AnalystEstimates() {
  return (
    <div>
      {/* Separator */}
      <div style={{ borderTop: `1px solid ${colors.border.subtle}` }} />

      {/* Header */}
      <div
        style={{
          padding: '20px 16px 8px',
          fontSize: 11,
          color: colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Analyst Ratings
      </div>

      {/* Consensus + target */}
      <div className="flex items-start justify-between" style={{ padding: '0 16px 16px' }}>
        <div>
          <div style={{ fontSize: 24, color: colors.status.positive, fontWeight: 700 }}>
            BUY
          </div>
          <div style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 2 }}>
            32 analysts
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontSize: 20, color: colors.text.emphasis, fontWeight: 300 }}>
            $950
          </div>
          <div style={{ fontSize: 11, color: colors.text.tertiary, marginTop: 2 }}>
            avg. target
          </div>
        </div>
      </div>

      {/* Rating bars */}
      <div style={{ padding: '0 16px 16px' }}>
        {ratings.map((rating) => (
          <div key={rating.label} style={{ marginBottom: 8 }}>
            {/* Label row */}
            <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: colors.text.tertiary }}>
                {rating.label}
              </span>
              <span style={{ fontSize: 12, color: colors.text.emphasis }}>
                {rating.count}
              </span>
            </div>
            {/* Bar track */}
            <div
              style={{
                height: 4,
                borderRadius: 999,
                background: colors.bg.elevated[3],
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${rating.percent}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: rating.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
