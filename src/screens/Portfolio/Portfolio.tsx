import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePortfolioStore } from '../../store/portfolioStore';
import { PortfolioTabs } from './PortfolioTabs';
import { DemoTab } from './DemoTab';
import { PaperTab } from './PaperTab';
import { RealTab } from './RealTab';

const tabVariants = {
  enter: { opacity: 0, x: 12 },
  center: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.25, 0.4, 0.4, 1] } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.15 } },
};

export default function Portfolio() {
  const activeTab = usePortfolioStore((s) => s.activeTab);
  useDocumentTitle('Portfolio — Feather');

  // Cmd+N shortcut — open trade/add modal for paper or real tab
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'n') {
        e.preventDefault();
        const tab = usePortfolioStore.getState().activeTab;
        if (tab === 'paper') {
          PaperTab.openTradeModal();
        }
        // TODO: wire Cmd+N for real tab manual entry
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <motion.div
      style={{ overflowY: 'auto', height: '100%' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.4, 0.4, 1] }}
    >
      <div style={{ paddingTop: 24 }}>
        <PortfolioTabs />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {activeTab === 'demo' && <DemoTab />}
          {activeTab === 'paper' && <PaperTab />}
          {activeTab === 'real' && <RealTab />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
