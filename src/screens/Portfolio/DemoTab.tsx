import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { Badge, Button } from '../../design-system';
import { usePortfolioStore } from '../../store/portfolioStore';
import { PortfolioView } from './PortfolioView';
import type { PortfolioTabId } from '../../types';

export function DemoTab() {
  const demoPortfolio = usePortfolioStore((s) => s.demoPortfolio);
  const setActiveTab = usePortfolioStore((s) => s.setActiveTab);

  return (
    <PortfolioView
      portfolio={demoPortfolio}
      readOnly
      headerLabel="Demo Portfolio Value"
      badge={
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <Badge variant="exchange">DEMO</Badge>
          <span style={{ fontSize: 12, color: colors.text.tertiary }}>
            Sample portfolio showcasing Feather&apos;s capabilities
          </span>
        </div>
      }
      footer={
        <motion.div
          style={{
            marginTop: 32,
            padding: '20px 24px',
            background: colors.bg.secondary,
            borderRadius: 12,
            border: `1px solid ${colors.border.subtle}`,
            textAlign: 'center',
          }}
          whileHover={{ borderColor: colors.border.hover }}
          transition={{ duration: 0.15 }}
        >
          <div style={{ fontSize: 15, color: colors.text.emphasis, fontWeight: 500 }}>
            Ready to build your own?
          </div>
          <div style={{ fontSize: 13, color: colors.text.secondary, marginTop: 4 }}>
            Start paper trading with virtual cash, or connect your real broker.
          </div>
          <div className="flex items-center justify-center gap-3" style={{ marginTop: 16 }}>
            <Button variant="primary" size="md" onClick={() => setActiveTab('paper' as PortfolioTabId)}>
              Start Paper Trading
            </Button>
            <Button variant="ghost" size="md" onClick={() => setActiveTab('real' as PortfolioTabId)}>
              Connect Broker
            </Button>
          </div>
        </motion.div>
      }
    />
  );
}
