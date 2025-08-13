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
    <ThemedView style={styles.descriptionCard}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <ThemedText style={styles.descriptionText}>{content}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  descriptionCard: {
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
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
});
