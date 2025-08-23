// app/brewing/[id].tsx
import { TimerDisplay } from "@/components/brewing/TimerDisplay";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
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
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" color="secondary" style={styles.loadingText}>
            Loading brewprint...
          </Text>
        </View>
      </Container>
    );
  }

  if (error || !brewprint) {
    return (
      <Container>
        <Card variant="outlined" style={{ flex: 1, justifyContent: 'center' }}>
          <Text 
            variant="h4" 
            weight="semibold" 
            style={{ textAlign: 'center', marginBottom: 8 }}
          >
            Brewprint Not Found
          </Text>
          <Text 
            variant="body" 
            color="secondary" 
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            {error || 'The requested brewprint could not be found.'}
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            fullWidth
          />
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title="Brewing Session"
        subtitle={`${brewprint.name} • ${brewprint.method.charAt(0).toUpperCase() + brewprint.method.slice(1).replace('-', ' ')}`}
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
          {/* Recipe Parameters */}
          <Card variant="default" style={styles.parametersCard}>
            <Text variant="h3" weight="semibold" style={styles.recipeName}>
              {brewprint.name}
            </Text>
            {brewprint.description && (
              <Text variant="body" color="secondary" style={styles.recipeDescription}>
                {brewprint.description}
              </Text>
            )}
            
            <View style={styles.parameterGrid}>
              <View style={styles.parameterItem}>
                <Text variant="h4" weight="semibold">
                  {brewprint.parameters.coffee_grams}g
                </Text>
                <Text variant="caption" color="secondary">
                  Coffee
                </Text>
              </View>
              <View style={styles.parameterItem}>
                <Text variant="h4" weight="semibold">
                  {brewprint.parameters.water_grams}ml
                </Text>
                <Text variant="caption" color="secondary">
                  Water
                </Text>
              </View>
              <View style={styles.parameterItem}>
                <Text variant="h4" weight="semibold">
                  {brewprint.parameters.water_temp}°C
                </Text>
                <Text variant="caption" color="secondary">
                  Temperature
                </Text>
              </View>
              <View style={styles.parameterItem}>
                <Text variant="h4" weight="semibold">
                  1:{Math.round((brewprint.parameters.water_grams / brewprint.parameters.coffee_grams) * 10) / 10}
                </Text>
                <Text variant="caption" color="secondary">
                  Ratio
                </Text>
              </View>
            </View>
          </Card>

          {/* Timer Section */}
          <TimerDisplay
            time={time}
            isRunning={isRunning}
            targetTime={brewprint.parameters.total_time}
          />

          {/* Current Step Display */}
          {isBrewingStarted && !isBrewingComplete && getCurrentStep() && (
            <Card variant="default" style={styles.currentStepCard}>
              <View style={styles.currentStepHeader}>
                <View style={styles.stepProgressIndicator}>
                  <Text variant="caption" weight="semibold" style={styles.stepProgress}>
                    {currentStepIndex + 1}/{brewprint.steps.length}
                  </Text>
                </View>
                <Text variant="h2" weight="semibold" style={styles.currentStepTitle}>
                  {getCurrentStep()?.title}
                </Text>
              </View>
              
              <Text variant="body" style={styles.currentStepDescription}>
                {getCurrentStep()?.description}
              </Text>
              
              <View style={styles.currentStepDetails}>
                <View style={styles.stepDetailItem}>
                  <Text variant="h4" weight="semibold">
                    {getCurrentStep()?.duration}s
                  </Text>
                  <Text variant="caption" color="secondary">
                    Duration
                  </Text>
                </View>
                <View style={styles.stepDetailItem}>
                  <Text variant="h4" weight="semibold">
                    {getCurrentStep()?.water_amount}g
                  </Text>
                  <Text variant="caption" color="secondary">
                    Water
                  </Text>
                </View>
                <View style={styles.stepDetailItem}>
                  <Text variant="body" weight="medium" style={styles.techniqueText}>
                    {getCurrentStep()?.technique.replace('-', ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Text>
                  <Text variant="caption" color="secondary">
                    Technique
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* All Steps Overview (when not brewing) */}
          {!isBrewingStarted && brewprint.steps && brewprint.steps.length > 0 && (
            <Card variant="default" style={styles.stepsOverview}>
              <View style={styles.stepsHeader}>
                <Text variant="h3" weight="semibold">
                  Brewing Process
                </Text>
                <View style={styles.stepCountBadge}>
                  <Text variant="caption" weight="medium" style={styles.stepCountText}>
                    {brewprint.steps.length} steps
                  </Text>
                </View>
              </View>
              
              {brewprint.steps.map((step, index) => (
                <View key={step.id} style={styles.stepPreview}>
                  <View style={styles.stepPreviewLeft}>
                    <View style={styles.stepNumber}>
                      <Text variant="caption" weight="semibold" style={styles.stepNumberText}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.stepPreviewContent}>
                      <Text variant="body" weight="semibold" style={styles.stepPreviewTitle}>
                        {step.title}
                      </Text>
                      <Text variant="caption" color="secondary" style={styles.stepPreviewDesc}>
                        {step.description}
                      </Text>
                      <View style={styles.stepPreviewMeta}>
                        <Text variant="caption" color="secondary">
                          {step.duration}s • {step.water_amount}g • {step.technique.replace('-', ' ')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* Action Panel */}
          <View style={styles.actionPanel}>
            {!isBrewingStarted ? (
              <Button
                title="Start Brewing Session"
                onPress={handleStartBrewing}
                variant="primary"
                size="lg"
                fullWidth
              />
            ) : isBrewingComplete ? (
              <View style={styles.actionGroup}>
                <Button
                  title="View Results"
                  onPress={() => router.push(`/brewing/${id}/results`)}
                  variant="primary"
                  size="lg"
                  fullWidth
                />
                <Button
                  title="Brew Again"
                  onPress={() => {
                    setIsBrewingStarted(false);
                    setIsBrewingComplete(false);
                    setCurrentStepIndex(-1);
                    resetTimer();
                  }}
                  variant="secondary"
                  size="lg"
                  fullWidth
                />
              </View>
            ) : (
              <View style={styles.actionGroup}>
                <Button
                  title={currentStepIndex < (brewprint.steps?.length || 0) - 1 ? "Next Step" : "Complete Brewing"}
                  onPress={handleNextStep}
                  variant="primary"
                  size="lg"
                  fullWidth
                />
                <Button
                  title={isRunning ? "Pause Timer" : "Resume Timer"}
                  onPress={isRunning ? pauseTimer : startTimer}
                  variant="secondary"
                  size="lg"
                  fullWidth
                />
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </Container>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Recipe Parameters Card
  parametersCard: {
    marginBottom: 16,
  },
  recipeName: {
    marginBottom: 8,
  },
  recipeDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  parameterGrid: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  parameterItem: {
    flex: 1,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  // Current Step Card (Enhanced)
  currentStepCard: {
    marginBottom: 16,
    padding: 20,
  },
  currentStepHeader: {
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  stepProgressIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  stepProgress: {
    fontSize: 12,
  },
  currentStepTitle: {
    textAlign: 'center' as const,
    fontSize: 24,
  },
  currentStepDescription: {
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 20,
    fontSize: 16,
  },
  currentStepDetails: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    gap: 16,
  },
  stepDetailItem: {
    flex: 1,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  techniqueText: {
    textAlign: 'center' as const,
    fontSize: 14,
  },

  // Steps Overview (Improved)
  stepsOverview: {
    marginBottom: 16,
  },
  stepsHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  stepCountBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepCountText: {
    fontSize: 12,
  },
  stepPreview: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stepPreviewLeft: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  stepNumberText: {
    fontSize: 12,
  },
  stepPreviewContent: {
    flex: 1,
    gap: 4,
  },
  stepPreviewTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  stepPreviewDesc: {
    lineHeight: 18,
    marginBottom: 4,
  },
  stepPreviewMeta: {
    marginTop: 4,
  },

  // Action Panel (Cleaner)
  actionPanel: {
    gap: 12,
  },
  actionGroup: {
    gap: 12,
  },
};
