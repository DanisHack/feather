import { useCallback } from 'react';
import { TabBar, Badge } from '../../design-system';
import type { Tab } from '../../design-system';
import { usePortfolioStore } from '../../store/portfolioStore';
import type { PortfolioTabId } from '../../types';

function fmt(value: number): string {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Tab icons — inline SVGs at 16x16
const PlayIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const BeakerIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 3h15" />
    <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
    <path d="M6 14h12" />
  </svg>
);

const WalletIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
  </svg>
);

export function PortfolioTabs() {
  const activeTab = usePortfolioStore((s) => s.activeTab);
  const setActiveTab = usePortfolioStore((s) => s.setActiveTab);
  const demoPortfolio = usePortfolioStore((s) => s.demoPortfolio);
  const paper = usePortfolioStore((s) => s.paper);
  const realPortfolio = usePortfolioStore((s) => s.realPortfolio);

  const paperValue = paper.initialized
    ? paper.positions.reduce((s, h) => s + h.currentValue, 0) + paper.cashBalance
    : paper.startingCash;

  const tabs: Tab[] = [
    {
      id: 'demo',
      label: 'Demo',
      icon: PlayIcon,
      badge: <Badge variant="exchange" className="text-[9px] px-1 py-0 leading-4">DEMO</Badge>,
      subtitle: fmt(demoPortfolio.totalValue),
      shortcutKey: '1',
    },
    {
      id: 'paper',
      label: 'Paper',
      icon: BeakerIcon,
      subtitle: paper.initialized ? fmt(paperValue) : 'Not started',
      shortcutKey: '2',
    },
    {
      id: 'real',
      label: 'Real',
      icon: WalletIcon,
      subtitle: realPortfolio ? fmt(realPortfolio.totalValue) : 'Not connected',
      shortcutKey: '3',
    },
  ];

  const handleTabChange = useCallback(
    (tabId: string) => setActiveTab(tabId as PortfolioTabId),
    [setActiveTab],
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px' }}>
      <TabBar
        tabs={tabs}
        activeTabId={activeTab}
        onTabChange={handleTabChange}
        layoutId="portfolio-tab-indicator"
      />
    </div>
  );
}
