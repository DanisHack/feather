import { Skeleton } from '../../design-system';
import { colors } from '../../design-system/tokens';
import { formatTimeAgo } from '../../lib/formatters';
import type { NewsItem } from '../../types';

interface StockNewsProps {
  ticker: string;
  news?: NewsItem[] | null;
  loading?: boolean;
}

export function StockNews({ news, loading }: StockNewsProps) {

  if (loading) {
    return (
      <div>
        <div
          style={{
            padding: '20px 16px 8px',
            fontSize: 11,
            color: colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          News
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: '10px 16px' }}>
            <Skeleton width="40%" height={12} />
            <Skeleton width="100%" height={16} className="mt-1" />
            <Skeleton width="90%" height={12} className="mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div>
        <div
          style={{
            padding: '20px 16px 8px',
            fontSize: 11,
            color: colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          News
        </div>
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: colors.text.tertiary }}>No recent news</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          padding: '20px 16px 8px',
          fontSize: 11,
          color: colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        News
      </div>

      {/* News items */}
      {news.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-colors duration-150 cursor-pointer"
          style={{
            padding: '10px 16px',
            borderBottom: `1px solid ${colors.border.hairline}`,
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.bg.elevated[1];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {/* Source + time */}
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 11, color: colors.text.tertiary }}>
              {item.source}
            </span>
            <span style={{ fontSize: 11, color: colors.text.tertiary }}>
              {formatTimeAgo(item.publishedAt)}
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 13,
              color: colors.text.emphasis,
              fontWeight: 500,
              lineHeight: 1.4,
              marginTop: 3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.title}
          </div>

          {/* Description */}
          {item.description && (
            <div
              style={{
                fontSize: 12,
                color: colors.text.secondary,
                lineHeight: 1.5,
                fontStyle: 'italic',
                marginTop: 3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.description}
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
