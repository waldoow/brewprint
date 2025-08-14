import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, View } from "react-native";

interface InfoSectionProps {
  brand: string;
  model: string;
  burrMaterial?: "steel" | "ceramic" | "titanium-coated";
  micronsPerStep?: number;
}

export function InfoSection({ brand, model, burrMaterial, micronsPerStep }: InfoSectionProps) {
  const cardBackgroundColor = useThemeColor({}, "cardBackground");

  const formatBurrMaterial = (material: string) => {
    switch (material) {
      case "titanium-coated":
        return "Titanium Coated";
      default:
        return material.charAt(0).toUpperCase() + material.slice(1);
    }
  };

  const getMaterialIcon = (material?: string) => {
    switch (material) {
      case "steel":
        return "wrench.and.screwdriver.fill";
      case "ceramic":
        return "cube.fill";
      case "titanium-coated":
        return "sparkles";
      default:
        return "gear";
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackgroundColor }]}>
      {/* Brand and Model */}
      <View style={styles.row}>
        <View style={styles.infoItem}>
          <IconSymbol name="tag.fill" size={16} color={Colors.light.text} />
          <ThemedText style={styles.label}>Brand:</ThemedText>
          <ThemedText style={styles.value}>{brand}</ThemedText>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.infoItem}>
          <IconSymbol name="cube.box.fill" size={16} color={Colors.light.text} />
          <ThemedText style={styles.label}>Model:</ThemedText>
          <ThemedText style={styles.value}>{model}</ThemedText>
        </View>
      </View>

      {/* Burr Material */}
      {burrMaterial && (
        <View style={styles.row}>
          <View style={styles.infoItem}>
            <IconSymbol name={getMaterialIcon(burrMaterial)} size={16} color={Colors.light.text} />
            <ThemedText style={styles.label}>Burr Material:</ThemedText>
            <ThemedText style={styles.value}>{formatBurrMaterial(burrMaterial)}</ThemedText>
          </View>
        </View>
      )}

      {/* Precision */}
      {micronsPerStep && (
        <View style={styles.row}>
          <View style={styles.infoItem}>
            <IconSymbol name="ruler.fill" size={16} color={Colors.light.text} />
            <ThemedText style={styles.label}>Precision:</ThemedText>
            <ThemedText style={styles.value}>{micronsPerStep}μ per step</ThemedText>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
    minWidth: 80,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});