import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { formatRelativeDate } from '../../lib/formatters';
import type { NewsItem } from '../../types';

interface NewsCardProps {
  item: NewsItem;
}

const sentimentConfig = {
  positive: { color: colors.status.positive, label: 'Positive' },
  negative: { color: colors.status.negative, label: 'Negative' },
  neutral: { color: colors.text.secondary, label: 'Neutral' },
} as const;

export function NewsCard({ item }: NewsCardProps) {
  const navigate = useNavigate();
  const sentiment = item.sentiment ? sentimentConfig[item.sentiment] : null;

  return (
    <motion.div
      className="cursor-pointer transition-colors duration-150"
      style={{
        padding: '16px 0',
        borderBottom: `1px solid ${colors.border.subtle}`,
      }}
      onClick={() => {
        if (item.tickers.length > 0) {
          navigate(`/research/${item.tickers[0]}`);
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.bg.elevated[1];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      {/* Top row: source + tickers + time */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 8 }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            {item.source}
          </span>
          {item.tickers.length > 0 && (
            <div className="flex items-center gap-1">
              {item.tickers.slice(0, 3).map((ticker) => (
                <span
                  key={ticker}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors.accent.blue,
                    background: `${colors.accent.blue}1A`,
                    padding: '1px 6px',
                    borderRadius: 3,
                  }}
                >
                  {ticker}
                </span>
              ))}
            </div>
          )}
        </div>
        <span style={{ fontSize: 11, color: colors.text.secondary }}>
          {formatRelativeDate(item.publishedAt)}
        </span>
      </div>

      {/* Headline */}
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: colors.text.emphasis,
          lineHeight: 1.4,
          marginBottom: 6,
        }}
      >
        {item.title}
      </h3>

      {/* AI Summary */}
      {item.summary && (
        <p
          style={{
            fontSize: 13,
            color: colors.text.secondary,
            lineHeight: 1.5,
            marginBottom: 8,
          }}
        >
          {item.summary}
        </p>
      )}

      {/* Sentiment dot */}
      {sentiment && (
        <div className="flex items-center gap-1.5">
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: sentiment.color,
            }}
          />
          <span style={{ fontSize: 11, color: colors.text.secondary }}>
            {sentiment.label}
          </span>
        </div>
      )}
    </motion.div>
  );
}
