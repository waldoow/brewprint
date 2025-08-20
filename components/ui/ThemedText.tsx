import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'micro' | 'body' | 'heading' | 'display';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'micro' ? styles.micro : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'heading' ? styles.heading : undefined,
        type === 'display' ? styles.display : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Professional Typography Scale for Coffee Professionals
  
  // Display Text (Hero titles, section headers)
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  
  // Primary Headings
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  
  // Section Headings
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  
  // Subsection Headings
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  
  // Body Text (Default)
  default: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  },
  
  // Body Text Alternative
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  
  // Emphasized Body Text
  defaultSemiBold: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  
  // Secondary Information
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  
  // Labels, Units, Technical Data
  micro: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  
  // Interactive Links
  link: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
    color: Colors.light.tint,
  },
});
