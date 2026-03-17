import { colors } from '../../design-system/tokens';
import { mockEconomicCalendar } from '../../mocks/markets';

const impactColors: Record<string, string> = {
  high: colors.status.negative,
  medium: colors.accent.orange,
  low: colors.text.secondary,
};

export function EconomicCalendar() {
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
        Upcoming Events
      </div>

      {/* Event rows */}
      <div>
        {mockEconomicCalendar.map((event, i) => (
          <div
            key={`${event.date}-${event.name}`}
            className="flex items-center"
            style={{
              padding: '12px 0',
              borderBottom:
                i < mockEconomicCalendar.length - 1
                  ? `1px solid ${colors.border.subtle}`
                  : 'none',
            }}
          >
            {/* Date/time */}
            <div style={{ width: 80, flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: colors.text.secondary }}>
                {event.date}
              </div>
              <div style={{ fontSize: 11, color: colors.text.faded }}>
                {event.time}
              </div>
            </div>

            {/* Impact dot */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: impactColors[event.impact],
                marginRight: 12,
                flexShrink: 0,
              }}
            />

            {/* Event name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, color: colors.text.emphasis }}>
                {event.name}
              </span>
            </div>

            {/* Country */}
            <div
              style={{
                fontSize: 12,
                color: colors.text.secondary,
                marginLeft: 12,
                flexShrink: 0,
                width: 50,
              }}
            >
              {event.countryFlag} {event.country}
            </div>

            {/* Forecast / Previous */}
            <div
              style={{
                fontSize: 12,
                color: colors.text.secondary,
                marginLeft: 12,
                textAlign: 'right',
                flexShrink: 0,
                minWidth: 180,
              }}
            >
              {event.forecast
                ? `Fcst: ${event.forecast} \u00B7 Prev: ${event.previous}`
                : '\u2014'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
