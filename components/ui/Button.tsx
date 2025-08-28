import React from 'react';
import { TouchableOpacity, ViewStyle, ActivityIndicator, Pressable, Platform, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  gradient?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  hapticFeedback = true,
  gradient = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const handlePress = () => {
    if (hapticFeedback && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    const sizeMap = {
      sm: {
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[3],
        height: 32,
      },
      md: {
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[4],
        height: 40,
      },
      lg: {
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[5],
        height: 44,
      },
      xl: {
        paddingVertical: theme.spacing[4],
        paddingHorizontal: theme.spacing[6],
        height: 52,
      },
    };

    const baseStyle: ViewStyle = {
      borderRadius: theme.layout.card.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      overflow: 'hidden',
      ...sizeMap[size],
      ...(fullWidth && { width: '100%' }),
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.interactive.default,
          ...theme.shadows.card,
        };
      case 'accent':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.interactive.default,
          ...theme.shadows.card,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'destructive':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.error,
          ...theme.shadows.card,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'accent':
      case 'destructive':
        return 'inverse' as const;
      case 'secondary':
        return 'primary' as const;
      case 'ghost':
      default:
        return 'primary' as const;
    }
  };

  // Removed gradient colors - not part of data-first design

  const renderButtonContent = () => {
    const content = (
      <>
        {loading && (
          <ActivityIndicator
            size="small"
            color={getTextColor() === 'inverse' ? '#FFFFFF' : theme.colors.text.primary}
            style={{ marginRight: theme.spacing[2] }}
          />
        )}
        <Text
          variant={size === 'xl' ? 'lg' : 'md'}
          weight="semibold"
          color={getTextColor()}
          style={{ letterSpacing: 0.5 }}
        >
          {title}
        </Text>
      </>
    );

    return content;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        getButtonStyle(),
        {
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: pressed ? 0.9 : (disabled ? 0.5 : 1),
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      {renderButtonContent()}
    </Pressable>
  );
}