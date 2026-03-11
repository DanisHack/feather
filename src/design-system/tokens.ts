// Fey Design System — TypeScript Design Tokens
// Extracted from fey.com

// ─── Colors ──────────────────────────────────────────────

export const colors = {
  bg: {
    primary: '#0B0B0F',
    secondary: '#131419',
    tertiary: '#1A1B1F',
    chip: '#26272F',
    warm: '#473832',
    inverse: '#E6E6E6',
    overlay: 'rgba(0, 0, 0, 0.6)',
    elevated: {
      1: 'rgba(255, 255, 255, 0.04)',
      2: 'rgba(255, 255, 255, 0.05)',
      3: 'rgba(255, 255, 255, 0.06)',
      4: 'rgba(255, 255, 255, 0.08)',
    },
  },

  text: {
    primary: '#FFFFFF',
    emphasis: '#E6E6E6',
    secondary: '#888888',
    tertiary: '#555555',
    link: '#479FFA',
    inverse: '#000000',
    placeholder: 'rgba(255, 255, 255, 0.24)',
    faded: '#333333',
  },

  accent: {
    blue: '#479FFA',
    orange: '#FFA16C',
    amber: '#D88036',
    indigo: '#6366F1',
    indigoHover: '#818CF8',
    indigoMuted: 'rgba(99, 102, 241, 0.15)',
    selection: 'rgb(97 102 220 / 0.32)',
  },

  status: {
    positive: '#4EBE96',
    positiveDark: '#44B48C',
    positiveTeal: '#3EC6D9',
    negative: '#D84F68',
    negativeDark: '#9F2A4D',
    warning: '#FACC15',
    danger: '#E50914',
    error: '#E3000D',
    badgeRed: '#FF5C5C',
  },

  border: {
    hairline: 'rgba(255, 255, 255, 0.04)',
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(255, 255, 255, 0.2)',
    dashed: 'rgba(255, 255, 255, 0.16)',
    ring: '#131419',
  },

  ai: {
    pink: '#e75ece',
    blue: '#3487f1',
    coral: '#fc6345',
  },
} as const;

// ─── Gradients ───────────────────────────────────────────

export const gradients = {
  default: {
    stops: ['#B3AEF5', '#D7CBE7', '#E5C8C8', '#ECBDAA'] as const,
    css: 'linear-gradient(90deg, #B3AEF5 0%, #D7CBE7 33%, #E5C8C8 66%, #ECBDAA 100%)',
  },
  positive: {
    stops: ['#4EBE96', '#44B48C', '#3DC1B9', '#3EC6D9'] as const,
    css: 'linear-gradient(90deg, #4EBE96 0%, #44B48C 33%, #3DC1B9 66%, #3EC6D9 100%)',
  },
  negative: {
    stops: ['#D84F68', '#9F2A4D'] as const,
    css: 'linear-gradient(90deg, #D84F68 0%, #9F2A4D 100%)',
  },
  idea: {
    stops: ['#1964BB', '#55BBF7'] as const,
    css: 'linear-gradient(90deg, #1964BB 0%, #55BBF7 100%)',
  },
  premium: {
    stops: ['#B3AEF5', '#D7CBE7', '#E5C8C8', '#EAA879'] as const,
    css: 'linear-gradient(90deg, #B3AEF5 0.41%, #D7CBE7 40.68%, #E5C8C8 64.12%, #EAA879 97.82%)',
  },
  border: {
    css: 'linear-gradient(178.8deg, rgba(255,255,255,0.2464) 10.85%, rgba(20,20,20,0.46) 24.36%, rgba(50,50,50,0.46) 73.67%, rgba(255,255,255,0.46) 90.68%)',
  },
  orangeText: {
    css: 'linear-gradient(97.13deg, #FFA16C 8.47%, #551B10 108.41%)',
  },
  blueText: {
    css: 'linear-gradient(96.44deg, #B6D6FF 6.12%, #393F56 110.28%)',
  },
  limeText: {
    css: 'linear-gradient(96.44deg, #D6FE51 6.12%, #58510B 110.28%)',
  },
} as const;

// ─── Typography ──────────────────────────────────────────

export const fontFamily = {
  sans: "'calibre', 'calibre Fallback', Arial, sans-serif",
  serif: "'financier', 'financier Fallback', Arial, serif",
  mono: 'monospace',
} as const;

export const fontWeight = {
  light: 200,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const fontSize = {
  nano: 8,
  micro: 10,
  caption: 12,
  label: 14,
  bodySm: 16,
  body: 18,
  bodyLg: 20,
  titleSm: 21,
  title: 22,
  titleLg: 24,
  headingSm: 32,
  heading: 36,
  headingLg: 38,
  headingXl: 42,
  displaySm: 48,
  display: 54,
  hero: 96,
  heroLg: 134,
  heroXl: 137,
} as const;

export const lineHeight = {
  tight: '100%',
  snug: '110%',
  normal: '125%',
  relaxed: '130%',
  body: '132%',
  loose: '140%',
  global: 1.4,
} as const;

// ─── Spacing ─────────────────────────────────────────────

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  4.5: 18,
  5: 20,
  5.25: 21,
  6: 24,
  6.5: 26,
  7: 28,
  7.5: 30,
  8: 32,
  8.5: 34,
  9: 36,
  9.5: 38,
  10: 40,
  10.5: 42,
  12: 48,
  12.5: 50,
  16: 64,
  20: 80,
} as const;

// ─── Border Radius ───────────────────────────────────────

export const borderRadius = {
  none: 0,
  xs: 3,
  sm: 4,
  default: 5,
  md: 7,
  lg: 12,
  xl: 16,
  '2xl': 32,
  pill: 50,
  fullSm: 99,
  full: 999,
  circle: '50%',
} as const;

// ─── Shadows ─────────────────────────────────────────────

export const boxShadow = {
  ctaGlow: '0px 0px 14px rgba(255, 255, 255, 0.25)',
  card: '0px 20px 30px rgba(0, 0, 0, 0.1)',
  commandBar: '0px 0px 44px rgba(0, 0, 0, 0.8)',
  keyBadge: '0px 1px 0px rgba(0, 0, 0, 0.85)',
  focusRing: '0 0 0 2px #131419, 0 0 0 3px #479FFA',
  pricingActive: '0px 5px 25px rgba(255, 255, 255, 0.15)',
  pricingOutline: '0px 5px 25px rgba(255, 255, 255, 0.1)',
  backButton: '0px 4px 35px rgba(0, 0, 0, 0.35)',
  notification: '2px 7px 14px rgba(0, 0, 0, 0.65)',
  darkToggle:
    'inset 0px -2px 4px rgba(255,255,255,0.5), inset 0px 0px 2px #ffffff, inset 0px 2px 2px rgba(255,255,255,0.25), inset 0px 0.5px 1px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
  dock: 'inset 1.25px 1.25px 1.25px rgba(255,255,255,0.32), inset 1.25px -1.25px 1.25px rgba(255,255,255,0.05), 9.22562px 43.5671px 43.3172px 0px rgba(0,0,0,0.753)',
  appFrame: '0px 0px 35px rgba(0, 0, 0, 0.5)',
  heroDeep: '0px 100px 50px rgba(0, 0, 0, 0.668)',
} as const;

// ─── Backdrop Blur ───────────────────────────────────────

export const backdropBlur = {
  xs: '0.75px',
  sm: '2px',
  md: '5px',
  default: '10px',
  lg: '20px',
  xl: '75px',
  '2xl': '250px',
} as const;

// ─── Breakpoints ─────────────────────────────────────────

export const breakpoints = {
  '2xs': 540,
  xs: 735,
  sm: 768,
  md: 960,
  lg: 1024,
  xl: 1280,
} as const;

export const containerMaxWidth = {
  desktop: 1220,
  tablet: 1130,
  mobile: 578,
  content: 1140,
} as const;

export const containerPadding = {
  desktop: 40,
  mobile: 20,
} as const;

// ─── Transitions ─────────────────────────────────────────

export const transitionDuration = {
  micro: '0.1s',
  fast: '0.15s',
  normal: '0.25s',
  slow: '0.3s',
  deliberate: '0.4s',
  dramatic: '0.5s',
  cinematic: '1s',
} as const;

export const easingFunction = {
  default: 'ease',
  easeInOut: 'ease-in-out',
  entrance: 'cubic-bezier(0.25, 0.4, 0.4, 1)',
  slideUp: 'cubic-bezier(0.22, 1, 0.36, 1)',
  material: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.4, 0.64, 1)',
  bounce: 'cubic-bezier(0.9, 0.3, 0.5, 1.2)',
  feyIn: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  feyOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  feyInOut: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
} as const;

// ─── Opacity ─────────────────────────────────────────────

export const opacity = {
  hidden: 0,
  grain: 0.05,
  overlay: 0.1,
  faded: 0.15,
  muted: 0.5,
  navLink: 0.75,
  visible: 1,
} as const;

// ─── SVG Gradient Definitions ────────────────────────────

export const svgGradients = {
  graphDefault: {
    id: 'graphDefault',
    stops: [
      { offset: '0%', color: '#B3AEF5' },
      { offset: '33%', color: '#D7CBE7' },
      { offset: '66%', color: '#E5C8C8' },
      { offset: '100%', color: '#ECBDAA' },
    ],
  },
  sparkPositive: {
    id: 'sparkPositive',
    stops: [
      { offset: '0%', color: '#4EBE96' },
      { offset: '33%', color: '#44B48C' },
      { offset: '66%', color: '#3DC1B9' },
      { offset: '100%', color: '#3EC6D9' },
    ],
  },
  sparkNegative: {
    id: 'sparkNegative',
    stops: [
      { offset: '0%', color: '#D84F68' },
      { offset: '100%', color: '#9F2A4D' },
    ],
  },
  sparkIdea: {
    id: 'sparkIdea',
    stops: [
      { offset: '0%', color: '#1964BB' },
      { offset: '100%', color: '#55BBF7' },
    ],
  },
} as const;

// ─── Noise Filter ────────────────────────────────────────

export const noiseFilter = {
  type: 'fractalNoise' as const,
  baseFrequency: 6.29,
  numOctaves: 2,
  stitchTiles: 'stitch' as const,
  saturateValues: '0',
};
