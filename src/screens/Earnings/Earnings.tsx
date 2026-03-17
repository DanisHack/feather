import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { Skeleton, EmptyState } from '../../design-system';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useEarnings } from '../../hooks/useEarnings';
import { EarningsHeader } from './EarningsHeader';
import { UpcomingStrip } from './UpcomingStrip';
import { EarningsCalendar } from './EarningsCalendar';
import { EarningsDetail } from './EarningsDetail';
import type { EarningsEvent } from '../../types';

function EarningsSkeleton() {
  return (
    <div style={{ padding: '24px 32px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <Skeleton width={120} height={24} />
        <Skeleton width={180} height={32} variant="rounded" />
      </div>
      <div className="flex gap-2" style={{ marginBottom: 24 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width={140} height={80} variant="rounded" />
        ))}
      </div>
      <div className="flex gap-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ flex: 1, padding: 8 }}>
            <Skeleton width="100%" height={200} variant="rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Earnings() {
  useDocumentTitle('Earnings — Feather');
  const { earnings, loading, error } = useEarnings();
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [selectedEvent, setSelectedEvent] = useState<EarningsEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [weekStart, setWeekStart] = useState(() => new Date());

  const handleWeekChange = useCallback((delta: number) => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * 7);
      return next;
    });
  }, []);

  const handleEventClick = useCallback((event: EarningsEvent) => {
    setSelectedEvent(event);
  }, []);

  if (loading) return <EarningsSkeleton />;

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

  if (earnings.length === 0) {
    return (
      <div className="h-full" style={{ background: colors.bg.primary }}>
        <EmptyState
          title="No earnings scheduled"
          description="There are no upcoming earnings events right now"
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
      <div className="flex h-full">
        {/* Main content */}
        <div
          style={{
            flex: selectedEvent ? '0 0 65%' : '1',
            padding: '24px 32px',
            overflowY: 'auto',
          }}
        >
          <EarningsHeader viewMode={viewMode} onViewModeChange={setViewMode} />
          <UpcomingStrip
            earnings={earnings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <EarningsCalendar
            earnings={earnings}
            weekStart={weekStart}
            selectedDate={selectedDate}
            onWeekChange={handleWeekChange}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Detail panel */}
        {selectedEvent && (
          <div
            style={{
              flex: '0 0 35%',
              borderLeft: `1px solid ${colors.border.subtle}`,
              overflowY: 'auto',
              background: colors.bg.primary,
            }}
          >
            <EarningsDetail
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
