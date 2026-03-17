import { useState, useEffect } from 'react';
import { colors } from '../../design-system/tokens';
import { Skeleton } from '../../design-system';
import { claudeClient } from '../../lib/claude';
import type { EarningsEvent } from '../../types';

interface EarningsDetailProps {
  event: EarningsEvent;
  onClose: () => void;
}

export function EarningsDetail({ event, onClose }: EarningsDetailProps) {
  const initials = event.ticker.slice(0, 2);
  const isReported = event.status === 'reported';
  const isBeat = (event.surprise ?? 0) > 0;
  const daysUntil = Math.ceil(
    (event.reportDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  // Lazy AI summary fetch for reported events without one
  const [aiSummary, setAiSummary] = useState<string | null>(event.aiSummary ?? null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    setAiSummary(event.aiSummary ?? null);
  }, [event.ticker, event.aiSummary]);

  useEffect(() => {
    if (event.aiSummary || !isReported || aiSummary) return;

    let cancelled = false;
    setSummaryLoading(true);

    claudeClient
      .analyzeEarnings('', event.ticker)
      .then((result) => {
        if (!cancelled) setAiSummary(result.summary);
      })
      .catch(() => {
        // Silent fail — no summary shown
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });

    return () => { cancelled = true; };
  }, [event.ticker, event.aiSummary, isReported, aiSummary]);

  return (
    <div
      style={{
        padding: 24,
        overflowY: 'auto',
        height: '100%',
      }}
    >
      {/* Close button */}
      <div className="flex justify-end" style={{ marginBottom: 12 }}>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text.tertiary,
            cursor: 'pointer',
            fontSize: 16,
            padding: 4,
          }}
        >
          &times;
        </button>
      </div>

      {/* Company header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{
            width: 36,
            height: 36,
            background: colors.bg.elevated[4],
            fontSize: 12,
            fontWeight: 600,
            color: colors.text.emphasis,
          }}
        >
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: colors.text.emphasis }}>
            {event.companyName}
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
            <span style={{ fontSize: 12, color: colors.text.secondary }}>
              {event.ticker}
            </span>
            <span style={{ fontSize: 11, color: colors.text.tertiary }}>
              Reports {formatDate(event.reportDate)} {event.timing === 'BMO' ? 'Pre-market' : 'After hours'}
            </span>
          </div>
        </div>
      </div>

      {/* Status badge */}
      {!isReported && daysUntil >= 0 && (
        <div
          style={{
            display: 'inline-block',
            fontSize: 11,
            color: colors.accent.indigo,
            background: colors.accent.indigoMuted,
            borderRadius: 4,
            padding: '3px 8px',
            marginBottom: 20,
          }}
        >
          In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
        </div>
      )}

      {isReported && (
        <div
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 500,
            color: isBeat ? colors.status.positive : colors.status.negative,
            background: isBeat ? `${colors.status.positive}1F` : `${colors.status.negative}1F`,
            borderRadius: 4,
            padding: '3px 8px',
            marginBottom: 20,
          }}
        >
          {isBeat ? 'Beat' : 'Miss'}
        </div>
      )}

      {/* Estimates / Actuals */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          {isReported ? 'Results' : 'Estimates'}
        </div>

        <div className="flex flex-col gap-3">
          <StatRow
            label="EPS Estimate"
            value={event.epsEstimate != null ? `$${event.epsEstimate.toFixed(2)}` : '\u2014'}
          />
          {isReported && event.epsActual != null && (
            <StatRow
              label="EPS Actual"
              value={`$${event.epsActual.toFixed(2)}`}
              highlight={isBeat ? 'positive' : 'negative'}
            />
          )}
          <StatRow
            label="Revenue Estimate"
            value={event.revenueEstimate != null ? formatRevenue(event.revenueEstimate) : '\u2014'}
          />
          {isReported && event.revenueActual != null && (
            <StatRow
              label="Revenue Actual"
              value={formatRevenue(event.revenueActual)}
              highlight={event.revenueActual > (event.revenueEstimate ?? 0) ? 'positive' : 'negative'}
            />
          )}
          {isReported && event.surprise != null && (
            <StatRow
              label="EPS Surprise"
              value={`${event.surprise > 0 ? '+' : ''}$${event.surprise.toFixed(2)} (${event.surprisePercent?.toFixed(1)}%)`}
              highlight={event.surprise > 0 ? 'positive' : 'negative'}
            />
          )}
        </div>
      </div>

      {/* Historical EPS chart */}
      {event.historicalEps && event.historicalEps.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            EPS History
          </div>
          <div className="flex items-end gap-1" style={{ height: 80 }}>
            {event.historicalEps.map((q) => {
              const beat = q.actual >= q.estimate;
              const maxEps = Math.max(...event.historicalEps!.map((h) => Math.max(h.actual, h.estimate)));
              const barHeight = Math.max(8, (q.actual / maxEps) * 64);

              return (
                <div key={q.quarter} className="flex flex-col items-center flex-1">
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 24,
                      height: barHeight,
                      background: beat ? `${colors.status.positive}4D` : `${colors.status.negative}4D`,
                      borderRadius: 3,
                      position: 'relative',
                    }}
                  >
                    {/* Estimate line */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: Math.max(0, (q.estimate / maxEps) * 64),
                        left: -2,
                        right: -2,
                        height: 1,
                        background: colors.border.hover,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 8, color: colors.text.tertiary, marginTop: 4 }}>
                    {q.quarter}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Summary */}
      {isReported && summaryLoading && (
        <div>
          <div style={{ fontSize: 11, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            AI Summary
          </div>
          <Skeleton lines={2} />
        </div>
      )}
      {isReported && aiSummary && (
        <div>
          <div style={{ fontSize: 11, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            AI Summary
          </div>
          <p style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 1.5 }}>
            {aiSummary}
          </p>
        </div>
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'positive' | 'negative';
}) {
  const valueColor = highlight === 'positive'
    ? colors.status.positive
    : highlight === 'negative'
      ? colors.status.negative
      : colors.text.emphasis;

  return (
    <div className="flex items-center justify-between">
      <span style={{ fontSize: 12, color: colors.text.secondary }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function formatRevenue(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}
