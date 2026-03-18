import { colors } from '../design-system/tokens';

interface FeatherLogoProps {
  size?: number;
  showText?: boolean;
  textSize?: number;
}

export function FeatherLogo({ size = 24, showText = true, textSize = 15 }: FeatherLogoProps) {
  return (
    <div className="flex items-center" style={{ gap: size * 0.35 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6366F1"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
        <line x1="16" y1="8" x2="2" y2="22" />
        <line x1="17.5" y1="15" x2="9" y2="15" />
      </svg>
      {showText && (
        <span
          style={{
            fontSize: textSize,
            fontWeight: 600,
            color: colors.text.emphasis,
            letterSpacing: '0.12em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
          }}
        >
          FEATHER
        </span>
      )}
    </div>
  );
}
