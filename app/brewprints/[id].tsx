import { DataLayout, DataGrid, DataSection } from '@/components/ui/DataLayout';
import { DataCard, InfoCard } from '@/components/ui/DataCard';
import { DataText } from '@/components/ui/DataText';
import { DataButton } from '@/components/ui/DataButton';
import { DataMetric } from '@/components/ui/DataMetric';
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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
import { getTheme } from '@/constants/DataFirstDesign';
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
      "Archive Recipe",
      "This recipe will be moved to archives. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await BrewprintsService.archiveBrewprint(
                brewprint.id
              );
              if (result.success) {
                toast.success("Recipe archived");
                router.back();
              } else {
                Alert.alert("Error", "Unable to archive recipe");
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
      "Delete Recipe",
      "This will permanently delete this recipe. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await BrewprintsService.deleteBrewprint(brewprint.id);
              if (result.success) {
                toast.success("Recipe deleted");
                router.back();
              } else {
                Alert.alert("Error", "Unable to delete recipe");
              }
            } catch {
              Alert.alert("Error", "An error occurred");
            }
          },
        },
      ]
    );
  };

  const handleDuplicate = async () => {
    if (!brewprint) return;

    try {
      const result = await BrewprintsService.duplicateBrewprint(brewprint.id);
      if (result.success) {
        toast.success("Recipe duplicated");
        router.back();
      } else {
        Alert.alert("Error", "Unable to duplicate recipe");
      }
    } catch {
      Alert.alert("Error", "An error occurred");
    }
  };

  const handleShare = async () => {
    if (!brewprint) return;

    const shareContent = {
      title: `${brewprint.name} - Coffee Recipe`,
      message: `Check out this coffee recipe: ${brewprint.name}\n\nMethod: ${brewprint.method}\nCoffee: ${brewprint.parameters?.coffee_grams}g\nWater: ${brewprint.parameters?.water_grams}ml\nTemperature: ${brewprint.parameters?.water_temp}°C`,
    };

    try {
      await Share.share(shareContent);
    } catch {
      Alert.alert("Error", "Unable to share recipe");
    }
  };

  const showActionSheet = () => {
    const options: AlertButton[] = [
      { text: "Edit Recipe", onPress: () => router.push(`/brewprints/edit/${id}`) },
      { text: "Duplicate", onPress: handleDuplicate },
      { text: "Share Recipe", onPress: handleShare },
    ];

    if (brewprint?.status !== 'final') {
      options.push({ text: "Mark as Final", onPress: handleMarkAsFinal });
    }

    options.push(
      { text: "Archive", style: "destructive", onPress: handleArchive },
      { text: "Delete", style: "destructive", onPress: handleDelete },
      { text: "Cancel", style: "cancel" }
    );

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: options.map(o => o.text),
          destructiveButtonIndex: options.findIndex(o => o.style === 'destructive'),
          cancelButtonIndex: options.length - 1,
        },
        (buttonIndex) => {
          if (buttonIndex < options.length - 1) {
            options[buttonIndex].onPress?.();
          }
        }
      );
    } else {
      // For Android, show a series of alerts
      Alert.alert("Recipe Actions", "Choose an action", options);
    }
  };

  if (isLoading) {
    return (
      <DataLayout
        title="Loading Recipe"
        subtitle="Retrieving brewing details..."
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <View style={styles.loadingContainer}>
          <DataText variant="body" color="secondary">
            Loading recipe details...
          </DataText>
        </View>
      </DataLayout>
    );
  }

  if (!brewprint) {
    return (
      <DataLayout
        title="Recipe Not Found"
        subtitle="Unable to load brewing recipe"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <InfoCard
          title="Recipe Not Available"
          message="This brewing recipe could not be found or may have been deleted."
          variant="error"
          action={{
            title: "Go Back",
            onPress: () => router.back(),
            variant: "primary"
          }}
        />
      </DataLayout>
    );
  }

  const ratio = brewprint.parameters?.coffee_grams && brewprint.parameters?.water_grams 
    ? Math.round((brewprint.parameters.water_grams / brewprint.parameters.coffee_grams) * 10) / 10
    : 0;


  return (
    <DataLayout
      title={brewprint.name}
      subtitle={`${brewprint.method.replace('-', ' ')} Recipe • ${brewprint.status}`}
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable
    >
      {/* Recipe Overview */}
      <DataSection title="Recipe Overview" spacing="lg">
        <DataGrid columns={3} gap="md">
          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Coffee
            </DataText>
            <DataText variant="h2" color="primary" weight="bold" style={{ marginVertical: theme.spacing[1] }}>
              {brewprint.parameters?.coffee_grams || 0}g
            </DataText>
          </DataCard>
          
          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Water
            </DataText>
            <DataText variant="h2" color="primary" weight="bold" style={{ marginVertical: theme.spacing[1] }}>
              {brewprint.parameters?.water_grams || 0}ml
            </DataText>
          </DataCard>
          
          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Ratio
            </DataText>
            <DataText variant="h2" color="primary" weight="bold" style={{ marginVertical: theme.spacing[1] }}>
              {ratio ? `1:${ratio}` : 'N/A'}
            </DataText>
          </DataCard>
        </DataGrid>
      </DataSection>

      {/* Brewing Parameters */}
      <DataSection title="Brewing Parameters" spacing="lg">
        <DataCard>
          <DataGrid columns={2} gap="sm">
            <DataMetric
              label="Water Temperature"
              value={brewprint.parameters?.water_temp || 0}
              unit="°C"
            />
            <DataMetric
              label="Grind Size"
              value={brewprint.parameters?.grind_size || 'Medium'}
            />
            <DataMetric
              label="Total Time"
              value={brewprint.parameters?.total_time || 0}
              unit="s"
            />
            <DataMetric
              label="Status"
              value={brewprint.status.charAt(0).toUpperCase() + brewprint.status.slice(1)}
            />
          </DataGrid>
        </DataCard>
      </DataSection>

      {/* Brewing Steps */}
      {brewprint.steps && brewprint.steps.length > 0 && (
        <DataSection title="Brewing Steps" subtitle={`${brewprint.steps.length} step process`} spacing="lg">
          <DataCard>
            {brewprint.steps.map((step, index) => (
              <View key={step.id} style={[styles.stepRow, index === brewprint.steps!.length - 1 && styles.lastStep]}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.gray[100] }]}>
                  <DataText variant="caption" weight="bold" color="secondary">
                    {index + 1}
                  </DataText>
                </View>
                
                <View style={styles.stepContent}>
                  <DataText variant="body" weight="semibold">
                    {step.title}
                  </DataText>
                  <DataText variant="caption" color="secondary" style={styles.stepMeta}>
                    {step.duration}s • {step.water_amount}g • {step.technique.replace('-', ' ')}
                  </DataText>
                  {step.description && (
                    <DataText variant="caption" color="secondary" style={styles.stepDescription}>
                      {step.description}
                    </DataText>
                  )}
                </View>
              </View>
            ))}
          </DataCard>
        </DataSection>
      )}

      {/* Notes */}
      {brewprint.notes && (
        <DataSection title="Recipe Notes" spacing="lg">
          <DataCard>
            <DataText variant="body" style={{ lineHeight: 20 }}>
              {brewprint.notes}
            </DataText>
          </DataCard>
        </DataSection>
      )}

      {/* Recipe Actions */}
      <DataSection title="Recipe Actions" spacing="xl">
        <DataGrid columns={1} gap="md">
          <DataButton
            title="Start Brewing Session"
            onPress={() => {
              if (!id) {
                toast.error('Recipe ID missing - cannot start brewing session');
                return;
              }
              router.push(`/brewing/${id}`);
            }}
            variant="primary"
            size="lg"
            fullWidth
          />
          
          <DataGrid columns={2} gap="sm">
            <DataButton
              title="Edit Recipe"
              onPress={() => router.push(`/brewprints/edit/${id}`)}
              variant="secondary"
            />
            
            <DataButton
              title="More Options"
              onPress={showActionSheet}
              variant="outline"
            />
          </DataGrid>
        </DataGrid>
      </DataSection>
    </DataLayout>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 32,
  },
  stepRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  lastStep: {
    borderBottomWidth: 0,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepMeta: {
    fontSize: 11,
  },
  stepDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
};