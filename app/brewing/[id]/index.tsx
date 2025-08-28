import { useBrewprint } from "@/hooks/useBrewprint";
import { useTimer } from "@/hooks/useTimer";
import type { BrewStep } from "@/lib/services/brewprints";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Dimensions } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
  ProgressBar,
} from "react-native-ui-lib";
import { toast } from "sonner-native";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BrewingScreen() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  
  // Extract ID safely before using hooks
  const id = params?.id as string;
  const { brewprint, loading, error } = useBrewprint(id);

  // All state hooks must be at the top level
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isBrewingStarted, setIsBrewingStarted] = useState(false);
  const [isBrewingComplete, setIsBrewingComplete] = useState(false);
  const [brewingPhase, setBrewingPhase] = useState<
    "not-started" | "bloom" | "brewing" | "complete"
  >("not-started");
  
  const {
    time,
    isRunning,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useTimer();

  console.log("BrewingScreen params:", params);

  // ID is mandatory for this screen
  if (!params || typeof params.id !== "string" || !params.id) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.colors.text.primary }]}>
            Invalid Brewing Session
          </Text>
          <Text style={[styles.pageSubtitle, { color: theme.colors.text.secondary }]}>
            Recipe ID is required
          </Text>
        </View>
        
        <View style={styles.emptyStateContainer}>
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
              No Recipe Selected
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
              No valid recipe ID provided for brewing session
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={[styles.emptyButtonText, { color: theme.colors.text.primary }]}>
                Back to Recipes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  console.log("BrewingScreen extracted id:", id);

  const handleStartBrewing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsBrewingStarted(true);
    setCurrentStepIndex(0);
    setBrewingPhase("brewing");
    startTimer();

    if (brewprint?.steps && brewprint.steps.length > 0) {
      const firstStep = brewprint.steps[0];
      toast.success(`Started: ${firstStep.title}`, { duration: 2000 });
    } else {
      toast.success("Brewing started", { duration: 2000 });
    }
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!brewprint?.steps) return;

    if (currentStepIndex < brewprint.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStep = brewprint.steps[nextIndex];
      toast.info(`Step ${nextIndex + 1}: ${nextStep.title}`, {
        duration: 1500,
      });
    } else {
      setIsBrewingComplete(true);
      setBrewingPhase("complete");
      pauseTimer();
      toast.success("Brewing complete! Time to taste.", { duration: 3000 });
    }
  };

  const getCurrentStep = (): BrewStep | null => {
    if (!brewprint?.steps || currentStepIndex < 0) return null;
    return brewprint.steps[currentStepIndex] || null;
  };

  const resetBrewing = () => {
    setIsBrewingStarted(false);
    setIsBrewingComplete(false);
    setCurrentStepIndex(-1);
    setBrewingPhase("preparation");
    resetTimer();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = () => {
    if (!brewprint?.parameters?.total_time) return 0;
    return Math.min((time / brewprint.parameters.total_time) * 100, 100);
  };

  const getStepProgress = () => {
    if (!brewprint?.steps || currentStepIndex < 0) return 0;
    return ((currentStepIndex + 1) / brewprint.steps.length) * 100;
  };


  const getStatusText = () => {
    switch (brewingPhase) {
      case "preparation":
        return "Ready to brew";
      case "brewing":
        return isRunning ? "Brewing in progress" : "Brewing paused";
      case "complete":
        return "Brewing complete";
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.colors.text.primary }]}>
            Brewing Session
          </Text>
          <Text style={[styles.pageSubtitle, { color: theme.colors.text.secondary }]}>
            Loading recipe for brewing...
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading brewing session...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !brewprint) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: theme.colors.text.primary }]}>
            Recipe Not Available
          </Text>
          <Text style={[styles.pageSubtitle, { color: theme.colors.text.secondary }]}>
            Brewing recipe could not be loaded
          </Text>
        </View>
        
        <View style={styles.emptyStateContainer}>
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
              Recipe Not Available
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
              {error || "This brewing recipe could not be loaded from your library."}
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={[styles.emptyButtonText, { color: theme.colors.text.primary }]}>
                Back to Recipes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const ratio =
    Math.round(
      (brewprint.parameters.waterAmount / brewprint.parameters.coffeeAmount) *
        10
    ) / 10;
  const currentStep = getCurrentStep();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Professional Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: theme.colors.text.primary }]}>
          {brewprint.name}
        </Text>
        <Text style={[styles.pageSubtitle, { color: theme.colors.text.secondary }]}>
          {brewprint.method.charAt(0).toUpperCase() +
            brewprint.method.slice(1).replace("-", " ")} Brewing • {getStatusText()} • {formatTime(time)}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Brewing Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Current Session
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
            Active brewing parameters and timing
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>ELAPSED TIME</Text>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                {formatTime(time)}
              </Text>
            </View>

            <View style={[styles.statItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>COFFEE DOSE</Text>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                {brewprint.parameters.coffee_grams}g
              </Text>
            </View>

            <View style={[styles.statItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>RATIO</Text>
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                1:{ratio}
              </Text>
            </View>
          </View>
        </View>

        {/* Recipe Parameters */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Recipe Specifications
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
            Brewing parameters for this recipe
          </Text>
          
          <View style={[styles.detailsContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                Coffee Dose
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                {brewprint.parameters.coffeeAmount}g
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                Water Volume
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                {brewprint.parameters.waterAmount}ml
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                Water Temperature
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                {brewprint.parameters.water_temp}°C
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                Coffee Ratio
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                1:{ratio}
              </Text>
            </View>
          </View>
        </View>

        {/* Timer Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Extraction Timer
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
            {isRunning
              ? `Timer active - ${Math.round(getProgress())}% complete`
              : "Timer ready"}
          </Text>
          
          <View style={[styles.timerContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text
              style={[styles.timerDisplay, { color: theme.colors.text.primary }]}
            >
              {formatTime(time)}
            </Text>

            {brewprint.parameters.totalTime && (
              <View style={styles.timerStats}>
                <View style={styles.timerStatItem}>
                  <Text style={[styles.timerStatLabel, { color: theme.colors.text.secondary }]}>Target Time</Text>
                  <Text style={[styles.timerStatValue, { color: theme.colors.text.primary }]}>
                    {formatTime(brewprint.parameters.totalTime)}
                  </Text>
                </View>
                <View style={styles.timerStatItem}>
                  <Text style={[styles.timerStatLabel, { color: theme.colors.text.secondary }]}>Remaining</Text>
                  <Text style={[styles.timerStatValue, { color: theme.colors.text.primary }]}>
                    {formatTime(Math.max(0, brewprint.parameters.totalTime - time))}
                  </Text>
                </View>
              </View>
            )}

            {brewprint.parameters.totalTime && (
              <View style={styles.progressSection}>
                <ProgressBar
                  progress={getProgress()}
                  progressColor={isRunning ? theme.colors.warning : theme.colors.info}
                  backgroundColor={theme.colors.border}
                  style={styles.progressBar}
                />
                <View style={styles.progressStats}>
                  <Text style={[styles.progressLabel, { color: theme.colors.text.secondary }]}>
                    Progress: {Math.round(getProgress())}%
                  </Text>
                  <Text style={[styles.progressLabel, { color: theme.colors.text.secondary }]}>
                    Status: {isRunning ? "Active" : "Paused"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Current Step - Active Phase */}
        {isBrewingStarted && !isBrewingComplete && currentStep && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Step {currentStepIndex + 1} of {brewprint.steps.length}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
              Active brewing instruction
            </Text>
            
            <View style={[styles.activeStepCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
                {currentStep.title}
              </Text>

              <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
                {currentStep.description}
              </Text>

              <View style={styles.stepStatsGrid}>
                <View style={styles.stepStatItem}>
                  <Text style={[styles.stepStatLabel, { color: theme.colors.text.secondary }]}>Duration</Text>
                  <Text style={[styles.stepStatValue, { color: theme.colors.text.primary }]}>{currentStep.duration}s</Text>
                </View>
                <View style={styles.stepStatItem}>
                  <Text style={[styles.stepStatLabel, { color: theme.colors.text.secondary }]}>Water Amount</Text>
                  <Text style={[styles.stepStatValue, { color: theme.colors.text.primary }]}>{currentStep.water_amount}g</Text>
                </View>
                <View style={styles.stepStatItem}>
                  <Text style={[styles.stepStatLabel, { color: theme.colors.text.secondary }]}>Progress</Text>
                  <Text style={[styles.stepStatValue, { color: theme.colors.text.primary }]}>{Math.round(getStepProgress())}%</Text>
                </View>
              </View>

              <View style={styles.stepTechnique}>
                <Text style={[styles.stepTechniqueText, { color: theme.colors.text.secondary }]}>
                  Technique: {currentStep.technique.replace("-", " ")}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Steps Overview - Pre-brewing */}
        {!isBrewingStarted && brewprint.steps && brewprint.steps.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Brewing Process Overview
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
              {brewprint.steps.length} precise steps to perfect extraction
            </Text>
            
            <View style={[styles.stepsOverviewContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.stepsOverviewTitle, { color: theme.colors.text.primary }]}>
                Brewing Sequence ({brewprint.steps.length} steps)
              </Text>

              {brewprint.steps.map((step, index) => (
                <View
                  key={step.id}
                  style={[
                    styles.stepRow,
                    { borderBottomColor: theme.colors.border },
                    index === brewprint.steps.length - 1 && styles.lastStep,
                  ]}
                >
                  <View
                    style={[
                      styles.stepNumber,
                      { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    ]}
                  >
                    <Text style={[styles.stepNumberText, { color: theme.colors.text.primary }]}>
                      {index + 1}
                    </Text>
                  </View>

                  <View style={styles.stepContent}>
                    <Text style={[styles.stepRowTitle, { color: theme.colors.text.primary }]}>
                      {step.title}
                    </Text>
                    <Text style={[styles.stepMeta, { color: theme.colors.text.secondary }]}>
                      {step.duration}s • {step.water_amount}g • {step.technique.replace("-", " ")}
                    </Text>
                    {step.description && (
                      <Text
                        style={[styles.stepNote, { color: theme.colors.text.secondary }]}
                        numberOfLines={2}
                      >
                        {step.description}
                      </Text>
                    )}
                  </View>

                  <View style={styles.stepIndicator}>
                    <Text style={[styles.stepDuration, { color: theme.colors.text.secondary }]}>
                      {step.duration}s
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Brewing Analytics - Post completion */}
        {isBrewingComplete && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Brewing Analytics
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
              Your extraction performance metrics
            </Text>
            
            <View style={styles.analyticsGrid}>
              <View style={[styles.statItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>TOTAL TIME</Text>
                <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                  {formatTime(time)}
                </Text>
              </View>

              <View style={[styles.statItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>STEPS</Text>
                <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                  {brewprint.steps.length}
                </Text>
              </View>

              <View style={[styles.statItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>TARGET TIME</Text>
                <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                  {brewprint.parameters.totalTime
                    ? formatTime(brewprint.parameters.totalTime)
                    : "N/A"}
                </Text>
              </View>

              <View style={[styles.statItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.statLabel, { color: theme.colors.text.tertiary }]}>PRECISION</Text>
                <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
                  {brewprint.parameters.totalTime
                    ? `${Math.max(
                        0,
                        100 -
                          Math.round(
                            (Math.abs(time - brewprint.parameters.totalTime) /
                              brewprint.parameters.totalTime) *
                              100
                          )
                      )}%`
                    : "100%"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Controls */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Brewing Controls
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.text.secondary }]}>
            {brewingPhase === "preparation"
              ? "Ready to begin your brewing session"
              : brewingPhase === "brewing"
              ? "Control your active brewing session"
              : "Session complete - review or brew again"}
          </Text>
          
          {!isBrewingStarted ? (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={handleStartBrewing}
              activeOpacity={0.7}
            >
              <Text style={[styles.primaryButtonText, { color: theme.colors.text.primary }]}>
                Start Brewing {brewprint.name}
              </Text>
            </TouchableOpacity>
          ) : isBrewingComplete ? (
            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => router.push(`/brewing/${id}/results`)}
                activeOpacity={0.7}
              >
                <Text style={[styles.primaryButtonText, { color: theme.colors.text.primary }]}>
                  View Full Results
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
                onPress={resetBrewing}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.colors.text.secondary }]}>
                  Brew This Recipe Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionButtonGroup}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={handleNextStep}
                activeOpacity={0.7}
              >
                <Text style={[styles.primaryButtonText, { color: theme.colors.text.primary }]}>
                  {currentStepIndex < (brewprint.steps?.length || 0) - 1
                    ? "Continue to Next Step"
                    : "Complete Brewing Session"}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.controlButtonRow}>
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                  onPress={isRunning ? pauseTimer : startTimer}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.controlButtonText, { color: theme.colors.text.primary }]}>
                    {isRunning ? "Pause Timer" : "Resume Timer"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.controlButton, { borderColor: theme.colors.border }]}
                  onPress={resetBrewing}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.controlButtonText, { color: theme.colors.text.secondary }]}>
                    Reset Session
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 14,
  },
  pageTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: 11,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 32,
  },
  
  // Sections
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 11,
    marginBottom: 16,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 80,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Details Container
  detailsContainer: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Timer
  timerContainer: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  timerStats: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 16,
  },
  timerStatItem: {
    alignItems: 'center',
  },
  timerStatLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  timerStatValue: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  progressSection: {
    width: '100%',
    marginTop: 20,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 10,
  },
  
  // Active Step Card
  activeStepCard: {
    borderRadius: 6,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  stepStatsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stepStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepStatLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepStatValue: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  stepTechnique: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  stepTechniqueText: {
    fontSize: 10,
  },
  
  // Steps Overview
  stepsOverviewContainer: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 16,
  },
  stepsOverviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastStep: {
    borderBottomWidth: 0,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '500',
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepRowTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepMeta: {
    fontSize: 10,
  },
  stepNote: {
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  stepIndicator: {
    alignItems: 'center',
    minWidth: 32,
  },
  stepDuration: {
    fontSize: 10,
  },
  
  // Buttons
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtonGroup: {
    gap: 12,
  },
  controlButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 6,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  emptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
