import React from 'react';
import { TouchableOpacity, ViewStyle, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DataText } from './DataText';
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DataButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function DataButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: DataButtonProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: theme.spacing[2],
          paddingHorizontal: theme.spacing[3],
          minHeight: 36,
          textVariant: 'small' as const,
        };
      case 'lg':
        return {
          paddingVertical: theme.spacing[4],
          paddingHorizontal: theme.spacing[6],
          minHeight: 52,
          textVariant: 'body' as const,
        };
      default: // md
        return {
          paddingVertical: theme.spacing[3],
          paddingHorizontal: theme.spacing[4],
          minHeight: 44,
          textVariant: 'body' as const,
        };
    }
  };

  const getVariantStyle = (): ViewStyle => {
    const sizeConfig = getSizeConfig();
    
    const baseStyle: ViewStyle = {
      borderRadius: theme.layout.card.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: sizeConfig.minHeight,
      paddingVertical: sizeConfig.paddingVertical,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      ...(fullWidth && { width: '100%' }),
      opacity: disabled || loading ? 0.6 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.interactive.default,
          ...theme.shadows.card,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      default: // ghost
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'inverse' as const;
      default:
        return 'primary' as const;
    }
  };

  const sizeConfig = getSizeConfig();
  const buttonStyle = getVariantStyle();

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      <DataText
        variant={sizeConfig.textVariant}
        color={getTextColor()}
        weight="medium"
        style={{ textAlign: 'center' }}
      >
        {loading ? 'Loading...' : title}
      </DataText>
    </TouchableOpacity>
  );
}