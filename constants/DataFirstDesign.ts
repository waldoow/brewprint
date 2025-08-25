// Data-First Minimalist Design System
// Inspired by Notion, Linear, and modern dashboard design principles

// Core Design Philosophy:
// 1. Data First - Information hierarchy drives all design decisions
// 2. Progressive Disclosure - Hide complexity, reveal when needed
// 3. Spatial Relationships - White space creates meaning
// 4. Minimal Color - 2 colors maximum + semantic states
// 5. Typography Hierarchy - Clear information architecture

export const COLORS = {
  // Pure Foundation - Only 2 colors as per research
  white: '#FFFFFF',
  black: '#17171A',  // Near black for better readability
  
  // Neutral Scale - Single gray system (like Notion)
  gray: {
    50: '#FAFAFA',   // Background tints
    100: '#F5F5F5',  // Card backgrounds
    200: '#E5E5E5',  // Borders
    300: '#D4D4D4',  // Disabled states
    400: '#A3A3A3',  // Placeholders
    500: '#737373',  // Secondary text
    600: '#525252',  // Primary text
    700: '#404040',  // Headings
    800: '#262626',  // High contrast
    900: '#171717',  // Maximum contrast
  },
  
  // Semantic Colors - Minimal and functional only
  success: '#22C55E',    // System feedback only
  warning: '#F59E0B',    // System feedback only
  error: '#EF4444',      // System feedback only
  
  // Data Visualization - Muted and professional
  data: {
    primary: '#525252',   // Gray-600 for main data
    secondary: '#A3A3A3', // Gray-400 for secondary data
    accent: '#737373',    // Gray-500 for highlights
  }
} as const;

// Typography - Data-first hierarchy (like Notion)
export const TYPOGRAPHY = {
  // Font sizes - Clear hierarchy for data
  fontSize: {
    // Data Display Sizes
    display: 48,      // Hero numbers/metrics
    h1: 32,          // Page titles
    h2: 24,          // Section headers
    h3: 18,          // Subsection headers
    h4: 16,          // Card titles
    
    // Content Sizes
    body: 15,        // Default reading text
    small: 13,       // Secondary information
    tiny: 11,        // Labels and metadata
  },
  
  // Font weights - Minimal variations
  fontWeight: {
    normal: '400',   // Body text
    medium: '500',   // Emphasis
    semibold: '600', // Headers
    bold: '700',     // Data highlights
  },
  
  // Line heights - Optimized for data readability
  lineHeight: {
    tight: 1.1,     // Numbers and metrics
    normal: 1.4,    // Body text
    relaxed: 1.6,   // Long form content
  },
} as const;

// Spacing System - Based on 8px grid (like Linear)
export const SPACING = {
  // Base unit: 8px
  1: 4,      // 0.5 unit - Fine adjustments
  2: 8,      // 1 unit - Minimum spacing
  3: 12,     // 1.5 units - Small gaps
  4: 16,     // 2 units - Standard spacing
  5: 20,     // 2.5 units - Medium gaps  
  6: 24,     // 3 units - Section spacing
  8: 32,     // 4 units - Large sections
  10: 40,    // 5 units - Major sections
  12: 48,    // 6 units - Page sections
  16: 64,    // 8 units - Hero sections
  20: 80,    // 10 units - Maximum spacing
} as const;

// Layout System - Card-based like modern dashboards
export const LAYOUT = {
  // Container widths
  container: {
    sm: 480,
    md: 768, 
    lg: 1024,
    xl: 1280,
  },
  
  // Card system
  card: {
    padding: {
      sm: SPACING[3],   // 12px
      md: SPACING[4],   // 16px
      lg: SPACING[6],   // 24px
    },
    radius: {
      sm: 6,
      md: 8,
      lg: 12,
    },
    gap: {
      sm: SPACING[2],   // 8px
      md: SPACING[4],   // 16px
      lg: SPACING[6],   // 24px
    },
  },
  
  // Grid system - 4-column mobile grid
  grid: {
    columns: {
      mobile: 4,
      tablet: 8,
      desktop: 12,
    },
    gutter: SPACING[4], // 16px
  },
} as const;

// Shadows - Minimal and functional
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  floating: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Light Theme - Clean and minimal
export const LightTheme = {
  colors: {
    // Backgrounds
    background: COLORS.white,
    surface: COLORS.gray[50],
    card: COLORS.white,
    
    // Borders
    border: COLORS.gray[200],
    borderLight: COLORS.gray[100],
    
    // Text Hierarchy
    text: {
      primary: COLORS.gray[700],    // Main content
      secondary: COLORS.gray[500],  // Supporting info
      tertiary: COLORS.gray[400],   // Labels
      inverse: COLORS.white,        // On dark backgrounds
    },
    
    // Data colors
    data: COLORS.data,
    
    // Interactive states
    interactive: {
      default: COLORS.gray[600],
      hover: COLORS.gray[700],
      active: COLORS.gray[800],
      disabled: COLORS.gray[300],
    },
    
    // System colors
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
  },
  typography: TYPOGRAPHY,
  spacing: SPACING,
  layout: LAYOUT,
  shadows: SHADOWS,
} as const;

// Dark Theme - High contrast for data
export const DarkTheme = {
  colors: {
    // Backgrounds
    background: COLORS.black,
    surface: COLORS.gray[900],
    card: COLORS.gray[800],
    
    // Borders  
    border: COLORS.gray[700],
    borderLight: COLORS.gray[800],
    
    // Text Hierarchy
    text: {
      primary: COLORS.gray[100],    // Main content
      secondary: COLORS.gray[400],  // Supporting info
      tertiary: COLORS.gray[500],   // Labels
      inverse: COLORS.black,        // On light backgrounds
    },
    
    // Data colors (adjusted for dark)
    data: {
      primary: COLORS.gray[200],
      secondary: COLORS.gray[500],
      accent: COLORS.gray[300],
    },
    
    // Interactive states
    interactive: {
      default: COLORS.gray[300],
      hover: COLORS.gray[200],
      active: COLORS.gray[100],
      disabled: COLORS.gray[600],
    },
    
    // System colors
    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
  },
  typography: TYPOGRAPHY,
  spacing: SPACING,
  layout: LAYOUT,
  shadows: {
    ...SHADOWS,
    card: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
  },
} as const;

export type Theme = typeof LightTheme;

export const getTheme = (colorScheme: 'light' | 'dark'): Theme => {
  return colorScheme === 'dark' ? DarkTheme : LightTheme;
};