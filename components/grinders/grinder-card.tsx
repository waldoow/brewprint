import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedSeparator } from "@/components/ui/ThemedSeparator";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";

interface GrinderSetting {
  setting_number: number;
  description: string;
  method: string;
  bean_type: string;
  notes?: string;
}

interface SettingRange {
  min: number;
  max: number;
  increment: number;
}

interface Grinder {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: "electric" | "manual";
  burr_type?: "conical" | "flat" | "ghost";
  burr_material?: "steel" | "ceramic" | "titanium-coated";
  default_setting?: number;
  setting_range?: SettingRange;
  settings?: GrinderSetting[];
  total_uses: number;
  last_used?: string;
  is_default: boolean;
  notes?: string;
}

interface GrinderCardProps {
  grinder: Grinder;
  onPress?: (grinder: Grinder) => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

export function GrinderCard({ grinder, onPress, onLongPress, style }: GrinderCardProps) {
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  // Get type display with appropriate dot color
  const getTypeColor = () => {
    return grinder.type === "electric" ? "#3b82f6" : "#10b981"; // Blue for electric, green for manual
  };

  const getTypeDisplay = () => {
    return grinder.type.charAt(0).toUpperCase() + grinder.type.slice(1);
  };

  // Get grinder status variant
  const getStatusVariant = () => {
    if (grinder.is_default) return "success";
    return grinder.type === "electric" ? "default" : "secondary";
  };

  // Calculate usage frequency (uses per day since creation if last_used exists)
  const getUsageFrequency = () => {
    if (!grinder.last_used) return "New grinder";
    
    const lastUsed = new Date(grinder.last_used);
    const now = new Date();
    const diffTime = now.getTime() - lastUsed.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Used today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Calculate settings progress (number of saved settings)
  const settingsCount = grinder.settings?.length || 0;
  const maxVisibleSettings = 5; // Arbitrary max for progress visualization
  const settingsProgress = Math.min((settingsCount / maxVisibleSettings) * 100, 100);

  return (
    <TouchableOpacity
      onPress={() => onPress?.(grinder)}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={style}
    >
      <ThemedView style={styles.card}>
        {/* Top Section */}
        <ThemedView style={styles.topSection}>
          {/* Type Dot Indicator */}
          <ThemedView style={styles.typeIndicator}>
            <ThemedView
              style={[
                styles.typeDot,
                { backgroundColor: getTypeColor() },
              ]}
            />
            <ThemedText style={styles.typeLevel}>
              {getTypeDisplay()}
            </ThemedText>
          </ThemedView>

          {/* Status Badge */}
          <ThemedBadge variant={getStatusVariant() as any} size="sm">
            {grinder.is_default ? "Default" : grinder.burr_type ? grinder.burr_type.charAt(0).toUpperCase() + grinder.burr_type.slice(1) : "Ready"}
          </ThemedBadge>
        </ThemedView>

        {/* Grinder Name */}
        <ThemedText style={styles.name} numberOfLines={1}>
          {grinder.name}
        </ThemedText>

        {/* Brand & Model */}
        <ThemedText style={styles.supplier} numberOfLines={1}>
          {grinder.brand} {grinder.model}
        </ThemedText>

        {/* Info Section */}
        <ThemedView style={styles.infoSection}>
          <ThemedText style={styles.infoText} numberOfLines={1}>
            {grinder.total_uses} uses
          </ThemedText>

          <ThemedSeparator
            orientation="vertical"
            size="sm"
            horizontalMargin={6}
          />

          <ThemedText style={styles.infoText} numberOfLines={1}>
            {getUsageFrequency()}
          </ThemedText>

          {grinder.default_setting && (
            <>
              <ThemedSeparator
                orientation="vertical"
                size="sm"
                horizontalMargin={6}
              />
              <ThemedText style={styles.infoText}>
                Setting {grinder.default_setting}
              </ThemedText>
            </>
          )}
        </ThemedView>

        {/* Bottom Section with Settings Progress Bar */}
        <ThemedView style={styles.bottomSection}>
          <ThemedText style={styles.quantityText}>
            {settingsCount} settings saved
          </ThemedText>
          <ThemedView style={styles.progressBar}>
            <ThemedView
              style={[
                styles.progressFill,
                {
                  width: `${settingsProgress}%`,
                  backgroundColor:
                    settingsCount >= 3
                      ? tintColor
                      : settingsCount >= 1
                      ? "#f59e0b"
                      : "#ef4444",
                },
              ]}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 6,
    // Subtle shadows
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  typeLevel: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: "500",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  supplier: {
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.6,
    marginBottom: 8,
  },
  infoSection: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 0,
  },
  infoText: {
    fontSize: 10,
    opacity: 0.5,
    lineHeight: 14,
  },
  bottomSection: {
    marginTop: "auto",
  },
  quantityText: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
    marginBottom: 4,
  },
  progressBar: {
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colors.dark.background,
    padding: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
  },
});