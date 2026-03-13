import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkline, PriceChange } from '../../design-system';
import { colors } from '../../design-system/tokens';
import { formatMarketCap, formatCompactNumber } from '../../lib/formatters';
import type { WatchlistStockData } from '../../mocks/watchlist';

interface WatchlistRowProps {
  stock: WatchlistStockData;
  livePrice?: number;
  liveChange?: number;
  liveChangePercent?: number;
  prevPrice?: number;
  onRemove?: () => void;
}

export function WatchlistRow({
  stock,
  livePrice,
  liveChange,
  liveChangePercent,
  onRemove,
}: WatchlistRowProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [flashColor, setFlashColor] = useState('transparent');
  const prevPriceRef = useRef(livePrice ?? stock.price);

  const price = livePrice ?? stock.price;
  const change = liveChange ?? stock.change;
  const changePercent = liveChangePercent ?? stock.changePercent;
  const isPositive = change >= 0;
  const sparklineColor = isPositive ? colors.status.positive : colors.status.negative;
  const initials = stock.ticker.slice(0, 2);

  // Price flash animation
  useEffect(() => {
    if (livePrice != null && prevPriceRef.current !== livePrice) {
      const direction = livePrice > prevPriceRef.current ? 'up' : 'down';
      setFlashColor(
        direction === 'up'
          ? `${colors.status.positive}26`
          : `${colors.status.negative}26`
      );
      prevPriceRef.current = livePrice;
      const timer = setTimeout(() => setFlashColor('transparent'), 600);
      return () => clearTimeout(timer);
    }
  }, [livePrice]);

  return (
    <motion.div
      className="flex items-center cursor-pointer"
      style={{
        padding: '0 16px',
        height: 52,
        borderBottom: `1px solid ${colors.border.hairline}`,
        backgroundColor: hovered ? colors.bg.elevated[1] : flashColor,
        transition: 'background-color 0.6s ease',
      }}
      onClick={() => navigate(`/research/${stock.ticker}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      layout
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 52, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Name column */}
      <div className="flex items-center flex-1 min-w-0">
        <div
          className="rounded-full flex items-center justify-center shrink-0"
          style={{
            width: 28,
            height: 28,
            background: colors.bg.elevated[4],
            fontSize: 11,
            fontWeight: 600,
            color: colors.text.emphasis,
            marginRight: 10,
          }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div style={{ fontSize: 13, color: colors.text.emphasis, fontWeight: 600 }}>
            {stock.ticker}
          </div>
          <div
            style={{
              fontSize: 12,
              color: colors.text.tertiary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {stock.name}
          </div>
        </div>
      </div>

      {/* Price */}
      <div style={{ width: 100, textAlign: 'right', fontSize: 14, color: colors.text.emphasis, fontWeight: 500 }}>
        ${price.toFixed(2)}
      </div>

      {/* Change */}
      <div
        style={{
          width: 90,
          textAlign: 'right',
          fontSize: 13,
          color: isPositive ? colors.status.positive : colors.status.negative,
        }}
      >
        {isPositive ? '+' : ''}{change.toFixed(2)}
      </div>

      {/* % Change */}
      <div style={{ width: 90, textAlign: 'right' }}>
        <PriceChange value={changePercent} size="sm" />
      </div>

      {/* Market Cap */}
      <div style={{ width: 110, textAlign: 'right', fontSize: 12, color: colors.text.secondary }}>
        {formatMarketCap(stock.marketCap)}
      </div>

      {/* Volume */}
      <div style={{ width: 100, textAlign: 'right', fontSize: 12, color: colors.text.secondary }}>
        {formatCompactNumber(stock.volume)}
      </div>

      {/* Sparkline */}
      <div style={{ width: 100, height: 32, paddingLeft: 16 }} className="flex items-center">
        <div style={{ width: 80, height: 32 }}>
          <Sparkline data={stock.sparkline} color={sparklineColor} width={80} height={32} />
        </div>
      </div>

      {/* Remove button on hover */}
      {hovered && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            position: 'absolute',
            right: 8,
            color: colors.text.tertiary,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            padding: '2px 6px',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = colors.status.negative; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = colors.text.tertiary; }}
        >
          ×
        </button>
      )}
    </motion.div>
  );
}
