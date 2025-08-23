import React from 'react';
import { View, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ProfessionalCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  onPress?: () => void;
}

export function ProfessionalCard({
  children,
  variant = 'default',
  padding = 'md',
  style,
  onPress,
  ...props
}: ProfessionalCardProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const getCardStyle = (): ViewStyle => {
    const paddingMap = {
      sm: theme.spacing.sm,
      md: theme.spacing.lg,
      lg: theme.spacing.xl,
      xl: theme.spacing['2xl'],
    };

    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surfaceSecondary,
      borderRadius: theme.radius.lg,
      padding: paddingMap[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...theme.shadows.md,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.border,
          backgroundColor: 'transparent',
        };
      case 'default':
      default:
        return {
          ...baseStyle,
          ...theme.shadows.sm,
        };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.95}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
}