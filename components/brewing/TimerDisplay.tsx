// components/brewing/TimerDisplay.tsx
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from 'react-native-svg';

interface TimerDisplayProps {
  time: number;
  isRunning: boolean;
  targetTime?: number;
}

export function TimerDisplay({
  time,
  isRunning,
  targetTime,
}: TimerDisplayProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const progress = targetTime ? (time / targetTime) * 100 : 0;

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.cardBackground,
      borderLeftColor: isRunning ? colors.statusGreen : colors.textSecondary,
    }]}>
      {/* Professional Timer Header */}
      <View style={styles.timerHeader}>
        <ThemedText style={[styles.timerTitle, { color: colors.text }]}>
          EXTRACTION TIMER
        </ThemedText>
        <ThemedText style={[styles.timerStatus, { color: isRunning ? colors.statusGreen : colors.textSecondary }]}>
          {isRunning ? 'ACTIVE' : 'STANDBY'}
        </ThemedText>
      </View>

      {/* Advanced Timer Display */}
      <View style={styles.timerSection}>
        <View style={styles.primaryTimer}>
          <ThemedText style={[styles.time, { color: colors.text }]}>
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}
          </ThemedText>
          {targetTime && (
            <ThemedText style={[styles.targetTime, { color: colors.textSecondary }]}>
              TARGET: {Math.floor(targetTime / 60)}:
              {(targetTime % 60).toString().padStart(2, "0")}
            </ThemedText>
          )}
        </View>

        {/* Progress bar instead of circle for minimal design */}
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: colors.cardBackgroundSecondary }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.primary,
                  width: `${Math.min(progress, 100)}%`
                }
              ]} 
            />
          </View>
          <View style={styles.progressLabels}>
            <ThemedText style={[styles.progressLabel, { color: colors.textSecondary }]}>
              PROGRESS
            </ThemedText>
            <ThemedText style={[styles.progressValue, { color: colors.text }]}>
              {Math.round(progress)}%
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Technical Metrics */}
      <View style={styles.metricsSection}>
        <View style={styles.metricItem}>
          <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
            ELAPSED
          </ThemedText>
          <ThemedText style={[styles.metricValue, { color: colors.text }]}>
            {time}s
          </ThemedText>
        </View>
        
        {targetTime && (
          <View style={styles.metricItem}>
            <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
              REMAINING
            </ThemedText>
            <ThemedText style={[styles.metricValue, { color: colors.text }]}>
              {Math.max(0, targetTime - time)}s
            </ThemedText>
          </View>
        )}
        
        <View style={styles.metricItem}>
          <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
            RATE
          </ThemedText>
          <ThemedText style={[styles.metricValue, { color: colors.text }]}>
            {isRunning ? '1.00x' : '0.00x'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  
  // Timer header
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timerStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Timer section
  timerSection: {
    marginBottom: 16,
  },
  primaryTimer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  time: {
    fontSize: 48,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
    lineHeight: 48,
  },
  targetTime: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  
  // Progress section
  progressSection: {
    gap: 8,
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
  
  // Metrics section
  metricsSection: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
