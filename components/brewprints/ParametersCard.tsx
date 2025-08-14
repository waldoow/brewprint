import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet } from "react-native";

interface ParametersCardProps {
  title: string;
  coffeeGrams: number;
  waterGrams: number;
  waterTemp: number;
  ratio?: string;
  grindSetting?: number;
  totalTime?: number;
}

export function ParametersCard({
  title,
  coffeeGrams,
  waterGrams,
  waterTemp,
  ratio,
  grindSetting,
  totalTime,
}: ParametersCardProps) {
  const calculateRatio = (): string => {
    if (ratio) return ratio;
    const ratioValue = waterGrams / coffeeGrams;
    return `1:${ratioValue.toFixed(1)}`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m${remainingSeconds}s`;
  };

  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      
      <ThemedView noBackground style={styles.parametersGrid}>
        {/* First row */}
        <ThemedView noBackground style={styles.parameterRow}>
          <ThemedView noBackground style={styles.parameter}>
            <ThemedText style={styles.parameterLabel}>Café</ThemedText>
            <ThemedView noBackground style={styles.parameterValue}>
              <ThemedText style={styles.valueText}>{coffeeGrams}</ThemedText>
              <ThemedText style={styles.unitText}>g</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView noBackground style={styles.parameter}>
            <ThemedText style={styles.parameterLabel}>Eau</ThemedText>
            <ThemedView noBackground style={styles.parameterValue}>
              <ThemedText style={styles.valueText}>{waterGrams}</ThemedText>
              <ThemedText style={styles.unitText}>g</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView noBackground style={styles.parameter}>
            <ThemedText style={styles.parameterLabel}>Ratio</ThemedText>
            <ThemedText style={styles.valueText}>{calculateRatio()}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Second row */}
        <ThemedView noBackground style={styles.parameterRow}>
          <ThemedView noBackground style={styles.parameter}>
            <ThemedText style={styles.parameterLabel}>Température</ThemedText>
            <ThemedView noBackground style={styles.parameterValue}>
              <ThemedText style={styles.valueText}>{waterTemp}</ThemedText>
              <ThemedText style={styles.unitText}>°C</ThemedText>
            </ThemedView>
          </ThemedView>

          {grindSetting && (
            <ThemedView noBackground style={styles.parameter}>
              <ThemedText style={styles.parameterLabel}>Mouture</ThemedText>
              <ThemedText style={styles.valueText}>{grindSetting}</ThemedText>
            </ThemedView>
          )}

          {totalTime && (
            <ThemedView noBackground style={styles.parameter}>
              <ThemedText style={styles.parameterLabel}>Temps</ThemedText>
              <ThemedText style={styles.valueText}>{formatTime(totalTime)}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBackgroundSecondary,
    padding: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  parametersGrid: {
    gap: 12,
  },
  parameterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  parameter: {
    flex: 1,
    alignItems: "flex-start",
    gap: 4,
  },
  parameterLabel: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  parameterValue: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
  },
  unitText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.7,
  },
});