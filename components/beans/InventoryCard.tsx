import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet } from "react-native";

interface InventoryCardProps {
  remainingGrams: number;
  totalGrams: number;
}

export function InventoryCard({
  remainingGrams,
  totalGrams,
}: InventoryCardProps) {
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const errorColor = useThemeColor({}, "error");

  const percentageRemaining: number = (remainingGrams / totalGrams) * 100;

  const getProgressColor = () => {
    return percentageRemaining > 30
      ? percentageRemaining > 60
        ? successColor
        : warningColor
      : errorColor;
  };

  return (
    <ThemedView noBackground>
      <ThemedView noBackground style={styles.inventoryHeader}>
        <ThemedView noBackground style={styles.inventoryInfo}>
          <ThemedText style={styles.inventoryLabel}>Inventaire</ThemedText>
          <ThemedText style={styles.inventoryAmount}>
            {remainingGrams}g / {totalGrams}g
          </ThemedText>
        </ThemedView>
        <ThemedText
          style={[styles.percentageText, { color: getProgressColor() }]}
        >
          {Math.round(percentageRemaining)}%
        </ThemedText>
      </ThemedView>

      <ThemedView noBackground style={styles.progressContainer}>
        <ThemedView noBackground style={styles.progressBar}>
          <ThemedView
            style={[
              styles.progressFill,
              {
                width: `${percentageRemaining}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  inventoryCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBackgroundSecondary,
    marginBottom: 16,
  },
  inventoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryLabel: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  inventoryAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    backgroundColor: Colors.dark.cardBackgroundSecondary,
    borderRadius: 12,
    padding: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
});
