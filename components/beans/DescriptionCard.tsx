import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet } from "react-native";

interface DescriptionCardProps {
  title: string;
  content: string;
}

export function DescriptionCard({ title, content }: DescriptionCardProps) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <ThemedView style={styles.descriptionCard}>
        <ThemedText style={styles.descriptionText}>{content}</ThemedText>
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
  descriptionCard: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.cardBackgroundSecondary,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
});
