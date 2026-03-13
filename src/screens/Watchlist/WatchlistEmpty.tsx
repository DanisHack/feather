import { colors } from '../../design-system/tokens';

interface WatchlistEmptyProps {
  onAddClick: () => void;
}

export function WatchlistEmpty({ onAddClick }: WatchlistEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <svg
        width={32}
        height={32}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.text.faded}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>

      <div style={{ fontSize: 15, color: colors.text.tertiary, marginTop: 12 }}>
        Build your watchlist
      </div>
      <div style={{ fontSize: 13, color: colors.text.faded, marginTop: 4 }}>
        Add stocks you want to track. Get real-time quotes, charts, and news.
      </div>

      <button
        onClick={onAddClick}
        className="transition-colors duration-150"
        style={{
          marginTop: 16,
          fontSize: 13,
          color: colors.text.tertiary,
          border: `1px solid ${colors.border.default}`,
          borderRadius: 6,
          padding: '6px 12px',
          background: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = colors.text.emphasis;
          e.currentTarget.style.borderColor = colors.border.hover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = colors.text.tertiary;
          e.currentTarget.style.borderColor = colors.border.default;
        }}
      >
        + Add your first stock
      </button>

      <div style={{ fontSize: 12, color: colors.text.faded, marginTop: 12 }}>
        Try searching for AAPL, TSLA, or NVDA
      </div>
    </div>
  );
}
