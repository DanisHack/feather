import { colors } from '../../design-system/tokens';

interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div
      style={{
        borderBottom: `1px solid ${colors.border.subtle}`,
        marginTop: 20,
      }}
    >
      <div className="flex">
        {tabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="relative transition-colors duration-150"
              style={{
                fontSize: 13,
                paddingBottom: 10,
                marginRight: 24,
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
              {tab}
              {active && (
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: 2, background: colors.accent.indigo }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
