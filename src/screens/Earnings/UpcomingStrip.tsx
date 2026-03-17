import { colors } from '../../design-system/tokens';
import type { EarningsEvent } from '../../types';

interface UpcomingStripProps {
  earnings: EarningsEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function UpcomingStrip({ earnings, selectedDate, onSelectDate }: UpcomingStripProps) {
  const today = new Date();

  // Build 7 upcoming days starting from today
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        className="flex gap-2"
        style={{
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const dayKey = day.toISOString().split('T')[0];
          const dayEarnings = earnings.filter((e) => isSameDay(e.reportDate, day));

          return (
            <div
              key={dayKey}
              onClick={() => onSelectDate(day)}
              style={{
                width: 140,
                minWidth: 140,
                background: isSelected ? `${colors.accent.indigo}14` : colors.bg.elevated[1],
                border: `1px solid ${isSelected ? `${colors.accent.indigo}99` : colors.border.subtle}`,
                borderRadius: 10,
                padding: 12,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {/* Day label */}
              <div style={{ fontSize: 10, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {DAY_NAMES[day.getDay()]}
                {isToday && (
                  <span style={{ marginLeft: 6, color: colors.accent.indigo, fontSize: 9 }}>
                    TODAY
                  </span>
                )}
              </div>

              {/* Date */}
              <div style={{ fontSize: 13, color: colors.text.emphasis, fontWeight: 500, marginBottom: 8 }}>
                {MONTH_NAMES[day.getMonth()]} {day.getDate()}
              </div>

              {/* Ticker circles */}
              {dayEarnings.length > 0 ? (
                <div className="flex items-center">
                  {dayEarnings.slice(0, 3).map((e, i) => (
                    <div
                      key={e.ticker}
                      className="rounded-full flex items-center justify-center"
                      style={{
                        width: 22,
                        height: 22,
                        background: colors.bg.elevated[4],
                        fontSize: 8,
                        fontWeight: 600,
                        color: colors.text.emphasis,
                        marginLeft: i > 0 ? -6 : 0,
                        border: `2px solid ${colors.bg.primary}`,
                        zIndex: 3 - i,
                        position: 'relative',
                      }}
                    >
                      {e.ticker.slice(0, 2)}
                    </div>
                  ))}
                  {dayEarnings.length > 3 && (
                    <span style={{ fontSize: 10, color: colors.text.tertiary, marginLeft: 4 }}>
                      +{dayEarnings.length - 3} more
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: colors.text.faded }}>
                  No earnings
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
