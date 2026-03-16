import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { suggestionPills } from '../../mocks/screener';

interface ScreenerEmptyProps {
  onSearch: (query: string) => void;
}

export function ScreenerEmpty({ onSearch }: ScreenerEmptyProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  const handlePillClick = (pill: string) => {
    setQuery(pill);
    onSearch(pill);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center"
      style={{ minHeight: 'calc(100vh - 80px)', padding: '0 32px' }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: 28,
          fontWeight: 300,
          color: colors.text.emphasis,
          marginBottom: 8,
        }}
      >
        Find any stock
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 14,
          color: colors.text.secondary,
          marginBottom: 32,
        }}
      >
        Describe what you&apos;re looking for in plain English
      </p>

      {/* Search input */}
      <div
        style={{
          width: 560,
          maxWidth: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: colors.bg.secondary,
            border: `1px solid ${focused ? `${colors.accent.indigo}80` : colors.border.default}`,
            borderRadius: 12,
            padding: '14px 16px',
            boxShadow: focused ? `0 0 20px ${colors.accent.indigoMuted}` : 'none',
            transition: 'all 0.2s',
          }}
        >
          {/* Search icon */}
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.text.secondary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Profitable tech stocks under $50..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: colors.text.emphasis,
            }}
          />

          {/* Send button */}
          <button
            onClick={handleSubmit}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: query.trim() ? colors.accent.indigo : colors.bg.elevated[3],
              border: 'none',
              cursor: query.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s',
              flexShrink: 0,
            }}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke={query.trim() ? colors.text.primary : colors.text.secondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggestion pills — 2 rows of 4 */}
      <div
        className="flex flex-col items-center gap-2.5"
        style={{ marginTop: 28, width: 560, maxWidth: '100%' }}
      >
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {suggestionPills.slice(0, 4).map((pill) => (
            <PillButton key={pill} label={pill} onClick={() => handlePillClick(pill)} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {suggestionPills.slice(4, 8).map((pill) => (
            <PillButton key={pill} label={pill} onClick={() => handlePillClick(pill)} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PillButton({ label, onClick }: { label: string; onClick: () => void }) {
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
