import { useState } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { usePaperPortfolio } from '../../hooks/usePaperPortfolio';
import { PortfolioView } from './PortfolioView';
import { PaperTradeModal } from './PaperTradeModal';

const STARTING_BALANCES = [50_000, 100_000, 250_000, 500_000, 1_000_000];

export function PaperTab() {
  const { paper, portfolio, initialize, reset } = usePaperPortfolio();
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  // Expose setter for Cmd+N shortcut
  PaperTab.openTradeModal = () => setTradeModalOpen(true);

  if (!paper.initialized) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 32px' }}>
        <div className="flex flex-col items-center" style={{ paddingTop: 60, paddingBottom: 60 }}>
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={colors.text.faded} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
          </svg>

          <div style={{ fontSize: 18, fontWeight: 500, color: colors.text.emphasis, marginTop: 16 }}>
            Start Paper Trading
          </div>
          <div
            style={{
              fontSize: 13,
              color: colors.text.secondary,
              marginTop: 6,
              maxWidth: 360,
              textAlign: 'center',
              lineHeight: '1.5',
            }}
          >
            Practice trading with virtual money using real market prices. No risk, full experience.
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, color: colors.text.tertiary, marginBottom: 8, textAlign: 'center' }}>
              Choose starting balance
            </div>
            <div className="flex items-center gap-2">
              {STARTING_BALANCES.map((amount) => {
                const isDefault = amount === 100_000;
                return (
                  <motion.button
                    key={amount}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => initialize(amount)}
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: isDefault ? colors.text.emphasis : colors.text.secondary,
                      background: isDefault ? colors.accent.indigoMuted : colors.bg.elevated[1],
                      border: `1px solid ${isDefault ? 'rgba(99,102,241,0.3)' : colors.border.subtle}`,
                      borderRadius: 8,
                      padding: '8px 16px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.border.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isDefault ? 'rgba(99,102,241,0.3)' : colors.border.subtle;
                    }}
                  >
                    ${amount >= 1_000_000 ? `${amount / 1_000_000}M` : `${amount / 1_000}K`}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Paper initialized but no positions yet
  if (!portfolio) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 32px' }}>
        <CashBalanceBar cashBalance={paper.cashBalance} startingCash={paper.startingCash} onReset={reset} />
        <div className="flex flex-col items-center" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ fontSize: 15, color: colors.text.tertiary }}>No positions yet</div>
          <div style={{ fontSize: 13, color: colors.text.faded, marginTop: 4 }}>
            Add your first paper trade to get started
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setTradeModalOpen(true)}
            style={{
              marginTop: 16,
              fontSize: 13,
              fontWeight: 500,
              color: colors.text.emphasis,
              background: colors.accent.indigoMuted,
              border: `1px solid rgba(99,102,241,0.3)`,
              borderRadius: 8,
              padding: '8px 20px',
              cursor: 'pointer',
            }}
          >
            + New Trade
          </motion.button>
        </div>
        <PaperTradeModal
          open={tradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
          cashBalance={paper.cashBalance}
          positions={paper.positions}
        />
      </div>
    );
  }

  return (
    <>
      <PortfolioView
        portfolio={portfolio}
        headerLabel="Paper Portfolio Value"
        onManualEntry={() => setTradeModalOpen(true)}
        footer={
          <CashBalanceBar cashBalance={paper.cashBalance} startingCash={paper.startingCash} onReset={reset} />
        }
      />
      <PaperTradeModal
        open={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        cashBalance={paper.cashBalance}
        positions={paper.positions}
      />
    </>
  );
}

// Static ref for shortcut access
PaperTab.openTradeModal = () => {};

function CashBalanceBar({ cashBalance, startingCash, onReset }: {
  cashBalance: number;
  startingCash: number;
  onReset: () => void;
}) {
  const usedPercent = ((startingCash - cashBalance) / startingCash) * 100;

  return (
    <div
      style={{
        marginTop: 24,
        padding: '14px 16px',
        background: colors.bg.secondary,
        borderRadius: 10,
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 12, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cash Available
          </span>
          <span style={{ fontSize: 16, fontWeight: 500, color: colors.text.emphasis }}>
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <button
          onClick={onReset}
          style={{ fontSize: 12, color: colors.text.tertiary, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Reset paper portfolio
        </button>
      </div>
      <div style={{ marginTop: 8, height: 3, background: colors.bg.elevated[1], borderRadius: 2 }}>
        <motion.div
          style={{ height: '100%', background: colors.accent.indigo, borderRadius: 2 }}
          initial={{ width: 0 }}
          animate={{ width: `${usedPercent}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.4, 1] }}
        />
      </div>
    </div>
  );
}
