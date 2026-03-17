import { useState } from 'react';
import { colors } from '../../design-system/tokens';

type ViewMode = 'Day' | 'Week' | 'Month';

interface EarningsHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const views: ViewMode[] = ['Day', 'Week', 'Month'];

export function EarningsHeader({ viewMode, onViewModeChange }: EarningsHeaderProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ marginBottom: 20 }}
    >
      {/* Left: title + month */}
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 20, fontWeight: 600, color: colors.text.emphasis }}>
          Earnings
        </span>
        <span style={{ fontSize: 14, color: colors.text.tertiary }}>
          March 2026
        </span>
      </div>

      {/* Right: view toggle pills */}
      <div
        className="flex items-center"
        style={{
          background: colors.bg.elevated[1],
          borderRadius: 8,
          padding: 2,
        }}
      >
        {views.map((v) => (
          <ViewPill
            key={v}
            label={v}
            active={viewMode === v}
            onClick={() => onViewModeChange(v)}
          />
        ))}
      </div>
    </div>
  );
}

function ViewPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: active ? colors.text.emphasis : hovered ? colors.text.secondary : colors.text.tertiary,
        background: active ? colors.bg.elevated[4] : 'transparent',
        border: 'none',
        borderRadius: 6,
        padding: '5px 14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </button>
  );
}
