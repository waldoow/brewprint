// React Native UI Lib Theme Configuration
// Based on Professional Design System

import {Colors, Typography, Spacings, ThemeManager} from 'react-native-ui-lib';
import {LightTheme, DarkTheme, getTheme} from './ProfessionalDesign';

// Load Colors for both light and dark modes
export const loadRNUITheme = () => {
  // Load base colors from professional design system
  Colors.loadColors({
    // Primary colors (grayscale)
    white: '#FFFFFF',
    black: '#000000',
    
    // Gray scale (using primary palette)
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',
    
    // Accent colors (blue)
    blue50: '#EFF6FF',
    blue100: '#DBEAFE',
    blue200: '#BFDBFE',
    blue300: '#93C5FD',
    blue400: '#60A5FA',
    blue500: '#3B82F6',
    blue600: '#2563EB',
    blue700: '#1D4ED8',
    blue800: '#1E40AF',
    blue900: '#1E3A8A',
    
    // Semantic colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Primary brand colors
    primaryColor: '#475569', // gray600
    primaryLight: '#64748B', // gray500
    primaryDark: '#334155',  // gray700
    
    // Accent brand colors
    accentColor: '#3B82F6', // blue500
    accentLight: '#60A5FA', // blue400
    accentDark: '#2563EB',  // blue600
  });

  // Load color schemes for light/dark mode support
  Colors.loadSchemes({
    light: {
      // Background colors
      screenBG: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      backgroundSecondary: '#F8FAFC',
      backgroundTertiary: '#F1F5F9',
      
      // Surface colors
      surface: '#FFFFFF',
      surfaceSecondary: '#F8FAFC',
      surfaceElevated: '#FFFFFF',
      
      // Text colors
      textColor: '#0F172A',          // gray900
      textSecondary: '#475569',      // gray600
      textTertiary: '#64748B',       // gray500
      textInverse: '#FFFFFF',
      textAccent: '#2563EB',         // blue600
      
      // Border colors
      borderColor: '#E2E8F0',        // gray200
      borderLight: '#F1F5F9',        // gray100
      borderAccent: '#93C5FD',       // blue300
      
      // Interactive colors
      primary: '#475569',            // gray600
      primaryLight: '#64748B',       // gray500
      primaryDark: '#334155',        // gray700
      accent: '#3B82F6',            // blue500
      accentLight: '#60A5FA',       // blue400
      accentDark: '#2563EB',        // blue600
      
      // Design tokens
      $backgroundDefault: '#FFFFFF',
      $backgroundNeutral: '#F8FAFC',
      $backgroundSuccess: '#10B981',
      $backgroundWarning: '#F59E0B',
      $backgroundDanger: '#EF4444',
      $textDefault: '#0F172A',
      $textNeutral: '#64748B',
      $textSuccess: '#10B981',
      $textWarning: '#F59E0B',
      $textDanger: '#EF4444',
      $iconDefault: '#64748B',
      $iconSuccess: '#10B981',
      $iconWarning: '#F59E0B',
      $iconDanger: '#EF4444',
    },
    dark: {
      // Background colors
      screenBG: '#0F172A',
      backgroundColor: '#0F172A',
      backgroundSecondary: '#1E293B',
      backgroundTertiary: '#334155',
      
      // Surface colors
      surface: '#1E293B',
      surfaceSecondary: '#334155',
      surfaceElevated: '#334155',
      
      // Text colors
      textColor: '#FFFFFF',
      textSecondary: '#CBD5E1',       // gray300
      textTertiary: '#94A3B8',        // gray400
      textInverse: '#0F172A',
      textAccent: '#93C5FD',          // blue300
      
      // Border colors
      borderColor: '#475569',         // gray600
      borderLight: '#334155',         // gray700
      borderAccent: '#3B82F6',        // blue500
      
      // Interactive colors
      primary: '#94A3B8',             // gray400
      primaryLight: '#CBD5E1',        // gray300
      primaryDark: '#64748B',         // gray500
      accent: '#60A5FA',             // blue400
      accentLight: '#93C5FD',        // blue300
      accentDark: '#3B82F6',         // blue500
      
      // Design tokens
      $backgroundDefault: '#0F172A',
      $backgroundNeutral: '#1E293B',
      $backgroundSuccess: '#10B981',
      $backgroundWarning: '#F59E0B',
      $backgroundDanger: '#EF4444',
      $textDefault: '#FFFFFF',
      $textNeutral: '#94A3B8',
      $textSuccess: '#10B981',
      $textWarning: '#F59E0B',
      $textDanger: '#EF4444',
      $iconDefault: '#94A3B8',
      $iconSuccess: '#10B981',
      $iconWarning: '#F59E0B',
      $iconDanger: '#EF4444',
    }
  });

  // Load typography based on professional design system
  Typography.loadTypographies({
    // Display typography
    display: {
      fontSize: 48, 
      fontWeight: '700',
      lineHeight: 48 * 1.25, // tight line height
      letterSpacing: -0.025 * 48, // tight letter spacing
    },
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 36 * 1.25, // tight
      letterSpacing: -0.025 * 36,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 30 * 1.25,
      letterSpacing: -0.025 * 30,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 24 * 1.375, // snug
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 20 * 1.375,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 18 * 1.375,
    },
    h6: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 16 * 1.375,
    },
    
    // Body typography
    body: {
      fontSize: 15, // base size from professional design
      fontWeight: '400',
      lineHeight: 15 * 1.5, // normal line height
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 16 * 1.5,
    },
    bodyMedium: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 15 * 1.5,
    },
    bodySmall: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 13 * 1.5,
    },
    
    // Label typography
    label: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 13 * 1.375,
      letterSpacing: 0.025 * 13, // wide letter spacing for labels
    },
    labelLarge: {
      fontSize: 15,
      fontWeight: '500',
      lineHeight: 15 * 1.375,
      letterSpacing: 0.025 * 15,
    },
    labelMedium: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 13 * 1.375,
      letterSpacing: 0.025 * 13,
    },
    labelSmall: {
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 11 * 1.375,
      letterSpacing: 0.025 * 11,
    },
    
    // Caption typography
    caption: {
      fontSize: 11,
      fontWeight: '400',
      lineHeight: 11 * 1.75, // loose line height
    },
    
    // Legacy support for existing text styles
    text10: { fontSize: 11, fontWeight: '400' },
    text20: { fontSize: 13, fontWeight: '400' },
    text30: { fontSize: 15, fontWeight: '400' },
    text40: { fontSize: 16, fontWeight: '400' },
    text50: { fontSize: 18, fontWeight: '400' },
    text60: { fontSize: 20, fontWeight: '600' },
    text70: { fontSize: 24, fontWeight: '600' },
    text80: { fontSize: 30, fontWeight: '700' },
    text90: { fontSize: 36, fontWeight: '700' },
    text100: { fontSize: 48, fontWeight: '700' },
  });

  // Load spacing based on professional design system
  Spacings.loadSpacings({
    // Base spacing values from professional design
    xs: 4,       // SPACING.xs
    sm: 8,       // SPACING.sm
    md: 16,      // SPACING.md (standard)
    lg: 24,      // SPACING.lg
    xl: 32,      // SPACING.xl
    xxl: 40,     // SPACING['2xl']
    xxxl: 48,    // SPACING['3xl']
    
    // Semantic spacing names
    page: 16,    // Standard page padding
    section: 24, // Section spacing
    card: 16,    // Card padding
    button: 12,  // Button padding
    input: 12,   // Input field padding
    
    // Legacy spacing support for migration
    s1: 4,
    s2: 8,
    s3: 12,
    s4: 16,
    s5: 20,
    s6: 24,
    s7: 28,
    s8: 32,
    s9: 36,
    s10: 40,
  });
};

// Configure component themes to match professional design
export const configureRNUIComponents = () => {
  // Configure View component defaults
  ThemeManager.setComponentTheme('View', {
    backgroundColor: Colors.backgroundColor,
  });

  // Configure Text component defaults
  ThemeManager.setComponentTheme('Text', {
    color: Colors.textColor,
    body: true, // Default to body typography
  });

  // Configure Card component defaults
  ThemeManager.setComponentTheme('Card', {
    backgroundColor: Colors.surface,
    borderRadius: 8, // lg radius from professional design
    padding: 16, // md spacing
    marginBottom: 16, // md spacing
    enableShadow: true,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  });

  // Configure Button component defaults
  ThemeManager.setComponentTheme('Button', (props) => {
    const baseStyle = {
      borderRadius: 6, // md radius
      paddingVertical: 12, // input spacing
      paddingHorizontal: 16, // md spacing
      minimumHeight: 44, // accessibility min touch target
    };

    // Primary button style
    if (!props.outline && !props.link) {
      return {
        ...baseStyle,
        backgroundColor: Colors.primary,
        labelStyle: { color: Colors.white, fontWeight: '500' },
      };
    }

    // Outline button style
    if (props.outline) {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderColor: Colors.borderColor,
        borderWidth: 1,
        labelStyle: { color: Colors.textColor, fontWeight: '500' },
      };
    }

    // Link button style
    if (props.link) {
      return {
        backgroundColor: 'transparent',
        paddingVertical: 8,
        paddingHorizontal: 0,
        labelStyle: { color: Colors.accent, fontWeight: '500' },
      };
    }

    return baseStyle;
  });

  // Configure TextField component defaults
  ThemeManager.setComponentTheme('TextField', {
    color: Colors.textColor,
    placeholderTextColor: Colors.textTertiary,
    containerStyle: {
      backgroundColor: Colors.surface,
      borderColor: Colors.borderColor,
      borderWidth: 1,
      borderRadius: 6, // md radius
      paddingHorizontal: 12, // input spacing
      paddingVertical: 12, // input spacing
      minHeight: 44, // accessibility min touch target
    },
    fieldStyle: {
      fontSize: 15, // body fontSize
      fontWeight: '400',
      lineHeight: 15 * 1.5,
    },
    floatingPlaceholder: true,
    floatingPlaceholderColor: {
      focus: Colors.accent,
      default: Colors.textTertiary,
    },
    enableErrors: true,
    errorColor: Colors.error,
    validateOnBlur: true,
  });

  // Configure Image component defaults
  ThemeManager.setComponentTheme('Image', {
    overlayType: 'none',
  });

  // Configure Badge component defaults  
  ThemeManager.setComponentTheme('Badge', {
    backgroundColor: Colors.primary,
    borderRadius: 12, // xl radius for pill shape
    size: 'default',
    labelStyle: { 
      color: Colors.white,
      fontSize: 11, // caption size
      fontWeight: '500',
    },
  });

  // Configure Chip component defaults
  ThemeManager.setComponentTheme('Chip', {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16, // 2xl radius for pill
    paddingVertical: 6,
    paddingHorizontal: 12,
    labelStyle: {
      color: Colors.textColor,
      fontSize: 13, // label size
      fontWeight: '500',
    },
  });

  // Configure Switch component defaults
  ThemeManager.setComponentTheme('Switch', {
    onColor: Colors.accent,
    offColor: Colors.borderColor,
    thumbColor: Colors.white,
  });

  // Configure Slider component defaults
  ThemeManager.setComponentTheme('Slider', {
    trackStyle: {
      backgroundColor: Colors.borderColor,
      height: 4,
      borderRadius: 2,
    },
    thumbStyle: {
      backgroundColor: Colors.accent,
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    minimumTrackTintColor: Colors.accent,
    maximumTrackTintColor: Colors.borderColor,
  });
};

// Initialize RNUI theme
export const initializeRNUITheme = () => {
  // Load all theme configurations
  loadRNUITheme();
  configureRNUIComponents();
};

// Export theme utilities
export const getRNUITheme = (colorScheme: 'light' | 'dark') => {
  return getTheme(colorScheme);
};

export default {
  loadRNUITheme,
  configureRNUIComponents,
  initializeRNUITheme,
  getRNUITheme,
};