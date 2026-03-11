import { type ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../tokens';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  subtitle?: string;
  shortcutKey?: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  layoutId?: string;
  enableKeyboardShortcuts?: boolean;
}

export function TabBar({
  tabs,
  activeTabId,
  onTabChange,
  layoutId = 'tab-indicator',
  enableKeyboardShortcuts = true,
}: TabBarProps) {
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const tab = tabs.find((t) => t.shortcutKey === e.key);
      if (tab) {
        e.preventDefault();
        onTabChange(tab.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tabs, onTabChange, enableKeyboardShortcuts]);

  return (
    <div
      className="flex gap-1"
      style={{ borderBottom: `1px solid ${colors.border.subtle}` }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(tab.id)}
            className="relative flex items-center gap-2 transition-colors duration-150"
            style={{
              padding: '10px 16px 12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? colors.text.emphasis : colors.text.tertiary,
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = colors.text.secondary;
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = colors.text.tertiary;
            }}
          >
            {tab.icon && (
              <span style={{ color: active ? colors.text.emphasis : colors.text.tertiary }}>
                {tab.icon}
              </span>
            )}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>
                  {tab.label}
                </span>
                {tab.badge}
                {tab.shortcutKey && (
                  <span
                    style={{
                      fontSize: 10,
                      color: colors.text.tertiary,
                      background: colors.bg.elevated[1],
                      padding: '1px 5px',
                      borderRadius: 3,
                      fontFamily: 'monospace',
                    }}
                  >
                    {tab.shortcutKey}
                  </span>
                )}
              </div>
              {tab.subtitle && (
                <span style={{ fontSize: 11, color: colors.text.secondary, marginTop: 1 }}>
                  {tab.subtitle}
                </span>
              )}
            </div>

            {active && (
              <motion.div
                layoutId={layoutId}
                className="absolute bottom-0 left-2 right-2"
                style={{
                  height: 2,
                  background: colors.accent.indigo,
                  borderRadius: 1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
