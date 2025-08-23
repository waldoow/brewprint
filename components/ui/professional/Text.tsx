import React from 'react';
import { Text, TextStyle } from 'react-native';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ProfessionalTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

export function ProfessionalText({
  children,
  variant = 'body',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  style,
}: ProfessionalTextProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: 'System',
      fontWeight: theme.typography.fontWeight[weight],
      color: theme.colors.text[color],
      textAlign: align,
    };

    switch (variant) {
      case 'h1':
        return {
          ...baseStyle,
          fontSize: theme.typography.fontSize['5xl'],
          lineHeight: theme.typography.fontSize['5xl'] * theme.typography.lineHeight.tight,
          fontWeight: theme.typography.fontWeight.bold,
        };
      case 'h2':
        return {
          ...baseStyle,
          fontSize: theme.typography.fontSize['4xl'],
          lineHeight: theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight,
          fontWeight: theme.typography.fontWeight.bold,
        };
      case 'h3':
        return {
          ...baseStyle,
          fontSize: theme.typography.fontSize['3xl'],
          lineHeight: theme.typography.fontSize['3xl'] * theme.typography.lineHeight.normal,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      case 'h4':
        return {
          ...baseStyle,
          fontSize: theme.typography.fontSize['2xl'],
          lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.normal,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      case 'body':
        return {
          ...baseStyle,
          fontSize: theme.typography.fontSize.base,
          lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
        };
      case 'caption':
        return {
          ...baseStyle,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
        };
      case 'label':
        return {
          ...baseStyle,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
          fontWeight: theme.typography.fontWeight.medium,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Text style={[getTextStyle(), style]}>
      {children}
    </Text>
  );
}