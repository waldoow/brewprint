import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedBadgeProps = {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  lightColor?: string;
  darkColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
  style?: ViewStyle;
};

export function ThemedBadge({
  children,
  variant = 'default',
  size = 'default',
  lightColor,
  darkColor,
  lightTextColor,
  darkTextColor,
  style,
}: ThemedBadgeProps) {
  const textColor = useThemeColor(
    { light: lightTextColor, dark: darkTextColor },
    'text'
  );
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const getBadgeStyles = (): ViewStyle => {
    const baseStyle = styles.base;
    const sizeStyle = styles[`size_${size}`];
    
    let variantStyle: ViewStyle = {};
    
    switch (variant) {
      case 'default':
        variantStyle = {
          backgroundColor: tintColor,
        };
        break;
      case 'secondary':
        variantStyle = {
          backgroundColor: iconColor + '20',
        };
        break;
      case 'destructive':
        variantStyle = {
          backgroundColor: '#dc2626',
        };
        break;
      case 'success':
        variantStyle = {
          backgroundColor: '#16a34a',
        };
        break;
      case 'warning':
        variantStyle = {
          backgroundColor: '#d97706',
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: iconColor + '40',
        };
        break;
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyle = styles.text;
    const sizeTextStyle = styles[`text_${size}`];
    
    let color = textColor;
    
    switch (variant) {
      case 'default':
        color = tintColor === Colors.dark.tint ? Colors.light.text : '#ffffff';
        break;
      case 'secondary':
        color = textColor;
        break;
      case 'destructive':
      case 'success':
      case 'warning':
        color = '#ffffff';
        break;
      case 'outline':
        color = textColor;
        break;
    }

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
      color,
    };
  };

  return (
    <View style={[getBadgeStyles(), style]}>
      <Text style={getTextStyles()}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  
  // Size variants
  size_default: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  size_sm: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  size_lg: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  
  // Text styles
  text: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  text_default: {
    fontSize: 12,
  },
  text_sm: {
    fontSize: 10,
  },
  text_lg: {
    fontSize: 14,
  },
});