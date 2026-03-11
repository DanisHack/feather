interface PriceChangeProps {
  value: number;
  percent?: boolean;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-caption px-1.5 py-0.5',
  md: 'text-label px-2 py-0.5',
  lg: 'text-body-sm px-2.5 py-1',
} as const;

export function PriceChange({
  value,
  percent = true,
  showSign = true,
  size = 'md',
  className = '',
}: PriceChangeProps) {
  const isPositive = value >= 0;
  const sign = showSign && isPositive ? '+' : '';
  const formatted = percent
    ? `${sign}${value.toFixed(2)}%`
    : `${sign}${value.toFixed(2)}`;

  return (
    <span
      className={`
        inline-flex items-center rounded font-medium
        ${isPositive ? 'text-status-positive bg-status-positive/10' : 'text-status-negative bg-status-negative/10'}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {formatted}
    </span>
  );
}
