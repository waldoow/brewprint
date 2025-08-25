import React, { useState } from 'react';
import { View, TouchableOpacity, ViewStyle, LayoutAnimation, Platform } from 'react-native';
import { DataText } from './DataText';
import { DataCard } from './DataCard';
import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  preview: React.ReactNode;
  expandedContent: React.ReactNode;
  variant?: 'default' | 'surface' | 'bordered';
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  style?: ViewStyle;
}

export function ExpandableCard({
  title,
  subtitle,
  preview,
  expandedContent,
  variant = 'default',
  defaultExpanded = false,
  onToggle,
  style,
}: ExpandableCardProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (Platform.OS === 'ios') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const getToggleIcon = () => {
    return expanded ? '−' : '+';
  };

  return (
    <DataCard variant={variant} style={style}>
      {/* Header */}
      <TouchableOpacity
        onPress={handleToggle}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing[3],
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
        accessibilityHint={`${expanded ? 'Hide' : 'Show'} additional details`}
      >
        <View style={{ flex: 1, marginRight: theme.spacing[2] }}>
          <DataText
            variant="h4"
            color="primary"
            weight="semibold"
            style={{ marginBottom: subtitle ? theme.spacing[1] : 0 }}
          >
            {title}
          </DataText>
          {subtitle && (
            <DataText variant="small" color="secondary">
              {subtitle}
            </DataText>
          )}
        </View>
        
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <DataText
            variant="small"
            color="secondary"
            weight="medium"
            style={{ lineHeight: 16 }}
          >
            {getToggleIcon()}
          </DataText>
        </View>
      </TouchableOpacity>

      {/* Preview - Always visible */}
      <View style={{ marginBottom: expanded ? theme.spacing[4] : 0 }}>
        {preview}
      </View>

      {/* Expanded content - Progressive disclosure */}
      {expanded && (
        <View
          style={{
            paddingTop: theme.spacing[4],
            borderTopWidth: 1,
            borderTopColor: theme.colors.borderLight,
          }}
        >
          {expandedContent}
        </View>
      )}
    </DataCard>
  );
}

// Specialized expandable card for metrics with preview
interface ExpandableMetricCardProps {
  title: string;
  subtitle?: string;
  previewMetrics: React.ReactNode[];
  expandedMetrics: React.ReactNode[];
  variant?: 'default' | 'surface' | 'bordered';
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  style?: ViewStyle;
}

export function ExpandableMetricCard({
  title,
  subtitle,
  previewMetrics,
  expandedMetrics,
  variant = 'default',
  defaultExpanded = false,
  onToggle,
  style,
}: ExpandableMetricCardProps) {
  const theme = getTheme(useColorScheme() ?? 'light');

  return (
    <ExpandableCard
      title={title}
      subtitle={subtitle}
      variant={variant}
      defaultExpanded={defaultExpanded}
      onToggle={onToggle}
      style={style}
      preview={
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.layout.card.gap.md,
        }}>
          {previewMetrics.map((metric, index) => (
            <View key={index} style={{ flex: 1, minWidth: 80 }}>
              {metric}
            </View>
          ))}
        </View>
      }
      expandedContent={
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.layout.card.gap.md,
        }}>
          {expandedMetrics.map((metric, index) => (
            <View key={index} style={{ flex: 1, minWidth: 80 }}>
              {metric}
            </View>
          ))}
        </View>
      }
    />
  );
}