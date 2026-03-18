import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, boxShadow } from '../design-system/tokens';
import { useCommandBar } from '../hooks/useCommandBar';
import type { CommandItem } from '../hooks/useCommandBar';

export function CommandBar() {
  const {
    open,
    query,
    sections,
    allItems,
    selectedIndex,
    searching,
    setQuery,
    setSelectedIndex,
    handleKeyDown,
    close,
  } = useCommandBar();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Track flat index across sections
  let flatIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{
              background: colors.bg.overlay,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onClick={close}
          />

          {/* Command palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-50"
            style={{
              width: 640,
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <div
              style={{
                background: colors.bg.tertiary,
                border: `1px solid ${colors.border.strong}`,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: boxShadow.commandBar,
              }}
            >
              {/* Search input */}
              <div
                className="flex items-center gap-3"
                style={{
                  padding: '14px 16px',
                  borderBottom: `1px solid ${colors.border.subtle}`,
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
                  className="shrink-0"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search stocks, navigate, actions..."
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
                  <span style={{ fontSize: 11, color: colors.text.tertiary }}>
                    Searching...
                  </span>
                )}
                <kbd
                  style={{
                    fontSize: 10,
                    color: colors.text.tertiary,
                    background: colors.bg.elevated[3],
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontFamily: 'monospace',
                  }}
                >
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                style={{
                  maxHeight: 400,
                  overflowY: 'auto',
                  padding: '8px 0',
                }}
              >
                {allItems.length === 0 && query.length > 0 ? (
                  <div
                    style={{
                      padding: '24px 16px',
                      fontSize: 13,
                      color: colors.text.tertiary,
                      textAlign: 'center',
                    }}
                  >
                    No results for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  sections.map((section) => {
                    const sectionItems = section.items.map((item) => {
                      const idx = flatIndex++;
                      return (
                        <ResultRow
                          key={item.id}
                          item={item}
                          selected={idx === selectedIndex}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={item.action}
                        />
                      );
                    });

                    return (
                      <div key={section.title}>
                        <div
                          style={{
                            fontSize: 11,
                            color: colors.text.tertiary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '8px 16px 4px',
                          }}
                        >
                          {section.title}
                        </div>
                        {sectionItems}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ResultRow({
  item,
  selected,
  onMouseEnter,
  onClick,
}: {
  item: CommandItem;
  selected: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  return (
    <button
      data-selected={selected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className="w-full flex items-center gap-3 transition-colors duration-75"
      style={{
        padding: '8px 16px',
        background: selected ? colors.bg.elevated[1] : 'transparent',
        border: 'none',
        borderLeftWidth: 2,
        borderLeftStyle: 'solid',
        borderLeftColor: selected ? colors.accent.indigo : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <TypeIcon type={item.type} label={item.label} />
      <div className="flex-1 min-w-0">
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: colors.text.emphasis,
          }}
        >
          {item.label}
        </span>
        {item.sublabel && (
          <span
            style={{
              fontSize: 12,
              color: colors.text.secondary,
              marginLeft: 8,
            }}
          >
            {item.sublabel}
          </span>
        )}
      </div>
      {item.shortcut && (
        <kbd
          style={{
            fontSize: 10,
            color: colors.text.tertiary,
            background: colors.bg.elevated[3],
            border: `1px solid ${colors.border.default}`,
            borderRadius: 4,
            padding: '2px 6px',
            fontFamily: 'monospace',
          }}
        >
          {item.shortcut}
        </kbd>
      )}
    </button>
  );
}

function TypeIcon({ type, label }: { type: string; label: string }) {
  if (type === 'stock' || type === 'recent') {
    return (
      <div
        className="flex items-center justify-center shrink-0 rounded-full"
        style={{
          width: 24,
          height: 24,
          background: colors.bg.elevated[4],
          fontSize: 9,
          fontWeight: 600,
          color: colors.text.emphasis,
        }}
      >
        {label.slice(0, 2)}
      </div>
    );
  }
  if (type === 'navigation') {
    return (
      <div
        className="flex items-center justify-center shrink-0 rounded"
        style={{
          width: 24,
          height: 24,
          background: colors.accent.indigoMuted,
          color: colors.accent.indigo,
        }}
      >
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    );
  }
  // action
  return (
    <div
      className="flex items-center justify-center shrink-0 rounded"
      style={{
        width: 24,
        height: 24,
        background: colors.bg.elevated[3],
        color: colors.text.secondary,
      }}
    >
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </div>
  );
}
