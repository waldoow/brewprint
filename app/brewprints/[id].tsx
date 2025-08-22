import { Header } from "@/components/ui/Header";
import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  Coffee,
  Droplets,
  SlidersHorizontal,
  Thermometer,
  Timer as TimerIcon,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Share,
  StyleSheet,
  type AlertButton,
} from "react-native";
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
    } catch {
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
    } catch {
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
              const result = await BrewprintsService.archiveBrewprint(
                brewprint.id
              );
              if (result.success) {
                toast.success("Recette archivée");
                router.back();
              } else {
                Alert.alert("Erreur", "Impossible d'archiver la recette");
              }
            } catch {
              Alert.alert("Erreur", "Une erreur s'est produite");
            }
          },
        },
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
              const result = await BrewprintsService.deleteBrewprint(
                brewprint.id
              );
              if (result.success) {
                toast.success("Recette supprimée");
                router.back();
              } else {
                Alert.alert("Erreur", "Impossible de supprimer la recette");
              }
            } catch {
              Alert.alert("Erreur", "Une erreur s'est produite");
            }
          },
        },
      ]
    );
  };

  const handleCreateIteration = async () => {
    if (!brewprint) return;

    try {
      const result = await BrewprintsService.createExperimentIteration(
        brewprint.id,
        {
          version_notes: "Nouvelle itération basée sur " + brewprint.version,
        }
      );

      if (result.success && result.data) {
        toast.success("Nouvelle itération créée!");
        router.push(`/brewprints/${result.data.id}`);
      } else {
        Alert.alert("Erreur", "Impossible de créer l'itération");
      }
    } catch {
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
            bean_id: brewprint.bean_id,
            grinder_id: brewprint.grinder_id,
            brewer_id: brewprint.brewer_id,
            water_profile_id: brewprint.water_profile_id,
          }),
        },
      });
    } catch {
      Alert.alert("Erreur", "Impossible de dupliquer la recette");
    }
  };

  const handleStartBrewing = () => {
    if (!brewprint) return;
    router.push(`/brewing/${brewprint.id}`);
  };

  const showActionSheet = () => {
    if (!brewprint) return;

    // Build dynamic options and handlers to avoid brittle index mapping
    const options: string[] = [];
    const handlers: (() => void)[] = [];

    const addOption = (label: string, handler: () => void) => {
      options.push(label);
      handlers.push(handler);
    };

    addOption("Share Recipe", () => {
      void handleShare();
    });
    addOption("Duplicate Recipe", () => {
      void handleDuplicate();
    });
    addOption("Create New Iteration", () => {
      void handleCreateIteration();
    });

    if (brewprint.status === "experimenting") {
      addOption("Mark as Final", () => {
        void handleMarkAsFinal();
      });
    }
    if (brewprint.status !== "archived") {
      addOption("Archive Recipe", () => {
        void handleArchive();
      });
    }

    const deleteIndex = options.length;
    addOption("Delete Recipe", () => {
      void handleDelete();
    });

    const cancelIndex = options.length;
    options.push("Cancel");

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: deleteIndex,
          cancelButtonIndex: cancelIndex,
          title: "Recipe Actions",
        },
        (buttonIndex) => {
          if (buttonIndex !== cancelIndex) {
            const fn = handlers[buttonIndex];
            if (fn) fn();
          }
        }
      );
    } else {
      // For Android, use Alert with typed action buttons
      const alertActions: AlertButton[] = [];
      alertActions.push({
        text: "Share Recipe",
        onPress: () => {
          void handleShare();
        },
      });
      alertActions.push({
        text: "Duplicate Recipe",
        onPress: () => {
          void handleDuplicate();
        },
      });
      alertActions.push({
        text: "Create New Iteration",
        onPress: () => {
          void handleCreateIteration();
        },
      });
      if (brewprint.status === "experimenting") {
        alertActions.push({
          text: "Mark as Final",
          onPress: () => {
            void handleMarkAsFinal();
          },
        });
      }
      if (brewprint.status !== "archived") {
        alertActions.push({
          text: "Archive Recipe",
          onPress: () => {
            void handleArchive();
          },
        });
      }
      alertActions.push({
        text: "Delete Recipe",
        onPress: () => {
          void handleDelete();
        },
        style: "destructive",
      });
      alertActions.push({ text: "Cancel", style: "cancel" });

      Alert.alert("Recipe Actions", "Choose an action", alertActions);
    }
  };

  const handleShare = async () => {
    if (!brewprint) return;

    const calculateRatio = () => {
      const ratio =
        brewprint.parameters.water_grams / brewprint.parameters.coffee_grams;
      return `1:${ratio.toFixed(1)}`;
    };

    const shareContent = `
📖 ${brewprint.name}
${brewprint.description ? `\n${brewprint.description}\n` : ""}
🔧 Méthode: ${brewprint.method.toUpperCase()}
📏 Paramètres:
• ${brewprint.parameters.coffee_grams}g café / ${
      brewprint.parameters.water_grams
    }g eau (${calculateRatio()})
• Température: ${brewprint.parameters.water_temp}°C
${brewprint.rating ? `\n⭐ Note: ${brewprint.rating}/5` : ""}

Créé avec Brewprint ☕
`.trim();

    try {
      await Share.share({
        message: shareContent,
        title: `Recette: ${brewprint.name}`,
      });
    } catch {
      // ignored
    }
  };

  if (isLoading) {
    return (
      <ThemedView noBackground={false} style={styles.container}>
        <Header
          title="Chargement..."
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Chargement de la recette...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  if (!brewprint) {
    return (
      <ThemedView noBackground={false} style={styles.container}>
        <Header
          title="Erreur"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <ThemedView style={styles.errorContainer}>
          <ThemedText>Recette introuvable</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

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
            title="⋮"
            size="sm"
            variant="ghost"
            onPress={showActionSheet}
          />
        }
      />

      <ThemedScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
      >
        <ThemedView noBackground style={styles.content}>
          {/* Hero Section */}
          <LinearGradient
            colors={["#1f1b2e", "#0f0c16"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <ThemedView noBackground style={styles.heroHeaderRow}>
              <ThemedBadge
                variant={
                  brewprint.status === "final"
                    ? "success"
                    : brewprint.status === "archived"
                    ? "secondary"
                    : "warning"
                }
                size="sm"
              >
                {brewprint.status === "final"
                  ? "Final"
                  : brewprint.status === "archived"
                  ? "Archived"
                  : "Experiment"}
              </ThemedBadge>
              {typeof brewprint.rating === "number" && (
                <ThemedText type="defaultSemiBold" style={styles.ratingText}>
                  {brewprint.rating}/5
                </ThemedText>
              )}
            </ThemedView>
            <ThemedText type="title" style={styles.heroTitle}>
              {brewprint.name}
            </ThemedText>
            <ThemedText type="caption" style={styles.heroSubtitle}>
              {brewprint.method.toUpperCase()} • {brewprint.version}
            </ThemedText>

            <ThemedView noBackground style={styles.heroActions}>
              <ThemedButton
                title="Start Brewing"
                size="lg"
                onPress={handleStartBrewing}
                style={styles.heroBrewButton}
              />
              <ThemedButton
                title="Share"
                variant="outline"
                size="lg"
                onPress={handleShare}
              />
            </ThemedView>
          </LinearGradient>

          {/* Stats Card */}
          <ThemedView noBackground style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardHeader}>
              Parameters
            </ThemedText>
            <ThemedView noBackground style={styles.statsGrid}>
              <ThemedView noBackground style={styles.statItem}>
                <Coffee size={18} color="#8b5cf6" />
                <ThemedText type="caption" style={styles.statLabel}>
                  Coffee
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.statValue}>
                  {brewprint.parameters.coffee_grams}g
                </ThemedText>
              </ThemedView>

              <ThemedView noBackground style={styles.statItem}>
                <Droplets size={18} color="#8b5cf6" />
                <ThemedText type="caption" style={styles.statLabel}>
                  Water
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.statValue}>
                  {brewprint.parameters.water_grams}g
                </ThemedText>
              </ThemedView>

              <ThemedView noBackground style={styles.statItem}>
                <Droplets size={18} color="#8b5cf6" />
                <ThemedText type="caption" style={styles.statLabel}>
                  Ratio
                </ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.statValue, styles.accentDataValue]}
                >
                  1:
                  {(
                    brewprint.parameters.water_grams /
                    brewprint.parameters.coffee_grams
                  ).toFixed(1)}
                </ThemedText>
              </ThemedView>

              <ThemedView noBackground style={styles.statItem}>
                <Thermometer size={18} color="#8b5cf6" />
                <ThemedText type="caption" style={styles.statLabel}>
                  Temperature
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.statValue}>
                  {brewprint.parameters.water_temp}°C
                </ThemedText>
              </ThemedView>

              {brewprint.parameters.grind_setting && (
                <ThemedView noBackground style={styles.statItem}>
                  <SlidersHorizontal size={18} color="#8b5cf6" />
                  <ThemedText type="caption" style={styles.statLabel}>
                    Grind
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.statValue}>
                    {brewprint.parameters.grind_setting}
                  </ThemedText>
                </ThemedView>
              )}

              {brewprint.parameters.total_time && (
                <ThemedView noBackground style={styles.statItem}>
                  <TimerIcon size={18} color="#8b5cf6" />
                  <ThemedText type="caption" style={styles.statLabel}>
                    Time
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.statValue}>
                    {Math.floor(brewprint.parameters.total_time / 60)}:
                    {String(brewprint.parameters.total_time % 60).padStart(
                      2,
                      "0"
                    )}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>

          {/* Steps Card */}
          {brewprint.steps && brewprint.steps.length > 0 && (
            <ThemedView noBackground style={styles.card}>
              <ThemedText type="subtitle" style={styles.cardHeader}>
                Steps
              </ThemedText>
              <ThemedView noBackground style={styles.timeline}>
                {brewprint.steps.map((step, index) => (
                  <ThemedView
                    key={index}
                    noBackground
                    style={styles.timelineRow}
                  >
                    <ThemedView noBackground style={styles.timelineLeft}>
                      <ThemedView noBackground style={styles.timelineBullet}>
                        <ThemedText
                          type="caption"
                          style={styles.timelineNumber}
                        >
                          {index + 1}
                        </ThemedText>
                      </ThemedView>
                      {index < brewprint.steps.length - 1 && (
                        <ThemedView
                          noBackground
                          style={styles.timelineConnector}
                        />
                      )}
                    </ThemedView>

                    <ThemedView noBackground style={styles.timelineContent}>
                      <ThemedText type="body" style={styles.stepDescription}>
                        {step.description}
                      </ThemedText>
                      {(step.duration || step.water_amount) && (
                        <ThemedView noBackground style={styles.stepMeta}>
                          {step.duration && (
                            <ThemedText
                              type="caption"
                              style={styles.stepMetaText}
                            >
                              {step.duration}s
                            </ThemedText>
                          )}
                          {step.water_amount && (
                            <ThemedText
                              type="caption"
                              style={styles.stepMetaText}
                            >
                              {step.water_amount}g
                            </ThemedText>
                          )}
                        </ThemedView>
                      )}
                    </ThemedView>
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>
          )}
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
    paddingHorizontal: 4,
    paddingVertical: 16,
    gap: 32,
  },
  heroCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heroTitle: {
    marginBottom: 4,
  },
  heroSubtitle: {
    opacity: 0.8,
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  heroBrewButton: {
    backgroundColor: "#8b5cf6",
  },
  ratingText: {
    opacity: 0.9,
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

  // Primary Action
  primaryAction: {
    paddingTop: 8,
  },

  // Section Divider
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 16,
  },
  brewButton: {
    backgroundColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  // Data Section - Clean and minimal
  dataSection: {
    gap: 8,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.06)",
    gap: 8,
  },
  cardHeader: {
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  statLabel: {
    opacity: 0.7,
  },
  statValue: {
    marginTop: 2,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  primaryDataRow: {
    // Remove special styling for now
  },
  accentDataRow: {
    // Keep just a subtle highlight for ratio
    backgroundColor: "rgba(139, 92, 246, 0.03)",
    borderRadius: 6,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  dataLabel: {
    opacity: 0.7,
    minWidth: 80,
  },
  primaryDataValue: {
    // Remove color
  },
  accentDataValue: {
    color: "#8b5cf6",
  },
  methodValue: {
    // Remove color
  },
  ratingValue: {
    // Remove color
  },

  // Steps Section
  stepsSection: {
    gap: 12,
  },
  timeline: {
    gap: 12,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
  },
  timelineLeft: {
    alignItems: "center",
  },
  timelineBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineNumber: {
    fontSize: 12,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    marginTop: 2,
    marginBottom: 8,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  sectionHeader: {
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  stepNumber: {
    minWidth: 24,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  stepDescription: {
    flex: 1,
  },
  stepMeta: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  stepMetaText: {
    opacity: 0.7,
    fontSize: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
