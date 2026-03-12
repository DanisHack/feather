import { colors } from '../../design-system/tokens';

interface PlaceholderTabProps {
  icon: 'financials' | 'earnings' | 'insiders';
}

const icons: Record<string, JSX.Element> = {
  financials: (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  earnings: (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  insiders: (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

export function PlaceholderTab({ icon }: PlaceholderTabProps) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <div style={{ color: colors.text.tertiary, marginBottom: 8 }}>
        {icons[icon]}
      </div>
      <div style={{ fontSize: 13, color: colors.text.tertiary }}>
        Coming in Day 7
      </div>
    </div>
  );
}
