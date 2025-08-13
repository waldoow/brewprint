import { X } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export interface SheetHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  customContent?: React.ReactNode;
  style?: ViewStyle;
  lightColor?: string;
  darkColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
}

export function SheetHeader({
  title,
  subtitle,
  onClose,
  showCloseButton = true,
  customContent,
  style,
  lightColor,
  darkColor,
  lightTextColor,
  darkTextColor,
}: SheetHeaderProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const textColor = useThemeColor(
    { light: lightTextColor, dark: darkTextColor },
    "text"
  );
  const iconColor = useThemeColor({}, "icon");

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: 20,
        },
        style,
      ]}
      noBackground={false}
    >
      {/* Header Row with Title and Close Button */}
      <View style={styles.headerRow}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={[styles.subtitle, { color: textColor }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>

        {/* Close Button */}
        {showCloseButton && (
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: iconColor + "20" }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color={iconColor} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Custom Content Section */}
      {customContent && (
        <View style={styles.customContent}>{customContent}</View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  titleSection: {
    flex: 1,
    marginRight: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 2,
    lineHeight: 32,
  },

  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    fontWeight: "400",
    marginTop: 4,
  },

  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    width: 40,
    height: 40,
    marginTop: 4,
  },

  customContent: {
    marginTop: 16,
  },
});
