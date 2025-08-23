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

// Theme configurations
export const LightTheme = {
  colors: {
    ...COLORS,
    background: COLORS.white,
    surface: COLORS.gray[50],
    surfaceSecondary: COLORS.white,
    border: COLORS.gray[200],
    borderSubtle: COLORS.gray[100],
    text: {
      primary: COLORS.gray[900],
      secondary: COLORS.gray[600],
      tertiary: COLORS.gray[500],
      inverse: COLORS.white,
    },
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  radius: RADIUS,
} as const;

export const DarkTheme = {
  colors: {
    ...COLORS,
    background: COLORS.gray[900],
    surface: COLORS.gray[800],
    surfaceSecondary: COLORS.gray[700],
    border: COLORS.gray[700],
    borderSubtle: COLORS.gray[800],
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