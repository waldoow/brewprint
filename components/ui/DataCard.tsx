import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Text } from './Text';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DataPoint {
  label: string;
  value: string | number;
  unit?: string;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

interface DataCardProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
}

export function DataCard({
  title,
  subtitle,
  data,
  layout = 'vertical',
  variant = 'default',
  style,
}: DataCardProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const renderDataPoint = (point: DataPoint, index: number) => {
    const isLast = index === data.length - 1;
    
    return (
      <View
        key={index}
        style={[
          styles.dataPoint,
          layout === 'horizontal' && styles.dataPointHorizontal,
          layout === 'grid' && styles.dataPointGrid,
          !isLast && layout === 'vertical' && {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderSubtle,
            paddingBottom: theme.spacing.md,
            marginBottom: theme.spacing.md,
          },
        ]}
      >
        <View style={styles.dataPointHeader}>
          <Text variant="caption" color="secondary">
            {point.label}
          </Text>
          {point.change && (
            <View style={[
              styles.changeIndicator,
              { backgroundColor: point.change.direction === 'up' ? theme.colors.success : 
                                point.change.direction === 'down' ? theme.colors.error : 
                                theme.colors.gray[400] }
            ]}>
              <Text variant="caption" color="inverse">
                {point.change.direction === 'up' ? '+' : point.change.direction === 'down' ? '-' : ''}
                {Math.abs(point.change.value)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.dataValue}>
          <Text variant="h4" weight="semibold" color="primary">
            {point.value}
          </Text>
          {point.unit && (
            <Text variant="body" color="tertiary" style={{ marginLeft: 2 }}>
              {point.unit}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const getContainerStyle = () => {
    if (layout === 'horizontal') {
      return styles.horizontalLayout;
    }
    if (layout === 'grid') {
      return styles.gridLayout;
    }
    return styles.verticalLayout;
  };

  return (
    <Card variant={variant} style={style}>
      <View style={styles.header}>
        <Text variant="h4" weight="semibold">
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      
      <View style={[getContainerStyle(), { marginTop: theme.spacing.lg }]}>
        {data.map(renderDataPoint)}
      </View>
    </Card>
  );
}

const styles = {
  header: {},
  
  verticalLayout: {
    gap: 0,
  },
  
  horizontalLayout: {
    flexDirection: 'row' as const,
    gap: 24,
  },
  
  gridLayout: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 16,
  },
  
  dataPoint: {},
  
  dataPointHorizontal: {
    flex: 1,
  },
  
  dataPointGrid: {
    width: '48%',
  },
  
  dataPointHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  
  dataValue: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
  },
  
  changeIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
};