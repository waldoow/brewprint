import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

export function Section({
  title,
  subtitle,
  children,
  spacing = 'lg',
  style,
}: SectionProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const getSpacingValue = () => {
    switch (spacing) {
      case 'sm': return theme.spacing.lg;
      case 'md': return theme.spacing.xl;
      case 'lg': return theme.spacing['2xl'];
      case 'xl': return theme.spacing['3xl'];
      default: return theme.spacing['2xl'];
    }
  };

  const sectionStyle: ViewStyle = {
    marginBottom: getSpacingValue(),
  };

  return (
    <View style={[sectionStyle, style]}>
      {title && (
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text 
            variant="xl" 
            weight="semibold" 
            color="primary"
            style={{ marginBottom: subtitle ? theme.spacing.xs : 0 }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text 
              variant="body" 
              color="secondary"
            >
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
}