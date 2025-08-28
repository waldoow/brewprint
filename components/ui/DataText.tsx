import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DataTextProps {
  children: React.ReactNode;
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'tiny';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'data-primary' | 'data-secondary';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

export function DataText({
  children,
  variant = 'body',
  color = 'primary',
  weight,
  align = 'left',
  style,
  numberOfLines,
}: DataTextProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const getTextStyle = (): TextStyle => {
    // Base style
    let fontSize: number;
    let lineHeight: number;
    let fontWeight: string;

    // Determine font properties based on variant
    switch (variant) {
      case 'display':
        fontSize = theme.typography.fontSize.display;
        lineHeight = fontSize * theme.typography.lineHeight.tight;
        fontWeight = weight || theme.typography.fontWeight.bold;
        break;
      case 'h1':
        fontSize = theme.typography.fontSize.h1;
        lineHeight = fontSize * theme.typography.lineHeight.tight;
        fontWeight = weight || theme.typography.fontWeight.semibold;
        break;
      case 'h2':
        fontSize = theme.typography.fontSize.h2;
        lineHeight = fontSize * theme.typography.lineHeight.tight;
        fontWeight = weight || theme.typography.fontWeight.semibold;
        break;
      case 'h3':
        fontSize = theme.typography.fontSize.h3;
        lineHeight = fontSize * theme.typography.lineHeight.normal;
        fontWeight = weight || theme.typography.fontWeight.semibold;
        break;
      case 'h4':
        fontSize = theme.typography.fontSize.h4;
        lineHeight = fontSize * theme.typography.lineHeight.normal;
        fontWeight = weight || theme.typography.fontWeight.medium;
        break;
      case 'body':
        fontSize = theme.typography.fontSize.body;
        lineHeight = fontSize * theme.typography.lineHeight.normal;
        fontWeight = weight || theme.typography.fontWeight.normal;
        break;
      case 'small':
        fontSize = theme.typography.fontSize.small;
        lineHeight = fontSize * theme.typography.lineHeight.normal;
        fontWeight = weight || theme.typography.fontWeight.normal;
        break;
      case 'tiny':
        fontSize = theme.typography.fontSize.tiny;
        lineHeight = fontSize * theme.typography.lineHeight.normal;
        fontWeight = weight || theme.typography.fontWeight.medium;
        break;
      default:
        fontSize = theme.typography.fontSize.body;
        lineHeight = fontSize * theme.typography.lineHeight.normal;
        fontWeight = weight || theme.typography.fontWeight.normal;
    }

    // Determine color
    let textColor: string;
    switch (color) {
      case 'primary':
        textColor = theme.colors.text.primary;
        break;
      case 'secondary':
        textColor = theme.colors.text.secondary;
        break;
      case 'tertiary':
        textColor = theme.colors.text.tertiary;
        break;
      case 'inverse':
        textColor = theme.colors.text.inverse;
        break;
      case 'data-primary':
        textColor = theme.colors.data.primary;
        break;
      case 'data-secondary':
        textColor = theme.colors.data.secondary;
        break;
      default:
        textColor = theme.colors.text.primary;
    }

    return {
      fontSize,
      lineHeight,
      fontWeight: fontWeight as TextStyle['fontWeight'],
      color: textColor,
      textAlign: align,
      fontFamily: 'System', // Use system font for consistency
    };
  };

  return (
    <RNText 
      style={[getTextStyle(), style]} 
      numberOfLines={numberOfLines}
      accessible={true}
      accessibilityRole="text"
    >
      {children}
    </RNText>
  );
}