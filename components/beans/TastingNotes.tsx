import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
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
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Notes de dégustation</ThemedText>
      <ThemedView style={styles.tastingNotes}>
        {notes.map((note, index) => (
          <ThemedBadge key={index} variant="outline" size="default">
            {note}
          </ThemedBadge>
        ))}
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
  tastingNotes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
