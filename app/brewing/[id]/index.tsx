import { DataButton } from "@/components/ui/DataButton";
import { DataCard, InfoCard } from "@/components/ui/DataCard";
import { DataGrid, DataLayout, DataSection } from "@/components/ui/DataLayout";
import { DataMetric } from "@/components/ui/DataMetric";
import { DataText } from "@/components/ui/DataText";
import { getTheme } from "@/constants/DataFirstDesign";
import { useBrewprint } from "@/hooks/useBrewprint";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTimer } from "@/hooks/useTimer";
import type { BrewStep } from "@/lib/services/brewprints";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";

export default function BrewingScreen() {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");
  
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
      <DataLayout
        title="Invalid Brewing Session"
        subtitle="Recipe ID is required"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <View style={styles.centerContent}>
          <DataText variant="body" color="secondary">
            No valid recipe ID provided for brewing session
          </DataText>
          <DataButton
            title="Back to Recipes"
            onPress={() => router.back()}
            variant="primary"
            style={{ marginTop: 16 }}
          />
        </View>
      </DataLayout>
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
      <DataLayout
        title="Brewing Session"
        subtitle="Loading recipe for brewing..."
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <View style={styles.centerContent}>
          <DataText variant="body" color="secondary">
            Loading brewing session...
          </DataText>
        </View>
      </DataLayout>
    );
  }

  if (error || !brewprint) {
    return (
      <DataLayout
        title="Recipe Not Available"
        subtitle="Brewing recipe could not be loaded"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <InfoCard
          title="Recipe Not Available"
          message={
            error ||
            "This brewing recipe could not be loaded from your library."
          }
          variant="error"
          action={{
            title: "Back to Recipes",
            onPress: () => router.back(),
            variant: "primary",
          }}
        />
      </DataLayout>
    );
  }

  const ratio =
    Math.round(
      (brewprint.parameters.waterAmount / brewprint.parameters.coffeeAmount) *
        10
    ) / 10;
  const currentStep = getCurrentStep();

  return (
    <DataLayout
      title={`${brewprint.name} - ${getStatusText()}`}
      subtitle={`${
        brewprint.method.charAt(0).toUpperCase() +
        brewprint.method.slice(1).replace("-", " ")
      } Brewing • ${formatTime(time)}`}
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable
    >
      {/* Current Brewing Status */}
      <DataSection title="Current Session" spacing="lg">
        <DataGrid columns={3} gap="md">
          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Elapsed Time
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              {formatTime(time)}
            </DataText>
          </DataCard>

          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Coffee Dose
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              {brewprint.parameters.coffee_grams}g
            </DataText>
          </DataCard>

          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Ratio
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              1:{ratio}
            </DataText>
          </DataCard>
        </DataGrid>
      </DataSection>

      {/* Recipe Parameters */}
      <DataSection
        title="Recipe Specifications"
        subtitle="Brewing parameters for this recipe"
        spacing="lg"
      >
        <DataCard>
          <DataGrid columns={2} gap="sm">
            <DataMetric
              label="Coffee Dose"
              value={brewprint.parameters.coffeeAmount}
              unit="g"
            />
            <DataMetric
              label="Water Volume"
              value={brewprint.parameters.waterAmount}
              unit="ml"
            />
            <DataMetric
              label="Water Temperature"
              value={brewprint.parameters.water_temp}
              unit="°C"
            />
            <DataMetric label="Coffee Ratio" value={`1:${ratio}`} />
          </DataGrid>
        </DataCard>
      </DataSection>

      {/* Timer Section */}
      <DataSection
        title="Extraction Timer"
        subtitle={
          isRunning
            ? `Timer active - ${Math.round(getProgress())}% complete`
            : "Timer ready"
        }
        spacing="lg"
      >
        <DataCard>
          <View style={styles.timerContainer}>
            <DataText
              variant="display"
              weight="bold"
              style={styles.timerDisplay}
            >
              {formatTime(time)}
            </DataText>

            {brewprint.parameters.totalTime && (
              <DataGrid columns={2} gap="md" style={{ marginTop: 16 }}>
                <DataMetric
                  label="Target Time"
                  value={formatTime(brewprint.parameters.totalTime)}
                />
                <DataMetric
                  label="Remaining"
                  value={formatTime(
                    Math.max(0, brewprint.parameters.totalTime - time)
                  )}
                />
              </DataGrid>
            )}

            {brewprint.parameters.totalTime && (
              <View style={styles.progressSection}>
                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: theme.colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: isRunning
                          ? theme.colors.warning
                          : theme.colors.text.primary,
                        width: `${getProgress()}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressLabels}>
                  <DataText variant="caption" color="secondary">
                    Progress: {Math.round(getProgress())}%
                  </DataText>
                  <DataText variant="caption" color="secondary">
                    Status: {isRunning ? "Active" : "Paused"}
                  </DataText>
                </View>
              </View>
            )}
          </View>
        </DataCard>
      </DataSection>

      {/* Current Step - Active Phase */}
      {isBrewingStarted && !isBrewingComplete && currentStep && (
        <DataSection
          title={`Step ${currentStepIndex + 1} of ${brewprint.steps.length}`}
          subtitle="Active brewing instruction"
          spacing="lg"
        >
          <DataCard>
            <DataText
              variant="h3"
              weight="semibold"
              style={{ marginBottom: 12 }}
            >
              {currentStep.title}
            </DataText>

            <DataText
              variant="body"
              color="secondary"
              style={{ marginBottom: 16, lineHeight: 24 }}
            >
              {currentStep.description}
            </DataText>

            <DataGrid columns={3} gap="sm">
              <DataMetric
                label="Duration"
                value={currentStep.duration}
                unit="s"
              />
              <DataMetric
                label="Water Amount"
                value={currentStep.water_amount}
                unit="g"
              />
              <DataMetric
                label="Progress"
                value={`${Math.round(getStepProgress())}%`}
              />
            </DataGrid>

            <View style={{ marginTop: 12 }}>
              <DataText
                variant="caption"
                color="secondary"
                style={{ marginBottom: 4 }}
              >
                Technique: {currentStep.technique.replace("-", " ")}
              </DataText>
            </View>
          </DataCard>
        </DataSection>
      )}

      {/* Steps Overview - Pre-brewing */}
      {!isBrewingStarted && brewprint.steps && brewprint.steps.length > 0 && (
        <DataSection
          title="Brewing Process Overview"
          subtitle={`${brewprint.steps.length} precise steps to perfect extraction`}
          spacing="lg"
        >
          <DataCard>
            <DataText
              variant="h4"
              weight="semibold"
              style={{ marginBottom: 16 }}
            >
              Brewing Sequence ({brewprint.steps.length} steps)
            </DataText>

            {brewprint.steps.map((step, index) => (
              <View
                key={step.id}
                style={[
                  styles.stepRow,
                  index === brewprint.steps.length - 1 && styles.lastStep,
                ]}
              >
                <View
                  style={[
                    styles.stepNumber,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <DataText variant="caption" weight="bold" color="secondary">
                    {index + 1}
                  </DataText>
                </View>

                <View style={styles.stepContent}>
                  <DataText variant="body" weight="semibold">
                    {step.title}
                  </DataText>
                  <DataText
                    variant="caption"
                    color="secondary"
                    style={styles.stepMeta}
                  >
                    {step.duration}s • {step.water_amount}g •{" "}
                    {step.technique.replace("-", " ")}
                  </DataText>
                  {step.description && (
                    <DataText
                      variant="caption"
                      color="secondary"
                      style={styles.stepNote}
                      numberOfLines={2}
                    >
                      {step.description}
                    </DataText>
                  )}
                </View>

                <View style={styles.stepIndicator}>
                  <DataText variant="caption" color="secondary">
                    {step.duration}s
                  </DataText>
                </View>
              </View>
            ))}
          </DataCard>
        </DataSection>
      )}

      {/* Brewing Analytics - Post completion */}
      {isBrewingComplete && (
        <DataSection
          title="Brewing Analytics"
          subtitle="Your extraction performance metrics"
          spacing="lg"
        >
          <DataGrid columns={2} gap="md">
            <DataCard>
              <DataText variant="small" color="secondary" weight="medium">
                Total Time
              </DataText>
              <DataText
                variant="h2"
                color="primary"
                weight="bold"
                style={{ marginVertical: theme.spacing[1] }}
              >
                {formatTime(time)}
              </DataText>
            </DataCard>

            <DataCard>
              <DataText variant="small" color="secondary" weight="medium">
                Steps Completed
              </DataText>
              <DataText
                variant="h2"
                color="primary"
                weight="bold"
                style={{ marginVertical: theme.spacing[1] }}
              >
                {brewprint.steps.length}
              </DataText>
            </DataCard>

            <DataCard>
              <DataText variant="small" color="secondary" weight="medium">
                Target Time
              </DataText>
              <DataText
                variant="h2"
                color="primary"
                weight="bold"
                style={{ marginVertical: theme.spacing[1] }}
              >
                {brewprint.parameters.totalTime
                  ? formatTime(brewprint.parameters.totalTime)
                  : "N/A"}
              </DataText>
            </DataCard>

            <DataCard>
              <DataText variant="small" color="secondary" weight="medium">
                Precision
              </DataText>
              <DataText
                variant="h2"
                color="primary"
                weight="bold"
                style={{ marginVertical: theme.spacing[1] }}
              >
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
              </DataText>
            </DataCard>
          </DataGrid>
        </DataSection>
      )}

      {/* Action Controls */}
      <DataSection
        title="Brewing Controls"
        subtitle={
          brewingPhase === "preparation"
            ? "Ready to begin your brewing session"
            : brewingPhase === "brewing"
            ? "Control your active brewing session"
            : "Session complete - review or brew again"
        }
        spacing="xl"
      >
        {!isBrewingStarted ? (
          <DataButton
            title={`Start Brewing ${brewprint.name}`}
            onPress={handleStartBrewing}
            variant="primary"
            size="lg"
            fullWidth
          />
        ) : isBrewingComplete ? (
          <DataGrid columns={1} gap="md">
            <DataButton
              title="View Full Results"
              onPress={() => router.push(`/brewing/${id}/results`)}
              variant="primary"
              size="lg"
              fullWidth
            />
            <DataButton
              title="Brew This Recipe Again"
              onPress={resetBrewing}
              variant="secondary"
              size="lg"
              fullWidth
            />
          </DataGrid>
        ) : (
          <DataGrid columns={1} gap="md">
            <DataButton
              title={
                currentStepIndex < (brewprint.steps?.length || 0) - 1
                  ? "Continue to Next Step"
                  : "Complete Brewing Session"
              }
              onPress={handleNextStep}
              variant="primary"
              size="lg"
              fullWidth
            />
            <DataGrid columns={2} gap="sm">
              <DataButton
                title={isRunning ? "Pause Timer" : "Resume Timer"}
                onPress={isRunning ? pauseTimer : startTimer}
                variant="secondary"
              />
              <DataButton
                title="Reset Session"
                onPress={resetBrewing}
                variant="outline"
              />
            </DataGrid>
          </DataGrid>
        )}
      </DataSection>
    </DataLayout>
  );
}

const styles = {
  centerContent: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 32,
  },

  heroSection: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    overflow: "hidden" as const,
  },

  heroContent: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 28,
  },

  heroHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginBottom: 24,
  },

  modernStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center" as const,
    minWidth: 80,
  },

  heroStats: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },

  heroStat: {
    alignItems: "center" as const,
    flex: 1,
  },

  errorCard: {
    alignItems: "center" as const,
    padding: 32,
  },

  errorTitle: {
    textAlign: "center" as const,
    marginBottom: 8,
  },

  errorMessage: {
    textAlign: "center" as const,
    marginBottom: 24,
    lineHeight: 22,
  },

  headerActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },

  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: "center" as const,
  },

  timerContainer: {
    alignItems: "center" as const,
    paddingVertical: 16,
  },

  timerMain: {
    alignItems: "center" as const,
    marginBottom: 32,
  },

  timerDisplay: {
    fontSize: 96,
    lineHeight: 96,
    marginBottom: 12,
    fontVariant: ["tabular-nums"] as any,
  },

  timerMeta: {
    flexDirection: "row" as const,
    gap: 24,
  },

  progressSection: {
    width: "100%" as const,
    gap: 12,
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden" as const,
  },

  progressBar: {
    height: "100%" as const,
    borderRadius: 4,
    minWidth: 4,
  },

  progressLabels: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },

  activeStepCard: {
    borderLeftWidth: 6,
    padding: 24,
  },

  stepHeader: {
    marginBottom: 20,
  },

  stepProgress: {
    gap: 8,
  },

  stepProgressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden" as const,
  },

  stepProgressBar: {
    height: "100%" as const,
    borderRadius: 2,
    minWidth: 2,
  },

  stepTitle: {
    marginBottom: 12,
  },

  stepDescription: {
    marginBottom: 20,
    lineHeight: 24,
  },

  stepsHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 24,
  },

  stepsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  stepRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },

  lastStep: {
    borderBottomWidth: 0,
  },

  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 16,
  },

  stepContent: {
    flex: 1,
    gap: 4,
  },

  stepMeta: {
    fontSize: 11,
  },

  stepNote: {
    fontSize: 10,
    marginTop: 2,
  },

  stepIndicator: {
    alignItems: "center" as const,
    minWidth: 40,
  },

  actionGroup: {
    gap: 16,
  },

  timerControls: {
    flexDirection: "row" as const,
    gap: 0,
  },
};
