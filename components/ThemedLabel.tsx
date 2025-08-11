import React from 'react';
import {
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedLabelProps = TextProps & {
  variant?: 'default' | 'secondary' | 'muted' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  required?: boolean;
  lightColor?: string;
  darkColor?: string;
  children: React.ReactNode;
};

export function ThemedLabel({
  variant = 'default',
  size = 'default',
  required = false,
  style,
  lightColor,
  darkColor,
  children,
  ...rest
}: ThemedLabelProps) {
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text'
  );
  const iconColor = useThemeColor({}, 'icon');

  const getLabelStyles = (): TextStyle => {
    const baseStyle = styles.base;
    const sizeStyle = styles[`size_${size}`];
    
    let variantStyle: TextStyle = {};
    
    switch (variant) {
      case 'default':
        variantStyle = {
          color: textColor,
          fontWeight: '500',
        };
        break;
      case 'secondary':
        variantStyle = {
          color: textColor,
          fontWeight: '400',
          opacity: 0.8,
        };
        break;
      case 'muted':
        variantStyle = {
          color: iconColor,
          fontWeight: '400',
          opacity: 0.6,
        };
        break;
      case 'destructive':
        variantStyle = {
          color: '#dc2626',
          fontWeight: '500',
        };
        break;
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
    };
  };

  return (
    <Text style={[getLabelStyles(), style]} {...rest}>
      {children}
      {required && (
        <Text style={[styles.required, { color: '#dc2626' }]}> *</Text>
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  
  // Size variants
  size_default: {
    fontSize: 14,
  },
  size_sm: {
    fontSize: 12,
  },
  size_lg: {
    fontSize: 16,
  },
  
  required: {
    fontSize: 14,
    fontWeight: '500',
  },
});