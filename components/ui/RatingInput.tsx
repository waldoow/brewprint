// components/ui/RatingInput.tsx
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "small" | "medium" | "large";
  readonly?: boolean;
}

export function RatingInput({
  value,
  onChange,
  size = "medium",
  readonly = false,
}: RatingInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Professional rating system with 10-point scale and smaller circles
  const sizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const starSize = sizes[size];

  const handlePress = (rating: number) => {
    if (readonly) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(rating);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
        <Pressable
          key={rating}
          onPress={() => handlePress(rating)}
          disabled={readonly}
          style={({ pressed }) => [
            styles.ratingCircle,
            {
              width: starSize,
              height: starSize,
              borderRadius: starSize / 2,
              backgroundColor: rating <= value ? colors.primary : 'transparent',
              borderColor: colors.border,
              transform: [{ scale: pressed && !readonly ? 1.1 : 1 }],
            },
          ]}
        >
          {rating <= value && (
            <View style={[styles.innerCircle, { 
              width: starSize * 0.6, 
              height: starSize * 0.6,
              borderRadius: (starSize * 0.6) / 2,
              backgroundColor: colors.background,
            }]} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6, // Smaller gap for professional layout
    flexWrap: 'wrap',
  },
  ratingCircle: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  innerCircle: {
    // Inner circle style for filled ratings
  },
});
