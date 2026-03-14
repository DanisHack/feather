import { isToday, isYesterday } from 'date-fns';
import { NewsCard } from './NewsCard';
import { Skeleton } from '../../design-system';
import { colors } from '../../design-system/tokens';
import type { NewsItem } from '../../types';

interface NewsFeedProps {
  news: NewsItem[];
  loading?: boolean;
}

function groupNews(items: NewsItem[]) {
  const today: NewsItem[] = [];
  const yesterday: NewsItem[] = [];
  const thisWeek: NewsItem[] = [];

  for (const item of items) {
    const date = new Date(item.publishedAt);
    if (isToday(date)) {
      today.push(item);
    } else if (isYesterday(date)) {
      yesterday.push(item);
    } else {
      thisWeek.push(item);
    }
  }

  return { today, yesterday, thisWeek };
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '20px 0 8px',
        borderBottom: `1px solid ${colors.border.subtle}`,
      }}
    >
      {label}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ marginTop: 16 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ padding: '16px 0', borderBottom: `1px solid ${colors.border.subtle}` }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
            <Skeleton width={60} height={10} />
            <Skeleton width={32} height={14} />
          </div>
          <Skeleton width="80%" height={16} />
          <div style={{ marginTop: 6 }}>
            <Skeleton width="100%" height={13} />
          </div>
          <div style={{ marginTop: 4 }}>
            <Skeleton width="60%" height={13} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewsFeed({ news, loading }: NewsFeedProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (news.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ paddingTop: 60, paddingBottom: 60 }}
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
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6Z" />
        </svg>
        <p style={{ fontSize: 14, color: colors.text.secondary, marginTop: 12 }}>
          No news available
        </p>
      </div>
    );
  }

  const { today, yesterday, thisWeek } = groupNews(news);

  return (
    <div>
      {today.length > 0 && (
        <>
          <SectionHeader label="Today" />
          {today.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </>
      )}
      {yesterday.length > 0 && (
        <>
          <SectionHeader label="Yesterday" />
          {yesterday.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </>
      )}
      {thisWeek.length > 0 && (
        <>
          <SectionHeader label="This Week" />
          {thisWeek.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </>
      )}
    </div>
  );
}
