import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'sector' | 'exchange' | 'status' | 'accent';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-bg-chip text-text-secondary border border-border',
  sector:
    'bg-accent-blue/10 text-accent-blue border border-accent-blue/20',
  exchange:
    'bg-bg-chip text-text-faded border border-border-subtle',
  status:
    'bg-status-positive/10 text-status-positive border border-status-positive/20',
  accent:
    'bg-accent-blue/10 text-accent-blue border border-accent-blue/20',
};

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-[3.75px] rounded text-caption font-medium
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
