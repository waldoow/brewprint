import { ThemedSeparator } from "@/components/ui/ThemedSeparator";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LucideIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet } from "react-native";

interface InfoRow {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface InfoSectionProps {
  title: string;
  rows: InfoRow[];
}

export function InfoSection({ title, rows }: InfoSectionProps) {
  const iconColor = useThemeColor({}, "icon");

  return (
    <ThemedView style={styles.infoCard}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {rows.map((row, index) => {
        const IconComponent = row.icon;
        return (
          <ThemedView noBackground key={index} style={styles.infoRow}>
            <IconComponent
              size={14}
              color={iconColor}
              style={styles.infoIcon}
            />
            <ThemedView noBackground style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>{row.label}:</ThemedText>
              <ThemedText style={styles.infoValue}>{row.value}</ThemedText>
            </ThemedView>
          </ThemedView>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBackgroundSecondary,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 2,
  },
  infoIcon: {
    opacity: 0.5,
  },
  infoContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.5,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
});
