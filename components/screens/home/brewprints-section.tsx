import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { BrewprintCard } from "@/components/brewprints/brewprint-card";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";

export function BrewprintsSection() {
  const router = useRouter();
  const [recentBrewprints, setRecentBrewprints] = useState<Brewprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentBrewprints();
  }, []);

  const loadRecentBrewprints = async () => {
    try {
      const result = await BrewprintsService.getAllBrewprints();
      if (result.success && result.data) {
        // Get the 3 most recent brewprints
        const recent = result.data.slice(0, 3);
        setRecentBrewprints(recent);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des recettes récentes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrewprintPress = (brewprint: Brewprint) => {
    router.push(`/brewprints/${brewprint.id}`);
  };

  const handleViewAll = () => {
    router.push("/brewprints");
  };

  const handleCreateNew = () => {
    router.push("/brewprints/new");
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.section}>
        <ThemedView noBackground style={styles.header}>
          <ThemedText style={styles.sectionTitle}>Mes Recettes</ThemedText>
        </ThemedView>
        <ThemedText style={styles.loadingText}>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.section}>
      <ThemedView noBackground style={styles.header}>
        <ThemedText style={styles.sectionTitle}>Mes Recettes</ThemedText>
        <ThemedView noBackground style={styles.headerActions}>
          <ThemedButton
            variant="outline"
            size="sm"
            onPress={handleCreateNew}
          >
            Nouvelle
          </ThemedButton>
          {recentBrewprints.length > 0 && (
            <ThemedButton
              variant="ghost"
              size="sm"
              onPress={handleViewAll}
            >
              Voir tout
            </ThemedButton>
          )}
        </ThemedView>
      </ThemedView>

      {recentBrewprints.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyTitle}>
            Aucune recette encore
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Créez votre première recette de café pour commencer à expérimenter
          </ThemedText>
          <ThemedButton
            onPress={handleCreateNew}
            style={styles.createButton}
          >
            Créer ma première recette
          </ThemedButton>
        </ThemedView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {recentBrewprints.map((brewprint, index) => (
            <ThemedView
              key={brewprint.id}
              style={[
                styles.brewprintContainer,
                index === recentBrewprints.length - 1 && styles.lastItem
              ]}
            >
              <BrewprintCard
                brewprint={brewprint}
                onPress={() => handleBrewprintPress(brewprint)}
              />
            </ThemedView>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    paddingVertical: 20,
  },
  emptyContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 20,
  },
  createButton: {
    marginTop: 8,
  },
  scrollView: {
    marginHorizontal: -16, // Extend to screen edges
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  brewprintContainer: {
    width: 280,
    marginRight: 12,
  },
  lastItem: {
    marginRight: 16,
  },
});