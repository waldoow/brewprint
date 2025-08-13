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
    <ThemedView noBackground style={styles.statusRow}>
      <ThemedView noBackground style={styles.column}>
        <ThemedText style={styles.columnTitle}>Torréfaction</ThemedText>
        <ThemedView noBackground style={styles.roastInfo}>
          <ThemedView
            style={[styles.roastDot, { backgroundColor: getRoastLevelColor() }]}
          />
          <ThemedText style={styles.statusValue}>
            {getRoastLevelDisplay()}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView noBackground style={styles.column}>
        <ThemedText style={styles.columnTitle}>Fraîcheur</ThemedText>
        <ThemedBadge variant={getFreshnessVariant() as any} size="sm">
          {getFreshnessLabel()}
        </ThemedBadge>
      </ThemedView>

      <ThemedView noBackground style={styles.column}>
        <ThemedText style={styles.columnTitle}>Âge</ThemedText>
        <ThemedView noBackground style={styles.daysInfo}>
          <ThemedText style={styles.statusValue}>{daysSinceRoast()}</ThemedText>
          <ThemedText style={styles.statusUnit}>j</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBackgroundSecondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  column: {
    alignItems: "flex-start",
    gap: 6,
    flex: 1,
  },
  columnTitle: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  roastInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  daysInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  roastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusUnit: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.7,
  },
});
