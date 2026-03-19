import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors } from '../design-system/tokens';
import { useUserStore } from '../store/userStore';
import { FeatherLogo } from './FeatherLogo';
import { polygon } from '../lib/polygon';
import { searchTickers as searchMockTickers } from '../mocks/tickers';

const hasApiKey = Boolean(import.meta.env.VITE_POLYGON_API_KEY);
const DEBOUNCE_MS = 300;
const MAX_STOCKS = 5;

const GICS_SECTORS = [
  'Technology',
  'Healthcare',
  'Financials',
  'Consumer Discretionary',
  'Communication Services',
  'Industrials',
  'Consumer Staples',
  'Energy',
  'Utilities',
  'Real Estate',
  'Materials',
];

interface TickerResult {
  ticker: string;
  name: string;
  exchange: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.4, 0.4, 1] } },
};

export function WelcomeScreen() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const { onboarding, updateOnboarding, completeOnboarding } = useUserStore();

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const skip = () => {
    completeOnboarding();
  };

  const finish = () => {
    completeOnboarding();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: colors.bg.primary }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress dots */}
      <div className="flex items-center gap-2" style={{ position: 'absolute', top: 48 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i === step ? colors.accent.indigo : colors.border.default,
              transition: 'background 0.2s ease',
            }}
          />
        ))}
      </div>

      {/* Skip button (visible on steps 1-3) */}
      {step > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={skip}
          style={{
            position: 'absolute',
            top: 44,
            right: 40,
            background: 'none',
            border: 'none',
            fontSize: 13,
            color: colors.text.tertiary,
            cursor: 'pointer',
          }}
        >
          Skip
        </motion.button>
      )}

      <div style={{ width: 520, maxWidth: '100%', padding: '0 32px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <StepWelcome key="step-0" direction={direction} onNext={goNext} />
          )}
          {step === 1 && (
            <StepSectors
              key="step-1"
              direction={direction}
              selected={onboarding.selectedSectors}
              onChange={(sectors) => updateOnboarding({ selectedSectors: sectors })}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 2 && (
            <StepStocks
              key="step-2"
              direction={direction}
              selected={onboarding.selectedStocks}
              onChange={(stocks) => updateOnboarding({ selectedStocks: stocks })}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 3 && (
            <StepBroker
              key="step-3"
              direction={direction}
              onFinish={finish}
              onBack={goBack}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── Step 0: Welcome Intro ─────────────────────────────── */

function StepWelcome({ direction, onNext }: { direction: number; onNext: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.4, 1] }}
    >
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <FeatherLogo size={36} showText={false} />
      </motion.div>

      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        style={{ fontSize: 28, fontWeight: 600, color: colors.text.emphasis, marginTop: 20 }}
      >
        Welcome to Feather
      </motion.h1>
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        style={{ fontSize: 15, color: colors.text.secondary, marginTop: 8, lineHeight: 1.5 }}
      >
        Your premium US equity research toolkit.
        <br />
        Let&apos;s personalize your experience.
      </motion.p>

      <motion.button
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        onClick={onNext}
        className="w-full transition-colors duration-150"
        style={{
          marginTop: 32,
          padding: '12px 0',
          borderRadius: 10,
          border: 'none',
          background: colors.accent.indigo,
          color: '#FFFFFF',
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
        }}
        whileHover={{ backgroundColor: colors.accent.indigoHover }}
        whileTap={{ scale: 0.98 }}
      >
        Get Started
      </motion.button>
    </motion.div>
  );
}

/* ─── Step 1: Sector Selection ──────────────────────────── */

function StepSectors({
  direction,
  selected,
  onChange,
  onNext,
  onBack,
}: {
  direction: number;
  selected: string[];
  onChange: (sectors: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const toggle = (sector: string) => {
    if (selected.includes(sector)) {
      onChange(selected.filter((s) => s !== sector));
    } else {
      onChange([...selected, sector]);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.4, 1] }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 600, color: colors.text.emphasis }}>
        What sectors do you follow?
      </h2>
      <p style={{ fontSize: 14, color: colors.text.secondary, marginTop: 6 }}>
        Select the sectors you&apos;re interested in
      </p>

      <motion.div
        className="flex flex-wrap justify-center gap-2"
        style={{ marginTop: 24 }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {GICS_SECTORS.map((sector) => {
          const isSelected = selected.includes(sector);
          return (
            <motion.button
              key={sector}
              variants={fadeUp}
              onClick={() => toggle(sector)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `1px solid ${isSelected ? colors.accent.indigo : colors.border.default}`,
                background: isSelected ? colors.accent.indigoMuted : 'transparent',
                color: isSelected ? colors.accent.indigoHover : colors.text.secondary,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              whileHover={{ borderColor: colors.border.hover }}
              whileTap={{ scale: 0.97 }}
            >
              {sector}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="flex items-center gap-3 w-full" style={{ marginTop: 32 }}>
        <BackButton onClick={onBack} />
        <motion.button
          onClick={onNext}
          className="flex-1 transition-colors duration-150"
          style={{
            padding: '12px 0',
            borderRadius: 10,
            border: 'none',
            background: colors.accent.indigo,
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          whileHover={{ backgroundColor: colors.accent.indigoHover }}
          whileTap={{ scale: 0.98 }}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Step 2: Stock Search ──────────────────────────────── */

function StepStocks({
  direction,
  selected,
  onChange,
  onNext,
  onBack,
}: {
  direction: number;
  selected: string[];
  onChange: (stocks: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TickerResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    clearTimeout(debounceRef.current);

    if (hasApiKey) {
      setSearching(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const apiResults = await polygon.searchTickers(query, 6);
          setResults(apiResults);
        } catch {
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, DEBOUNCE_MS);
    } else {
      debounceRef.current = setTimeout(() => {
        setResults(searchMockTickers(query));
      }, 80);
    }

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const addStock = useCallback(
    (ticker: string) => {
      if (selected.length >= MAX_STOCKS || selected.includes(ticker)) return;
      onChange([...selected, ticker]);
      setQuery('');
      setResults([]);
      inputRef.current?.focus();
    },
    [selected, onChange],
  );

  const removeStock = (ticker: string) => {
    onChange(selected.filter((t) => t !== ticker));
  };

  return (
    <motion.div
      className="flex flex-col items-center"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.4, 1] }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 600, color: colors.text.emphasis }}>
        Pick stocks to watch
      </h2>
      <p style={{ fontSize: 14, color: colors.text.secondary, marginTop: 6 }}>
        Add up to {MAX_STOCKS} stocks to your watchlist
      </p>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2" style={{ marginTop: 16 }}>
          {selected.map((ticker) => (
            <span
              key={ticker}
              className="flex items-center gap-1.5"
              style={{
                padding: '6px 12px',
                borderRadius: 16,
                background: colors.accent.indigoMuted,
                color: colors.accent.indigoHover,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {ticker}
              <button
                onClick={() => removeStock(ticker)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.accent.indigoHover,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 15,
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div
        className="w-full relative"
        style={{ marginTop: 20 }}
      >
        <div
          className="flex items-center gap-3"
          style={{
            padding: '10px 14px',
            background: colors.bg.secondary,
            border: `1px solid ${colors.border.default}`,
            borderRadius: 10,
          }}
        >
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.text.tertiary}
            strokeWidth={2}
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={selected.length >= MAX_STOCKS ? 'Maximum reached' : 'Search stocks...'}
            disabled={selected.length >= MAX_STOCKS}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              color: colors.text.emphasis,
            }}
          />
          {searching && (
            <span style={{ fontSize: 11, color: colors.text.tertiary }}>Searching...</span>
          )}
        </div>

        {/* Results dropdown */}
        {results.length > 0 && (
          <div
            className="absolute w-full"
            style={{
              top: '100%',
              marginTop: 4,
              background: colors.bg.tertiary,
              border: `1px solid ${colors.border.strong}`,
              borderRadius: 10,
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            {results.map((item) => (
              <button
                key={item.ticker}
                onClick={() => addStock(item.ticker)}
                className="w-full flex items-center gap-2 transition-colors duration-100"
                style={{
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  cursor: selected.includes(item.ticker) ? 'default' : 'pointer',
                  textAlign: 'left',
                  opacity: selected.includes(item.ticker) ? 0.4 : 1,
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center shrink-0"
                  style={{
                    width: 26,
                    height: 26,
                    background: colors.bg.elevated[4],
                    fontSize: 10,
                    fontWeight: 600,
                    color: colors.text.emphasis,
                  }}
                >
                  {item.ticker.slice(0, 2)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text.emphasis }}>
                  {item.ticker}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: colors.text.secondary,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 w-full" style={{ marginTop: 32 }}>
        <BackButton onClick={onBack} />
        <motion.button
          onClick={onNext}
          className="flex-1 transition-colors duration-150"
          style={{
            padding: '12px 0',
            borderRadius: 10,
            border: 'none',
            background: colors.accent.indigo,
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          whileHover={{ backgroundColor: colors.accent.indigoHover }}
          whileTap={{ scale: 0.98 }}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Step 3: Broker Connect ────────────────────────────── */

function StepBroker({
  direction,
  onFinish,
  onBack,
}: {
  direction: number;
  onFinish: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.4, 1] }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: colors.bg.elevated[2],
          border: `1px solid ${colors.border.default}`,
        }}
      >
        <svg
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.text.secondary}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 600, color: colors.text.emphasis, marginTop: 20 }}>
        Connect your broker
      </h2>
      <p style={{ fontSize: 14, color: colors.text.secondary, marginTop: 6, lineHeight: 1.5 }}>
        Link your brokerage account to track your real portfolio.
        <br />
        You can always do this later in Settings.
      </p>

      <div className="flex flex-col gap-3 w-full" style={{ marginTop: 28 }}>
        {/* Plaid connect button — placeholder */}
        <motion.button
          className="w-full transition-colors duration-150"
          style={{
            padding: '12px 0',
            borderRadius: 10,
            border: `1px solid ${colors.border.default}`,
            background: colors.bg.secondary,
            color: colors.text.emphasis,
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
          }}
          whileHover={{ borderColor: colors.border.hover }}
          whileTap={{ scale: 0.98 }}
          onClick={onFinish}
        >
          Connect with Plaid
        </motion.button>

        <div className="flex items-center gap-3 w-full">
          <BackButton onClick={onBack} />
          <motion.button
            onClick={onFinish}
            className="flex-1 transition-colors duration-150"
            style={{
              padding: '12px 0',
              borderRadius: 10,
              border: 'none',
              background: colors.accent.indigo,
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
            whileHover={{ backgroundColor: colors.accent.indigoHover }}
            whileTap={{ scale: 0.98 }}
          >
            Skip for now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Back Button ───────────────────────────────────────── */

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      style={{
        padding: '12px 20px',
        borderRadius: 10,
        border: `1px solid ${colors.border.default}`,
        background: 'transparent',
        color: colors.text.secondary,
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
      }}
      whileHover={{ borderColor: colors.border.hover }}
      whileTap={{ scale: 0.98 }}
    >
      Back
    </motion.button>
  );
}
