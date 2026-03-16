import { AnimatePresence, motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ResultsTable, ResultsTableSkeleton } from './ResultsTable';
import { ScreenerEmpty } from './ScreenerEmpty';
import { ScreenerInput } from './ScreenerInput';
import { ParsedFilters } from './ParsedFilters';
import { useScreener } from '../../hooks/useScreener';

export default function Screener() {
  useDocumentTitle('Screener — Feather');
  const { results, filters, description, loading, error, hasSearched, search, removeFilter, clear } =
    useScreener();

  return (
    <motion.div
      style={{
        overflowY: 'auto',
        height: '100%',
        background: colors.bg.primary,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.4, 0.4, 1] }}
    >
      <AnimatePresence mode="wait">
        {!hasSearched ? (
          /* ── Empty state: centered search ─────────────────── */
          <ScreenerEmpty key="empty" onSearch={search} />
        ) : (
          /* ── Results state: input at top + table ──────────── */
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ padding: '24px 32px' }}
          >
            {/* Header row */}
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 16 }}
            >
              <div className="flex items-center gap-3">
                {/* Back button */}
                <button
                  onClick={clear}
                  className="flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: 'none',
                    border: `1px solid ${colors.border.subtle}`,
                    cursor: 'pointer',
                    color: colors.text.secondary,
                    transition: 'all 0.15s',
                  }}
                >
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: colors.text.emphasis,
                  }}
                >
                  Stock finder
                </span>
              </div>

              {/* Applied filters */}
              <ParsedFilters filters={filters} onRemove={removeFilter} />
            </div>

            {/* Search bar at top */}
            <ScreenerInput onSearch={search} onClear={clear} />

            {/* Error state */}
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  marginBottom: 16,
                  borderRadius: 8,
                  background: `${colors.status.negative}14`,
                  border: `1px solid ${colors.status.negative}33`,
                  fontSize: 13,
                  color: colors.status.negative,
                }}
              >
                {error}
              </div>
            )}

            {/* Loading or results */}
            {loading ? (
              <div>
                {/* Analyzing message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                  style={{ marginBottom: 16 }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: colors.text.secondary,
                    }}
                  >
                    Analyzing your query
                  </span>
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ fontSize: 13, color: colors.text.secondary }}
                  >
                    ...
                  </motion.span>
                </motion.div>
                <ResultsTableSkeleton />
              </div>
            ) : (
              <ResultsTable results={results} description={description} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
