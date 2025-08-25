import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { DataText } from './DataText';
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DataCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'surface' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function DataCard({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
}: DataCardProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const getPaddingValue = () => {
    switch (padding) {
      case 'sm': return theme.layout.card.padding.sm;
      case 'lg': return theme.layout.card.padding.lg;
      default: return theme.layout.card.padding.md;
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.layout.card.radius.md,
      padding: getPaddingValue(),
    };

    switch (variant) {
      case 'surface':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
        };
      case 'bordered':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      default: // default
        return {
          ...baseStyle,
          backgroundColor: theme.colors.card,
          ...theme.shadows.card,
        };
    }
  };

  const renderHeader = () => {
    if (!title && !subtitle) return null;

    return (
      <View style={{ marginBottom: theme.spacing[4] }}>
        {title && (
          <DataText
            variant="h4"
            color="primary"
            weight="semibold"
            style={{ marginBottom: subtitle ? theme.spacing[1] : 0 }}
          >
            {title}
          </DataText>
        )}
        {subtitle && (
          <DataText variant="small" color="secondary">
            {subtitle}
          </DataText>
        )}
      </View>
    );
  };

  const cardStyle = getCardStyle();
  const content = (
    <>
      {renderHeader()}
      {children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.97}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View 
      style={[cardStyle, style]}
      accessible={true}
      accessibilityRole="group"
      accessibilityLabel={accessibilityLabel || title}
    >
      {content}
    </View>
  );
}

// Specialized cards for common patterns
interface MetricCardProps {
  title: string;
  metrics: React.ReactNode[];
  variant?: DataCardProps['variant'];
  onPress?: () => void;
  style?: ViewStyle;
}

export function MetricCard({ 
  title, 
  metrics, 
  variant = 'default',
  onPress,
  style 
}: MetricCardProps) {
  const theme = getTheme(useColorScheme() ?? 'light');

  return (
    <DataCard
      title={title}
      variant={variant}
      onPress={onPress}
      style={style}
      accessibilityLabel={`${title} metrics`}
    >
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.layout.card.gap.md,
      }}>
        {metrics.map((metric, index) => (
          <View key={index} style={{ flex: 1, minWidth: 80 }}>
            {metric}
          </View>
        ))}
      </View>
    </DataCard>
  );
}

interface InfoCardProps {
  title: string;
  items: { label: string; value: string; }[];
  variant?: DataCardProps['variant'];
  onPress?: () => void;
  style?: ViewStyle;
}

export function InfoCard({ 
  title, 
  items, 
  variant = 'default',
  onPress,
  style 
}: InfoCardProps) {
  const theme = getTheme(useColorScheme() ?? 'light');

  return (
    <DataCard
      title={title}
      variant={variant}
      onPress={onPress}
      style={style}
      accessibilityLabel={`${title} information`}
    >
      <View style={{ gap: theme.spacing[3] }}>
        {items.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <DataText variant="small" color="secondary">
              {item.label}
            </DataText>
            <DataText variant="small" color="primary" weight="medium">
              {item.value}
            </DataText>
          </View>
        ))}
      </View>
    </DataCard>
  );
}