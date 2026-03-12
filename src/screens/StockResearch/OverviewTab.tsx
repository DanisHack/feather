import { useState } from 'react';
import { Skeleton } from '../../design-system';
import { colors } from '../../design-system/tokens';
import { formatCompactNumber } from '../../lib/formatters';
import type { Stock } from '../../types';

interface OverviewTabProps {
  ticker: string;
  stock?: Stock | null;
}

export function OverviewTab({ ticker, stock }: OverviewTabProps) {
  const [expanded, setExpanded] = useState(false);

  if (!stock) {
    return (
      <div style={{ marginTop: 20 }}>
        <Skeleton width="100%" height={60} variant="rounded" />
        <div className="grid grid-cols-2 gap-x-8 mt-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} width="80%" height={16} className="mb-2" />
          ))}
        </div>
      </div>
    );
  }

  const description = stock.description ?? 'No description available.';
  const truncated = description.slice(0, 120);
  const needsTruncation = description.length > 120;

  const aboutData = [
    { label: 'Ticker', value: stock.ticker ?? ticker },
    { label: 'Exchange', value: stock.exchange ?? '--' },
    { label: 'Sector', value: stock.sector ?? '--' },
    { label: 'Industry', value: stock.industry ?? '--' },
    { label: 'Employees', value: stock.employees ? formatCompactNumber(stock.employees) : '--' },
    { label: 'Market Cap', value: stock.marketCap ? `$${formatCompactNumber(stock.marketCap)}` : '--' },
    ...(stock.website ? [{ label: 'Website', value: stock.website.replace(/^https?:\/\/(www\.)?/, ''), link: stock.website }] : []),
  ];

  return (
    <div style={{ marginTop: 20 }}>
      {/* Description */}
      <div style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 1.7 }}>
        {expanded || !needsTruncation ? description : `${truncated}...`}
        {needsTruncation && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              fontSize: 13,
              color: colors.accent.indigo,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginLeft: 4,
            }}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* About section */}
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            fontSize: 11,
            color: colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 12,
          }}
        >
          About
        </div>
        <div className="grid grid-cols-2 gap-x-8">
          {aboutData.map((item) => (
            <div key={item.label} style={{ paddingBottom: 8 }}>
              <span style={{ fontSize: 12, color: colors.text.tertiary }}>
                {item.label}
              </span>
              <span style={{ fontSize: 12, color: colors.text.tertiary }}> · </span>
              {'link' in item && item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    color: colors.text.emphasis,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {item.value}
                </a>
              ) : (
                <span style={{ fontSize: 12, color: colors.text.emphasis }}>
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
