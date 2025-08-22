// app/brewing/[id].tsx
import { TimerDisplay } from "@/components/brewing/TimerDisplay";
import { Header } from "@/components/ui/Header";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useBrewprint } from "@/hooks/useBrewprint";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTimer } from "@/hooks/useTimer";
import type { BrewStep } from "@/lib/services/brewprints";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { toast } from "sonner-native";

export default function BrewingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const { brewprint, loading, error } = useBrewprint(id);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1 = preparation phase
  const [isBrewingStarted, setIsBrewingStarted] = useState(false);
  const [isBrewingComplete, setIsBrewingComplete] = useState(false);

  const {
    time,
    isRunning,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useTimer();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (brewprint) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [brewprint]);

  const handleStartBrewing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsBrewingStarted(true);
    setCurrentStepIndex(0);
    startTimer();
    
    if (brewprint?.steps && brewprint.steps.length > 0) {
      const firstStep = brewprint.steps[0];
      toast.success(`Brewing started! Begin: ${firstStep.title}`);
    } else {
      toast.success("Brewing started!");
    }
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!brewprint?.steps) return;
    
    if (currentStepIndex < brewprint.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStep = brewprint.steps[nextIndex];
      toast.info(`Next step: ${nextStep.title}`);
    } else {
      // All steps completed
      setIsBrewingComplete(true);
      pauseTimer();
      toast.success("Brewing complete! How was it?");
    }
  };

  const getCurrentStep = (): BrewStep | null => {
    if (!brewprint?.steps || currentStepIndex < 0) return null;
    return brewprint.steps[currentStepIndex] || null;
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading brewprint...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error || !brewprint) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error || 'Brewprint not found'}
        </ThemedText>
        <ThemedButton
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header
        title="BREWING SESSION"
        subtitle={`${brewprint.name} • ${brewprint.method} extraction protocol`}
        onBackPress={() => router.back()}
        rightAction={{
          icon: "info",
          onPress: () => console.log("Show brewing tips"),
        }}
        showTopSpacing={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Recipe Info */}
          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
            <ThemedText style={[styles.recipeName, { color: colors.text }]}>
              {brewprint.name}
            </ThemedText>
            <ThemedText style={[styles.recipeMethod, { color: colors.textSecondary }]}>
              {brewprint.method.charAt(0).toUpperCase() + brewprint.method.slice(1).replace('-', ' ')}
              {brewprint.description && ` • ${brewprint.description}`}
            </ThemedText>
            
            <View style={styles.quickParams}>
              <ThemedText style={[styles.param, { color: colors.textSecondary }]}>
                {brewprint.parameters.coffee_grams}g coffee
              </ThemedText>
              <ThemedText style={[styles.param, { color: colors.textSecondary }]}>
                {brewprint.parameters.water_grams}ml water
              </ThemedText>
              <ThemedText style={[styles.param, { color: colors.textSecondary }]}>
                {brewprint.parameters.water_temp}°C
              </ThemedText>
              {brewprint.parameters.ratio && (
                <ThemedText style={[styles.param, { color: colors.textSecondary }]}>
                  {brewprint.parameters.ratio} ratio
                </ThemedText>
              )}
            </View>
          </View>

          {/* Timer Section */}
          <TimerDisplay
            time={time}
            isRunning={isRunning}
            targetTime={brewprint.parameters.total_time}
          />

          {/* Current Step Display */}
          {isBrewingStarted && !isBrewingComplete && getCurrentStep() && (
            <View style={[styles.currentStepCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.stepHeader}>
                <ThemedText style={[styles.stepNumber, { color: colors.primary }]}>
                  Step {currentStepIndex + 1} of {brewprint.steps.length}
                </ThemedText>
                <ThemedText style={[styles.stepTitle, { color: colors.text }]}>
                  {getCurrentStep()?.title}
                </ThemedText>
              </View>
              
              <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                {getCurrentStep()?.description}
              </ThemedText>
              
              <View style={styles.stepDetails}>
                <ThemedText style={[styles.stepDetail, { color: colors.textSecondary }]}>
                  Duration: {getCurrentStep()?.duration}s
                </ThemedText>
                <ThemedText style={[styles.stepDetail, { color: colors.textSecondary }]}>
                  Water: {getCurrentStep()?.water_amount}g
                </ThemedText>
                <ThemedText style={[styles.stepDetail, { color: colors.textSecondary }]}>
                  Technique: {getCurrentStep()?.technique}
                </ThemedText>
              </View>
            </View>
          )}

          {/* All Steps Overview (when not brewing) */}
          {!isBrewingStarted && brewprint.steps && brewprint.steps.length > 0 && (
            <View style={[styles.stepsOverview, { backgroundColor: colors.cardBackground }]}>
              <ThemedText style={[styles.stepsTitle, { color: colors.text }]}>
                Brewing Steps ({brewprint.steps.length} steps)
              </ThemedText>
              
              {brewprint.steps.map((step, index) => (
                <View key={step.id} style={styles.stepPreview}>
                  <View style={styles.stepPreviewHeader}>
                    <ThemedText style={[styles.stepPreviewNumber, { color: colors.primary }]}>
                      {index + 1}
                    </ThemedText>
                    <ThemedText style={[styles.stepPreviewTitle, { color: colors.text }]}>
                      {step.title}
                    </ThemedText>
                    <ThemedText style={[styles.stepPreviewTime, { color: colors.textSecondary }]}>
                      {step.duration}s
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.stepPreviewDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {step.description} • {step.water_amount}g water • {step.technique}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Action Panel */}
          <View style={[styles.actionPanel, { backgroundColor: colors.cardBackground }]}>
            {!isBrewingStarted ? (
              <ThemedButton
                title="Start Brewing"
                onPress={handleStartBrewing}
                variant="default"
                size="lg"
                style={styles.primaryAction}
              />
            ) : isBrewingComplete ? (
              <>
                <ThemedButton
                  title="View Results"
                  onPress={() => router.push(`/brewing/${id}/results`)}
                  variant="default"
                  size="lg"
                  style={styles.primaryAction}
                />
                <ThemedButton
                  title="Brew Again"
                  onPress={() => {
                    setIsBrewingStarted(false);
                    setIsBrewingComplete(false);
                    setCurrentStepIndex(-1);
                    resetTimer();
                  }}
                  variant="outline"
                  size="lg"
                  style={styles.secondaryAction}
                />
              </>
            ) : (
              <>
                <ThemedButton
                  title={currentStepIndex < (brewprint.steps?.length || 0) - 1 ? "Next Step" : "Complete Brewing"}
                  onPress={handleNextStep}
                  variant="default"
                  size="lg"
                  style={styles.primaryAction}
                />
                <ThemedButton
                  title={isRunning ? "Pause Timer" : "Resume Timer"}
                  onPress={isRunning ? pauseTimer : startTimer}
                  variant="outline"
                  size="lg"
                  style={styles.secondaryAction}
                />
              </>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  backButton: {
    paddingHorizontal: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Minimalist Cards
  infoCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  recipeMethod: {
    fontSize: 14,
    marginBottom: 12,
  },
  quickParams: {
    flexDirection: "row",
    gap: 16,
  },
  param: {
    fontSize: 12,
  },

  // Action Panel
  actionPanel: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  primaryAction: {
    alignSelf: "stretch",
  },
  secondaryAction: {
    alignSelf: "stretch",
  },

  // Current Step Card
  currentStepCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  stepHeader: {
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  stepDetails: {
    flexDirection: "row",
    gap: 16,
  },
  stepDetail: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Steps Overview
  stepsOverview: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  stepPreview: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  stepPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  stepPreviewNumber: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 20,
  },
  stepPreviewTitle: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  stepPreviewTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  stepPreviewDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 28,
  },
});
