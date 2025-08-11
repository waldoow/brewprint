import React from 'react';
import {
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedSeparatorProps = {
  orientation?: 'horizontal' | 'vertical';
  size?: 'default' | 'sm' | 'lg';
  lightColor?: string;
  darkColor?: string;
  style?: ViewStyle;
};

export function ThemedSeparator({
  orientation = 'horizontal',
  size = 'default',
  lightColor,
  darkColor,
  style,
}: ThemedSeparatorProps) {
  const iconColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'icon'
  );

  const getSeparatorStyles = (): ViewStyle => {
    const baseStyle = styles.base;
    const orientationStyle = styles[orientation];
    const sizeStyle = styles[`${orientation}_${size}`];
    
    return {
      ...baseStyle,
      ...orientationStyle,
      ...sizeStyle,
      backgroundColor: iconColor + '20',
    };
  };

  return <View style={[getSeparatorStyles(), style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#e5e7eb', // This will be overridden by theme color
  },
  
  // Orientation styles
  horizontal: {
    width: '100%',
    marginVertical: 16,
  },
  vertical: {
    height: '100%',
    marginHorizontal: 16,
  },
  
  // Size variants for horizontal
  horizontal_default: {
    height: 1,
  },
  horizontal_sm: {
    height: 0.5,
  },
  horizontal_lg: {
    height: 2,
  },
  
  // Size variants for vertical
  vertical_default: {
    width: 1,
  },
  vertical_sm: {
    width: 0.5,
  },
  vertical_lg: {
    width: 2,
  },
});