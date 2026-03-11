import { motion } from 'framer-motion';
import type { Quote } from '../../types';
import { colors } from '../tokens';
import { StockLogo } from './StockLogo';
import { PriceChange } from './PriceChange';
import { Sparkline } from './Sparkline';

interface StockRowProps {
  ticker: string;
  name: string;
  logo?: string;
  quote?: Quote;
  sparklineData?: number[];
  onClick?: () => void;
  className?: string;
}

export function StockRow({
  ticker,
  name,
  logo,
  quote,
  sparklineData,
  onClick,
  className = '',
}: StockRowProps) {
  return (
    <motion.div
      whileHover={{ backgroundColor: colors.bg.elevated[1] }}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
        transition-colors duration-150
        ${className}
      `}
    >
      <StockLogo ticker={ticker} name={name} logo={logo} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-label font-semibold text-text-emphasis">
            {ticker}
          </span>
        </div>
        <p className="text-caption text-text-secondary truncate">{name}</p>
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="w-16 h-8 flex-shrink-0">
          <Sparkline
            data={sparklineData}
            color={
              quote && quote.changePercent >= 0 ? colors.status.positive : colors.status.negative
            }
          />
        </div>
      )}

      <div className="text-right flex-shrink-0">
        {quote ? (
          <>
            <div className="text-label font-medium text-text-emphasis">
              ${quote.price.toFixed(2)}
            </div>
            <PriceChange value={quote.changePercent} size="sm" />
          </>
        ) : (
          <div className="text-label text-text-faded">--</div>
        )}
      </div>
    </motion.div>
  );
}
