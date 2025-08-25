import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AccessibleTouchableProps extends TouchableOpacityProps {
  children: React.ReactNode;
  hapticFeedback?: boolean;
  accessibilityLabel: string; // Required for accessibility
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'text' | 'image' | 'menu' | 'menuitem';
  minimumTouchTarget?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function AccessibleTouchable({
  children,
  hapticFeedback = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  minimumTouchTarget = true,
  onPress,
  style,
  ...props
}: AccessibleTouchableProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const handlePress = async () => {
    // Provide haptic feedback for better UX
    if (hapticFeedback) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptic feedback not available on all devices
        console.log('Haptic feedback not available');
      }
    }

    // Announce the action for screen readers
    if (accessibilityHint) {
      AccessibilityInfo.announceForAccessibility(accessibilityHint);
    }

    // Execute the onPress callback
    if (onPress) {
      onPress();
    }
  };

  const getAccessibleStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {};

    // Ensure minimum touch target size for accessibility
    if (minimumTouchTarget) {
      baseStyle.minWidth = theme.accessibility.minTouchTarget;
      baseStyle.minHeight = theme.accessibility.minTouchTarget;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      style={[getAccessibleStyle(), style]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

// Helper hook for managing accessibility features
export function useAccessibility() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = React.useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = React.useState(false);

  React.useEffect(() => {
    // Check if screen reader is enabled
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
    
    // Listen for screen reader state changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  const announceMessage = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  const getAccessibleFontSize = (baseSize: number, scale: keyof typeof theme.accessibility.textScaling = 'normal') => {
    return baseSize * theme.accessibility.textScaling[scale];
  };

  const getMotionDuration = (baseDuration: number) => {
    return isReduceMotionEnabled ? baseDuration * 0.1 : baseDuration;
  };

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    announceMessage,
    getAccessibleFontSize,
    getMotionDuration,
    theme,
  };
}

// Accessibility-focused text color function
export function getAccessibleTextColor(background: string, theme: any) {
  // This is a simplified contrast checker
  // In a production app, you'd want to use a more robust contrast calculation
  const isDark = colorScheme === 'dark' || background.includes('rgba(0') || background.includes('#000');
  
  return isDark ? theme.colors.white : theme.colors.neutral[900];
}