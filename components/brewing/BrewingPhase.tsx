// components/brewing/BrewingPhase.tsx
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, Text } from "react-native";

interface BrewingPhaseProps {
  currentPhase: "blooming" | "pouring" | "finished";
  onNextPhase: () => void;
}

const phaseData = {
  blooming: {
    title: "BLOOM PHASE",
    description: "Saturate grounds • 2x coffee weight • 30-45 second degassing period",
    technical: "CO2 Release • Uniform saturation • Foundation extraction",
    duration: 30,
    priority: "critical" as const,
    status: "active" as const,
  },
  pouring: {
    title: "EXTRACTION PHASE",
    description: "Primary pour • Steady spiral pattern • Maintain water level",
    technical: "Soluble extraction • Temperature maintenance • Flow rate control",
    duration: 150,
    priority: "high" as const,
    status: "active" as const,
  },
  finished: {
    title: "EXTRACTION COMPLETE",
    description: "Final drip-through • Quality assessment • Cleanup preparation",
    technical: "Total dissolved solids extracted • Recipe evaluation ready",
    duration: 0,
    priority: "complete" as const,
    status: "completed" as const,
  },
};

export function BrewingPhase({ currentPhase, onNextPhase }: BrewingPhaseProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentPhase]);

  const phase = phaseData[currentPhase];

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case 'critical': return colors.statusRed;
      case 'high': return colors.statusYellow;
      case 'complete': return colors.statusGreen;
      default: return colors.primary;
    }
  };

  const getProgressPercentage = () => {
    switch (currentPhase) {
      case 'blooming': return 33;
      case 'pouring': return 67;
      case 'finished': return 100;
      default: return 0;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Advanced Phase Analysis Card */}
      <View
        style={[
          styles.phaseCard, 
          { 
            backgroundColor: colors.cardBackground,
            borderLeftColor: getBorderColor(phase.priority),
          }
        ]}
      >
        {/* Professional Header */}
        <View style={styles.phaseHeader}>
          <View style={styles.phaseMain}>
            <ThemedText style={[styles.phaseTitle, { color: colors.text }]}>
              {phase.title}
            </ThemedText>
            <ThemedText style={[styles.phaseStatus, { color: getBorderColor(phase.priority) }]}>
              {phase.priority.toUpperCase()}
            </ThemedText>
          </View>
        </View>

        {/* Technical Instructions */}
        <View style={styles.instructionsSection}>
          <View style={styles.instructionRow}>
            <ThemedText style={[styles.instructionLabel, { color: colors.textSecondary }]}>
              TECHNIQUE
            </ThemedText>
            <ThemedText style={[styles.instructionValue, { color: colors.text }]}>
              {phase.description}
            </ThemedText>
          </View>
          
          <View style={styles.instructionRow}>
            <ThemedText style={[styles.instructionLabel, { color: colors.textSecondary }]}>
              OBJECTIVE
            </ThemedText>
            <ThemedText style={[styles.instructionValue, { color: colors.text }]}>
              {phase.technical}
            </ThemedText>
          </View>
          
          {phase.duration > 0 && (
            <View style={styles.instructionRow}>
              <ThemedText style={[styles.instructionLabel, { color: colors.textSecondary }]}>
                DURATION
              </ThemedText>
              <ThemedText style={[styles.instructionValue, { color: colors.text }]}>
                {phase.duration}s target
              </ThemedText>
            </View>
          )}
        </View>

        {/* Progress Analytics */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <ThemedText style={[styles.progressLabel, { color: colors.textSecondary }]}>
              PHASE PROGRESS
            </ThemedText>
            <ThemedText style={[styles.progressValue, { color: colors.text }]}>
              {getProgressPercentage()}%
            </ThemedText>
          </View>
          
          <View style={[styles.progressTrack, { backgroundColor: colors.cardBackgroundSecondary }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: getBorderColor(phase.priority),
                  width: `${getProgressPercentage()}%`
                }
              ]} 
            />
          </View>
        </View>

        {/* Action Controls */}
        {currentPhase !== "finished" ? (
          <ThemedButton
            onPress={onNextPhase}
            variant="default"
            size="default"
            style={styles.actionButton}
          >
            {currentPhase === "blooming" ? "PROCEED TO EXTRACTION" : "COMPLETE BREWING"}
          </ThemedButton>
        ) : (
          <View style={styles.completedSection}>
            <ThemedText style={[styles.completedText, { color: colors.statusGreen }]}>
              EXTRACTION ANALYSIS READY
            </ThemedText>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 16,
  },
  phaseCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Header section
  phaseHeader: {
    marginBottom: 12,
  },
  phaseMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  phaseStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Instructions section
  instructionsSection: {
    gap: 8,
    marginBottom: 12,
  },
  instructionRow: {
    flexDirection: 'column',
    gap: 2,
  },
  instructionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  instructionValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  
  // Progress section
  progressSection: {
    gap: 8,
    marginBottom: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 2,
  },
  
  // Actions
  actionButton: {
    alignSelf: 'stretch',
  },
  completedSection: {
    alignItems: 'center',
    padding: 8,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
