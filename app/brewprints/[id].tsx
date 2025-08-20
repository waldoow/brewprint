import { Header } from "@/components/ui/Header";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { StatusCards } from "@/components/brewprints/StatusCards";
import { ParametersCard } from "@/components/brewprints/ParametersCard";
import { StepsCard } from "@/components/brewprints/StepsCard";
import { ResultsCard } from "@/components/brewprints/ResultsCard";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, Alert, Share } from "react-native";
import { toast } from "sonner-native";

export default function BrewprintDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [brewprint, setBrewprint] = useState<Brewprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBrewprint = useCallback(async () => {
    if (!id) return;
    
    try {
      const result = await BrewprintsService.getBrewprintById(id);
      if (result.success && result.data) {
        setBrewprint(result.data);
      } else {
        Alert.alert("Erreur", "Impossible de charger la recette");
        router.back();
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useFocusEffect(
    useCallback(() => {
      loadBrewprint();
    }, [loadBrewprint])
  );

  const handleMarkAsFinal = async () => {
    if (!brewprint) return;

    try {
      const result = await BrewprintsService.markAsFinal(brewprint.id);
      if (result.success && result.data) {
        setBrewprint(result.data);
        toast.success("Recette marquée comme finale!");
      } else {
        Alert.alert("Erreur", "Impossible de marquer comme finale");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite");
    }
  };

  const handleArchive = async () => {
    if (!brewprint) return;

    Alert.alert(
      "Archiver la recette",
      "Cette recette sera déplacée vers les archives. Continuer?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Archiver",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await BrewprintsService.archiveBrewprint(brewprint.id);
              if (result.success) {
                toast.success("Recette archivée");
                router.back();
              } else {
                Alert.alert("Erreur", "Impossible d'archiver la recette");
              }
            } catch (error) {
              Alert.alert("Erreur", "Une erreur s'est produite");
            }
          }
        }
      ]
    );
  };

  const handleDelete = async () => {
    if (!brewprint) return;

    Alert.alert(
      "Supprimer la recette",
      "Cette action est irréversible. Êtes-vous sûr?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await BrewprintsService.deleteBrewprint(brewprint.id);
              if (result.success) {
                toast.success("Recette supprimée");
                router.back();
              } else {
                Alert.alert("Erreur", "Impossible de supprimer la recette");
              }
            } catch (error) {
              Alert.alert("Erreur", "Une erreur s'est produite");
            }
          }
        }
      ]
    );
  };

  const handleCreateIteration = async () => {
    if (!brewprint) return;

    try {
      const result = await BrewprintsService.createExperimentIteration(
        brewprint.id,
        {
          version_notes: "Nouvelle itération basée sur " + brewprint.version
        }
      );
      
      if (result.success && result.data) {
        toast.success("Nouvelle itération créée!");
        router.push(`/brewprints/${result.data.id}`);
      } else {
        Alert.alert("Erreur", "Impossible de créer l'itération");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite");
    }
  };

  const handleDuplicate = async () => {
    if (!brewprint) return;

    try {
      // Navigate to the new brewprint form with this brewprint as a template
      router.push({
        pathname: "/brewprints/new",
        params: { 
          template: JSON.stringify({
            name: `${brewprint.name} (Copy)`,
            description: brewprint.description,
            method: brewprint.method,
            difficulty: brewprint.difficulty,
            parameters: brewprint.parameters,
            steps: brewprint.steps,
            beans_id: brewprint.beans_id,
            grinder_id: brewprint.grinder_id,
            brewer_id: brewprint.brewer_id,
            water_profile_id: brewprint.water_profile_id,
          })
        }
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de dupliquer la recette");
    }
  };

  const handleStartBrewing = () => {
    if (!brewprint) return;
    router.push(`/brewing/${brewprint.id}`);
  };

  const handleShare = async () => {
    if (!brewprint) return;

    const calculateRatio = () => {
      const ratio = brewprint.parameters.water_grams / brewprint.parameters.coffee_grams;
      return `1:${ratio.toFixed(1)}`;
    };

    const shareContent = `
📖 ${brewprint.name}
${brewprint.description ? `\n${brewprint.description}\n` : ''}
🔧 Méthode: ${brewprint.method.toUpperCase()}
📏 Paramètres:
• ${brewprint.parameters.coffee_grams}g café / ${brewprint.parameters.water_grams}g eau (${calculateRatio()})
• Température: ${brewprint.parameters.water_temp}°C
${brewprint.rating ? `\n⭐ Note: ${brewprint.rating}/5` : ''}

Créé avec Brewprint ☕
`.trim();

    try {
      await Share.share({
        message: shareContent,
        title: `Recette: ${brewprint.name}`,
      });
    } catch (error) {
      console.error("Erreur de partage:", error);
    }
  };

  if (isLoading) {
    return (
      <ThemedView noBackground={false} style={styles.container}>
        <Header title="Chargement..." showBackButton={true} onBackPress={() => router.back()} />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Chargement de la recette...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!brewprint) {
    return (
      <ThemedView noBackground={false} style={styles.container}>
        <Header title="Erreur" showBackButton={true} onBackPress={() => router.back()} />
        <ThemedView style={styles.errorContainer}>
          <ThemedText>Recette introuvable</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  const getActionButtons = () => {
    const primaryActions = [];
    const secondaryActions = [];

    // Start Brewing button (primary action)
    primaryActions.push(
      <ThemedButton
        key="brew"
        title="🚀 Start Brewing"
        variant="default"
        onPress={handleStartBrewing}
        style={styles.primaryActionButton}
      />
    );

    // Secondary actions
    secondaryActions.push(
      <ThemedButton
        key="duplicate"
        title="Duplicate"
        variant="outline"
        onPress={handleDuplicate}
        style={styles.actionButton}
      />
    );

    secondaryActions.push(
      <ThemedButton
        key="iterate"
        title="New Iteration"
        variant="outline"
        onPress={handleCreateIteration}
        style={styles.actionButton}
      />
    );

    // Mark as final button (only for experimenting recipes)
    if (brewprint.status === "experimenting") {
      secondaryActions.push(
        <ThemedButton
          key="final"
          title="Mark as Final"
          variant="secondary"
          onPress={handleMarkAsFinal}
          style={styles.actionButton}
        />
      );
    }

    // Archive button (not for archived recipes)
    if (brewprint.status !== "archived") {
      secondaryActions.push(
        <ThemedButton
          key="archive"
          title="Archive Recipe"
          variant="secondary"
          onPress={handleArchive}
          style={styles.actionButton}
        />
      );
    }

    return (
      <ThemedView noBackground style={styles.actionsWrapper}>
        <ThemedView noBackground style={styles.primaryActionsContainer}>
          {primaryActions}
        </ThemedView>
        <ThemedView noBackground style={styles.secondaryActionsContainer}>
          {secondaryActions}
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <ThemedView noBackground={false} style={styles.container}>
      <Header
        title={brewprint.name}
        subtitle={`${brewprint.method.toUpperCase()} • ${brewprint.version}`}
        showBackButton={true}
        onBackPress={() => router.back()}
        backButtonTitle="Recipes"
        customContent={
          <ThemedButton
            size="sm"
            variant="ghost"
            onPress={handleShare}
          >
            Partager
          </ThemedButton>
        }
      />

      <ThemedScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
      >
        <ThemedView noBackground style={styles.content}>
          {/* Hero Section */}
          <ThemedView style={styles.heroSection}>
            <StatusCards
              method={brewprint.method}
              difficulty={brewprint.difficulty}
              status={brewprint.status}
              rating={brewprint.rating}
            />

            {/* Quick Stats */}
            <ThemedView style={styles.quickStatsContainer}>
              <ThemedView style={styles.quickStat}>
                <ThemedText style={styles.quickStatValue}>
                  {brewprint.parameters.coffee_grams}g : {brewprint.parameters.water_grams}g
                </ThemedText>
                <ThemedText style={styles.quickStatLabel}>Ratio</ThemedText>
              </ThemedView>
              <ThemedView style={styles.quickStat}>
                <ThemedText style={styles.quickStatValue}>
                  {brewprint.parameters.water_temp}°C
                </ThemedText>
                <ThemedText style={styles.quickStatLabel}>Température</ThemedText>
              </ThemedView>
              {brewprint.parameters.total_time && (
                <ThemedView style={styles.quickStat}>
                  <ThemedText style={styles.quickStatValue}>
                    {Math.floor(brewprint.parameters.total_time / 60)}:{String(brewprint.parameters.total_time % 60).padStart(2, '0')}
                  </ThemedText>
                  <ThemedText style={styles.quickStatLabel}>Temps</ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>

          {/* Description */}
          {brewprint.description && (
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Description</ThemedText>
              <ThemedView style={styles.descriptionCard}>
                <ThemedText style={styles.descriptionText}>
                  {brewprint.description}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}

          {/* Parameters Section */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Paramètres de Brassage</ThemedText>
            <ParametersCard
              title=""
              coffeeGrams={brewprint.parameters.coffee_grams}
              waterGrams={brewprint.parameters.water_grams}
              waterTemp={brewprint.parameters.water_temp}
              grindSetting={brewprint.parameters.grind_setting}
              totalTime={brewprint.parameters.total_time}
            />
          </ThemedView>

          {/* Steps Section */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Étapes de Brassage</ThemedText>
            <StepsCard steps={brewprint.steps} />
          </ThemedView>

          {/* Results Section */}
          {(brewprint.actual_parameters || brewprint.actual_metrics || brewprint.tasting_notes || brewprint.brewing_notes) && (
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Résultats</ThemedText>
              <ResultsCard
                actualParameters={brewprint.actual_parameters}
                actualMetrics={brewprint.actual_metrics}
                rating={brewprint.rating}
                tastingNotes={brewprint.tasting_notes}
                brewingNotes={brewprint.brewing_notes}
                brewDate={brewprint.brew_date}
              />
            </ThemedView>
          )}

          {/* Action Buttons */}
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Actions</ThemedText>
            {getActionButtons()}
          </ThemedView>

          {/* Danger Zone */}
          <ThemedView style={styles.dangerZone}>
            <ThemedText style={styles.dangerZoneTitle}>Danger Zone</ThemedText>
            <ThemedButton
              title="Delete Recipe"
              variant="destructive"
              onPress={handleDelete}
            />
          </ThemedView>
        </ThemedView>
      </ThemedScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Hero Section
  heroSection: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  quickStat: {
    alignItems: "center",
    gap: 4,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  quickStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#ffffff",
  },
  
  // Description
  descriptionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.9,
  },
  
  // Actions
  actionsWrapper: {
    gap: 16,
  },
  primaryActionsContainer: {
    gap: 12,
  },
  secondaryActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
  },
  primaryActionButton: {
    width: "100%",
  },
  
  // Danger Zone
  dangerZone: {
    backgroundColor: "rgba(255, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.2)",
  },
  dangerZoneTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff4444",
    marginBottom: 12,
  },
});