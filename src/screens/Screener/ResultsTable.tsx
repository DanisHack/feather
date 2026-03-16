import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import type { ScreenerRow } from '../../mocks/screener';

interface ResultsTableProps {
  results: ScreenerRow[];
  description: string;
}

function formatMarketCap(value?: number): string {
  if (value == null) return '\u2014';
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(0)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

function formatRevenue(value?: number): string {
  if (value == null) return '\u2014';
  return `${value > 0 ? '+' : ''}${value}%`;
}

const sectorBadgeColors: Record<string, { bg: string; text: string }> = {
  Technology: { bg: `${colors.status.positive}1F`, text: colors.status.positive },
  Healthcare: { bg: `${colors.accent.blue}1F`, text: colors.accent.blue },
  Consumer: { bg: 'rgba(251,191,36,0.12)', text: '#FBBF24' },
  Telecom: { bg: 'rgba(167,139,250,0.12)', text: '#A78BFA' },
  Energy: { bg: `${colors.accent.orange}1F`, text: colors.accent.orange },
  Financial: { bg: `${colors.accent.blue}1F`, text: colors.accent.blue },
};

const COLUMNS = [
  { key: 'company', label: 'COMPANY', flex: true },
  { key: 'price', label: 'PRICE', width: 90 },
  { key: 'change', label: 'CHANGE', width: 90 },
  { key: 'mktCap', label: 'MKT CAP', width: 100 },
  { key: 'pe', label: 'P/E', width: 70 },
  { key: 'revenue', label: 'REVENUE', width: 90 },
  { key: 'sector', label: 'SECTOR', width: 110 },
];

function ResultRow({ row, index }: { row: ScreenerRow; index: number }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const isPositive = row.changePercent >= 0;
  const returnColor = isPositive ? colors.status.positive : colors.status.negative;
  const initials = row.ticker.slice(0, 2);
  const sector = row.sector ?? 'Other';
  const badge = sectorBadgeColors[sector] ?? { bg: colors.bg.elevated[3], text: colors.text.secondary };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="flex items-center cursor-pointer"
      style={{
        padding: '10px 16px',
        borderBottom: `1px solid ${colors.border.subtle}`,
        backgroundColor: hovered ? colors.bg.elevated[1] : 'transparent',
        transition: 'background-color 0.15s',
      }}
      onClick={() => navigate(`/research/${row.ticker}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -1 }}
    >
      {/* Company */}
      <div className="flex items-center flex-1 min-w-0 gap-2.5">
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{
            width: 28,
            height: 28,
            background: colors.bg.elevated[4],
            fontSize: 10,
            fontWeight: 600,
            color: colors.text.emphasis,
          }}
        >
          {initials}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.emphasis }}>
          {row.ticker}
        </span>
        <span
          style={{
            fontSize: 12,
            color: colors.text.secondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.name}
        </span>
      </div>

      {/* Price */}
      <div style={{ width: 90, textAlign: 'right', fontSize: 13, color: colors.text.emphasis }}>
        ${row.price.toFixed(2)}
      </div>

      {/* Change */}
      <div style={{ width: 90, textAlign: 'right', fontSize: 13, fontWeight: 500, color: returnColor }}>
        {isPositive ? '+' : ''}{row.changePercent.toFixed(2)}%
      </div>

      {/* Mkt cap */}
      <div style={{ width: 100, textAlign: 'right', fontSize: 13, color: colors.text.secondary }}>
        {formatMarketCap(row.marketCap)}
      </div>

      {/* P/E */}
      <div style={{ width: 70, textAlign: 'right', fontSize: 13, color: colors.text.secondary }}>
        {row.peRatio?.toFixed(1) ?? '\u2014'}
      </div>

      {/* Revenue growth */}
      <div
        style={{
          width: 90,
          textAlign: 'right',
          fontSize: 13,
          color: row.revenueGrowth != null
            ? (row.revenueGrowth >= 0 ? colors.status.positive : colors.status.negative)
            : colors.text.secondary,
        }}
      >
        {formatRevenue(row.revenueGrowth)}
      </div>

      {/* Sector badge */}
      <div style={{ width: 110, textAlign: 'right' }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: badge.text,
            background: badge.bg,
            padding: '3px 10px',
            borderRadius: 4,
          }}
        >
          {sector}
        </span>
      </div>
    </motion.div>
  );
}

function SkeletonRow({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center"
      style={{
        padding: '10px 16px',
        borderBottom: `1px solid ${colors.border.subtle}`,
      }}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2.5">
        <div
          className="rounded-full animate-pulse"
          style={{ width: 28, height: 28, background: colors.bg.elevated[3] }}
        />
        <div
          className="animate-pulse rounded"
          style={{ width: 40, height: 14, background: colors.bg.elevated[3] }}
        />
        <div
          className="animate-pulse rounded"
          style={{ width: 120, height: 12, background: colors.bg.elevated[1] }}
        />
      </div>
      {[90, 90, 100, 70, 90, 110].map((w, i) => (
        <div key={i} style={{ width: w, display: 'flex', justifyContent: 'flex-end' }}>
          <div
            className="animate-pulse rounded"
            style={{ width: w * 0.6, height: 12, background: colors.bg.elevated[1] }}
          />
        </div>
      ))}
    </motion.div>
  );
}

export function ResultsTable({ results, description }: ResultsTableProps) {
  return (
    <div>
      {/* Result count header */}
      <div
        className="flex items-center gap-2"
        style={{ marginBottom: 12 }}
      >
        <span style={{ fontSize: 13, color: colors.text.secondary }}>
          {description}
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          background: colors.bg.secondary,
          borderRadius: 10,
          border: `1px solid ${colors.border.subtle}`,
          overflow: 'hidden',
        }}
      >
        {/* Column headers */}
        <div
          className="flex items-center"
          style={{
            padding: '10px 16px',
            borderBottom: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div className="flex items-center flex-1 min-w-0 gap-2">
            <span
              style={{
                fontSize: 11,
                color: colors.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 500,
              }}
            >
              Company
            </span>
            <span
              style={{
                fontSize: 10,
                color: colors.text.secondary,
                background: colors.bg.elevated[2],
                padding: '1px 6px',
                borderRadius: 8,
              }}
            >
              {results.length}
            </span>
          </div>
          {COLUMNS.slice(1).map((col) => (
            <div
              key={col.key}
              style={{
                width: col.width,
                fontSize: 11,
                color: colors.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 500,
                textAlign: col.key === 'sector' ? 'right' : 'right',
              }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {results.map((row, i) => (
          <ResultRow key={row.ticker} row={row} index={i} />
        ))}
      </div>
    </div>
  );
}

export function ResultsTableSkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div style={{ marginBottom: 12 }}>
        <div
          className="animate-pulse rounded"
          style={{ width: 180, height: 14, background: colors.bg.elevated[1] }}
        />
      </div>

      <div
        style={{
          background: colors.bg.secondary,
          borderRadius: 10,
          border: `1px solid ${colors.border.subtle}`,
          overflow: 'hidden',
        }}
      >
        {/* Column headers */}
        <div
          className="flex items-center"
          style={{
            padding: '10px 16px',
            borderBottom: `1px solid ${colors.border.subtle}`,
          }}
        >
          <div className="flex-1" />
          {[90, 90, 100, 70, 90, 110].map((w, i) => (
            <div key={i} style={{ width: w, display: 'flex', justifyContent: 'flex-end' }}>
              <div
                className="animate-pulse rounded"
                style={{ width: w * 0.5, height: 10, background: colors.bg.elevated[1] }}
              />
            </div>
          ))}
        </div>

        {/* Skeleton rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} index={i} />
        ))}
      </div>
    </div>
  );
}
