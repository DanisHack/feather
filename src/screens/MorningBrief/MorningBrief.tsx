import { motion } from 'framer-motion';
import { useNews } from '../../hooks/useNews';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { colors } from '../../design-system/tokens';
import { EmptyState } from '../../design-system';
import { MarketBar } from './MarketBar';
import { BriefCard } from './BriefCard';
import { NewsFeed } from './NewsFeed';

export default function MorningBrief() {
  const { news, loading, error } = useNews();
  useDocumentTitle('Morning Brief — Feather');

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      className="h-full overflow-y-auto"
      style={{ background: colors.bg.primary }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.4, 0.4, 1] }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '24px 32px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: colors.text.primary,
              marginBottom: 4,
            }}
          >
            Morning Brief
          </h1>
          <p
            style={{
              fontSize: 13,
              color: colors.text.secondary,
            }}
          >
            {dayName}, {dateStr}
          </p>
        </div>

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

        {/* Market Bar */}
        <MarketBar />

        {/* Brief Card */}
        <div style={{ marginTop: 24 }}>
          <BriefCard loading={loading} />
        </div>

        {/* News Feed */}
        <div style={{ marginTop: 32 }}>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: colors.text.emphasis,
              marginBottom: 4,
            }}
          >
            News
          </h2>
          {!loading && news.length === 0 ? (
            <EmptyState
              title="No news today"
              description="Check back later for the latest market updates"
            />
          ) : (
            <NewsFeed news={news} loading={loading} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
