// components/brewprints/BrewprintCard.tsx
import { ThemedText } from "@/components/ui/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Haptics from "expo-haptics";
import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";

function getStatusColor(
  status: "experimenting" | "final" | "archived",
  colors: any
) {
  switch (status) {
    case "experimenting":
      return colors.statusYellow;
    case "final":
      return colors.statusGreen;
    case "archived":
      return colors.textSecondary;
    default:
      return colors.textSecondary;
  }
}

function getStatusLabel(status: "experimenting" | "final" | "archived") {
  switch (status) {
    case "experimenting":
      return "EXPERIMENTAL";
    case "final":
      return "FINALIZED";
    case "archived":
      return "ARCHIVED";
    default:
      return "UNKNOWN";
  }
}

interface BrewprintCardProps {
  brewprint: {
    id: string;
    name: string;
    method: string;
    beans: string;
    rating?: number;
    date: string;
    status: "experimenting" | "final" | "archived";
    // Additional advanced properties
    coffee_weight?: number;
    water_weight?: number;
    grind_size?: string;
    water_temp?: number;
    brew_time?: number;
    yield_weight?: number;
    extraction_yield?: number;
    tds?: number;
  };
  onPress: () => void;
  isSelected?: boolean;
}

export function BrewprintCard({
  brewprint,
  onPress,
}: BrewprintCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Calculate derived metrics
  const ratio = brewprint.coffee_weight && brewprint.water_weight ? 
    (brewprint.water_weight / brewprint.coffee_weight).toFixed(1) : null;
  
  const extractionTime = brewprint.brew_time ? 
    `${Math.floor(brewprint.brew_time / 60)}:${(brewprint.brew_time % 60).toString().padStart(2, '0')}` : null;

  const efficiency = brewprint.yield_weight && brewprint.water_weight ?
    ((brewprint.yield_weight / brewprint.water_weight) * 100).toFixed(1) : null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.advancedBrewprintCard, { 
        backgroundColor: colors.cardBackground,
        borderLeftColor: getStatusColor(brewprint.status, colors),
      }]}
    >
      {/* Header with recipe name and status */}
      <View style={styles.recipeHeader}>
        <View style={styles.recipeMain}>
          <ThemedText type="defaultSemiBold" style={[styles.recipeName, { color: colors.text }]}>
            {brewprint.name}
          </ThemedText>
          <ThemedText style={[styles.recipeMethod, { color: colors.textSecondary }]}>
            {brewprint.method.toUpperCase()} • {brewprint.beans}
          </ThemedText>
        </View>
        <View style={styles.recipeStatus}>
          <ThemedText style={[styles.statusLabel, { color: getStatusColor(brewprint.status, colors) }]}>
            {getStatusLabel(brewprint.status)}
          </ThemedText>
          <ThemedText style={[styles.recipeDate, { color: colors.text }]}>
            {new Date(brewprint.date).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>

      {/* Brewing parameters grid */}
      <View style={styles.parametersGrid}>
        {brewprint.coffee_weight && (
          <View style={styles.parameterItem}>
            <ThemedText style={[styles.parameterLabel, { color: colors.textSecondary }]}>
              COFFEE
            </ThemedText>
            <ThemedText style={[styles.parameterValue, { color: colors.text }]}>
              {brewprint.coffee_weight}g
            </ThemedText>
          </View>
        )}
        
        {brewprint.water_weight && (
          <View style={styles.parameterItem}>
            <ThemedText style={[styles.parameterLabel, { color: colors.textSecondary }]}>
              WATER
            </ThemedText>
            <ThemedText style={[styles.parameterValue, { color: colors.text }]}>
              {brewprint.water_weight}g
            </ThemedText>
          </View>
        )}

        {ratio && (
          <View style={styles.parameterItem}>
            <ThemedText style={[styles.parameterLabel, { color: colors.textSecondary }]}>
              RATIO
            </ThemedText>
            <ThemedText style={[styles.parameterValue, { color: colors.text }]}>
              1:{ratio}
            </ThemedText>
          </View>
        )}

        {brewprint.grind_size && (
          <View style={styles.parameterItem}>
            <ThemedText style={[styles.parameterLabel, { color: colors.textSecondary }]}>
              GRIND
            </ThemedText>
            <ThemedText style={[styles.parameterValue, { color: colors.text }]}>
              {brewprint.grind_size}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Advanced metrics row */}
      <View style={styles.metricsRow}>
        {brewprint.water_temp && (
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
              TEMP
            </ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>
              {brewprint.water_temp}°C
            </ThemedText>
          </View>
        )}

        {extractionTime && (
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
              TIME
            </ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>
              {extractionTime}
            </ThemedText>
          </View>
        )}

        {brewprint.tds && (
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
              TDS
            </ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>
              {brewprint.tds.toFixed(2)}%
            </ThemedText>
          </View>
        )}

        {brewprint.extraction_yield && (
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
              EY
            </ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>
              {brewprint.extraction_yield.toFixed(1)}%
            </ThemedText>
          </View>
        )}

        {efficiency && (
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
              EFFICIENCY
            </ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>
              {efficiency}%
            </ThemedText>
          </View>
        )}

        {brewprint.rating && (
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
              RATING
            </ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>
              {brewprint.rating.toFixed(1)}/10
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Advanced brewprint card styles
  advancedBrewprintCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recipeMain: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    marginBottom: 2,
  },
  recipeMethod: {
    fontSize: 12,
    fontWeight: '500',
  },
  recipeStatus: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  recipeDate: {
    fontSize: 11,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  
  // Parameters section
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  parameterItem: {
    flex: 1,
    minWidth: '20%',
  },
  parameterLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  parameterValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  
  // Metrics section
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricItem: {
    flex: 1,
    minWidth: '15%',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
