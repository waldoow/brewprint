import { ProfessionalContainer } from '@/components/ui/professional/Container';
import { ProfessionalHeader } from '@/components/ui/professional/Header';
import { ProfessionalCard } from '@/components/ui/professional/Card';
import { ProfessionalText } from '@/components/ui/professional/Text';
import { ProfessionalButton } from '@/components/ui/professional/Button';
import { BrewprintsService, type Brewprint } from "@/lib/services";
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
  View,
  type AlertButton,
} from "react-native";
import { toast } from "sonner-native";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BrewprintDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [brewprint, setBrewprint] = useState<Brewprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const loadBrewprint = useCallback(async () => {
    if (!id) return;

    try {
      const result = await BrewprintsService.getBrewprintById(id);
      if (result.success && result.data) {
        setBrewprint(result.data);
      } else {
        Alert.alert("Error", "Unable to load recipe");
        router.back();
      }
    } catch {
      Alert.alert("Error", "An error occurred");
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
        toast.success("Recipe marked as final!");
      } else {
        Alert.alert("Error", "Unable to mark as final");
      }
    } catch {
      Alert.alert("Error", "An error occurred");
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
              Alert.alert("Error", "An error occurred");
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
              Alert.alert("Error", "An error occurred");
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
      Alert.alert("Error", "An error occurred");
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
      <ProfessionalContainer>
        <ProfessionalHeader
          title="Loading..."
          action={{
            title: "Back",
            onPress: () => router.back(),
          }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ProfessionalText variant="body" color="secondary">
            Loading recipe...
          </ProfessionalText>
        </View>
      </ProfessionalContainer>
    );
  }

  if (!brewprint) {
    return (
      <ProfessionalContainer>
        <ProfessionalHeader
          title="Error"
          action={{
            title: "Back",
            onPress: () => router.back(),
          }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ProfessionalText variant="body" color="secondary">
            Recipe not found
          </ProfessionalText>
        </View>
      </ProfessionalContainer>
    );
  }

  return (
    <ProfessionalContainer scrollable>
      <ProfessionalHeader
        title={brewprint.name}
        subtitle={`${brewprint.method.toUpperCase()} • ${brewprint.version}`}
        action={{
          title: "Actions",
          onPress: showActionSheet,
        }}
      />

      {/* Status and Actions */}
      <ProfessionalCard variant="elevated" style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
          <View style={{
            backgroundColor: brewprint.status === 'final'
              ? theme.colors.success
              : brewprint.status === 'archived'
              ? theme.colors.gray[400]
              : theme.colors.warning,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <ProfessionalText variant="caption" color="inverse">
              {brewprint.status === 'final'
                ? 'FINAL'
                : brewprint.status === 'archived'
                ? 'ARCHIVED'
                : 'EXPERIMENT'}
            </ProfessionalText>
          </View>
          {typeof brewprint.rating === 'number' && (
            <ProfessionalText variant="body" weight="semibold">
              {brewprint.rating}/5 ★
            </ProfessionalText>
          )}
        </View>
        
        <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
          <ProfessionalButton
            title="Start Brewing"
            variant="primary"
            onPress={handleStartBrewing}
            style={{ flex: 1 }}
          />
          <ProfessionalButton
            title="Share"
            variant="secondary"
            onPress={handleShare}
            style={{ flex: 1 }}
          />
        </View>
      </ProfessionalCard>

      {/* Parameters */}
      <ProfessionalCard variant="default">
        <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: theme.spacing.md }}>
          Parameters
        </ProfessionalText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
          <View style={{ width: '48%', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.borderSubtle }}>
            <Coffee size={18} color={theme.colors.gray[500]} style={{ marginBottom: theme.spacing.xs }} />
            <ProfessionalText variant="caption" color="tertiary">
              Coffee
            </ProfessionalText>
            <ProfessionalText variant="body" weight="semibold">
              {brewprint.parameters.coffee_grams}g
            </ProfessionalText>
          </View>

          <View style={{ width: '48%', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.borderSubtle }}>
            <Droplets size={18} color={theme.colors.gray[500]} style={{ marginBottom: theme.spacing.xs }} />
            <ProfessionalText variant="caption" color="tertiary">
              Water
            </ProfessionalText>
            <ProfessionalText variant="body" weight="semibold">
              {brewprint.parameters.water_grams}g
            </ProfessionalText>
          </View>

          <View style={{ width: '48%', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.borderSubtle }}>
            <ProfessionalText variant="caption" color="tertiary">
              Ratio
            </ProfessionalText>
            <ProfessionalText variant="body" weight="semibold">
              1:{(
                brewprint.parameters.water_grams /
                brewprint.parameters.coffee_grams
              ).toFixed(1)}
            </ProfessionalText>
          </View>

          <View style={{ width: '48%', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.borderSubtle }}>
            <Thermometer size={18} color={theme.colors.gray[500]} style={{ marginBottom: theme.spacing.xs }} />
            <ProfessionalText variant="caption" color="tertiary">
              Temperature
            </ProfessionalText>
            <ProfessionalText variant="body" weight="semibold">
              {brewprint.parameters.water_temp}°C
            </ProfessionalText>
          </View>

          {brewprint.parameters.grind_setting && (
            <View style={{ width: '48%', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.borderSubtle }}>
              <SlidersHorizontal size={18} color={theme.colors.gray[500]} style={{ marginBottom: theme.spacing.xs }} />
              <ProfessionalText variant="caption" color="tertiary">
                Grind
              </ProfessionalText>
              <ProfessionalText variant="body" weight="semibold">
                {brewprint.parameters.grind_setting}
              </ProfessionalText>
            </View>
          )}

          {brewprint.parameters.total_time && (
            <View style={{ width: '48%', backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.borderSubtle }}>
              <TimerIcon size={18} color={theme.colors.gray[500]} style={{ marginBottom: theme.spacing.xs }} />
              <ProfessionalText variant="caption" color="tertiary">
                Time
              </ProfessionalText>
              <ProfessionalText variant="body" weight="semibold">
                {Math.floor(brewprint.parameters.total_time / 60)}:
                {String(brewprint.parameters.total_time % 60).padStart(
                  2,
                  "0"
                )}
              </ProfessionalText>
            </View>
          )}
        </View>
      </ProfessionalCard>

      {/* Steps */}
      {brewprint.steps && brewprint.steps.length > 0 && (
        <ProfessionalCard variant="default">
          <ProfessionalText variant="h4" weight="semibold" style={{ marginBottom: theme.spacing.md }}>
            Brewing Steps
          </ProfessionalText>
          <View style={{ gap: theme.spacing.lg }}>
            {brewprint.steps.map((step, index) => (
              <View key={index} style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: theme.colors.gray[900],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ProfessionalText variant="caption" color="inverse">
                      {index + 1}
                    </ProfessionalText>
                  </View>
                  {index < brewprint.steps.length - 1 && (
                    <View style={{
                      width: 2,
                      flex: 1,
                      backgroundColor: theme.colors.borderSubtle,
                      marginTop: theme.spacing.xs,
                      marginBottom: theme.spacing.sm,
                    }} />
                  )}
                </View>

                <View style={{ flex: 1, paddingBottom: theme.spacing.md }}>
                  <ProfessionalText variant="body">
                    {step.description}
                  </ProfessionalText>
                  {(step.duration || step.water_amount) && (
                    <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
                      {step.duration && (
                        <View style={{
                          backgroundColor: theme.colors.surface,
                          paddingHorizontal: theme.spacing.sm,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}>
                          <ProfessionalText variant="caption" color="secondary">
                            {step.duration}s
                          </ProfessionalText>
                        </View>
                      )}
                      {step.water_amount && (
                        <View style={{
                          backgroundColor: theme.colors.surface,
                          paddingHorizontal: theme.spacing.sm,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}>
                          <ProfessionalText variant="caption" color="secondary">
                            {step.water_amount}g
                          </ProfessionalText>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ProfessionalCard>
      )}
    </ProfessionalContainer>
  );
}

