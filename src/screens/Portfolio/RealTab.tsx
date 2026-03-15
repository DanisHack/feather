import { useState } from 'react';
import { colors } from '../../design-system/tokens';
import { Skeleton } from '../../design-system/components/Skeleton';
import { usePortfolioStore } from '../../store/portfolioStore';
import { usePortfolio } from '../../hooks/usePortfolio';
import { PortfolioView } from './PortfolioView';
import { BrokerConnect } from './BrokerConnect';
import { ManualEntry } from './ManualEntry';

function RealTabSkeleton() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 32px' }}>
      <Skeleton width={120} height={12} />
      <Skeleton width={240} height={36} className="mt-2" />
      <Skeleton width={300} height={14} className="mt-2" />
      <Skeleton width="100%" height={220} variant="rounded" className="mt-6" />
      <Skeleton width="100%" height={280} variant="rounded" className="mt-8" />
    </div>
  );
}

export function RealTab() {
  const realConnected = usePortfolioStore((s) => s.realConnected);
  const [manualOpen, setManualOpen] = useState(false);

  // Not connected — show broker connect flow
  if (!realConnected) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 32px' }}>
        <BrokerConnect onManualEntry={() => setManualOpen(true)} />
        <ManualEntry open={manualOpen} onClose={() => setManualOpen(false)} />
      </div>
    );
  }

  // Connected — load real portfolio data
  return <ConnectedRealTab />;
}

function ConnectedRealTab() {
  const { portfolio, loading, error } = usePortfolio();
  const [manualOpen, setManualOpen] = useState(false);

  if (loading) return <RealTabSkeleton />;

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ padding: '80px 32px', textAlign: 'center' }}
      >
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={colors.status.negative} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div style={{ fontSize: 15, color: colors.text.emphasis, marginTop: 12 }}>
          Failed to load portfolio
        </div>
        <div style={{ fontSize: 13, color: colors.text.secondary, marginTop: 4 }}>
          {error}
        </div>
      </div>
    );
  }

  if (!portfolio || portfolio.accounts.length === 0) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 32px' }}>
        <BrokerConnect onManualEntry={() => setManualOpen(true)} />
        <ManualEntry open={manualOpen} onClose={() => setManualOpen(false)} />
      </div>
    );
  }

  return (
    <>
      <PortfolioView
        portfolio={portfolio}
        headerLabel="Total Portfolio Value"
        onManualEntry={() => setManualOpen(true)}
      />
      <ManualEntry open={manualOpen} onClose={() => setManualOpen(false)} />
    </>
  );
}
