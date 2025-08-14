import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet } from "react-native";

interface StatusCardsProps {
  method: string;
  difficulty: number;
  status: string;
  rating?: number;
}

export function StatusCards({
  method,
  difficulty,
  status,
  rating,
}: StatusCardsProps) {
  const getMethodDisplay = (): string => {
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

  const getDifficultyDisplay = (): string => {
    const levels: Record<number, string> = {
      1: 'Facile',
      2: 'Intermédiaire',
      3: 'Avancé',
    };
    return levels[difficulty] || 'Inconnu';
  };

  const getDifficultyVariant = ():
    | "secondary"
    | "default"
    | "warning" => {
    switch (difficulty) {
      case 1:
        return "secondary";
      case 2:
        return "default";
      case 3:
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusVariant = ():
    | "secondary"
    | "success"
    | "default"
    | "warning"
    | "destructive" => {
    switch (status) {
      case "experimenting":
        return "warning";
      case "final":
        return "success";
      case "archived":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (): string => {
    const labels: Record<string, string> = {
      "experimenting": "Test",
      "final": "Final",
      "archived": "Archivé",
    };
    return labels[status] || status;
  };

  const getRatingDots = () => {
    if (!rating) return null;
    
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <ThemedView
          key={i}
          style={[
            styles.ratingDot,
            i <= rating ? styles.ratingDotFilled : styles.ratingDotEmpty
          ]}
        />
      );
    }
    return dots;
  };

  return (
    <ThemedView noBackground style={styles.statusRow}>
      <ThemedView noBackground style={styles.column}>
        <ThemedText style={styles.columnTitle}>Méthode</ThemedText>
        <ThemedText style={styles.statusValue}>
          {getMethodDisplay()}
        </ThemedText>
      </ThemedView>

      <ThemedView noBackground style={styles.column}>
        <ThemedText style={styles.columnTitle}>Difficulté</ThemedText>
        <ThemedBadge variant={getDifficultyVariant() as any} size="sm">
          {getDifficultyDisplay()}
        </ThemedBadge>
      </ThemedView>

      <ThemedView noBackground style={styles.column}>
        <ThemedText style={styles.columnTitle}>Statut</ThemedText>
        <ThemedBadge variant={getStatusVariant() as any} size="sm">
          {getStatusLabel()}
        </ThemedBadge>
      </ThemedView>

      {rating && (
        <ThemedView noBackground style={styles.column}>
          <ThemedText style={styles.columnTitle}>Note</ThemedText>
          <ThemedView noBackground style={styles.ratingContainer}>
            {getRatingDots()}
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  column: {
    alignItems: "flex-start",
    gap: 6,
    flex: 1,
  },
  columnTitle: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ratingDotFilled: {
    backgroundColor: Colors.dark.success,
  },
  ratingDotEmpty: {
    backgroundColor: Colors.dark.cardBackgroundSecondary,
  },
});