import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent';
  align?: 'left' | 'center' | 'right' | 'justify';
  style?: TextStyle;
  letterSpacing?: number;
  lineHeight?: number;
}

export function Text({
  children,
  variant = 'body',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  style,
  letterSpacing,
  lineHeight,
}: TextProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: 'System',
      fontWeight: theme.typography.fontWeight[weight] as TextStyle['fontWeight'],
      color: color === 'accent' ? theme.colors.text.accent : theme.colors.text[color],
      textAlign: align,
      ...(letterSpacing && { letterSpacing }),
    };

    const getVariantStyle = (fontSize: number, defaultLineHeight: number, defaultWeight?: string) => {
      return {
        ...baseStyle,
        fontSize,
        lineHeight: lineHeight || fontSize * defaultLineHeight,
        ...(defaultWeight && { fontWeight: theme.typography.fontWeight[defaultWeight as keyof typeof theme.typography.fontWeight] as TextStyle['fontWeight'] }),
      };
    };

    switch (variant) {
      case 'h1':
        return getVariantStyle(
          theme.typography.fontSize['5xl'], // Hero text - 48px
          theme.typography.lineHeight.tight,
          'extrabold'
        );
      case 'h2':
        return getVariantStyle(
          theme.typography.fontSize['4xl'], // Display text - 36px
          theme.typography.lineHeight.tight,
          'bold'
        );
      case 'h3':
        return getVariantStyle(
          theme.typography.fontSize['3xl'], // Large headings - 30px
          theme.typography.lineHeight.snug,
          'semibold'
        );
      case 'h4':
        return getVariantStyle(
          theme.typography.fontSize['2xl'], // Medium headings - 24px
          theme.typography.lineHeight.snug,
          'semibold'
        );
      case 'sm':
        return getVariantStyle(
          theme.typography.fontSize.sm,
          theme.typography.lineHeight.normal
        );
      case 'md':
        return getVariantStyle(
          theme.typography.fontSize.md,
          theme.typography.lineHeight.normal
        );
      case 'lg':
        return getVariantStyle(
          theme.typography.fontSize.lg,
          theme.typography.lineHeight.normal
        );
      case 'xl':
        return getVariantStyle(
          theme.typography.fontSize.xl,
          theme.typography.lineHeight.normal,
          'medium'
        );
      case '2xl':
        return getVariantStyle(
          theme.typography.fontSize['2xl'],
          theme.typography.lineHeight.snug,
          'semibold'
        );
      case '3xl':
        return getVariantStyle(
          theme.typography.fontSize['3xl'],
          theme.typography.lineHeight.tight,
          'bold'
        );
      case '4xl':
        return getVariantStyle(
          theme.typography.fontSize['4xl'],
          theme.typography.lineHeight.tight,
          'bold'
        );
      case '5xl':
        return getVariantStyle(
          theme.typography.fontSize['5xl'],
          theme.typography.lineHeight.none,
          'extrabold'
        );
      case 'body':
        return getVariantStyle(
          theme.typography.fontSize.base, // 15px for better readability
          theme.typography.lineHeight.normal // 1.5 for improved reading
        );
      case 'caption':
        return getVariantStyle(
          theme.typography.fontSize.sm, // 13px for metadata
          theme.typography.lineHeight.relaxed
        );
      case 'label':
        return getVariantStyle(
          theme.typography.fontSize.sm, // 13px for labels
          theme.typography.lineHeight.normal,
          'medium' // Medium weight for emphasis
        );
      default:
        return baseStyle;
    }
  };

  return (
    <RNText style={[getTextStyle(), style]}>
      {children}
    </RNText>
  );
}