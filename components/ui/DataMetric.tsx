import React from 'react';
import { View, ViewStyle } from 'react-native';
import { DataText } from './DataText';
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DataMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function DataMetric({
  label,
  value,
  unit,
  trend,
  size = 'md',
  style,
}: DataMetricProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          valueVariant: 'h4' as const,
          labelVariant: 'tiny' as const,
          spacing: theme.spacing[2],
        };
      case 'lg':
        return {
          valueVariant: 'display' as const,
          labelVariant: 'small' as const,
          spacing: theme.spacing[3],
        };
      default: // md
        return {
          valueVariant: 'h2' as const,
          labelVariant: 'small' as const,
          spacing: theme.spacing[2],
        };
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return theme.colors.success;
      case 'down': return theme.colors.error;
      default: return theme.colors.text.tertiary;
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <View 
      style={[
        {
          alignItems: 'flex-start',
          gap: sizeConfig.spacing,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}${unit || ''}`}
    >
      {/* Label */}
      <DataText
        variant={sizeConfig.labelVariant}
        color="tertiary"
        weight="medium"
        style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        {label}
      </DataText>

      {/* Value with Unit */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <DataText
          variant={sizeConfig.valueVariant}
          color="data-primary"
          weight="bold"
          style={{ 
            fontFeatures: [{ 'tnum': 1 }], // Tabular numbers
            letterSpacing: -0.5,
          }}
        >
          {value}
        </DataText>
        {unit && (
          <DataText
            variant="small"
            color="secondary"
            style={{ 
              marginLeft: theme.spacing[1],
              fontFeatures: [{ 'tnum': 1 }],
            }}
          >
            {unit}
          </DataText>
        )}
      </View>

      {/* Trend */}
      {trend && (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          gap: theme.spacing[1],
        }}>
          <DataText
            variant="tiny"
            style={{ 
              color: getTrendColor(trend.direction),
              fontFeatures: [{ 'tnum': 1 }],
            }}
          >
            {getTrendIcon(trend.direction)} {Math.abs(trend.value)}%
          </DataText>
          {trend.period && (
            <DataText variant="tiny" color="tertiary">
              {trend.period}
            </DataText>
          )}
        </View>
      )}
    </View>
  );
}

// Specialized metric components for common use cases
interface TimeMetricProps extends Omit<DataMetricProps, 'value'> {
  seconds: number;
}

export function TimeMetric({ seconds, ...props }: TimeMetricProps) {
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DataMetric
      {...props}
      value={formatTime(seconds)}
    />
  );
}

interface RatioMetricProps extends Omit<DataMetricProps, 'value'> {
  numerator: number;
  denominator: number;
}

export function RatioMetric({ numerator, denominator, ...props }: RatioMetricProps) {
  const ratio = denominator > 0 ? (numerator / denominator).toFixed(1) : '0.0';
  
  return (
    <DataMetric
      {...props}
      value={`${numerator}:${denominator} (${ratio})`}
    />
  );
}