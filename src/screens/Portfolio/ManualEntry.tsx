import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { usePortfolioStore } from '../../store/portfolioStore';
import { polygon } from '../../lib/polygon';

const hasApiKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);

interface ManualEntryProps {
  open: boolean;
  onClose: () => void;
}

export function ManualEntry({ open, onClose }: ManualEntryProps) {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addManualPosition = usePortfolioStore((s) => s.addManualPosition);

  useEffect(() => {
    if (open) {
      setTicker('');
      setShares('');
      setAvgCost('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const tickerTrimmed = ticker.trim().toUpperCase();
    const sharesNum = parseFloat(shares);
    const avgCostNum = parseFloat(avgCost);

    if (!tickerTrimmed) {
      setError('Enter a ticker symbol');
      return;
    }
    if (isNaN(sharesNum) || sharesNum <= 0) {
      setError('Enter a valid number of shares');
      return;
    }
    if (isNaN(avgCostNum) || avgCostNum <= 0) {
      setError('Enter a valid average cost');
      return;
    }

    setSubmitting(true);

    let currentPrice = avgCostNum;
    let companyName = tickerTrimmed;

    if (hasApiKey) {
      try {
        const [quoteResult, detailsResult] = await Promise.allSettled([
          polygon.getQuote(tickerTrimmed),
          polygon.getTickerDetails(tickerTrimmed),
        ]);

        if (quoteResult.status === 'fulfilled' && quoteResult.value.price > 0) {
          currentPrice = quoteResult.value.price;
        }
        if (detailsResult.status === 'fulfilled' && detailsResult.value?.name) {
          companyName = detailsResult.value.name;
        }
      } catch {
        // Fall back to avgCost as price
      }
    }

    const currentValue = sharesNum * currentPrice;
    const totalCost = sharesNum * avgCostNum;

    addManualPosition(
      {
        ticker: tickerTrimmed,
        name: companyName,
        quantity: sharesNum,
        avgCost: avgCostNum,
        currentPrice,
        currentValue,
        totalReturn: currentValue - totalCost,
        totalReturnPercent: totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0,
        dayReturn: 0,
        dayReturnPercent: 0,
        brokerName: 'Manual',
      },
      'acc_manual'
    );

    setSubmitting(false);
    onClose();
  };

  const inputStyle = {
    width: '100%',
    fontSize: 14,
    color: colors.text.emphasis,
    background: colors.bg.tertiary,
    border: `1px solid ${colors.border.subtle}`,
    borderRadius: 8,
    padding: '10px 12px',
    outline: 'none',
  };

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
                width: 400,
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
                  Add Position
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

              {/* Ticker */}
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: colors.text.secondary,
                    marginBottom: 6,
                  }}
                >
                  Ticker Symbol
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="e.g. AAPL"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  style={inputStyle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {/* Shares */}
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: colors.text.secondary,
                    marginBottom: 6,
                  }}
                >
                  Number of Shares
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  style={inputStyle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {/* Avg Cost */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: colors.text.secondary,
                    marginBottom: 6,
                  }}
                >
                  Average Cost per Share
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150.00"
                  value={avgCost}
                  onChange={(e) => setAvgCost(e.target.value)}
                  style={inputStyle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{ fontSize: 12, color: colors.status.negative, marginBottom: 12 }}>
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.text.primary,
                  background: submitting ? colors.accent.indigoMuted : colors.accent.indigo,
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 0',
                  cursor: submitting ? 'wait' : 'pointer',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.backgroundColor = colors.accent.indigoHover;
                }}
                onMouseLeave={(e) => {
                  if (!submitting) e.currentTarget.style.backgroundColor = colors.accent.indigo;
                }}
              >
                {submitting ? 'Adding...' : 'Add Position'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
