import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { Skeleton, EmptyState } from '../../design-system';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useMarkets } from '../../hooks/useMarkets';
import { IndicesBar } from './IndicesBar';
import { SectorHeatmap } from './SectorHeatmap';
import { EconomicIndicators } from './EconomicIndicators';
import { EconomicCalendar } from './EconomicCalendar';

function MarketsSkeleton() {
  return (
    <div style={{ padding: '24px 32px' }}>
      <Skeleton width={100} height={24} className="mb-6" />
      <div className="flex gap-3" style={{ marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ flex: 1 }}>
            <Skeleton width="100%" height={100} variant="rounded" />
          </div>
        ))}
      </div>
      <Skeleton width={80} height={14} className="mb-3" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={56} variant="rounded" />
        ))}
      </div>
    </div>
  );
}

export default function Markets() {
  useDocumentTitle('Markets — Feather');
  const { indices, sectors, loading, error } = useMarkets();

  if (loading) return <MarketsSkeleton />;

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full"
        style={{ background: colors.bg.primary }}
      >
        <span style={{ fontSize: 14, color: colors.status.negative }}>
          {error}
        </span>
      </div>
    );
  }

  if (!indices.length) {
    return (
      <div className="h-full" style={{ background: colors.bg.primary }}>
        <EmptyState
          title="Market data unavailable"
          description="Unable to load market data right now. Try again later."
        />
      </div>
    );
  }

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
      <div style={{ padding: '24px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: colors.text.emphasis }}>
            Markets
          </span>
        </div>

        <IndicesBar indices={indices} />
        <SectorHeatmap sectors={sectors} />
        <EconomicIndicators />
        <EconomicCalendar />
      </div>
    </motion.div>
  );
}
