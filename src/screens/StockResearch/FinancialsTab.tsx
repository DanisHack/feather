import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../../design-system';
import { colors } from '../../design-system/tokens';

interface FinancialsTabProps {
  ticker: string;
  data: Record<string, unknown>[] | null;
}

type SubTab = 'income' | 'balance' | 'cashflow';

interface ParsedQuarter {
  label: string;
  date: string;
  income: Record<string, number>;
  balance: Record<string, number>;
  cashflow: Record<string, number>;
}

interface MetricConfig {
  key: string;
  label: string;
  isEps?: boolean;
}

// ─── Parsing ────────────────────────────────────────────

type FinField = { value?: number };
type FinStatement = Record<string, FinField>;

function getVal(stmt: FinStatement, key: string): number {
  return stmt[key]?.value ?? 0;
}

function parseQuarters(raw: Record<string, unknown>[]): ParsedQuarter[] {
  return raw
    .map((item) => {
      const fp = (item.fiscal_period as string) ?? '';
      const fy = (item.fiscal_year as string) ?? '';
      const label = `${fp} '${fy.slice(-2)}`;
      const date = (item.period_of_report_date as string) ?? '';

      const fin = (item.financials ?? {}) as Record<string, FinStatement>;
      const inc = fin.income_statement ?? {};
      const bal = fin.balance_sheet ?? {};
      const cf = fin.cash_flow_statement ?? {};

      return {
        label,
        date,
        income: {
          revenue: getVal(inc, 'revenues'),
          costOfRevenue: getVal(inc, 'cost_of_revenue'),
          grossProfit: getVal(inc, 'gross_profit'),
          operatingExpenses: getVal(inc, 'operating_expenses'),
          operatingIncome: getVal(inc, 'operating_income_loss'),
          netIncome: getVal(inc, 'net_income_loss'),
          eps: getVal(inc, 'basic_earnings_per_share'),
        },
        balance: {
          totalAssets: getVal(bal, 'assets'),
          totalLiabilities: getVal(bal, 'liabilities'),
          stockholdersEquity: getVal(bal, 'equity'),
          currentAssets: getVal(bal, 'current_assets'),
          currentLiabilities: getVal(bal, 'current_liabilities'),
          longTermDebt: getVal(bal, 'long_term_debt'),
        },
        cashflow: {
          operatingCF: getVal(cf, 'net_cash_flow_from_operating_activities'),
          investingCF: getVal(cf, 'net_cash_flow_from_investing_activities'),
          financingCF: getVal(cf, 'net_cash_flow_from_financing_activities'),
        },
      };
    })
    .reverse(); // Oldest first → left-to-right chronological
}

// ─── Formatting ─────────────────────────────────────────

function fmtValue(value: number, isEps = false): string {
  if (value === 0) return '--';
  if (isEps) return `$${value.toFixed(2)}`;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(0)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function qoqChange(current: number, previous: number): string | null {
  if (previous === 0 || current === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

// ─── Metric configs ─────────────────────────────────────

const INCOME_METRICS: MetricConfig[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'costOfRevenue', label: 'Cost of Revenue' },
  { key: 'grossProfit', label: 'Gross Profit' },
  { key: 'operatingExpenses', label: 'Operating Expenses' },
  { key: 'operatingIncome', label: 'Operating Income' },
  { key: 'netIncome', label: 'Net Income' },
  { key: 'eps', label: 'EPS', isEps: true },
];

const BALANCE_METRICS: MetricConfig[] = [
  { key: 'totalAssets', label: 'Total Assets' },
  { key: 'totalLiabilities', label: 'Total Liabilities' },
  { key: 'stockholdersEquity', label: "Stockholders' Equity" },
  { key: 'currentAssets', label: 'Current Assets' },
  { key: 'currentLiabilities', label: 'Current Liabilities' },
  { key: 'longTermDebt', label: 'Long-term Debt' },
];

const CASHFLOW_METRICS: MetricConfig[] = [
  { key: 'operatingCF', label: 'Operating' },
  { key: 'investingCF', label: 'Investing' },
  { key: 'financingCF', label: 'Financing' },
];

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'income', label: 'Income' },
  { key: 'balance', label: 'Balance Sheet' },
  { key: 'cashflow', label: 'Cash Flow' },
];

// ─── Bar Chart ──────────────────────────────────────────

function QuarterlyBarChart({
  quarters,
  metricKey,
  statement,
  isEps,
}: {
  quarters: ParsedQuarter[];
  metricKey: string;
  statement: SubTab;
  isEps?: boolean;
}) {
  const values = quarters.map((q) => q[statement][metricKey]);
  const maxAbs = Math.max(...values.map(Math.abs), 1);
  const maxBarHeight = 120;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 12,
        height: maxBarHeight + 50,
        padding: '20px 0',
      }}
    >
      {quarters.map((q, i) => {
        const val = values[i];
        const height = (Math.abs(val) / maxAbs) * maxBarHeight;
        const isPositive = val >= 0;

        return (
          <div
            key={q.label}
            className="flex flex-col items-center"
            style={{ width: 64 }}
          >
            <div
              style={{
                fontSize: 11,
                color: colors.text.secondary,
                marginBottom: 6,
                whiteSpace: 'nowrap',
              }}
            >
              {fmtValue(val, isEps)}
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: Math.max(height, 4) }}
              transition={{ duration: 0.5, ease: [0.25, 0.4, 0.4, 1], delay: i * 0.08 }}
              style={{
                width: '100%',
                borderRadius: '4px 4px 0 0',
                background: isPositive
                  ? `linear-gradient(180deg, ${colors.status.positive} 0%, ${colors.status.positiveDark} 100%)`
                  : `linear-gradient(180deg, ${colors.status.negative} 0%, ${colors.status.negativeDark} 100%)`,
                opacity: i === quarters.length - 1 ? 1 : 0.5 + (i / quarters.length) * 0.3,
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: colors.text.secondary,
                marginTop: 8,
              }}
            >
              {q.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Table ──────────────────────────────────────────────

function FinancialTable({
  quarters,
  metrics,
  statement,
}: {
  quarters: ParsedQuarter[];
  metrics: MetricConfig[];
  statement: SubTab;
}) {
  return (
    <div style={{ marginTop: 8 }}>
      {/* Header row */}
      <div
        className="flex items-center"
        style={{
          padding: '8px 12px',
          borderBottom: `1px solid ${colors.border.subtle}`,
        }}
      >
        <div style={{ flex: 1, fontSize: 11, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Metric
        </div>
        {quarters.map((q) => (
          <div
            key={q.label}
            style={{
              width: 90,
              textAlign: 'right',
              fontSize: 11,
              color: colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {q.label}
          </div>
        ))}
        <div
          style={{
            width: 64,
            textAlign: 'right',
            fontSize: 11,
            color: colors.text.secondary,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          QoQ
        </div>
      </div>

      {/* Data rows */}
      {metrics.map((metric, idx) => {
        const values = quarters.map((q) => q[statement][metric.key]);
        const lastIdx = values.length - 1;
        const change = lastIdx > 0 ? qoqChange(values[lastIdx], values[lastIdx - 1]) : null;
        const isChangePositive = change ? change.startsWith('+') : false;

        return (
          <div
            key={metric.key}
            className="flex items-center"
            style={{
              padding: '10px 12px',
              background: idx % 2 === 0 ? 'transparent' : colors.bg.elevated[1],
              borderRadius: 4,
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: 13,
                color: colors.text.emphasis,
                fontWeight: 400,
              }}
            >
              {metric.label}
            </div>
            {values.map((val, i) => (
              <div
                key={quarters[i].label}
                style={{
                  width: 90,
                  textAlign: 'right',
                  fontSize: 13,
                  fontVariantNumeric: 'tabular-nums',
                  color: val < 0 ? colors.status.negative : colors.text.emphasis,
                }}
              >
                {fmtValue(val, metric.isEps)}
              </div>
            ))}
            <div
              style={{
                width: 64,
                textAlign: 'right',
                fontSize: 12,
                fontVariantNumeric: 'tabular-nums',
                color: change
                  ? isChangePositive
                    ? colors.status.positive
                    : colors.status.negative
                  : colors.text.secondary,
              }}
            >
              {change ?? '--'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────

export function FinancialsTab({ ticker, data }: FinancialsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('income');

  const quarters = useMemo(() => {
    if (!data || data.length === 0) return [];
    return parseQuarters(data);
  }, [data]);

  // Loading state
  if (!data) {
    return (
      <div style={{ marginTop: 20 }}>
        <div className="flex gap-4" style={{ marginBottom: 20 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width={80} height={28} variant="rounded" />
          ))}
        </div>
        <Skeleton width="100%" height={180} variant="rounded" />
        <div style={{ marginTop: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={36} variant="rounded" className="mb-1" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (quarters.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ paddingTop: 48, paddingBottom: 48 }}
      >
        <svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.text.secondary}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
        <div style={{ fontSize: 13, color: colors.text.secondary, marginTop: 8 }}>
          No financial data available for {ticker}
        </div>
      </div>
    );
  }

  const metricsForTab: Record<SubTab, MetricConfig[]> = {
    income: INCOME_METRICS,
    balance: BALANCE_METRICS,
    cashflow: CASHFLOW_METRICS,
  };

  const primaryMetric: Record<SubTab, { key: string; label: string; isEps?: boolean }> = {
    income: { key: 'revenue', label: 'Revenue' },
    balance: { key: 'totalAssets', label: 'Total Assets' },
    cashflow: { key: 'operatingCF', label: 'Operating Cash Flow' },
  };

  const currentMetrics = metricsForTab[activeSubTab];
  const hero = primaryMetric[activeSubTab];

  return (
    <div style={{ marginTop: 20 }}>
      {/* Sub-tab bar */}
      <div className="flex gap-1" style={{ marginBottom: 16 }}>
        {SUB_TABS.map((tab) => {
          const active = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              style={{
                fontSize: 12,
                padding: '6px 14px',
                borderRadius: 6,
                border: `1px solid ${active ? colors.border.hover : colors.border.subtle}`,
                background: active ? colors.bg.elevated[3] : 'transparent',
                color: active ? colors.text.emphasis : colors.text.secondary,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = colors.border.hover;
                  e.currentTarget.style.color = colors.text.emphasis;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = colors.border.subtle;
                  e.currentTarget.style.color = colors.text.secondary;
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {/* Hero bar chart */}
          <div
            style={{
              background: colors.bg.elevated[1],
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 10,
              padding: '16px 16px 4px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              {hero.label}
            </div>
            <QuarterlyBarChart
              quarters={quarters}
              metricKey={hero.key}
              statement={activeSubTab}
              isEps={hero.isEps}
            />
          </div>

          {/* Financial table */}
          <div
            style={{
              marginTop: 16,
              background: colors.bg.elevated[1],
              border: `1px solid ${colors.border.subtle}`,
              borderRadius: 10,
              padding: '8px 4px',
              overflow: 'hidden',
            }}
          >
            <FinancialTable
              quarters={quarters}
              metrics={currentMetrics}
              statement={activeSubTab}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
