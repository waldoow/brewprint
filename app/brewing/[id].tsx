// app/brewing/[id].tsx
import { TimerDisplay } from "@/components/brewing/TimerDisplay";
import { ProfessionalContainer } from "@/components/ui/professional/Container";
import { ProfessionalHeader } from "@/components/ui/professional/Header";
import { ProfessionalCard } from "@/components/ui/professional/Card";
import { ProfessionalText } from "@/components/ui/professional/Text";
import { ProfessionalButton } from "@/components/ui/professional/Button";
import { getTheme } from "@/constants/ProfessionalDesign";
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
  const theme = getTheme(colorScheme ?? 'light');

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
      <ProfessionalContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ProfessionalText variant="body" color="secondary" style={styles.loadingText}>
            Loading brewprint...
          </ProfessionalText>
        </View>
      </ProfessionalContainer>
    );
  }

  if (error || !brewprint) {
    return (
      <ProfessionalContainer>
        <ProfessionalCard variant="outlined" style={{ flex: 1, justifyContent: 'center' }}>
          <ProfessionalText 
            variant="h4" 
            weight="semibold" 
            style={{ textAlign: 'center', marginBottom: 8 }}
          >
            Brewprint Not Found
          </ProfessionalText>
          <ProfessionalText 
            variant="body" 
            color="secondary" 
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            {error || 'The requested brewprint could not be found.'}
          </ProfessionalText>
          <ProfessionalButton
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            fullWidth
          />
        </ProfessionalCard>
      </ProfessionalContainer>
    );
  }

  return (
    <ProfessionalContainer>
      <ProfessionalHeader
        title="Brewing Session"
        subtitle={`${brewprint.name} • ${brewprint.method} extraction protocol`}
        action={{
          title: "Back",
          onPress: () => router.back(),
        }}
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
          <ProfessionalCard variant="default" style={styles.infoCard}>
            <ProfessionalText variant="h3" weight="semibold" style={styles.recipeName}>
              {brewprint.name}
            </ProfessionalText>
            <ProfessionalText variant="body" color="secondary" style={styles.recipeMethod}>
              {brewprint.method.charAt(0).toUpperCase() + brewprint.method.slice(1).replace('-', ' ')}
              {brewprint.description && ` • ${brewprint.description}`}
            </ProfessionalText>
            
            <View style={styles.quickParams}>
              <ProfessionalText variant="caption" color="secondary">
                {brewprint.parameters.coffee_grams}g coffee
              </ProfessionalText>
              <ProfessionalText variant="caption" color="secondary">
                {brewprint.parameters.water_grams}ml water
              </ProfessionalText>
              <ProfessionalText variant="caption" color="secondary">
                {brewprint.parameters.water_temp}°C
              </ProfessionalText>
              {brewprint.parameters.ratio && (
                <ProfessionalText variant="caption" color="secondary">
                  {brewprint.parameters.ratio} ratio
                </ProfessionalText>
              )}
            </View>
          </ProfessionalCard>

          {/* Timer Section */}
          <TimerDisplay
            time={time}
            isRunning={isRunning}
            targetTime={brewprint.parameters.total_time}
          />

          {/* Current Step Display */}
          {isBrewingStarted && !isBrewingComplete && getCurrentStep() && (
            <ProfessionalCard variant="default" style={styles.currentStepCard}>
              <View style={styles.stepHeader}>
                <ProfessionalText variant="caption" color="secondary" style={styles.stepNumber}>
                  Step {currentStepIndex + 1} of {brewprint.steps.length}
                </ProfessionalText>
                <ProfessionalText variant="h3" weight="semibold">
                  {getCurrentStep()?.title}
                </ProfessionalText>
              </View>
              
              <ProfessionalText variant="body" color="secondary" style={styles.stepDescription}>
                {getCurrentStep()?.description}
              </ProfessionalText>
              
              <View style={styles.stepDetails}>
                <ProfessionalText variant="caption" color="secondary">
                  Duration: {getCurrentStep()?.duration}s
                </ProfessionalText>
                <ProfessionalText variant="caption" color="secondary">
                  Water: {getCurrentStep()?.water_amount}g
                </ProfessionalText>
                <ProfessionalText variant="caption" color="secondary">
                  Technique: {getCurrentStep()?.technique}
                </ProfessionalText>
              </View>
            </ProfessionalCard>
          )}

          {/* All Steps Overview (when not brewing) */}
          {!isBrewingStarted && brewprint.steps && brewprint.steps.length > 0 && (
            <ProfessionalCard variant="default" style={styles.stepsOverview}>
              <ProfessionalText variant="h4" weight="semibold" style={styles.stepsTitle}>
                Brewing Steps ({brewprint.steps.length} steps)
              </ProfessionalText>
              
              {brewprint.steps.map((step, index) => (
                <View key={step.id} style={styles.stepPreview}>
                  <View style={styles.stepPreviewHeader}>
                    <ProfessionalText variant="caption" weight="bold" style={styles.stepPreviewNumber}>
                      {index + 1}
                    </ProfessionalText>
                    <ProfessionalText variant="body" weight="medium" style={styles.stepPreviewTitle}>
                      {step.title}
                    </ProfessionalText>
                    <ProfessionalText variant="caption" color="secondary">
                      {step.duration}s
                    </ProfessionalText>
                  </View>
                  <ProfessionalText variant="caption" color="secondary" style={styles.stepPreviewDesc} numberOfLines={2}>
                    {step.description} • {step.water_amount}g water • {step.technique}
                  </ProfessionalText>
                </View>
              ))}
            </ProfessionalCard>
          )}

          {/* Action Panel */}
          <ProfessionalCard variant="default" style={styles.actionPanel}>
            {!isBrewingStarted ? (
              <ProfessionalButton
                title="Start Brewing"
                onPress={handleStartBrewing}
                variant="primary"
                size="large"
                fullWidth
              />
            ) : isBrewingComplete ? (
              <>
                <ProfessionalButton
                  title="View Results"
                  onPress={() => router.push(`/brewing/${id}/results`)}
                  variant="primary"
                  size="large"
                  fullWidth
                  style={styles.primaryAction}
                />
                <ProfessionalButton
                  title="Brew Again"
                  onPress={() => {
                    setIsBrewingStarted(false);
                    setIsBrewingComplete(false);
                    setCurrentStepIndex(-1);
                    resetTimer();
                  }}
                  variant="outline"
                  size="large"
                  fullWidth
                />
              </>
            ) : (
              <>
                <ProfessionalButton
                  title={currentStepIndex < (brewprint.steps?.length || 0) - 1 ? "Next Step" : "Complete Brewing"}
                  onPress={handleNextStep}
                  variant="primary"
                  size="large"
                  fullWidth
                  style={styles.primaryAction}
                />
                <ProfessionalButton
                  title={isRunning ? "Pause Timer" : "Resume Timer"}
                  onPress={isRunning ? pauseTimer : startTimer}
                  variant="outline"
                  size="large"
                  fullWidth
                />
              </>
            )}
          </ProfessionalCard>
        </Animated.View>
      </ScrollView>
    </ProfessionalContainer>
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
