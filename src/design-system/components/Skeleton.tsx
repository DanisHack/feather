interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

function SkeletonBase({
  variant = 'text',
  width,
  height,
  className = '',
}: Omit<SkeletonProps, 'lines'>) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        animate-pulse bg-bg-elevated-4
        ${variantClasses[variant]}
        ${className}
      `}
      style={style}
    />
  );
}

export function Skeleton({
  lines,
  ...props
}: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase
            key={i}
            {...props}
            width={i === lines - 1 ? '75%' : props.width}
          />
        ))}
      </div>
    );
  }

  return <SkeletonBase {...props} />;
}

export function SkeletonRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 ${className}`}>
      <SkeletonBase variant="circular" width={32} height={32} />
      <div className="flex-1 space-y-1.5">
        <SkeletonBase width="40%" height={14} />
        <SkeletonBase width="60%" height={12} />
      </div>
      <div className="text-right space-y-1.5">
        <SkeletonBase width={60} height={14} />
        <SkeletonBase width={48} height={12} />
      </div>
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-bg-elevated-4 border border-border rounded-lg p-4 space-y-3 ${className}`}
    >
      <SkeletonBase width="50%" height={16} />
      <Skeleton lines={3} />
    </div>
  );
}
