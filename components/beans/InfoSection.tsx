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
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <ThemedView style={styles.infoCard}>
        {rows.map((row, index) => {
          const IconComponent = row.icon;
          return (
            <React.Fragment key={index}>
              <ThemedView style={styles.infoRow}>
                <IconComponent
                  size={16}
                  color={iconColor}
                  style={styles.infoIcon}
                />
                <ThemedView style={styles.infoContent}>
                  <ThemedText style={styles.infoLabel}>{row.label}</ThemedText>
                  <ThemedText style={styles.infoValue}>{row.value}</ThemedText>
                </ThemedView>
              </ThemedView>
              {index < rows.length - 1 && (
                <ThemedSeparator size="sm" verticalMargin={8} />
              )}
            </React.Fragment>
          );
        })}
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
  infoCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardBackgroundSecondary,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIcon: {
    opacity: 0.7,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
});
