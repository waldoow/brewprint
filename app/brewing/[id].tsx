// app/brewing/[id].tsx
import { BrewingPhase } from "@/components/brewing/BrewingPhase";
import { TimerDisplay } from "@/components/brewing/TimerDisplay";
import { Header } from "@/components/ui/Header";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useBrewprint } from "@/hooks/useBrewprint";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTimer } from "@/hooks/useTimer";
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

type BrewingStep = "preparation" | "blooming" | "pouring" | "finished";

export default function BrewingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const { brewprint, loading, error } = useBrewprint(id);

  const [currentStep, setCurrentStep] = useState<BrewingStep>("preparation");

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
          {/* Simple Recipe Info */}
          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
            <ThemedText style={[styles.recipeName, { color: colors.text }]}>
              {brewprint.name}
            </ThemedText>
            <ThemedText style={[styles.recipeMethod, { color: colors.textSecondary }]}>
              {brewprint.method} • {brewprint.beans.name}
            </ThemedText>
            
            <View style={styles.quickParams}>
              <ThemedText style={[styles.param, { color: colors.textSecondary }]}>
                {brewprint.parameters.coffeeAmount}g coffee
              </ThemedText>
              <ThemedText style={[styles.param, { color: colors.textSecondary }]}>
                {brewprint.parameters.waterAmount}ml water
              </ThemedText>
              <ThemedText style={[styles.param, { color: colors.textSecondary }]}>
                {brewprint.parameters.waterTemp}°C
              </ThemedText>
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

          {/* Simple Action Panel */}
          {currentStep === "preparation" ? (
            <View style={[styles.actionPanel, { backgroundColor: colors.cardBackground }]}>
              <ThemedButton
                title="Start Brewing"
                onPress={handleStartBrewing}
                variant="default"
                size="lg"
                style={styles.primaryAction}
              />
            </View>
          ) : currentStep === "finished" ? (
            <View style={[styles.actionPanel, { backgroundColor: colors.cardBackground }]}>
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
                  setCurrentStep("preparation");
                  resetTimer();
                }}
                variant="outline"
                size="lg"
                style={styles.secondaryAction}
              />
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

  // Simple Action Panel
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
});
