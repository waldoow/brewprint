import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import type { BrewStep } from "@/lib/services/brewprints";
import React from "react";
import { StyleSheet } from "react-native";

interface StepsCardProps {
  steps: BrewStep[];
}

export function StepsCard({ steps }: StepsCardProps) {
  if (!steps || steps.length === 0) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m${remainingSeconds}s`;
  };

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.cardTitle}>Étapes de préparation</ThemedText>
      
      <ThemedView noBackground style={styles.stepsContainer}>
        {sortedSteps.map((step, index) => (
          <ThemedView key={step.id} noBackground style={styles.stepItem}>
            <ThemedView noBackground style={styles.stepHeader}>
              <ThemedView style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
              </ThemedView>
              
              <ThemedView noBackground style={styles.stepInfo}>
                <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                <ThemedView noBackground style={styles.stepMeta}>
                  {step.duration > 0 && (
                    <ThemedText style={styles.stepMetaText}>
                      ⏱️ {formatTime(step.duration)}
                    </ThemedText>
                  )}
                  {step.water_amount > 0 && (
                    <ThemedText style={styles.stepMetaText}>
                      💧 {step.water_amount}g
                    </ThemedText>
                  )}
                  {step.technique && (
                    <ThemedText style={styles.stepMetaText}>
                      🔄 {step.technique}
                    </ThemedText>
                  )}
                </ThemedView>
              </ThemedView>
            </ThemedView>
            
            {step.description && (
              <ThemedText style={styles.stepDescription}>
                {step.description}
              </ThemedText>
            )}
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBackgroundSecondary,
    padding: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  stepsContainer: {
    gap: 12,
  },
  stepItem: {
    gap: 8,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.cardBackgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "600",
  },
  stepInfo: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  stepMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stepMetaText: {
    fontSize: 12,
    opacity: 0.7,
  },
  stepDescription: {
    fontSize: 13,
    opacity: 0.8,
    marginLeft: 36, // Align with step info
    lineHeight: 18,
  },
});