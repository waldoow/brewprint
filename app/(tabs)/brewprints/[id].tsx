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
        router.push(`/(tabs)/brewprints/${result.data.id}`);
      } else {
        Alert.alert("Erreur", "Impossible de créer l'itération");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite");
    }
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
    const buttons = [];

    // Create iteration button
    buttons.push(
      <ThemedButton
        key="iterate"
        variant="outline"
        onPress={handleCreateIteration}
        style={styles.actionButton}
      >
        Nouvelle itération
      </ThemedButton>
    );

    // Mark as final button (only for experimenting recipes)
    if (brewprint.status === "experimenting") {
      buttons.push(
        <ThemedButton
          key="final"
          variant="default"
          onPress={handleMarkAsFinal}
          style={styles.actionButton}
        >
          Marquer finale
        </ThemedButton>
      );
    }

    // Archive button (not for archived recipes)
    if (brewprint.status !== "archived") {
      buttons.push(
        <ThemedButton
          key="archive"
          variant="secondary"
          onPress={handleArchive}
          style={styles.actionButton}
        >
          Archiver
        </ThemedButton>
      );
    }

    return buttons;
  };

  return (
    <ThemedView style={styles.container}>
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

      <ThemedScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          {/* Status */}
          <StatusCards
            method={brewprint.method}
            difficulty={brewprint.difficulty}
            status={brewprint.status}
            rating={brewprint.rating}
          />

          {/* Description */}
          {brewprint.description && (
            <ThemedView style={styles.descriptionCard}>
              <ThemedText style={styles.descriptionText}>
                {brewprint.description}
              </ThemedText>
            </ThemedView>
          )}

          {/* Parameters */}
          <ParametersCard
            title="Paramètres cibles"
            coffeeGrams={brewprint.parameters.coffee_grams}
            waterGrams={brewprint.parameters.water_grams}
            waterTemp={brewprint.parameters.water_temp}
            grindSetting={brewprint.parameters.grind_setting}
            totalTime={brewprint.parameters.total_time}
          />

          {/* Steps */}
          <StepsCard steps={brewprint.steps} />

          {/* Results */}
          <ResultsCard
            actualParameters={brewprint.actual_parameters}
            actualMetrics={brewprint.actual_metrics}
            rating={brewprint.rating}
            tastingNotes={brewprint.tasting_notes}
            brewingNotes={brewprint.brewing_notes}
            brewDate={brewprint.brew_date}
          />

          {/* Action Buttons */}
          <ThemedView noBackground style={styles.actionsContainer}>
            {getActionButtons()}
          </ThemedView>

          {/* Danger Zone */}
          <ThemedView style={styles.dangerZone}>
            <ThemedText style={styles.dangerZoneTitle}>Zone de danger</ThemedText>
            <ThemedButton
              variant="destructive"
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              Supprimer définitivement
            </ThemedButton>
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
    padding: 16,
    paddingBottom: 32,
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
  descriptionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
  },
  dangerZone: {
    backgroundColor: "rgba(255, 0, 0, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.2)",
  },
  dangerZoneTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff4444",
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
  },
});