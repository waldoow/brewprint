import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import type { Brewprint } from "@/lib/services/brewprints";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface BrewprintCardProps {
  brewprint: Brewprint;
  onPress: () => void;
}

export function BrewprintCard({ brewprint, onPress }: BrewprintCardProps) {
  const getMethodDisplay = (method: string): string => {
    const methods: Record<string, string> = {
      'v60': 'V60',
      'chemex': 'Chemex',
      'french-press': 'French Press',
      'aeropress': 'AeroPress',
      'espresso': 'Espresso',
      'cold-brew': 'Cold Brew',
      'siphon': 'Siphon',
      'percolator': 'Percolator',
      'turkish': 'Turkish',
      'moka': 'Moka Pot',
    };
    return methods[method] || method;
  };

  const getDifficultyBadge = (difficulty: number) => {
    const variants = {
      1: "secondary" as const,
      2: "default" as const,
      3: "warning" as const,
    };
    
    const labels = {
      1: "Facile",
      2: "Intermédiaire", 
      3: "Avancé",
    };

    return (
      <ThemedBadge variant={variants[difficulty as keyof typeof variants]} size="sm">
        {labels[difficulty as keyof typeof labels]}
      </ThemedBadge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      experimenting: "warning" as const,
      final: "success" as const,
      archived: "secondary" as const,
    };
    
    const labels = {
      experimenting: "Test",
      final: "Final",
      archived: "Archivé",
    };

    return (
      <ThemedBadge 
        variant={variants[status as keyof typeof variants] || "default"} 
        size="sm"
      >
        {labels[status as keyof typeof labels] || status}
      </ThemedBadge>
    );
  };

  const getRatingStars = (rating?: number) => {
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
    return (
      <ThemedView noBackground style={styles.ratingContainer}>
        {stars}
      </ThemedView>
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const calculateRatio = (): string => {
    const { coffee_grams, water_grams } = brewprint.parameters;
    const ratioValue = water_grams / coffee_grams;
    return `1:${ratioValue.toFixed(1)}`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={styles.card}>
        {/* Header with status and badges */}
        <ThemedView noBackground style={styles.header}>
          <ThemedView noBackground style={styles.badgesContainer}>
            {getStatusBadge(brewprint.status)}
            {getDifficultyBadge(brewprint.difficulty)}
          </ThemedView>
          {brewprint.rating && getRatingStars(brewprint.rating)}
        </ThemedView>

        {/* Main content */}
        <ThemedView noBackground style={styles.content}>
          <ThemedText style={styles.brewprintName}>{brewprint.name}</ThemedText>
          
          <ThemedView noBackground style={styles.methodContainer}>
            <ThemedText style={styles.method}>
              {getMethodDisplay(brewprint.method)}
            </ThemedText>
            <ThemedText style={styles.version}>
              {brewprint.version}
            </ThemedText>
          </ThemedView>

          {brewprint.description && (
            <ThemedText style={styles.description} numberOfLines={2}>
              {brewprint.description}
            </ThemedText>
          )}
        </ThemedView>

        {/* Parameters summary */}
        <ThemedView noBackground style={styles.parametersRow}>
          <ThemedView noBackground style={styles.parameter}>
            <ThemedText style={styles.parameterValue}>
              {brewprint.parameters.coffee_grams}g
            </ThemedText>
            <ThemedText style={styles.parameterLabel}>café</ThemedText>
          </ThemedView>

          <ThemedView noBackground style={styles.parameter}>
            <ThemedText style={styles.parameterValue}>
              {brewprint.parameters.water_grams}g
            </ThemedText>
            <ThemedText style={styles.parameterLabel}>eau</ThemedText>
          </ThemedView>

          <ThemedView noBackground style={styles.parameter}>
            <ThemedText style={styles.parameterValue}>
              {calculateRatio()}
            </ThemedText>
            <ThemedText style={styles.parameterLabel}>ratio</ThemedText>
          </ThemedView>

          <ThemedView noBackground style={styles.parameter}>
            <ThemedText style={styles.parameterValue}>
              {brewprint.parameters.water_temp}°C
            </ThemedText>
            <ThemedText style={styles.parameterLabel}>temp</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Footer with date */}
        {(brewprint.brew_date || brewprint.created_at) && (
          <ThemedView noBackground style={styles.footer}>
            <ThemedText style={styles.dateText}>
              {brewprint.brew_date 
                ? `Testé le ${formatDate(brewprint.brew_date)}`
                : `Créé le ${formatDate(brewprint.created_at)}`
              }
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBackgroundSecondary,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  content: {
    marginBottom: 12,
    gap: 4,
  },
  brewprintName: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  methodContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  method: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.info,
  },
  version: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.6,
    backgroundColor: Colors.dark.cardBackgroundSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  description: {
    fontSize: 13,
    opacity: 0.8,
    lineHeight: 18,
  },
  parametersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  parameter: {
    alignItems: "center",
    gap: 2,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  parameterLabel: {
    fontSize: 10,
    fontWeight: "500",
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.dark.cardBackgroundSecondary,
    paddingTop: 8,
  },
  dateText: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 1,
  },
  star: {
    fontSize: 12,
  },
  starFilled: {
    color: Colors.dark.success,
  },
  starEmpty: {
    color: Colors.dark.cardBackgroundSecondary,
  },
});