import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, View } from "react-native";

interface MaintenanceCardProps {
  lastCleaned?: string; // ISO date string
  cleaningFrequency?: number; // days
  totalUses: number;
  lastUsed?: string; // ISO timestamp string
}

export function MaintenanceCard({ 
  lastCleaned, 
  cleaningFrequency, 
  totalUses, 
  lastUsed 
}: MaintenanceCardProps) {
  const cardBackgroundColor = useThemeColor({}, "cardBackground");

  // Calculate days since last cleaning
  const getDaysSinceLastCleaned = () => {
    if (!lastCleaned) return null;
    const now = new Date();
    const cleanedDate = new Date(lastCleaned);
    return Math.floor((now.getTime() - cleanedDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Calculate cleaning status
  const getCleaningStatus = () => {
    if (!lastCleaned || !cleaningFrequency) return null;
    const daysSince = getDaysSinceLastCleaned();
    if (daysSince === null) return null;

    if (daysSince >= cleaningFrequency) {
      return { status: "overdue", variant: "destructive" as const };
    } else if (daysSince >= cleaningFrequency * 0.8) {
      return { status: "due_soon", variant: "warning" as const };
    } else {
      return { status: "clean", variant: "success" as const };
    }
  };

  // Format last used date
  const formatLastUsed = () => {
    if (!lastUsed) return "Never";
    const date = new Date(lastUsed);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const cleaningStatus = getCleaningStatus();
  const daysSinceLastCleaned = getDaysSinceLastCleaned();

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackgroundColor }]}>
      {/* Usage Stats */}
      <View style={styles.row}>
        <View style={styles.statItem}>
          <IconSymbol name="chart.bar.fill" size={16} color={Colors.light.text} />
          <ThemedText style={styles.statLabel}>Uses:</ThemedText>
          <ThemedText style={styles.statValue}>{totalUses}</ThemedText>
        </View>

        <View style={styles.statItem}>
          <IconSymbol name="clock.fill" size={16} color={Colors.light.text} />
          <ThemedText style={styles.statLabel}>Last Used:</ThemedText>
          <ThemedText style={styles.statValue}>{formatLastUsed()}</ThemedText>
        </View>
      </View>

      {/* Cleaning Status */}
      {cleaningStatus && (
        <View style={styles.row}>
          <View style={styles.cleaningSection}>
            <IconSymbol name="sparkles" size={16} color={Colors.light.text} />
            <ThemedText style={styles.cleaningLabel}>
              Cleaned {daysSinceLastCleaned} days ago
            </ThemedText>
            <ThemedBadge variant={cleaningStatus.variant} size="sm">
              {cleaningStatus.status === "clean" && "Clean"}
              {cleaningStatus.status === "due_soon" && "Due Soon"}
              {cleaningStatus.status === "overdue" && "Overdue"}
            </ThemedBadge>
          </View>
        </View>
      )}

      {/* Cleaning Frequency */}
      {cleaningFrequency && (
        <View style={styles.row}>
          <View style={styles.frequencySection}>
            <IconSymbol name="calendar" size={16} color={Colors.light.text} />
            <ThemedText style={styles.frequencyLabel}>
              Clean every {cleaningFrequency} days
            </ThemedText>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  cleaningSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  cleaningLabel: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  frequencySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  frequencyLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
});