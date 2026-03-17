import { colors } from '../../design-system/tokens';
import { EarningsEventCard } from './EarningsEvent';
import { getWeekDates, groupEarningsByDate } from '../../mocks/earnings';
import type { EarningsEvent } from '../../types';

const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

interface EarningsCalendarProps {
  earnings: EarningsEvent[];
  weekStart: Date;
  selectedDate: Date;
  onWeekChange: (delta: number) => void;
  onEventClick: (event: EarningsEvent) => void;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function EarningsCalendar({
  earnings,
  weekStart,
  selectedDate,
  onWeekChange,
  onEventClick,
}: EarningsCalendarProps) {
  const weekDates = getWeekDates(weekStart);
  const grouped = groupEarningsByDate(earnings);
  const today = new Date();

  return (
    <div>
      {/* Week navigation */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 12 }}
      >
        <button
          onClick={() => onWeekChange(-1)}
          style={{
            background: 'none',
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: 6,
            padding: '4px 10px',
            color: colors.text.secondary,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <span style={{ fontSize: 13, color: colors.text.secondary }}>
          {formatDateShort(weekDates[0])} — {formatDateShort(weekDates[4])}
        </span>

        <button
          onClick={() => onWeekChange(1)}
          style={{
            background: 'none',
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: 6,
            padding: '4px 10px',
            color: colors.text.secondary,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* 5-column week grid */}
      <div className="flex" style={{ gap: 0 }}>
        {weekDates.map((date, i) => {
          const dateKey = date.toISOString().split('T')[0];
          const dayEvents = grouped[dateKey] ?? [];
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);

          return (
            <div
              key={dateKey}
              style={{
                flex: 1,
                minHeight: 200,
                borderRight: i < 4 ? `1px solid ${colors.border.hairline}` : 'none',
                padding: 8,
                background: isSelected ? `${colors.accent.indigo}08` : 'transparent',
                transition: 'background-color 0.2s',
              }}
            >
              {/* Column header */}
              <div className="flex flex-col items-center" style={{ marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    color: isSelected ? colors.accent.indigo : colors.text.tertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'color 0.2s',
                  }}
                >
                  {DAY_NAMES[i]}
                </span>
                <span
                  className="flex items-center justify-center"
                  style={{
                    fontSize: 13,
                    color: isToday || isSelected ? colors.text.primary : colors.text.emphasis,
                    fontWeight: 500,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isToday ? colors.accent.indigo : 'transparent',
                    marginTop: 2,
                    borderBottom: isSelected && !isToday ? `2px solid ${colors.accent.indigo}` : '2px solid transparent',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Events */}
              {dayEvents.map((event) => (
                <EarningsEventCard
                  key={event.ticker}
                  event={event}
                  onClick={onEventClick}
                />
              ))}

              {dayEvents.length === 0 && (
                <div
                  style={{
                    fontSize: 11,
                    color: colors.text.faded,
                    textAlign: 'center',
                    marginTop: 16,
                  }}
                >
                  —
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDateShort(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}
