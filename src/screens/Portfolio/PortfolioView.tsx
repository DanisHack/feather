import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Portfolio } from '../../types';
import { PortfolioHeader } from './PortfolioHeader';
import { PerformanceChart } from './PerformanceChart';
import { HoldingsSection } from './HoldingsSection';

interface PortfolioViewProps {
  portfolio: Portfolio;
  readOnly?: boolean;
  onManualEntry?: () => void;
  headerLabel?: string;
  badge?: ReactNode;
  footer?: ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.4, 0.4, 1] },
  },
};

export function PortfolioView({
  portfolio,
  readOnly = false,
  onManualEntry,
  headerLabel,
  badge,
  footer,
}: PortfolioViewProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 32px' }}
    >
      {badge && <motion.div variants={itemVariants}>{badge}</motion.div>}

      <motion.div variants={itemVariants}>
        <PortfolioHeader portfolio={portfolio} label={headerLabel} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <PerformanceChart data={portfolio.performanceHistory} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <HoldingsSection
          accounts={portfolio.accounts}
          onManualEntry={readOnly ? undefined : onManualEntry}
        />
      </motion.div>

      {footer && <motion.div variants={itemVariants}>{footer}</motion.div>}
    </motion.div>
  );
}
