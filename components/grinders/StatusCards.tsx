import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, View } from "react-native";

interface StatusCardsProps {
  type: "electric" | "manual";
  burrType?: "conical" | "flat" | "ghost";
  defaultSetting?: number;
  isDefault: boolean;
}

export function StatusCards({ type, burrType, defaultSetting, isDefault }: StatusCardsProps) {
  const cardBackgroundColor = useThemeColor({}, "cardBackground");

  const getTypeVariant = (type: "electric" | "manual") => {
    switch (type) {
      case "electric":
        return "default";
      case "manual":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getBurrIcon = (burrType?: "conical" | "flat" | "ghost") => {
    switch (burrType) {
      case "conical":
        return "cone.fill";
      case "flat":
        return "circle.fill";
      case "ghost":
        return "sparkles";
      default:
        return "gear";
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackgroundColor }]}>
      {/* Type and Burr Type */}
      <View style={styles.row}>
        <View style={styles.typeSection}>
          <IconSymbol
            name={type === "electric" ? "bolt.fill" : "hand.raised.fill"}
            size={16}
            color={Colors.light.text}
          />
          <ThemedBadge variant={getTypeVariant(type)} size="sm">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </ThemedBadge>
        </View>

        {burrType && (
          <View style={styles.burrSection}>
            <IconSymbol
              name={getBurrIcon(burrType)}
              size={16}
              color={Colors.light.text}
            />
            <ThemedText style={styles.burrText}>
              {burrType.charAt(0).toUpperCase() + burrType.slice(1)} Burr
            </ThemedText>
          </View>
        )}
      </View>

      {/* Default Setting and Status */}
      <View style={styles.row}>
        {defaultSetting && (
          <View style={styles.settingSection}>
            <IconSymbol name="dial.fill" size={16} color={Colors.light.text} />
            <ThemedText style={styles.settingText}>
              Setting {defaultSetting}
            </ThemedText>
          </View>
        )}

        {isDefault && (
          <ThemedBadge variant="success" size="sm">
            Default
          </ThemedBadge>
        )}
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  typeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  burrSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  burrText: {
    fontSize: 14,
    opacity: 0.8,
  },
  settingSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingText: {
    fontSize: 14,
    fontWeight: "500",
  },
});