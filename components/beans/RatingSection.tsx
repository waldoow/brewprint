import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet } from "react-native";

interface RatingSectionProps {
  rating: number;
}

export function RatingSection({ rating }: RatingSectionProps) {
  const iconColor = useThemeColor({}, "icon");
  const textColor = useThemeColor({}, "text");

  return (
    <ThemedView style={styles.ratingCard}>
      <ThemedText style={styles.sectionTitle}>Ma note</ThemedText>
      <ThemedView noBackground style={styles.ratingContainer}>
        <ThemedView noBackground style={styles.circlesContainer}>
          {[1, 2, 3, 4, 5].map((circle) => (
            <ThemedView key={circle} style={styles.circleWrapper}>
              {/* Outer Ring */}
              <ThemedView
                style={[
                  styles.outerRing,
                  {
                    borderColor: circle <= rating ? textColor : iconColor,
                  },
                ]}
              />
              {/* Inner Circle */}
              <ThemedView
                style={[
                  styles.innerCircle,
                  {
                    backgroundColor: circle <= rating ? textColor : "transparent",
                  },
                ]}
              />
            </ThemedView>
          ))}
        </ThemedView>
        <ThemedText style={styles.ratingText}>{rating}/5</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  ratingCard: {
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
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circlesContainer: {
    flexDirection: "row",
    gap: 4,
  },
  circleWrapper: {
    position: "relative",
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  outerRing: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
  },
});
