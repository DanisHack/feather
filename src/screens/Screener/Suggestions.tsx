import { useState } from 'react';
import { colors } from '../../design-system/tokens';

interface SuggestionsProps {
  suggestions: string[];
  onSelect: (query: string) => void;
}

export function Suggestions({ suggestions, onSelect }: SuggestionsProps) {
  return (
    <div className="flex flex-col items-center gap-2.5" style={{ width: '100%' }}>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {suggestions.slice(0, 4).map((s) => (
          <SuggestionChip key={s} label={s} onClick={() => onSelect(s)} />
        ))}
      </div>
      {suggestions.length > 4 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {suggestions.slice(4, 8).map((s) => (
            <SuggestionChip key={s} label={s} onClick={() => onSelect(s)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SuggestionChip({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: hovered ? colors.text.emphasis : colors.text.secondary,
        background: hovered ? colors.bg.elevated[4] : colors.bg.elevated[1],
        border: `1px solid ${hovered ? colors.border.hover : colors.border.subtle}`,
        borderRadius: 20,
        padding: '6px 14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Sparkle icon */}
      <svg
        width={10}
        height={10}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.text.tertiary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
      {label}
    </button>
  );
}
