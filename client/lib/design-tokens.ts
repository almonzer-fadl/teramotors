// Design Tokens for TeraMotors SaaS
// Apple-inspired design system with modern aesthetics

export const colors = {
  brand: {
    primary: '#F97402',    // Orange - main brand color
    secondary: '#063479',  // Navy - headers and accents
    accent: '#F13F33',     // Red-orange - CTAs and important actions
  },
  semantic: {
    success: '#10B981',    // Green - success states
    warning: '#F59E0B',    // Amber - warning states
    error: '#EF4444',      // Red - error states
    info: '#3B82F6',       // Blue - informational
  },
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceHover: '#F3F4F6',
    border: '#E5E7EB',
    borderHover: '#D1D5DB',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
    }
  },
  dark: {
    background: '#000000',
    surface: '#1F1F1F',
    surfaceHover: '#2D2D2D',
    border: '#2D2D2D',
    borderHover: '#3D3D3D',
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1AA',
      tertiary: '#71717A',
    }
  }
}

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
  glow: '0 0 40px rgba(249, 116, 2, 0.3)', // Brand color glow for hover effects
  card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)',
  cardHover: '0 10px 20px -5px rgb(0 0 0 / 0.15), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
}

export const spacing = {
  section: '96px',   // Between major sections on marketing pages
  card: '24px',      // Inside cards and containers
  input: '16px',     // Inside form fields
  button: '12px 24px', // Button padding
  page: '32px',      // Page margins
}

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
}

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Bounce effect for playful interactions
}

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    mono: 'var(--font-geist-mono, "SF Mono", Monaco, Consolas, monospace)',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
}

export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    base: 300,
    slow: 500,
    slower: 700,
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  }
}

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Z-index scale for layering
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}
