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
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Inventaire</ThemedText>
      <ThemedView style={styles.inventoryCard}>
        <ThemedView style={styles.inventoryHeader}>
          <ThemedView style={styles.inventoryAmounts}>
            <ThemedText style={styles.inventoryAmount}>
              {remainingGrams}g
            </ThemedText>
            <ThemedText style={styles.inventoryLabel}>restant</ThemedText>
          </ThemedView>
          <ThemedView style={styles.inventoryPercentage}>
            <ThemedText
              style={[
                styles.percentageText,
                {
                  color: getProgressColor(),
                },
              ]}
            >
              {Math.round(percentageRemaining)}%
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.progressContainer}>
          <ThemedView style={styles.progressBar}>
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

        <ThemedText style={styles.inventorySubtext}>
          Total: {totalGrams}g
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  inventoryCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardBackgroundSecondary,
  },
  inventoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  inventoryAmounts: {
    alignItems: "flex-start",
  },
  inventoryPercentage: {
    alignItems: "flex-end",
  },
  inventoryAmount: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 2,
  },
  inventoryLabel: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: "500",
  },
  inventorySubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 12,
    textAlign: "center",
  },
  percentageText: {
    fontSize: 20,
    fontWeight: "700",
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.dark.cardBackgroundSecondary,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
});
