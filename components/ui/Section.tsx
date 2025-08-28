import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { Card } from './Card';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'gradient' | 'glass';
  headerAction?: {
    title: string;
    onPress: () => void;
  };
}

export function Section({
  title,
  subtitle,
  children,
  spacing = 'lg',
  style,
  variant = 'default',
  headerAction,
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

  const renderHeader = () => {
    if (!title) return null;
    
    return (
      <View style={{ 
        marginBottom: theme.spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <View style={{ flex: 1, marginRight: headerAction ? theme.spacing.md : 0 }}>
          <Text 
            variant="2xl" 
            weight="bold" 
            color="primary"
            style={{ 
              marginBottom: subtitle ? theme.spacing.xs : 0,
              letterSpacing: -0.5
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text 
              variant="md" 
              color="secondary"
              style={{ lineHeight: 22 }}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {headerAction && (
          <Text
            variant="md"
            weight="semibold"
            color="accent"
            style={{ marginTop: 4 }}
            onPress={headerAction.onPress}
          >
            {headerAction.title}
          </Text>
        )}
      </View>
    );
  };

  const renderContent = () => {
    switch (variant) {
      case 'elevated':
        return (
          <Card variant="elevated" padding="xl" style={{ marginTop: title ? 0 : theme.spacing.lg }}>
            {renderHeader()}
            {children}
          </Card>
        );
      
      case 'glass':
        return (
          <Card variant="glass" padding="xl" style={{ marginTop: title ? 0 : theme.spacing.lg }}>
            {renderHeader()}
            {children}
          </Card>
        );
        
      case 'gradient':
        return (
          <Card variant="gradient" padding="xl" style={{ marginTop: title ? 0 : theme.spacing.lg }}>
            {renderHeader()}
            {children}
          </Card>
        );
        
      default:
        return (
          <View>
            {renderHeader()}
            {children}
          </View>
        );
    }
  };

  return (
    <View style={[sectionStyle, style]}>
      {renderContent()}
    </View>
  );
}