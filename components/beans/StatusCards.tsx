import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet } from "react-native";

interface StatusCardsProps {
  roastLevel: string;
  freshnessStatus: string;
  roastDate: string;
}

export function StatusCards({
  roastLevel,
  freshnessStatus,
  roastDate,
}: StatusCardsProps) {
  // Coffee colors for roast levels
  const coffeeLight = useThemeColor({}, "coffeeLight");
  const coffeeLightMedium = useThemeColor({}, "coffeeLightMedium");
  const coffeeMedium = useThemeColor({}, "coffeeMedium");
  const coffeeMediumDark = useThemeColor({}, "coffeeMediumDark");
  const coffeeDark = useThemeColor({}, "coffeeDark");

  const getRoastLevelDisplay = (): string => {
    const levels: Record<string, string> = {
      light: "Clair",
      "light-medium": "Clair-Moyen",
      medium: "Moyen",
      "medium-dark": "Moyen-Foncé",
      dark: "Foncé",
    };
    return levels[roastLevel] || roastLevel;
  };

  const getRoastLevelColor = (): string => {
    const colors: Record<string, string> = {
      light: coffeeLight,
      "light-medium": coffeeLightMedium,
      medium: coffeeMedium,
      "medium-dark": coffeeMediumDark,
      dark: coffeeDark,
    };
    return colors[roastLevel] || coffeeMedium;
  };

  const getFreshnessVariant = ():
    | "secondary"
    | "success"
    | "default"
    | "warning"
    | "destructive" => {
    switch (freshnessStatus) {
      case "too-fresh":
        return "secondary";
      case "peak":
        return "success";
      case "good":
        return "default";
      case "declining":
        return "warning";
      case "stale":
        return "destructive";
      default:
        return "default";
    }
  };

  const getFreshnessLabel = (): string => {
    const labels: Record<string, string> = {
      "too-fresh": "En repos",
      peak: "Optimal",
      good: "Bon",
      declining: "En déclin",
      stale: "Périmé",
    };
    return labels[freshnessStatus] || freshnessStatus;
  };

  const daysSinceRoast = (): number => {
    const roastDateObj = new Date(roastDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - roastDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <ThemedView style={styles.statusSection}>
      <ThemedView style={styles.statusCard}>
        <ThemedView style={styles.statusHeader}>
          <ThemedView
            style={[styles.roastDot, { backgroundColor: getRoastLevelColor() }]}
          />
          <ThemedText style={styles.statusValue}>
            {getRoastLevelDisplay()}
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.statusLabel}>Torréfaction</ThemedText>
      </ThemedView>

      <ThemedView style={styles.statusCard}>
        <ThemedView style={styles.statusHeader}>
          <ThemedBadge variant={getFreshnessVariant() as any} size="sm">
            {getFreshnessLabel()}
          </ThemedBadge>
        </ThemedView>
        <ThemedText style={styles.statusLabel}>Fraîcheur</ThemedText>
      </ThemedView>

      <ThemedView style={styles.statusCard}>
        <ThemedView style={styles.statusHeader}>
          <ThemedText style={styles.statusValue}>{daysSinceRoast()}</ThemedText>
          <ThemedText style={styles.statusUnit}>jours</ThemedText>
        </ThemedView>
        <ThemedText style={styles.statusLabel}>Depuis torréfaction</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statusSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statusCard: {
    flex: 1,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.dark.cardBackgroundSecondary,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  roastDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  statusValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statusUnit: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.8,
  },
});
