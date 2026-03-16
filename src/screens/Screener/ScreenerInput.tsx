import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';

interface ScreenerInputProps {
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function ScreenerInput({ onSearch, onClear }: ScreenerInputProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClear();
      }
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear]);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ marginBottom: 20 }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: colors.bg.secondary,
          border: `1px solid ${focused ? `${colors.accent.indigo}66` : colors.border.default}`,
          borderRadius: 10,
          padding: '10px 14px',
          boxShadow: focused ? `0 0 16px ${colors.accent.indigoMuted}` : 'none',
          transition: 'all 0.2s',
        }}
      >
        {/* Search icon */}
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.text.secondary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
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
          placeholder="Search for another query..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: colors.text.emphasis,
          }}
        />

        {/* Clear button */}
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text.secondary,
            cursor: 'pointer',
            fontSize: 12,
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          Clear
        </button>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          style={{
            width: 28,
            height: 28,
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
            width={12}
            height={12}
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
    </motion.div>
  );
}
