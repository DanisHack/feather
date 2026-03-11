import { useState } from 'react';

interface StockLogoProps {
  ticker: string;
  name?: string;
  logo?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-6 h-6 text-micro',
  md: 'w-8 h-8 text-caption',
  lg: 'w-10 h-10 text-label',
} as const;

export function StockLogo({
  ticker,
  name,
  logo,
  size = 'md',
  className = '',
}: StockLogoProps) {
  const [imgError, setImgError] = useState(false);

  const initials = ticker.slice(0, 2);

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name ?? ticker}
        className={`${sizeMap[size]} rounded-lg object-cover bg-bg-tertiary ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeMap[size]} rounded-lg bg-bg-tertiary border border-border
        flex items-center justify-center font-semibold text-text-secondary
        ${className}
      `}
    >
      {initials}
    </div>
  );
}
