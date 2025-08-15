// app/brewing/[id].tsx
import { BrewingPhase } from "@/components/brewing/BrewingPhase";
import { TimerDisplay } from "@/components/brewing/TimerDisplay";
import { Header } from "@/components/ui/Header";
import { InteractiveSlider } from "@/components/ui/InteractiveSlider";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
// import { useBrewprint } from "@/hooks/useBrewprint";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTimer } from "@/hooks/useTimer";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

type BrewingStep = "preparation" | "blooming" | "pouring" | "finished";

export default function BrewingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  // const { brewprint, loading } = useBrewprint(id);
  const brewprint = {
    name: "Test Brewprint",
    method: "V60",
    beans: { name: "Test Beans", roaster: "Test Roaster" },
    parameters: {
      waterTemp: 90,
      grindSize: 1,
      coffeeAmount: 10,
      waterAmount: 100,
      ratio: 16,
      totalTime: 120,
    },
  };
  const loading = false;
  const [currentStep, setCurrentStep] = useState<BrewingStep>("preparation");
  const [actualParameters, setActualParameters] = useState({
    waterTemp: 0,
    grindSize: 0,
    coffeeAmount: 0,
    waterAmount: 0,
  });

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
      setActualParameters({
        waterTemp: brewprint.parameters.waterTemp,
        grindSize: brewprint.parameters.grindSize,
        coffeeAmount: brewprint.parameters.coffeeAmount,
        waterAmount: brewprint.parameters.waterAmount,
      });

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
    setCurrentStep("blooming");
    startTimer();
    toast.success("Brewing started! Begin blooming phase.");
  };

  const handleNextPhase = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (currentStep) {
      case "blooming":
        setCurrentStep("pouring");
        toast.info("Blooming complete. Start main pour.");
        break;
      case "pouring":
        setCurrentStep("finished");
        pauseTimer();
        toast.success("Brewing complete! How was it?");
        break;
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (!brewprint) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>Brewprint not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header
        title="BREWING SESSION"
        subtitle={`${brewprint.name} • ${brewprint.method} extraction protocol`}
        onBack={() => router.back()}
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
          {/* Recipe Specifications Card */}
          <View
            style={[
              styles.recipeCard,
              { 
                backgroundColor: colors.cardBackground,
                borderLeftColor: colors.primary,
              }
            ]}
          >
            <View style={styles.recipeHeader}>
              <ThemedText style={[styles.recipeTitle, { color: colors.text }]}>
                RECIPE SPECIFICATIONS
              </ThemedText>
              <ThemedText style={[styles.recipeStatus, { color: colors.primary }]}>
                {brewprint.method.toUpperCase()}
              </ThemedText>
            </View>

            <View style={styles.recipeSpecs}>
              <View style={styles.specificationRow}>
                <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                  COFFEE BEANS
                </ThemedText>
                <ThemedText style={[styles.specValue, { color: colors.text }]}>
                  {brewprint.beans.name}
                </ThemedText>
              </View>
              
              <View style={styles.specificationRow}>
                <ThemedText style={[styles.specLabel, { color: colors.textSecondary }]}>
                  ROASTER
                </ThemedText>
                <ThemedText style={[styles.specValue, { color: colors.text }]}>
                  {brewprint.beans.roaster}
                </ThemedText>
              </View>
            </View>

            <View style={styles.parametersGrid}>
              <View style={styles.parameterRow}>
                <ThemedText style={[styles.paramLabel, { color: colors.textSecondary }]}>
                  RATIO
                </ThemedText>
                <ThemedText style={[styles.paramValue, { color: colors.text }]}>
                  1:{brewprint.parameters.ratio}
                </ThemedText>
              </View>
              
              <View style={styles.parameterRow}>
                <ThemedText style={[styles.paramLabel, { color: colors.textSecondary }]}>
                  TARGET TIME
                </ThemedText>
                <ThemedText style={[styles.paramValue, { color: colors.text }]}>
                  {Math.floor(brewprint.parameters.totalTime / 60)}:
                  {(brewprint.parameters.totalTime % 60)
                    .toString()
                    .padStart(2, "0")}
                </ThemedText>
              </View>
              
              <View style={styles.parameterRow}>
                <ThemedText style={[styles.paramLabel, { color: colors.textSecondary }]}>
                  WATER TEMP
                </ThemedText>
                <ThemedText style={[styles.paramValue, { color: colors.text }]}>
                  {brewprint.parameters.waterTemp}°C
                </ThemedText>
              </View>
              
              <View style={styles.parameterRow}>
                <ThemedText style={[styles.paramLabel, { color: colors.textSecondary }]}>
                  GRIND SIZE
                </ThemedText>
                <ThemedText style={[styles.paramValue, { color: colors.text }]}>
                  {brewprint.parameters.grindSize}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Timer Section */}
          <TimerDisplay
            time={time}
            isRunning={isRunning}
            targetTime={brewprint.parameters.totalTime}
          />

          {currentStep !== "preparation" && (
            <BrewingPhase
              currentPhase={currentStep}
              onNextPhase={handleNextPhase}
            />
          )}

          {/* Live Monitoring Section */}
          <View style={[styles.monitoringSection, { 
            backgroundColor: colors.cardBackground,
            borderLeftColor: colors.statusGreen,
          }]}>
            <View style={styles.monitoringHeader}>
              <ThemedText style={[styles.monitoringTitle, { color: colors.text }]}>
                LIVE MONITORING
              </ThemedText>
              <ThemedText style={[styles.monitoringStatus, { color: colors.statusGreen }]}>
                ACTIVE
              </ThemedText>
            </View>

            <View style={styles.monitoringGrid}>
              <View style={styles.monitoringRow}>
                <ThemedText style={[styles.monitoringLabel, { color: colors.textSecondary }]}>
                  WATER TEMP
                </ThemedText>
                <ThemedText style={[styles.monitoringValue, { color: colors.text }]}>
                  {actualParameters.waterTemp}°C
                </ThemedText>
              </View>
              
              <View style={styles.monitoringRow}>
                <ThemedText style={[styles.monitoringLabel, { color: colors.textSecondary }]}>
                  GRIND SETTING
                </ThemedText>
                <ThemedText style={[styles.monitoringValue, { color: colors.text }]}>
                  {actualParameters.grindSize}
                </ThemedText>
              </View>
              
              <View style={styles.monitoringRow}>
                <ThemedText style={[styles.monitoringLabel, { color: colors.textSecondary }]}>
                  COFFEE DOSE
                </ThemedText>
                <ThemedText style={[styles.monitoringValue, { color: colors.text }]}>
                  {actualParameters.coffeeAmount}g
                </ThemedText>
              </View>
              
              <View style={styles.monitoringRow}>
                <ThemedText style={[styles.monitoringLabel, { color: colors.textSecondary }]}>
                  WATER VOLUME
                </ThemedText>
                <ThemedText style={[styles.monitoringValue, { color: colors.text }]}>
                  {actualParameters.waterAmount}ml
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Professional Action Panel */}
          {currentStep === "preparation" ? (
            <View style={[styles.actionPanel, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.actionHeader}>
                <ThemedText style={[styles.actionTitle, { color: colors.text }]}>
                  BREWING PROTOCOL
                </ThemedText>
                <ThemedText style={[styles.actionStatus, { color: colors.textSecondary }]}>
                  READY
                </ThemedText>
              </View>
              
              <View style={styles.actionGrid}>
                <ThemedButton
                  onPress={handleStartBrewing}
                  variant="default"
                  size="default"
                  style={styles.primaryAction}
                >
                  INITIATE EXTRACTION
                </ThemedButton>
                
                <View style={styles.actionInstructions}>
                  <ThemedText style={[styles.instructionText, { color: colors.textSecondary }]}>
                    Verify equipment calibration • Water temperature • Grind consistency
                  </ThemedText>
                </View>
              </View>
            </View>
          ) : currentStep === "finished" ? (
            <View style={[styles.actionPanel, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.actionHeader}>
                <ThemedText style={[styles.actionTitle, { color: colors.text }]}>
                  SESSION COMPLETE
                </ThemedText>
                <ThemedText style={[styles.actionStatus, { color: colors.statusGreen }]}>
                  ANALYSIS READY
                </ThemedText>
              </View>
              
              <View style={styles.actionGrid}>
                <ThemedButton
                  onPress={() => router.push(`/brewing/${id}/results`)}
                  variant="default"
                  size="default"
                  style={styles.primaryAction}
                >
                  ANALYZE RESULTS
                </ThemedButton>
                
                <ThemedButton
                  onPress={() => {
                    setCurrentStep("preparation");
                    resetTimer();
                  }}
                  variant="secondary"
                  size="default"
                  style={styles.secondaryAction}
                >
                  REPEAT PROTOCOL
                </ThemedButton>
              </View>
            </View>
          ) : null}
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  
  // Advanced recipe card
  recipeCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  recipeStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  recipeSpecs: {
    gap: 8,
    marginBottom: 12,
  },
  specificationsGrid: {
    gap: 8,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  specValue: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  
  // Parameters grid
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  parameterRow: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  paramLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  paramValue: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  
  // Live monitoring section
  monitoringSection: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monitoringTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  monitoringStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  monitoringGrid: {
    gap: 8,
  },
  monitoringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monitoringLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  monitoringValue: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    flex: 1,
  },
  
  // Professional action panel
  actionPanel: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  actionStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  actionGrid: {
    gap: 12,
  },
  primaryAction: {
    alignSelf: 'stretch',
  },
  secondaryAction: {
    alignSelf: 'stretch',
  },
  actionInstructions: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionText: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
