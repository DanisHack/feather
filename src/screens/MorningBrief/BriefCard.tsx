import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../design-system';
import { Skeleton } from '../../design-system';
import { colors } from '../../design-system/tokens';

// TODO: wire real data from Claude API
const mockBrief = `Markets are rallying this morning after Fed Chair Powell signaled openness to a May rate cut, with the S&P 500 up 0.87% and NASDAQ gaining 1.12%. NVIDIA continues its dominance, surpassing a $4.4 trillion market cap on surging Blackwell Ultra chip demand. Microsoft's Azure posted 38% growth driven by AI workloads, while Meta's Llama 5 launch is accelerating open-source AI adoption.

On the downside, Tesla missed Q1 delivery estimates with 485K vehicles vs 510K expected, as Chinese EV competition intensifies in Europe. Bitcoin broke through $95K on record ETF inflows, lifting crypto-related stocks. Saudi Aramco's $15B US tech investment signals growing Gulf interest in AI infrastructure.`;

interface BriefCardProps {
  brief?: string | null;
  loading?: boolean;
}

export function BriefCard({ brief, loading }: BriefCardProps) {
  const [expanded, setExpanded] = useState(false);
  const content = brief ?? mockBrief;
  const previewLength = 280;
  const needsTruncation = content.length > previewLength;
  const displayText = expanded || !needsTruncation
    ? content
    : content.slice(0, previewLength) + '...';

  if (loading) {
    return (
      <Card padding="lg">
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <Skeleton width={120} height={16} />
          <Skeleton width={140} height={12} />
        </div>
        <Skeleton lines={4} />
      </Card>
    );
  }

  return (
    <Card padding="lg">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 16 }}
      >
        <div className="flex items-center gap-2">
          {/* AI sparkle icon */}
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.ai.pink}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: colors.text.emphasis,
            }}
          >
            Daily Recap
          </span>
        </div>
        <span style={{ fontSize: 11, color: colors.text.secondary }}>
          Summarized at {new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </span>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={expanded ? 'expanded' : 'collapsed'}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: colors.text.secondary,
              whiteSpace: 'pre-line',
            }}
          >
            {displayText}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Read more */}
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: 12,
            fontSize: 12,
            color: colors.text.link,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </Card>
  );
}
