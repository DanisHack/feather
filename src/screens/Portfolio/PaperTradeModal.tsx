import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { polygon } from '../../lib/polygon';
import { searchTickers as searchMockTickers } from '../../mocks/tickers';
import { usePaperPortfolio } from '../../hooks/usePaperPortfolio';
import type { Holding } from '../../types';

const hasApiKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);
const DEBOUNCE_MS = 250;

interface TickerResult {
  ticker: string;
  name: string;
  exchange: string;
}

interface PaperTradeModalProps {
  open: boolean;
  onClose: () => void;
  cashBalance: number;
  positions: Holding[];
}

export function PaperTradeModal({ open, onClose, cashBalance, positions }: PaperTradeModalProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [query, setQuery] = useState('');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Search state
  const [results, setResults] = useState<TickerResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { buy, sell } = usePaperPortfolio();

  // Reset form on open
  useEffect(() => {
    if (open) {
      setSide('buy');
      setQuery('');
      setSelectedTicker(null);
      setCompanyName('');
      setQuantity('');
      setPrice(null);
      setFetchingPrice(false);
      setError(null);
      setResults([]);
      setDropdownOpen(false);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape — only close dropdown if open, otherwise close modal
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dropdownOpen) {
          setDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, dropdownOpen]);

  // Debounced search
  useEffect(() => {
    if (selectedTicker) return; // Already selected, no search needed

    if (query.length < 1) {
      setResults([]);
      setSearching(false);
      setDropdownOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);

    if (hasApiKey) {
      setSearching(true);
      setDropdownOpen(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const apiResults = await polygon.searchTickers(query, 6);
          setResults(apiResults);
        } catch {
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, DEBOUNCE_MS);
    } else {
      debounceRef.current = setTimeout(() => {
        const mockResults = searchMockTickers(query);
        setResults(mockResults);
        setDropdownOpen(mockResults.length > 0 || query.length >= 2);
      }, 60);
    }

    return () => clearTimeout(debounceRef.current);
  }, [query, selectedTicker]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightIndex(0);
  }, [results]);

  // Fetch price after selecting a ticker
  const fetchPrice = useCallback(async (ticker: string) => {
    setFetchingPrice(true);
    try {
      if (hasApiKey) {
        const [quoteResult, detailsResult] = await Promise.allSettled([
          polygon.getQuote(ticker),
          polygon.getTickerDetails(ticker),
        ]);
        if (quoteResult.status === 'fulfilled' && quoteResult.value.price > 0) {
          setPrice(quoteResult.value.price);
        }
        if (detailsResult.status === 'fulfilled' && detailsResult.value?.name) {
          setCompanyName(detailsResult.value.name);
        }
      }
    } catch {
      // Price stays null — user will see error on submit
    }
    setFetchingPrice(false);
  }, []);

  const selectTicker = useCallback((result: TickerResult) => {
    setSelectedTicker(result.ticker);
    setCompanyName(result.name);
    setQuery(result.ticker);
    setDropdownOpen(false);
    setResults([]);
    setError(null);
    fetchPrice(result.ticker);
    // Focus quantity input after selection
    setTimeout(() => quantityInputRef.current?.focus(), 50);
  }, [fetchPrice]);

  const clearSelection = () => {
    setSelectedTicker(null);
    setCompanyName('');
    setQuery('');
    setPrice(null);
    setQuantity('');
    setError(null);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  // Held quantity for sell validation
  const heldPosition = useMemo(
    () => selectedTicker ? positions.find((p) => p.ticker === selectedTicker) : null,
    [positions, selectedTicker],
  );

  const qtyNum = parseFloat(quantity);
  const estimatedTotal = !isNaN(qtyNum) && price && qtyNum > 0 ? qtyNum * price : 0;

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && dropdownOpen) {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp' && dropdownOpen) {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && dropdownOpen && results.length > 0) {
      e.preventDefault();
      selectTicker(results[highlightIndex]);
    } else if (e.key === 'Enter' && selectedTicker) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!selectedTicker) {
      setError('Search and select a stock');
      return;
    }
    if (!price || price <= 0) {
      setError('Unable to fetch price. Try again.');
      return;
    }
    if (isNaN(qtyNum) || qtyNum <= 0 || !Number.isInteger(qtyNum)) {
      setError('Enter a valid whole number of shares');
      return;
    }

    if (side === 'buy') {
      if (estimatedTotal > cashBalance) {
        setError(`Insufficient cash. Available: $${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        return;
      }
    } else {
      if (!heldPosition) {
        setError(`You don't hold any ${selectedTicker}`);
        return;
      }
      if (qtyNum > heldPosition.quantity) {
        setError(`You only hold ${heldPosition.quantity} shares of ${selectedTicker}`);
        return;
      }
    }

    setSubmitting(true);
    const name = companyName || selectedTicker;

    if (side === 'buy') {
      buy(selectedTicker, name, qtyNum, price);
    } else {
      sell(selectedTicker, qtyNum, price);
    }

    setSubmitting(false);
    onClose();
  };

  const showEmpty = query.length >= 2 && results.length === 0 && !searching && !selectedTicker;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: colors.bg.overlay }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ pointerEvents: 'none' }}
          >
            <div
              style={{
                width: 420,
                background: colors.bg.secondary,
                border: `1px solid ${colors.border.default}`,
                borderRadius: 12,
                padding: 24,
                pointerEvents: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: colors.text.emphasis }}>
                  Paper Trade
                </span>
                <button
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.text.secondary,
                    cursor: 'pointer',
                    fontSize: 18,
                    padding: 4,
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Buy / Sell Toggle */}
              <div
                className="flex"
                style={{
                  background: colors.bg.elevated[1],
                  borderRadius: 8,
                  padding: 3,
                  marginBottom: 20,
                }}
              >
                {(['buy', 'sell'] as const).map((s) => {
                  const active = side === s;
                  return (
                    <button
                      key={s}
                      onClick={() => { setSide(s); setError(null); }}
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 500,
                        padding: '7px 0',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        color: active
                          ? (s === 'buy' ? colors.status.positive : colors.status.negative)
                          : colors.text.tertiary,
                        background: active ? colors.bg.secondary : 'transparent',
                      }}
                    >
                      {s === 'buy' ? 'Buy' : 'Sell'}
                    </button>
                  );
                })}
              </div>

              {/* Ticker Search */}
              <div style={{ marginBottom: 14, position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 12, color: colors.text.secondary, marginBottom: 6 }}>
                  Stock
                </label>

                {selectedTicker ? (
                  /* Selected ticker chip */
                  <div
                    className="flex items-center justify-between"
                    style={{
                      background: colors.bg.tertiary,
                      border: `1px solid ${colors.border.subtle}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: colors.bg.elevated[4],
                          fontSize: 11,
                          fontWeight: 600,
                          color: colors.text.emphasis,
                        }}
                      >
                        {selectedTicker.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: colors.text.emphasis }}>
                          {selectedTicker}
                        </div>
                        {companyName && (
                          <div style={{ fontSize: 11, color: colors.text.tertiary, marginTop: -1 }}>
                            {companyName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {fetchingPrice ? (
                        <span style={{ fontSize: 12, color: colors.text.tertiary }}>Loading...</span>
                      ) : price ? (
                        <span style={{ fontSize: 14, fontWeight: 500, color: colors.text.emphasis }}>
                          ${price.toFixed(2)}
                        </span>
                      ) : null}
                      <button
                        onClick={clearSelection}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.text.tertiary,
                          cursor: 'pointer',
                          fontSize: 14,
                          padding: 2,
                          lineHeight: 1,
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Search input */
                  <div className="relative">
                    <div
                      className="flex items-center gap-2"
                      style={{
                        background: colors.bg.tertiary,
                        border: `1px solid ${dropdownOpen ? colors.border.hover : colors.border.subtle}`,
                        borderRadius: dropdownOpen && (results.length > 0 || showEmpty) ? '8px 8px 0 0' : 8,
                        padding: '0 12px',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <svg
                        width={14}
                        height={14}
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
                        ref={searchInputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value.toUpperCase());
                          setError(null);
                        }}
                        onFocus={() => {
                          if (results.length > 0) setDropdownOpen(true);
                        }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search stocks... e.g. AAPL, Tesla"
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          fontSize: 14,
                          color: colors.text.emphasis,
                          padding: '10px 0',
                        }}
                      />
                      {searching && (
                        <span style={{ fontSize: 11, color: colors.text.tertiary, flexShrink: 0 }}>
                          Searching...
                        </span>
                      )}
                    </div>

                    {/* Dropdown results */}
                    {dropdownOpen && (results.length > 0 || showEmpty) && (
                      <div
                        ref={dropdownRef}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: colors.bg.tertiary,
                          border: `1px solid ${colors.border.hover}`,
                          borderTop: `1px solid ${colors.border.subtle}`,
                          borderRadius: '0 0 8px 8px',
                          maxHeight: 220,
                          overflowY: 'auto',
                          zIndex: 10,
                        }}
                      >
                        {showEmpty ? (
                          <div style={{ padding: '14px 12px', fontSize: 13, color: colors.text.tertiary, textAlign: 'center' }}>
                            No results for &ldquo;{query}&rdquo;
                          </div>
                        ) : (
                          results.map((item, i) => (
                            <button
                              key={item.ticker}
                              onClick={() => selectTicker(item)}
                              onMouseEnter={() => setHighlightIndex(i)}
                              className="w-full flex items-center"
                              style={{
                                padding: '8px 12px',
                                background: i === highlightIndex ? colors.bg.elevated[2] : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.1s',
                              }}
                            >
                              <div
                                className="flex items-center justify-center shrink-0"
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: 5,
                                  background: colors.bg.elevated[4],
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: colors.text.emphasis,
                                }}
                              >
                                {item.ticker.slice(0, 2)}
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.emphasis, marginLeft: 8 }}>
                                {item.ticker}
                              </span>
                              <span
                                style={{
                                  fontSize: 12,
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
                              <span
                                style={{
                                  fontSize: 10,
                                  color: colors.text.tertiary,
                                  background: colors.bg.elevated[3],
                                  padding: '1px 5px',
                                  borderRadius: 3,
                                  marginLeft: 6,
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
                )}
              </div>

              {/* Quantity — only show after ticker selected */}
              {selectedTicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.15 }}
                  style={{ marginBottom: 14 }}
                >
                  <label style={{ display: 'block', fontSize: 12, color: colors.text.secondary, marginBottom: 6 }}>
                    Shares
                    {side === 'sell' && heldPosition && (
                      <span style={{ color: colors.text.tertiary, marginLeft: 8 }}>
                        (Held: {heldPosition.quantity})
                      </span>
                    )}
                  </label>
                  <input
                    ref={quantityInputRef}
                    type="number"
                    placeholder="Number of shares"
                    value={quantity}
                    onChange={(e) => { setQuantity(e.target.value); setError(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    min={1}
                    step={1}
                    style={{
                      width: '100%',
                      fontSize: 14,
                      color: colors.text.emphasis,
                      background: colors.bg.tertiary,
                      border: `1px solid ${colors.border.subtle}`,
                      borderRadius: 8,
                      padding: '10px 12px',
                      outline: 'none',
                    }}
                  />
                </motion.div>
              )}

              {/* Market price display */}
              {selectedTicker && price && !fetchingPrice && (
                <div
                  style={{
                    fontSize: 11,
                    color: colors.text.tertiary,
                    marginBottom: 6,
                  }}
                >
                  Market price: ${price.toFixed(2)} per share
                </div>
              )}

              {/* Estimated total */}
              {estimatedTotal > 0 && (
                <div
                  className="flex items-center justify-between"
                  style={{
                    padding: '10px 12px',
                    background: colors.bg.elevated[1],
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 12, color: colors.text.secondary }}>
                    Estimated {side === 'buy' ? 'Cost' : 'Proceeds'}
                  </span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: side === 'buy' ? colors.status.negative : colors.status.positive,
                  }}>
                    {side === 'buy' ? '-' : '+'}${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Cash available hint */}
              {side === 'buy' && selectedTicker && (
                <div style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 12 }}>
                  Cash available: ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ fontSize: 12, color: colors.status.negative, marginBottom: 12 }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={submitting || !selectedTicker || fetchingPrice}
                className="w-full"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.text.primary,
                  background: (!selectedTicker || fetchingPrice)
                    ? colors.bg.elevated[3]
                    : submitting
                      ? colors.accent.indigoMuted
                      : side === 'buy'
                        ? colors.status.positive
                        : colors.status.negative,
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 0',
                  cursor: (!selectedTicker || fetchingPrice || submitting) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  opacity: (!selectedTicker || fetchingPrice) ? 0.5 : submitting ? 0.7 : 1,
                }}
              >
                {submitting
                  ? (side === 'buy' ? 'Buying...' : 'Selling...')
                  : fetchingPrice
                    ? 'Fetching price...'
                    : `${side === 'buy' ? 'Buy' : 'Sell'}${selectedTicker ? ` ${selectedTicker}` : ''}`
                }
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
