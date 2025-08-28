import React from 'react';
import { TouchableOpacity, ViewStyle, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface IconButtonProps {
  icon: string; // Unicode symbol or text
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'filled' | 'outlined';
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'error';
  disabled?: boolean;
  style?: ViewStyle;
  hapticFeedback?: boolean;
}

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'ghost',
  color = 'primary',
  disabled = false,
  style,
  hapticFeedback = true,
}: IconButtonProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const handlePress = () => {
    if (hapticFeedback && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          width: 32,
          height: 32,
          borderRadius: 8,
        };
      case 'lg':
        return {
          width: 48,
          height: 48,
          borderRadius: 12,
        };
      default:
        return {
          width: 40,
          height: 40,
          borderRadius: 10,
        };
    }
  };

  const getVariantStyle = () => {
    const baseColor = color === 'accent' ? theme.colors.accent : 
                     color === 'success' ? theme.colors.success :
                     color === 'error' ? theme.colors.error :
                     theme.colors.primary;

    switch (variant) {
      case 'filled':
        return {
          backgroundColor: baseColor,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: baseColor,
        };
      default: // ghost
        return {
          backgroundColor: 'transparent',
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'filled') {
      return 'inverse';
    }
    
    switch (color) {
      case 'accent':
        return 'accent';
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      default:
        return 'primary';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'md';
      case 'lg':
        return 'xl';
      default:
        return 'lg';
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        getSizeStyle(),
        getVariantStyle(),
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        variant={getIconSize()}
        color={getTextColor() as any}
        weight="normal"
        style={{ lineHeight: undefined }}
      >
        {icon}
      </Text>
    </TouchableOpacity>
  );
}