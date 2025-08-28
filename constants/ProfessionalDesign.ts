// Clean Minimalist Design System
// 2-3 Primary Colors, High Contrast, Intuitive Navigation

export const SPACING = {
  // Generous spacing for clean minimalist design with ample white space
  xs: 4,       // Micro spacing
  sm: 8,       // Small gaps  
  md: 16,      // Standard spacing (increased)
  lg: 24,      // Section spacing (increased)
  xl: 32,      // Large sections (increased)
  '2xl': 40,   // Major sections (increased)
  '3xl': 48,   // Component separation (increased) 
  '4xl': 64,   // Page sections (increased)
  '5xl': 80,   // Major page divisions (increased)
  '6xl': 96,   // Hero sections
  '7xl': 128,  // Maximum spacing
} as const;

export const TYPOGRAPHY = {
  // Clean minimalist typographic scale for clear hierarchy
  fontSize: {
    xs: 11,       // Small labels
    sm: 13,       // Captions, metadata
    base: 15,     // Body text (increased for readability)
    md: 16,       // Default text
    lg: 18,       // Large body text
    xl: 20,       // Small headings
    '2xl': 24,    // Medium headings
    '3xl': 30,    // Large headings
    '4xl': 36,    // Display text
    '5xl': 48,    // Hero text
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: 1.25,     // Headlines only
    snug: 1.375,     // Subheadings
    normal: 1.5,     // Body text (improved readability)
    relaxed: 1.625,  // Long form content
    loose: 1.75,     // Captions with spacing
  },
  
  letterSpacing: {
    tight: -0.025,   // Large headings only
    normal: 0,       // Most text
    wide: 0.025,     // Small caps, labels
  },
} as const;

export const COLORS = {
  // Pure minimalist foundation - Primary Color #1
  white: '#FFFFFF',
  black: '#000000',
  
  // Primary Color #2 - Deep charcoal for sophistication 
  primary: {
    50: '#F8FAFC',   // Almost white
    100: '#F1F5F9',  // Light gray
    200: '#E2E8F0',  // Border gray
    300: '#CBD5E1',  // Muted gray
    400: '#94A3B8',  // Medium gray
    500: '#64748B',  // Text gray
    600: '#475569',  // Dark gray
    700: '#334155',  // Darker gray
    800: '#1E293B',  // Very dark gray
    900: '#0F172A',  // Near black
  },
  
  // Primary Color #3 - Single accent for visual interest
  accent: {
    50: '#EFF6FF',   // Very light blue
    100: '#DBEAFE',  // Light blue
    200: '#BFDBFE',  // Medium light blue
    300: '#93C5FD',  // Medium blue
    400: '#60A5FA',  // Bright blue
    500: '#3B82F6',  // Primary blue - main accent
    600: '#2563EB',  // Darker blue
    700: '#1D4ED8',  // Deep blue
    800: '#1E40AF',  // Very deep blue
    900: '#1E3A8A',  // Darkest blue
  },
  
  // Minimal semantic colors - high contrast only
  success: '#10B981',    // Green for positive actions
  warning: '#F59E0B',    // Amber for caution  
  error: '#EF4444',      // Red for errors
  info: '#3B82F6',       // Blue for information (same as accent.500)
  
  // Simplified gray system (alias to primary for consistency)
  gray: {
    50: '#F8FAFC',   // Same as primary.50
    100: '#F1F5F9',  // Same as primary.100
    200: '#E2E8F0',  // Same as primary.200
    300: '#CBD5E1',  // Same as primary.300
    400: '#94A3B8',  // Same as primary.400
    500: '#64748B',  // Same as primary.500
    600: '#475569',  // Same as primary.600
    700: '#334155',  // Same as primary.700
    800: '#1E293B',  // Same as primary.800
    900: '#0F172A',  // Same as primary.900
  },
} as const;

// Minimal shadow system - subtle depth only
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
} as const;

// Modern border radius system
export const RADIUS = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

// Gradient system for modern appeal
export const GRADIENTS = {
  // Clean minimalist gradients using our 2-3 color system
  primary: {
    colors: ['#64748B', '#334155'], // Primary gray gradient
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  accent: {
    colors: ['#3B82F6', '#2563EB'], // Blue accent gradient
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  neutral: {
    colors: ['#F8FAFC', '#E2E8F0'], // Light neutral gradient
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  subtle: {
    colors: ['#FFFFFF', '#F1F5F9'], // Very subtle white-to-light gradient
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

// Animation and transition values
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
} as const;

// Modern Light Theme - Coffee-inspired elegance
// Accessibility helpers
export const ACCESSIBILITY = {
  minTouchTarget: 44, // Minimum 44x44 touch target
  textScaling: {
    small: 0.85,
    normal: 1.0,
    large: 1.15,
    extraLarge: 1.3,
  },
  contrastRatios: {
    aa: 4.5, // WCAG AA standard
    aaa: 7.0, // WCAG AAA standard
  },
  motion: {
    reduceMotion: false, // Can be toggled based on system preferences
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
  },
} as const;

export const LightTheme = {
  colors: {
    ...COLORS,
    // Clean minimalist backgrounds with ample white space
    background: COLORS.white, // Pure white background for clean look
    backgroundSecondary: COLORS.primary[50], // Subtle gray tint
    backgroundTertiary: COLORS.primary[100], // Light gray for sections
    
    // Surface colors with clear hierarchy
    surface: COLORS.white,
    surfaceSecondary: COLORS.primary[50],
    surfaceElevated: COLORS.white,
    surfaceGlass: 'rgba(255, 255, 255, 0.85)', // Clean glassmorphism
    
    // Minimal border system - high contrast
    border: COLORS.primary[200],
    borderLight: COLORS.primary[100],
    borderAccent: COLORS.accent[300], // Blue accent borders
    
    // Primary brand colors (charcoal gray)
    primary: COLORS.primary[600],
    primaryLight: COLORS.primary[500],
    primaryDark: COLORS.primary[700],
    
    // Accent colors (clean blue)
    accent: COLORS.accent[500],
    accentLight: COLORS.accent[400],
    accentDark: COLORS.accent[600],
    
    // High contrast text hierarchy for accessibility
    text: {
      primary: COLORS.primary[900], // Near black for maximum contrast
      secondary: COLORS.primary[600], // Medium gray
      tertiary: COLORS.primary[500], // Light gray
      inverse: COLORS.white,
      accent: COLORS.accent[600], // Blue accent text
    },
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  radius: RADIUS,
  gradients: GRADIENTS,
  animation: ANIMATION,
  accessibility: ACCESSIBILITY,
} as const;

// Modern Dark Theme - Clean minimalist sophistication
export const DarkTheme = {
  colors: {
    ...COLORS,
    // Clean dark minimalist backgrounds 
    background: COLORS.primary[900], // Rich dark background
    backgroundSecondary: COLORS.primary[800], // Secondary surface
    backgroundTertiary: COLORS.primary[700], // Lighter dark sections
    
    // Surface colors with subtle depth
    surface: COLORS.primary[800],
    surfaceSecondary: COLORS.primary[700],
    surfaceElevated: COLORS.primary[700],
    surfaceGlass: 'rgba(30, 41, 59, 0.85)', // Clean dark glassmorphism
    
    // High contrast border system for dark theme
    border: COLORS.primary[600],
    borderLight: COLORS.primary[700],
    borderAccent: COLORS.accent[500], // Blue accent borders
    
    // Primary colors adjusted for dark with high contrast
    primary: COLORS.primary[400], // Lighter gray for contrast
    primaryLight: COLORS.primary[300],
    primaryDark: COLORS.primary[500],
    
    // Accent colors for dark theme
    accent: COLORS.accent[400], // Lighter blue for dark backgrounds
    accentLight: COLORS.accent[300],
    accentDark: COLORS.accent[500],
    
    // High contrast text hierarchy for dark theme accessibility
    text: {
      primary: COLORS.white, // Pure white for maximum contrast
      secondary: COLORS.primary[300], // Light gray
      tertiary: COLORS.primary[400], // Medium gray
      inverse: COLORS.primary[900],
      accent: COLORS.accent[300], // Light blue accent
    },
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  shadows: {
    ...SHADOWS,
    // Enhanced shadows for dark theme
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 6,
    },
  },
  radius: RADIUS,
  gradients: GRADIENTS,
  animation: ANIMATION,
} as const;

export type Theme = typeof LightTheme;

export const getTheme = (colorScheme: 'light' | 'dark'): Theme => {
  return colorScheme === 'dark' ? DarkTheme : LightTheme;
};