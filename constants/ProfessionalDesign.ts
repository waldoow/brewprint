// Professional Design System for Coffee Specialists
// Minimal, Clean, Data-Focused Design

export const SPACING = {
  // Base 4px scale with improved rhythm
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const TYPOGRAPHY = {
  // Refined professional type scale
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const COLORS = {
  // Neutral foundation
  white: '#FFFFFF',
  black: '#000000',
  
  // Grayscale - optimized for readability
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic colors
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  info: '#2563EB',
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const RADIUS = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
} as const;

// Runna-inspired subtle design system  
export const LightTheme = {
  colors: {
    ...COLORS,
    background: '#F5F5F5', // Runna's light gray background
    surface: COLORS.white, // Clean white cards with subtle border
    surfaceElevated: COLORS.white, // White cards with shadow
    border: '#E1E5E9', // Subtle card borders for contrast
    borderSubtle: '#F0F0F0', // Ultra-subtle borders
    text: {
      primary: '#1A1A1A', // Slightly softer than pure black
      secondary: COLORS.gray[600], 
      tertiary: COLORS.gray[500],
      inverse: COLORS.white,
    },
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: {
    // Runna-style subtle shadows
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
  },
  radius: RADIUS,
} as const;

export const DarkTheme = {
  colors: {
    ...COLORS,
    background: COLORS.gray[900], // Dark app background
    backgroundSecondary: COLORS.gray[800], // Subtle secondary background
    surface: COLORS.gray[800], // Cards on dark background
    surfaceSecondary: COLORS.gray[750] || '#1F2832', // Subtle card variant
    surfaceElevated: COLORS.gray[700], // Elevated cards
    border: COLORS.gray[700],
    borderSubtle: COLORS.gray[750] || '#2D3748', // Very subtle borders
    text: {
      primary: COLORS.white,
      secondary: COLORS.gray[300],
      tertiary: COLORS.gray[400],
      inverse: COLORS.gray[900],
    },
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  radius: RADIUS,
} as const;

export type Theme = typeof LightTheme;

export const getTheme = (colorScheme: 'light' | 'dark'): Theme => {
  return colorScheme === 'dark' ? DarkTheme : LightTheme;
};