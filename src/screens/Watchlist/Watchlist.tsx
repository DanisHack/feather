import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useWatchlistStore } from '../../store/watchlistStore';
import { usePolygonWS } from '../../hooks/usePolygonWS';
import { useSnapshots } from '../../hooks/usePolygon';
import { mockWatchlistData } from '../../mocks/watchlist';
import { Skeleton } from '../../design-system';
import { WatchlistTabs } from './WatchlistTabs';
import { WatchlistRow } from './WatchlistRow';
import { WatchlistEmpty } from './WatchlistEmpty';
import { AddStock } from './AddStock';
import { SearchModal } from '../../components/SearchModal/SearchModal';

const hasApiKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);

const TABLE_HEADERS = [
  { label: 'Name', align: 'left' as const, width: undefined, flex: true },
  { label: 'Price', align: 'right' as const, width: 100 },
  { label: 'Change', align: 'right' as const, width: 90 },
  { label: '% Change', align: 'right' as const, width: 90 },
  { label: 'Mkt Cap', align: 'right' as const, width: 110 },
  { label: 'Volume', align: 'right' as const, width: 100 },
  { label: 'Chart', align: 'right' as const, width: 100 },
];

export default function Watchlist() {
  useDocumentTitle('Watchlist — Feather');
  const { lists, activeListId, addTicker, removeTicker } = useWatchlistStore();
  const activeList = lists.find((l) => l.id === activeListId);
  const tickers = activeList?.tickers ?? [];

  // Fetch real snapshots for stock info (name, marketCap, etc.)
  const { data: snapshots, loading: snapshotsLoading, error: snapshotsError } = useSnapshots(hasApiKey ? tickers : []);

  // Build initial quotes for WS from snapshots
  const initialQuotes = useMemo(() => {
    if (!snapshots) return undefined;
    const map: Record<string, { price: number; prevClose: number }> = {};
    for (const snap of snapshots) {
      map[snap.quote.ticker] = {
        price: snap.quote.price,
        prevClose: snap.prevClose,
      };
    }
    return map;
  }, [snapshots]);

  const { quotes, status } = usePolygonWS(tickers, initialQuotes);

  const [emptySearchOpen, setEmptySearchOpen] = useState(false);

  const statusColor = status === 'connected' ? colors.status.positive : status === 'connecting' ? colors.status.warning : colors.status.negative;

  // Build stock data: prefer real snapshots, fall back to mock
  const getStockData = (ticker: string) => {
    if (hasApiKey && snapshots) {
      const snap = snapshots.find((s) => s.quote.ticker === ticker);
      if (snap) {
        return {
          ticker,
          name: snap.name ?? ticker,
          price: snap.quote.price,
          change: snap.quote.change,
          changePercent: snap.quote.changePercent,
          marketCap: snap.marketCap ?? 0,
          volume: snap.quote.volume,
          sparkline: [] as number[],
        };
      }
    }
    return mockWatchlistData[ticker] ?? null;
  };

  return (
    <motion.div
      className="h-full overflow-y-auto"
      style={{ background: colors.bg.primary }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.4, 0.4, 1] }}
    >
      {/* Tabs + add stock + status */}
      <div className="flex items-center justify-between">
        <WatchlistTabs />
        <div className="flex items-center gap-3" style={{ paddingRight: 16, paddingTop: 16 }}>
          <AddStock />
          {/* Connection status dot */}
          <div className="flex items-center gap-1.5">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: statusColor,
              }}
            />
            <span style={{ fontSize: 11, color: colors.text.tertiary }}>
              {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {snapshotsError && (
        <div
          style={{
            margin: '0 16px',
            padding: '12px 16px',
            borderRadius: 8,
            background: `${colors.status.negative}14`,
            border: `1px solid ${colors.status.negative}33`,
            fontSize: 13,
            color: colors.status.negative,
          }}
        >
          {snapshotsError}
        </div>
      )}

      {/* Table header */}
      <div
        className="flex items-center"
        style={{
          padding: '12px 16px 8px',
          borderBottom: `1px solid ${colors.border.subtle}`,
          marginTop: 8,
        }}
      >
        {TABLE_HEADERS.map((header) => (
          <div
            key={header.label}
            style={{
              width: header.width,
              flex: header.flex ? 1 : undefined,
              textAlign: header.align,
              fontSize: 11,
              color: colors.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {header.label}
          </div>
        ))}
      </div>

      {/* Rows or empty state */}
      {tickers.length === 0 ? (
        <>
          <WatchlistEmpty onAddClick={() => setEmptySearchOpen(true)} />
          <SearchModal
            open={emptySearchOpen}
            onClose={() => setEmptySearchOpen(false)}
            onSelect={(ticker) => {
              addTicker(activeListId, ticker);
              setEmptySearchOpen(false);
            }}
          />
        </>
      ) : hasApiKey && snapshotsLoading ? (
        // Show skeleton rows while loading
        <div>
          {tickers.map((ticker) => (
            <div
              key={ticker}
              className="flex items-center"
              style={{ padding: '0 16px', height: 52, borderBottom: `1px solid ${colors.border.hairline}` }}
            >
              <div className="flex items-center flex-1 gap-2">
                <Skeleton width={28} height={28} variant="circular" />
                <div>
                  <Skeleton width={60} height={14} />
                  <Skeleton width={100} height={12} className="mt-1" />
                </div>
              </div>
              <Skeleton width={70} height={14} />
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {tickers.map((ticker) => {
            const stock = getStockData(ticker);
            if (!stock) return null;
            const live = quotes[ticker];
            return (
              <WatchlistRow
                key={ticker}
                stock={stock}
                livePrice={live?.price}
                liveChange={live?.change}
                liveChangePercent={live?.changePercent}
                prevPrice={live?.prevPrice}
                onRemove={() => removeTicker(activeListId, ticker)}
              />
            );
          })}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
