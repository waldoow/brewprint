import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet } from "react-native";

interface TastingNotesProps {
  notes: string[];
}

export function TastingNotes({ notes }: TastingNotesProps) {
  if (!notes || notes.length === 0) {
    return null;
  }

  return (
    <ThemedView style={styles.tastingCard}>
      <ThemedText style={styles.sectionTitle}>Notes de dégustation</ThemedText>
      <ThemedView noBackground style={styles.tastingNotes}>
        {notes.map((note, index) => (
          <ThemedBadge key={index} variant="outline" size="sm">
            {note}
          </ThemedBadge>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tastingCard: {
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
  tastingNotes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
});
