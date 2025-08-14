import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import type { ActualMetrics, ActualParameters } from "@/lib/services/brewprints";
import React from "react";
import { StyleSheet } from "react-native";

interface ResultsCardProps {
  actualParameters?: ActualParameters;
  actualMetrics?: ActualMetrics;
  rating?: number;
  tastingNotes?: string[];
  brewingNotes?: string;
  brewDate?: string;
}

export function ResultsCard({
  actualParameters,
  actualMetrics,
  rating,
  tastingNotes,
  brewingNotes,
  brewDate,
}: ResultsCardProps) {
  const hasResults = actualParameters || actualMetrics || rating || tastingNotes?.length || brewingNotes || brewDate;

  if (!hasResults) {
    return (
      <ThemedView style={styles.card}>
        <ThemedText style={styles.cardTitle}>Résultats du test</ThemedText>
        <ThemedView noBackground style={styles.noResultsContainer}>
          <ThemedText style={styles.noResultsText}>
            Aucun résultat enregistré
          </ThemedText>
          <ThemedText style={styles.noResultsSubtext}>
            Testez cette recette et enregistrez vos observations
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m${remainingSeconds}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRatingStars = () => {
    if (!rating) return null;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <ThemedText key={i} style={[
          styles.star,
          i <= rating ? styles.starFilled : styles.starEmpty
        ]}>
          ★
        </ThemedText>
      );
    }
    return stars;
  };

  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.cardTitle}>Résultats du test</ThemedText>
      
      {brewDate && (
        <ThemedView noBackground style={styles.brewDate}>
          <ThemedText style={styles.brewDateText}>
            Testé le {formatDate(brewDate)}
          </ThemedText>
        </ThemedView>
      )}

      {rating && (
        <ThemedView noBackground style={styles.ratingSection}>
          <ThemedText style={styles.sectionLabel}>Évaluation</ThemedText>
          <ThemedView noBackground style={styles.ratingContainer}>
            {getRatingStars()}
            <ThemedText style={styles.ratingText}>({rating}/5)</ThemedText>
          </ThemedView>
        </ThemedView>
      )}

      {actualParameters && (
        <ThemedView noBackground style={styles.section}>
          <ThemedText style={styles.sectionLabel}>Paramètres utilisés</ThemedText>
          <ThemedView noBackground style={styles.parametersGrid}>
            <ThemedView noBackground style={styles.parameterItem}>
              <ThemedText style={styles.parameterLabel}>Café</ThemedText>
              <ThemedText style={styles.parameterValue}>{actualParameters.coffee_grams}g</ThemedText>
            </ThemedView>
            <ThemedView noBackground style={styles.parameterItem}>
              <ThemedText style={styles.parameterLabel}>Eau</ThemedText>
              <ThemedText style={styles.parameterValue}>{actualParameters.water_grams}g</ThemedText>
            </ThemedView>
            <ThemedView noBackground style={styles.parameterItem}>
              <ThemedText style={styles.parameterLabel}>Température</ThemedText>
              <ThemedText style={styles.parameterValue}>{actualParameters.water_temp}°C</ThemedText>
            </ThemedView>
            {actualParameters.grind_setting && (
              <ThemedView noBackground style={styles.parameterItem}>
                <ThemedText style={styles.parameterLabel}>Mouture</ThemedText>
                <ThemedText style={styles.parameterValue}>{actualParameters.grind_setting}</ThemedText>
              </ThemedView>
            )}
            {actualParameters.total_time && (
              <ThemedView noBackground style={styles.parameterItem}>
                <ThemedText style={styles.parameterLabel}>Temps total</ThemedText>
                <ThemedText style={styles.parameterValue}>{formatTime(actualParameters.total_time)}</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      )}

      {actualMetrics && (
        <ThemedView noBackground style={styles.section}>
          <ThemedText style={styles.sectionLabel}>Mesures</ThemedText>
          <ThemedView noBackground style={styles.parametersGrid}>
            {actualMetrics.tds && (
              <ThemedView noBackground style={styles.parameterItem}>
                <ThemedText style={styles.parameterLabel}>TDS</ThemedText>
                <ThemedText style={styles.parameterValue}>{actualMetrics.tds}%</ThemedText>
              </ThemedView>
            )}
            {actualMetrics.extraction_yield && (
              <ThemedView noBackground style={styles.parameterItem}>
                <ThemedText style={styles.parameterLabel}>Extraction</ThemedText>
                <ThemedText style={styles.parameterValue}>{actualMetrics.extraction_yield}%</ThemedText>
              </ThemedView>
            )}
            {actualMetrics.brew_strength && (
              <ThemedView noBackground style={styles.parameterItem}>
                <ThemedText style={styles.parameterLabel}>Force</ThemedText>
                <ThemedText style={styles.parameterValue}>{actualMetrics.brew_strength} mg/ml</ThemedText>
              </ThemedView>
            )}
            {actualMetrics.final_volume && (
              <ThemedView noBackground style={styles.parameterItem}>
                <ThemedText style={styles.parameterLabel}>Volume final</ThemedText>
                <ThemedText style={styles.parameterValue}>{actualMetrics.final_volume}ml</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      )}

      {tastingNotes && tastingNotes.length > 0 && (
        <ThemedView noBackground style={styles.section}>
          <ThemedText style={styles.sectionLabel}>Notes de dégustation</ThemedText>
          <ThemedView noBackground style={styles.tastingNotesContainer}>
            {tastingNotes.map((note, index) => (
              <ThemedBadge key={index} variant="outline" size="sm">
                {note}
              </ThemedBadge>
            ))}
          </ThemedView>
        </ThemedView>
      )}

      {brewingNotes && (
        <ThemedView noBackground style={styles.section}>
          <ThemedText style={styles.sectionLabel}>Notes de brassage</ThemedText>
          <ThemedText style={styles.brewingNotesText}>{brewingNotes}</ThemedText>
        </ThemedView>
      )}
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
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
  noResultsSubtext: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 4,
  },
  brewDate: {
    marginBottom: 12,
  },
  brewDateText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.7,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  star: {
    fontSize: 16,
  },
  starFilled: {
    color: Colors.dark.success,
  },
  starEmpty: {
    color: Colors.dark.cardBackgroundSecondary,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.7,
    marginLeft: 8,
  },
  parametersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  parameterItem: {
    minWidth: "45%",
    gap: 2,
  },
  parameterLabel: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  tastingNotesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  brewingNotesText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
});