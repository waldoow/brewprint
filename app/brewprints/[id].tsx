import {
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  View,
  Text,
  Card,
  Button,
  TouchableOpacity,
  Colors,
} from "react-native-ui-lib";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Share,
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
      <View flex bg-screenBG>
        <View padding-page paddingT-xxxl>
          <TouchableOpacity onPress={() => router.back()} marginB-md>
            <Text body textColor>← Back</Text>
          </TouchableOpacity>
          <Text h1 textColor marginB-xs>
            Loading Recipe
          </Text>
          <Text body textSecondary>
            Retrieving brewing details...
          </Text>
        </View>
        
        <View flex center>
          <Text body textSecondary>
            Loading recipe details...
          </Text>
        </View>
      </View>
    );
  }

  if (!brewprint) {
    return (
      <View flex bg-screenBG>
        <View padding-page paddingT-xxxl>
          <TouchableOpacity onPress={() => router.back()} marginB-md>
            <Text body textColor>← Back</Text>
          </TouchableOpacity>
          <Text h1 textColor marginB-xs>
            Recipe Not Found
          </Text>
          <Text body textSecondary>
            Unable to load brewing recipe
          </Text>
        </View>

        <ScrollView
          style={StyleSheet.create({ scrollView: { flex: 1 } }).scrollView}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 24 }}
        >
          <Card padding-md backgroundColor={Colors.red10}>
            <Text h3 textColor marginB-xs>
              Recipe Not Available
            </Text>
            <Text body textSecondary marginB-md>
              This brewing recipe could not be found or may have been deleted.
            </Text>
            <Button
              label="Go Back"
              onPress={() => router.back()}
              backgroundColor={Colors.blue30}
              size="large"
              fullWidth
            />
          </Card>
        </ScrollView>
      </View>
    );
  }

  const ratio = brewprint.parameters?.coffee_grams && brewprint.parameters?.water_grams 
    ? Math.round((brewprint.parameters.water_grams / brewprint.parameters.coffee_grams) * 10) / 10
    : 0;


  return (
    <View flex bg-screenBG>
      <View padding-page paddingT-xxxl>
        <TouchableOpacity onPress={() => router.back()} marginB-md>
          <Text body textColor>← Back</Text>
        </TouchableOpacity>
        <Text h1 textColor marginB-xs>
          {brewprint.name}
        </Text>
        <Text body textSecondary>
          {brewprint.method.replace('-', ' ')} Recipe • {brewprint.status}
        </Text>
      </View>

      <ScrollView
        style={StyleSheet.create({ scrollView: { flex: 1 } }).scrollView}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 24 }}
      >
        {/* Recipe Overview */}
        <View>
          <Text h3 textColor marginB-xs>
            Recipe Overview
          </Text>
          <Text body textSecondary marginB-md>
            Essential brewing parameters
          </Text>
          <View row gap-md>
            <Card flex padding-md>
              <Text caption textSecondary weight="medium">
                Coffee
              </Text>
              <Text h2 textColor weight="bold" marginV-xs>
                {brewprint.parameters?.coffee_grams || 0}g
              </Text>
            </Card>
            
            <Card flex padding-md>
              <Text caption textSecondary weight="medium">
                Water
              </Text>
              <Text h2 textColor weight="bold" marginV-xs>
                {brewprint.parameters?.water_grams || 0}ml
              </Text>
            </Card>
            
            <Card flex padding-md>
              <Text caption textSecondary weight="medium">
                Ratio
              </Text>
              <Text h2 textColor weight="bold" marginV-xs>
                {ratio ? `1:${ratio}` : 'N/A'}
              </Text>
            </Card>
          </View>
        </View>

        {/* Brewing Parameters */}
        <View>
          <Text h3 textColor marginB-xs>
            Brewing Parameters
          </Text>
          <Text body textSecondary marginB-md>
            Detailed brewing specifications
          </Text>
          <Card padding-md>
            <View style={styles.parametersGrid}>
              <View style={styles.parameterItem}>
                <Text caption textSecondary>Water Temperature</Text>
                <Text body textColor weight="semibold">
                  {brewprint.parameters?.water_temp || 0}°C
                </Text>
              </View>
              <View style={styles.parameterItem}>
                <Text caption textSecondary>Grind Size</Text>
                <Text body textColor weight="semibold">
                  {brewprint.parameters?.grind_size || 'Medium'}
                </Text>
              </View>
              <View style={styles.parameterItem}>
                <Text caption textSecondary>Total Time</Text>
                <Text body textColor weight="semibold">
                  {brewprint.parameters?.total_time || 0}s
                </Text>
              </View>
              <View style={styles.parameterItem}>
                <Text caption textSecondary>Status</Text>
                <Text body textColor weight="semibold">
                  {brewprint.status.charAt(0).toUpperCase() + brewprint.status.slice(1)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Brewing Steps */}
        {brewprint.steps && brewprint.steps.length > 0 && (
          <View>
            <Text h3 textColor marginB-xs>
              Brewing Steps
            </Text>
            <Text body textSecondary marginB-md>
              {brewprint.steps.length} step process
            </Text>
            <Card padding-md>
              {brewprint.steps.map((step, index) => (
                <View key={step.id} style={[styles.stepRow, index === brewprint.steps!.length - 1 && styles.lastStep]}>
                  <View style={[styles.stepNumber, { backgroundColor: Colors.grey40 }]}>
                    <Text caption textColor weight="bold">
                      {index + 1}
                    </Text>
                  </View>
                  
                  <View style={styles.stepContent}>
                    <Text body textColor weight="semibold">
                      {step.title}
                    </Text>
                    <Text caption textSecondary style={styles.stepMeta}>
                      {step.duration}s • {step.water_amount}g • {step.technique.replace('-', ' ')}
                    </Text>
                    {step.description && (
                      <Text caption textSecondary style={styles.stepDescription}>
                        {step.description}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Notes */}
        {brewprint.notes && (
          <View>
            <Text h3 textColor marginB-xs>
              Recipe Notes
            </Text>
            <Text body textSecondary marginB-md>
              Additional brewing notes and observations
            </Text>
            <Card padding-md>
              <Text body textColor style={{ lineHeight: 20 }}>
                {brewprint.notes}
              </Text>
            </Card>
          </View>
        )}

        {/* Recipe Actions */}
        <View>
          <Text h3 textColor marginB-xs>
            Recipe Actions
          </Text>
          <Text body textSecondary marginB-md>
            Start brewing or manage this recipe
          </Text>
          <Card padding-md>
            <View style={{ gap: 12 }}>
              <Button
                label="Start Brewing Session"
                onPress={() => {
                  if (!id) {
                    toast.error('Recipe ID missing - cannot start brewing session');
                    return;
                  }
                  router.push(`/brewing/${id}`);
                }}
                backgroundColor={Colors.blue30}
                size="large"
                fullWidth
              />
              
              <View row gap-sm>
                <Button
                  label="Edit Recipe"
                  onPress={() => router.push(`/brewprints/edit/${id}`)}
                  backgroundColor={Colors.grey40}
                  size="large"
                  flex
                />
                
                <Button
                  label="More Options"
                  onPress={showActionSheet}
                  backgroundColor={Colors.grey40}
                  size="large"
                  flex
                />
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  parametersGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 16,
  },
  parameterItem: {
    minWidth: '45%',
    alignItems: 'center' as const,
    padding: 16,
  },
  stepRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey30,
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
});