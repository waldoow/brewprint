// components/ui/InteractiveSlider.tsx
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Haptics } from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";

interface InteractiveSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
}

export function InteractiveSlider({
  min,
  max,
  value,
  onChange,
  label,
  unit,
}: InteractiveSliderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [sliderWidth, setSliderWidth] = useState(0);

  const percentage = ((value - min) / (max - min)) * 100;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (_, gestureState) => {
      const newPercentage = Math.max(
        0,
        Math.min(100, (gestureState.moveX / sliderWidth) * 100)
      );
      const newValue = Math.round(min + (newPercentage / 100) * (max - min));
      onChange(newValue);

      if (newValue !== value) {
        Haptics.selectionAsync();
      }
    },
  });

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.value, { color: colors.primary }]}>
            {value}
            {unit}
          </Text>
        </View>
      )}

      <View
        style={[styles.track, { backgroundColor: colors.border }]}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={[styles.fill, { width: `${percentage}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />

        <View
          style={[
            styles.thumb,
            {
              left: `${percentage}%`,
              backgroundColor: colors.surface,
              borderColor: colors.primary,
            },
          ]}
        >
          <View
            style={[styles.thumbInner, { backgroundColor: colors.primary }]}
          />
        </View>
      </View>

      <View style={styles.scaleContainer}>
        <Text style={[styles.scaleText, { color: colors.textTertiary }]}>
          {min}
        </Text>
        <Text style={[styles.scaleText, { color: colors.textTertiary }]}>
          {max}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
  },
  track: {
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  fill: {
    height: "100%",
    borderRadius: 20,
  },
  thumb: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    top: 4,
    marginLeft: -16,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  scaleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  scaleText: {
    fontSize: 12,
  },
});
