import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, boxShadow } from '../../design-system/tokens';
import { polygon } from '../../lib/polygon';
import { searchTickers as searchMockTickers } from '../../mocks/tickers';

const hasApiKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);
const DEBOUNCE_MS = 300;

interface TickerResult {
  ticker: string;
  name: string;
  exchange: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (ticker: string) => void;
}

export function SearchModal({ open, onClose, onSelect }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TickerResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setHighlightIndex(0);
      setSearching(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Debounced search — real API or mock fallback
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    clearTimeout(debounceRef.current);

    if (hasApiKey) {
      setSearching(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const apiResults = await polygon.searchTickers(query, 8);
          setResults(apiResults);
        } catch {
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, DEBOUNCE_MS);
    } else {
      debounceRef.current = setTimeout(() => {
        setResults(searchMockTickers(query));
      }, 80);
    }

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightIndex(0);
  }, [results]);

  const selectResult = useCallback(
    (ticker: string) => {
      if (onSelect) {
        onSelect(ticker);
      } else {
        navigate(`/research/${ticker}`);
        onClose();
      }
    },
    [navigate, onClose, onSelect],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      selectResult(results[highlightIndex].ticker);
    }
  };

  const showEmpty = query.length >= 2 && results.length === 0 && !searching;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: colors.bg.overlay }}
            onClick={onClose}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-50"
            style={{ width: 580, top: 100, left: '30%' }}
          >
            <div
              style={{
                background: colors.bg.tertiary,
                border: `1px solid ${colors.border.strong}`,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: boxShadow.commandBar,
              }}
            >
              {/* Search input */}
              <div
                className="flex items-center gap-3"
                style={{ padding: '12px 16px' }}
              >
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.text.tertiary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="shrink-0"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search stocks..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 14,
                    color: colors.text.emphasis,
                  }}
                />
                {searching && (
                  <span style={{ fontSize: 11, color: colors.text.tertiary }}>
                    Searching...
                  </span>
                )}
                <kbd
                  style={{
                    fontSize: 10,
                    color: colors.text.tertiary,
                    background: colors.bg.elevated[3],
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontFamily: 'monospace',
                  }}
                >
                  ESC
                </kbd>
              </div>

              {/* Results dropdown */}
              {(results.length > 0 || showEmpty) && (
                <div
                  style={{
                    borderTop: `1px solid ${colors.border.subtle}`,
                    maxHeight: 320,
                    overflowY: 'auto',
                  }}
                >
                  {showEmpty ? (
                    <div
                      style={{
                        padding: '20px 16px',
                        fontSize: 13,
                        color: colors.text.tertiary,
                        textAlign: 'center',
                      }}
                    >
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  ) : (
                    results.map((item, i) => (
                      <button
                        key={item.ticker}
                        onClick={() => selectResult(item.ticker)}
                        className="w-full flex items-center transition-colors duration-100"
                        style={{
                          padding: '10px 14px',
                          background:
                            i === highlightIndex
                              ? colors.bg.elevated[1]
                              : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={() => setHighlightIndex(i)}
                      >
                        {/* Logo fallback */}
                        <div
                          className="rounded-full flex items-center justify-center shrink-0"
                          style={{
                            width: 28,
                            height: 28,
                            background: colors.bg.elevated[4],
                            fontSize: 11,
                            fontWeight: 600,
                            color: colors.text.emphasis,
                          }}
                        >
                          {item.ticker.slice(0, 2)}
                        </div>

                        {/* Ticker + name */}
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: colors.text.emphasis,
                            marginLeft: 10,
                          }}
                        >
                          {item.ticker}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: colors.text.secondary,
                            marginLeft: 8,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.name}
                        </span>

                        {/* Exchange badge */}
                        <span
                          style={{
                            fontSize: 11,
                            color: colors.text.tertiary,
                            background: colors.bg.elevated[3],
                            padding: '2px 6px',
                            borderRadius: 4,
                            marginLeft: 8,
                            flexShrink: 0,
                          }}
                        >
                          {item.exchange}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
