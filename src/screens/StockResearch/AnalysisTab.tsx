import { motion } from 'framer-motion';
import { Skeleton } from '../../design-system';
import { colors } from '../../design-system/tokens';
import type { AnalysisData } from '../../types/analysis';

interface AnalysisTabProps {
  ticker: string;
  data: AnalysisData | null;
  loading: boolean;
  currentPrice?: number;
}

// ─── Helpers ──────────────────────────────────────────────

function fmtNumber(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

function fmtCurrency(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

// ─── Section wrapper ──────────────────────────────────────

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{
        background: colors.bg.elevated[1],
        border: `1px solid ${colors.border.subtle}`,
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Section 1: Analyst Consensus ─────────────────────────

function ConsensusSection({ data }: { data: AnalysisData }) {
  const { consensus } = data;
  const bars = [
    { label: 'Strong Buy', count: consensus.strongBuy, color: colors.status.positive },
    { label: 'Buy', count: consensus.buy, color: '#6BCB77' },
    { label: 'Hold', count: consensus.hold, color: colors.status.warning },
    { label: 'Sell', count: consensus.sell, color: colors.status.negative },
    { label: 'Strong Sell', count: consensus.strongSell, color: colors.status.negativeDark },
  ].filter((b) => b.count > 0);

  const maxCount = Math.max(...bars.map((b) => b.count), 1);

  const consensusColor =
    consensus.consensus.includes('Buy')
      ? colors.status.positive
      : consensus.consensus.includes('Sell')
        ? colors.status.negative
        : colors.status.warning;

  return (
    <Section title="Analyst Consensus" delay={0}>
      {/* Consensus label */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: consensusColor }}>
            {consensus.consensus}
          </div>
          <div style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 2 }}>
            Based on {consensus.total} analyst{consensus.total !== 1 ? 's' : ''} in last 3 months
          </div>
        </div>
      </div>

      {/* Horizontal bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <div style={{ width: 72, fontSize: 12, color: colors.text.secondary, flexShrink: 0 }}>
              {bar.label}
            </div>
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 999,
                background: colors.bg.elevated[3],
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(bar.count / maxCount) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.25, 0.4, 0.4, 1] }}
                style={{
                  height: '100%',
                  borderRadius: 999,
                  background: bar.color,
                }}
              />
            </div>
            <div
              style={{
                width: 24,
                textAlign: 'right',
                fontSize: 12,
                fontVariantNumeric: 'tabular-nums',
                color: colors.text.emphasis,
                flexShrink: 0,
              }}
            >
              {bar.count}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Section 2: Price Target ──────────────────────────────

function PriceTargetSection({ data, currentPrice }: { data: AnalysisData; currentPrice: number }) {
  const { priceTarget } = data;
  const { targetLow, targetConsensus, targetHigh } = priceTarget;

  if (targetConsensus === 0) return null;

  const upside = currentPrice > 0
    ? ((targetConsensus - currentPrice) / currentPrice) * 100
    : 0;
  const isPositive = upside >= 0;

  // Price range bar position calculation
  const rangeMin = Math.min(targetLow, currentPrice) * 0.95;
  const rangeMax = Math.max(targetHigh, currentPrice) * 1.05;
  const range = rangeMax - rangeMin;
  const currentPos = range > 0 ? ((currentPrice - rangeMin) / range) * 100 : 50;
  const lowPos = range > 0 ? ((targetLow - rangeMin) / range) * 100 : 20;
  const highPos = range > 0 ? ((targetHigh - rangeMin) / range) * 100 : 80;
  const consensusPos = range > 0 ? ((targetConsensus - rangeMin) / range) * 100 : 50;

  return (
    <Section title="Price Target" delay={0.05}>
      {/* Consensus + upside */}
      <div className="flex items-baseline gap-3" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: colors.text.emphasis, fontVariantNumeric: 'tabular-nums' }}>
          ${targetConsensus.toFixed(2)}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: isPositive ? colors.status.positive : colors.status.negative,
          }}
        >
          {isPositive ? '+' : ''}{upside.toFixed(1)}%
        </div>
        <div style={{ fontSize: 12, color: colors.text.tertiary }}>
          vs current ${currentPrice.toFixed(2)}
        </div>
      </div>

      {/* Visual price range bar */}
      <div style={{ position: 'relative', height: 40, marginBottom: 20 }}>
        {/* Track */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: `${lowPos}%`,
            right: `${100 - highPos}%`,
            height: 4,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${colors.status.negative}66, ${colors.text.secondary}44, ${colors.status.positive}66)`,
          }}
        />
        {/* Current price marker */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: `${currentPos}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: colors.accent.indigo,
              border: `2px solid ${colors.bg.primary}`,
              boxShadow: `0 0 0 1px ${colors.accent.indigo}`,
            }}
          />
        </div>
        {/* Consensus marker */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: `${consensusPos}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: colors.status.positive,
            }}
          />
        </div>
      </div>

      {/* Low / Consensus / High */}
      <div className="flex justify-between">
        <div className="text-center">
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.status.negative, fontVariantNumeric: 'tabular-nums' }}>
            ${targetLow.toFixed(0)}
          </div>
          <div style={{ fontSize: 11, color: colors.text.tertiary, marginTop: 2 }}>Low</div>
        </div>
        <div className="text-center">
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text.emphasis, fontVariantNumeric: 'tabular-nums' }}>
            ${targetConsensus.toFixed(0)}
          </div>
          <div style={{ fontSize: 11, color: colors.text.tertiary, marginTop: 2 }}>Consensus</div>
        </div>
        <div className="text-center">
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.status.positive, fontVariantNumeric: 'tabular-nums' }}>
            ${targetHigh.toFixed(0)}
          </div>
          <div style={{ fontSize: 11, color: colors.text.tertiary, marginTop: 2 }}>High</div>
        </div>
      </div>
    </Section>
  );
}

// ─── Section 3: Recent Analyst Grades ─────────────────────

function GradesSection({ data }: { data: AnalysisData }) {
  const { grades } = data;
  if (grades.length === 0) return null;

  return (
    <Section title="Recent Analyst Ratings" delay={0.1}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {grades.slice(0, 10).map((grade, i) => {
          const actionColor =
            grade.action === 'upgrade'
              ? colors.status.positive
              : grade.action === 'downgrade'
                ? colors.status.negative
                : colors.text.secondary;

          const actionLabel =
            grade.action === 'upgrade'
              ? 'Upgrade'
              : grade.action === 'downgrade'
                ? 'Downgrade'
                : grade.action === 'init'
                  ? 'Initiated'
                  : 'Reiterated';

          return (
            <motion.div
              key={`${grade.gradingCompany}-${grade.date}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="flex items-center justify-between"
              style={{
                padding: '10px 0',
                borderBottom: i < grades.length - 1 && i < 9
                  ? `1px solid ${colors.border.hairline}`
                  : 'none',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: colors.text.emphasis, fontWeight: 500 }}>
                  {grade.gradingCompany}
                </div>
                <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: actionColor,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {actionLabel}
                  </span>
                  <span style={{ fontSize: 11, color: colors.text.tertiary }}>
                    {grade.previousGrade && grade.action !== 'init'
                      ? `${grade.previousGrade} → ${grade.newGrade}`
                      : grade.newGrade}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: colors.text.tertiary, flexShrink: 0 }}>
                {fmtDate(grade.date)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Section 4: Insider Activity ──────────────────────────

function InsiderSection({ data }: { data: AnalysisData }) {
  const { insiderTransactions } = data;
  if (insiderTransactions.length === 0) return null;

  // Compute summary
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const recentTxns = insiderTransactions.filter(
    (t) => new Date(t.transactionDate) >= threeMonthsAgo
  );

  let totalBought = 0;
  let totalSold = 0;
  let buyValue = 0;
  let sellValue = 0;

  for (const t of recentTxns) {
    if (t.acquistionOrDisposition === 'A') {
      totalBought += t.securitiesTransacted;
      buyValue += t.securitiesTransacted * t.price;
    } else {
      totalSold += t.securitiesTransacted;
      sellValue += t.securitiesTransacted * t.price;
    }
  }

  const netSelling = totalSold > totalBought;
  const netTotal = netSelling ? sellValue : buyValue;

  return (
    <Section title="Insider Activity" delay={0.15}>
      {/* Summary banner */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 8,
          background: netSelling
            ? `${colors.status.negative}12`
            : `${colors.status.positive}12`,
          border: `1px solid ${netSelling ? colors.status.negative : colors.status.positive}22`,
          marginBottom: 14,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: netSelling ? colors.status.negative : colors.status.positive,
            }}
          />
          <span style={{ fontSize: 12, color: colors.text.secondary }}>
            Insiders{' '}
            <span style={{ color: netSelling ? colors.status.negative : colors.status.positive, fontWeight: 600 }}>
              net {netSelling ? 'sold' : 'bought'}
            </span>
            {' '}
            {fmtCurrency(netTotal)} in last 3 months
          </span>
        </div>
      </div>

      {/* Net buy/sell bar */}
      <div style={{ marginBottom: 14 }}>
        <div className="flex justify-between" style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: colors.status.positive }}>
            Bought: {fmtNumber(totalBought)} shares
          </span>
          <span style={{ fontSize: 11, color: colors.status.negative }}>
            Sold: {fmtNumber(totalSold)} shares
          </span>
        </div>
        <div
          className="flex"
          style={{
            height: 6,
            borderRadius: 999,
            overflow: 'hidden',
            background: colors.bg.elevated[3],
          }}
        >
          {totalBought > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(totalBought / (totalBought + totalSold)) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: [0.25, 0.4, 0.4, 1] }}
              style={{ height: '100%', background: colors.status.positive, borderRadius: '999px 0 0 999px' }}
            />
          )}
          {totalSold > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(totalSold / (totalBought + totalSold)) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: [0.25, 0.4, 0.4, 1] }}
              style={{ height: '100%', background: colors.status.negative, borderRadius: '0 999px 999px 0' }}
            />
          )}
        </div>
      </div>

      {/* Transaction list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {insiderTransactions.slice(0, 10).map((txn, i) => {
          const isBuy = txn.acquistionOrDisposition === 'A';
          return (
            <motion.div
              key={`${txn.reportingName}-${txn.transactionDate}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="flex items-center justify-between"
              style={{
                padding: '10px 0',
                borderBottom:
                  i < insiderTransactions.length - 1 && i < 9
                    ? `1px solid ${colors.border.hairline}`
                    : 'none',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: colors.text.emphasis, fontWeight: 500 }}>
                  {txn.reportingName}
                </div>
                <div style={{ fontSize: 11, color: colors.text.tertiary, marginTop: 2 }}>
                  {fmtNumber(txn.securitiesTransacted)} shares
                  {txn.price > 0 ? ` @ $${txn.price.toFixed(2)}` : ''}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isBuy ? colors.status.positive : colors.status.negative,
                  }}
                >
                  {isBuy ? 'Buy' : 'Sell'}
                </span>
                <span style={{ fontSize: 11, color: colors.text.tertiary, marginTop: 1 }}>
                  {fmtDate(txn.transactionDate)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Section 5: Institutional Holders ─────────────────────

function InstitutionalSection({ data }: { data: AnalysisData }) {
  const { institutionalHolders } = data;
  if (institutionalHolders.length === 0) return null;

  return (
    <Section title="Top Institutional Holders" delay={0.2}>
      {/* Header row */}
      <div
        className="flex items-center"
        style={{
          paddingBottom: 8,
          borderBottom: `1px solid ${colors.border.subtle}`,
          marginBottom: 4,
        }}
      >
        <div style={{ flex: 1, fontSize: 11, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Institution
        </div>
        <div style={{ width: 90, textAlign: 'right', fontSize: 11, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Shares
        </div>
        <div style={{ width: 72, textAlign: 'right', fontSize: 11, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Change
        </div>
      </div>

      {institutionalHolders.slice(0, 10).map((holder, i) => {
        const changeColor =
          holder.change > 0
            ? colors.status.positive
            : holder.change < 0
              ? colors.status.negative
              : colors.text.secondary;

        return (
          <motion.div
            key={holder.holder}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="flex items-center"
            style={{
              padding: '8px 0',
              borderBottom:
                i < institutionalHolders.length - 1 && i < 9
                  ? `1px solid ${colors.border.hairline}`
                  : 'none',
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: 13,
                color: colors.text.emphasis,
                fontWeight: 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingRight: 8,
              }}
            >
              {holder.holder}
            </div>
            <div
              style={{
                width: 90,
                textAlign: 'right',
                fontSize: 13,
                color: colors.text.emphasis,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {fmtNumber(holder.shares)}
            </div>
            <div
              style={{
                width: 72,
                textAlign: 'right',
                fontSize: 12,
                fontVariantNumeric: 'tabular-nums',
                color: changeColor,
              }}
            >
              {holder.change === 0
                ? '--'
                : `${holder.changePercent > 0 ? '+' : ''}${holder.changePercent.toFixed(1)}%`}
            </div>
          </motion.div>
        );
      })}
    </Section>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────

function AnalysisSkeleton() {
  return (
    <div style={{ marginTop: 20 }}>
      {/* Consensus skeleton */}
      <div
        style={{
          background: colors.bg.elevated[1],
          border: `1px solid ${colors.border.subtle}`,
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Skeleton width={120} height={12} />
        <Skeleton width={140} height={28} className="mt-3" />
        <Skeleton width={200} height={12} className="mt-2" />
        <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={6} variant="rounded" />
          ))}
        </div>
      </div>

      {/* Price target skeleton */}
      <div
        style={{
          background: colors.bg.elevated[1],
          border: `1px solid ${colors.border.subtle}`,
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Skeleton width={90} height={12} />
        <div className="flex items-baseline gap-3 mt-3">
          <Skeleton width={120} height={32} />
          <Skeleton width={50} height={16} />
        </div>
        <Skeleton width="100%" height={4} variant="rounded" className="mt-4" />
        <div className="flex justify-between mt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width={60} height={20} />
          ))}
        </div>
      </div>

      {/* Grades skeleton */}
      <div
        style={{
          background: colors.bg.elevated[1],
          border: `1px solid ${colors.border.subtle}`,
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Skeleton width={140} height={12} />
        <div className="mt-3" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between">
              <div>
                <Skeleton width={120} height={14} />
                <Skeleton width={80} height={11} className="mt-1" />
              </div>
              <Skeleton width={60} height={11} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

export function AnalysisTab({ ticker, data, loading, currentPrice = 0 }: AnalysisTabProps) {
  // Loading state
  if (loading && !data) {
    return <AnalysisSkeleton />;
  }

  // Empty state
  if (!data) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ paddingTop: 48, paddingBottom: 48 }}
      >
        <svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.text.secondary}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
        <div style={{ fontSize: 13, color: colors.text.secondary, marginTop: 8 }}>
          No analysis data available for {ticker}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <ConsensusSection data={data} />
      <PriceTargetSection data={data} currentPrice={currentPrice} />
      <GradesSection data={data} />
      <InsiderSection data={data} />
      <InstitutionalSection data={data} />
    </div>
  );
}
