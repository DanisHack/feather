import { useState } from 'react';
import { PriceChange } from '../../design-system';
import { colors } from '../../design-system/tokens';

interface StockHeaderProps {
  ticker: string;
  name: string;
  exchange: string;
  logo?: string;
  price: number;
  change: number;
  changePercent: number;
  activeRange: string;
  onRangeChange: (range: string) => void;
}

const timeRanges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

export function StockHeader({
  ticker,
  name,
  exchange,
  logo,
  price,
  change,
  changePercent,
  activeRange,
  onRangeChange,
}: StockHeaderProps) {
  const [imgError, setImgError] = useState(false);
  const initials = ticker.slice(0, 2);

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center">
        {/* Logo */}
        {logo && !imgError ? (
          <img
            src={logo}
            alt={name}
            className="rounded-full object-cover"
            style={{ width: 40, height: 40 }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="rounded-full flex items-center justify-center font-semibold"
            style={{
              width: 40,
              height: 40,
              background: colors.bg.elevated[4],
              color: colors.text.emphasis,
              fontSize: 14,
            }}
          >
            {initials}
          </div>
        )}

        {/* Company info */}
        <div className="ml-3">
          <div style={{ fontSize: 15, color: colors.text.emphasis, fontWeight: 600 }}>
            {name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              style={{
                fontSize: 12,
                color: colors.text.secondary,
                background: colors.bg.elevated[3],
                borderRadius: 4,
                padding: '2px 8px',
              }}
            >
              {ticker}
            </span>
            <span
              style={{
                fontSize: 12,
                color: colors.text.secondary,
                background: colors.bg.elevated[3],
                borderRadius: 4,
                padding: '2px 8px',
              }}
            >
              {exchange}
            </span>
          </div>
        </div>

        {/* Price section */}
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <div
              style={{
                fontSize: 32,
                color: colors.text.emphasis,
                fontWeight: 300,
                letterSpacing: -0.5,
              }}
            >
              ${price.toFixed(2)}
            </div>
            <div className="flex items-center justify-end gap-2 mt-0.5">
              <PriceChange value={change} percent={false} size="sm" />
              <PriceChange value={changePercent} percent={true} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Time range selector */}
      <div
        style={{
          borderBottom: `1px solid ${colors.border.subtle}`,
          marginTop: 16,
        }}
      >
        <div className="flex">
          {timeRanges.map((range) => {
            const active = activeRange === range;
            return (
              <button
                key={range}
                onClick={() => onRangeChange(range)}
                className="relative transition-colors duration-150"
                style={{
                  fontSize: 13,
                  paddingBottom: 8,
                  marginRight: 20,
                  color: active ? colors.text.emphasis : colors.text.tertiary,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = colors.text.secondary;
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = colors.text.tertiary;
                }}
              >
                {range}
                {active && (
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{ height: 2, background: colors.text.emphasis }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
