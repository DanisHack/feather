import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { colors } from '../../design-system/tokens';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useResearchStore } from '../../store/researchStore';
import { useStockData } from '../../hooks/useStockData';
import { useAggregates, usePolygonNews } from '../../hooks/usePolygon';
import { TIMEFRAMES } from '../../lib/constants';
import { Skeleton } from '../../design-system';
import { useAnalysis } from '../../hooks/useAnalysis';
import { StockHeader } from './StockHeader';
import { PriceChart } from './PriceChart';
import { KeyStats } from './KeyStats';
import { TabBar } from './TabBar';
import { OverviewTab } from './OverviewTab';
import { FinancialsTab } from './FinancialsTab';
import { AnalysisTab } from './AnalysisTab';
import { PlaceholderTab } from './PlaceholderTab';
import { StockNews } from './StockNews';

const tabs = ['Overview', 'Financials', 'Analysis', 'Earnings', 'News'];

function getDateRange(rangeKey: string): { from: string; to: string; timespan: string; multiplier: number } {
  const tf = TIMEFRAMES.find((t) => t.key === rangeKey) ?? TIMEFRAMES[5]; // default 1Y
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - tf.days);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return {
    from: fmt(from),
    to: fmt(to),
    timespan: tf.timespan,
    multiplier: tf.multiplier,
  };
}

export default function StockResearch() {
  const { ticker: tickerParam } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const lastTicker = useResearchStore((s) => s.lastTicker);
  const setLastTicker = useResearchStore((s) => s.setLastTicker);
  const [activeRange, setActiveRange] = useState('1Y');
  const [activeTab, setActiveTab] = useState('Overview');

  // Redirect to last viewed ticker when no param
  useEffect(() => {
    if (!tickerParam && lastTicker) {
      navigate(`/research/${lastTicker}`, { replace: true });
    }
  }, [tickerParam, lastTicker, navigate]);

  const ticker = tickerParam ? tickerParam.toUpperCase() : null;

  // Save last viewed ticker
  useEffect(() => {
    if (ticker) setLastTicker(ticker);
  }, [ticker, setLastTicker]);

  useDocumentTitle(ticker ? `${ticker} — Feather` : 'Research — Feather');

  // Fetch stock data (progressive: snapshot → details+stats)
  const { stock, quote, keyStats, financials, loading: stockLoading, error: stockError } = useStockData(ticker ?? '');

  // Fetch news (single call, shared between right panel and News tab)
  const { data: newsData, loading: newsLoading } = usePolygonNews(ticker ? [ticker] : [], 8);

  // Fetch analysis data (analyst consensus, price targets, insiders, institutional)
  const { data: analysisData, loading: analysisLoading } = useAnalysis(ticker ?? '');

  // Fetch chart data
  const { from, to, timespan, multiplier } = useMemo(() => getDateRange(activeRange), [activeRange]);
  const { data: ohlcData, loading: chartLoading } = useAggregates(
    ticker ?? '',
    timespan,
    from,
    to,
    multiplier
  );

  const chartData = useMemo(() => {
    if (!ohlcData || ohlcData.length === 0) return [];

    // For intraday timespans (minute/hour), use Unix timestamp
    // For daily+, use YYYY-MM-DD string (TradingView requirement)
    const isIntraday = timespan === 'minute' || timespan === 'hour';

    if (isIntraday) {
      // Use Unix seconds for intraday — TradingView accepts this
      return ohlcData.map((bar) => ({
        time: Math.floor(bar.timestamp / 1000) as unknown as string,
        value: bar.close,
      }));
    }

    // For daily+, deduplicate by date (keep last bar per date)
    const byDate = new Map<string, number>();
    for (const bar of ohlcData) {
      const date = new Date(bar.timestamp).toISOString().slice(0, 10);
      byDate.set(date, bar.close);
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, value]) => ({ time, value }));
  }, [ohlcData, timespan]);

  const renderTabContent = () => {
    if (!ticker) return null;
    switch (activeTab) {
      case 'Overview':
        return <OverviewTab ticker={ticker} stock={stock} />;
      case 'Financials':
        return <FinancialsTab ticker={ticker} data={financials} />;
      case 'Analysis':
        return (
          <AnalysisTab
            ticker={ticker}
            data={analysisData}
            loading={analysisLoading}
            currentPrice={quote?.price ?? 0}
          />
        );
      case 'Earnings':
        return <PlaceholderTab icon="earnings" />;
      case 'News':
        return <StockNews ticker={ticker} news={newsData} loading={newsLoading} />;
      default:
        return <OverviewTab ticker={ticker} stock={stock} />;
    }
  };

  // Empty state — no ticker selected
  if (!ticker) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full"
        style={{ background: colors.bg.primary }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.25, 0.4, 0.4, 1] }}
      >
        <svg
          width={32}
          height={32}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.text.faded}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
        </svg>

        <div style={{ fontSize: 17, color: colors.text.tertiary, fontWeight: 500, marginTop: 12 }}>
          Search for any stock
        </div>
        <div style={{ fontSize: 13, color: colors.text.faded, marginTop: 6 }}>
          Press ⌘K to search 10,000+ stocks
        </div>

        <div className="flex items-center gap-1.5" style={{ marginTop: 16 }}>
          <span
            style={{
              background: colors.bg.elevated[3],
              border: `1px solid ${colors.border.strong}`,
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 13,
              color: colors.text.tertiary,
              fontFamily: 'monospace',
            }}
          >
            ⌘
          </span>
          <span
            style={{
              background: colors.bg.elevated[3],
              border: `1px solid ${colors.border.strong}`,
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 13,
              color: colors.text.tertiary,
              fontFamily: 'monospace',
            }}
          >
            K
          </span>
        </div>
      </motion.div>
    );
  }

  const displayName = stock?.name ?? ticker;
  const displayExchange = stock?.exchange ?? '';

  return (
    <motion.div
      className="flex h-full"
      style={{ background: colors.bg.primary }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.4, 0.4, 1] }}
    >
      {/* Left panel */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 24 }}>
        {/* Shortcut tip */}
        <div
          className="flex items-center justify-center gap-2"
          style={{
            marginBottom: 16,
            padding: '6px 0',
            borderRadius: 8,
            background: colors.bg.elevated[1],
            border: `1px solid ${colors.border.hairline}`,
          }}
        >
          <span style={{ fontSize: 12, color: colors.text.tertiary }}>
            Press
          </span>
          <span
            style={{
              fontSize: 11,
              color: colors.text.secondary,
              background: colors.bg.elevated[3],
              border: `1px solid ${colors.border.default}`,
              borderRadius: 4,
              padding: '1px 6px',
              fontFamily: 'monospace',
            }}
          >
            ⌘K
          </span>
          <span style={{ fontSize: 12, color: colors.text.tertiary }}>
            to search stocks
          </span>
        </div>

        {stockError && (
          <div
            style={{
              padding: '12px 16px',
              marginBottom: 16,
              borderRadius: 8,
              background: `${colors.status.negative}14`,
              border: `1px solid ${colors.status.negative}33`,
              fontSize: 13,
              color: colors.status.negative,
            }}
          >
            {stockError}
          </div>
        )}

        {stockLoading ? (
          <div style={{ marginBottom: 16 }}>
            <div className="flex items-center gap-3">
              <Skeleton width={40} height={40} variant="circular" />
              <div>
                <Skeleton width={160} height={18} />
                <Skeleton width={100} height={14} className="mt-1" />
              </div>
              <div className="ml-auto">
                <Skeleton width={120} height={32} />
                <Skeleton width={80} height={14} className="mt-1" />
              </div>
            </div>
          </div>
        ) : (
          <StockHeader
            ticker={ticker}
            name={displayName}
            exchange={displayExchange}
            logo={stock?.logo}
            price={quote?.price ?? 0}
            change={quote?.change ?? 0}
            changePercent={quote?.changePercent ?? 0}
            activeRange={activeRange}
            onRangeChange={setActiveRange}
          />
        )}

        <div style={{ marginTop: 16 }}>
          {chartLoading || chartData.length === 0 ? (
            <Skeleton width="100%" height={260} variant="rounded" />
          ) : (
            <PriceChart data={chartData} />
          )}
        </div>

        <KeyStats ticker={ticker} data={keyStats} />

        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {renderTabContent()}
      </div>

      {/* Right panel */}
      <div
        className="overflow-y-auto shrink-0"
        style={{
          width: 320,
          borderLeft: `1px solid ${colors.border.subtle}`,
        }}
      >
        <StockNews ticker={ticker} news={newsData} loading={newsLoading} />
      </div>
    </motion.div>
  );
}
