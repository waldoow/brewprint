import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Star } from "lucide-react-native";
import React from "react";
import { StyleSheet } from "react-native";

interface RatingSectionProps {
  rating: number;
}

export function RatingSection({ rating }: RatingSectionProps) {
  const iconColor = useThemeColor({}, "icon");
  const warningColor = useThemeColor({}, "warning");

  return (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Ma note</ThemedText>
      <ThemedView style={styles.ratingContainer}>
        <ThemedView style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={24}
              color={star <= rating ? warningColor : iconColor}
              fill={star <= rating ? warningColor : "none"}
            />
          ))}
        </ThemedView>
        <ThemedText style={styles.ratingText}>{rating}/5 étoiles</ThemedText>
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
  ratingContainer: {
    alignItems: "center",
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    opacity: 0.7,
  },
});
