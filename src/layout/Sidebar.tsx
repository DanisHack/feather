import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tooltip } from '../design-system';
import { useUserStore } from '../store/userStore';
import { colors } from '../design-system/tokens';

const navItems = [
  { path: '/', label: 'Brief', icon: BriefIcon },
  { path: '/research', label: 'Research', icon: ResearchIcon },
  { path: '/portfolio', label: 'Portfolio', icon: PortfolioIcon },
  { path: '/watchlist', label: 'Watchlist', icon: WatchlistIcon },
  { path: '/screener', label: 'Screener', icon: ScreenerIcon },
  { path: '/earnings', label: 'Earnings', icon: EarningsIcon },
  { path: '/markets', label: 'Markets', icon: MarketsIcon },
];

const settingsItem = { path: '/settings', label: 'Settings', icon: SettingsIcon };

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const renderNavButton = ({ path, label, icon: Icon }: typeof navItems[number]) => {
    const active = isActive(path);
    return (
      <Tooltip key={path} content={label} side="right">
        <button
          onClick={() => navigate(path)}
          className="relative w-14 h-10 flex items-center justify-center transition-colors duration-200"
          style={{
            color: active ? colors.text.emphasis : colors.text.tertiary,
            backgroundColor: active ? colors.bg.elevated[1] : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!active) e.currentTarget.style.color = colors.text.secondary;
          }}
          onMouseLeave={(e) => {
            if (!active) e.currentTarget.style.color = colors.text.tertiary;
          }}
        >
          {active && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute left-0 top-1 bottom-1 rounded-r"
              style={{ width: 2, backgroundColor: colors.accent.indigo }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <Icon size={20} />
        </button>
      </Tooltip>
    );
  };

  return (
    <nav
      className="h-full bg-black/40 flex flex-col items-center shrink-0"
      style={{
        width: 56,
        borderRight: `1px solid ${colors.border.default}`,
        paddingTop: 16,
      }}
    >
      {/* Spacer for traffic lights */}
      <div className="h-10" />

      <div className="flex flex-col items-center gap-1">
        {navItems.map(renderNavButton)}
      </div>

      <div className="mt-auto mb-3 flex flex-col items-center gap-1">
        {user?.subscription?.status === 'trialing' && (
          <TrialRing trialEnd={user.subscription.trialEnd} onClick={() => navigate('/settings')} />
        )}
        {user && (
          <Tooltip content={user.name ?? user.email} side="right">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center justify-center rounded-full transition-opacity duration-200"
              style={{
                width: 28,
                height: 28,
                background: colors.accent.indigoMuted,
                color: colors.accent.indigo,
                fontSize: 11,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                marginBottom: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {(user.name ?? user.email).slice(0, 2).toUpperCase()}
            </button>
          </Tooltip>
        )}
        {renderNavButton(settingsItem)}
      </div>
    </nav>
  );
}

// Simple inline SVG icons (20x20)
function BriefIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
    </svg>
  );
}

function ResearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function PortfolioIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function WatchlistIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ScreenerIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function EarningsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MarketsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function TrialRing({ trialEnd, onClick }: { trialEnd?: Date; onClick: () => void }) {
  const totalDays = 7;
  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : totalDays;
  const progress = daysLeft / totalDays;
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const ringColor = daysLeft <= 3 ? colors.status.negative : colors.status.warning;

  return (
    <Tooltip content={`${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in trial`} side="right">
      <button
        onClick={onClick}
        className="relative flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 4,
        }}
      >
        <svg width={24} height={24} viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r={radius}
            fill="none"
            stroke={colors.border.default}
            strokeWidth={2}
          />
          <circle
            cx="12"
            cy="12"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 12 12)"
          />
        </svg>
        <span
          className="absolute"
          style={{ fontSize: 9, fontWeight: 600, color: ringColor }}
        >
          {daysLeft}
        </span>
      </button>
    </Tooltip>
  );
}

function SettingsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
