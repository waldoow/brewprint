import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  backButtonTitle?: string; // Title of the previous screen
  customContent?: React.ReactNode; // Custom content for stats/progress section
  style?: ViewStyle;
}

export function Header({
  title,
  subtitle,
  onBackPress,
  showBackButton = true,
  backButtonTitle,
  customContent,
  style,
}: HeaderProps) {
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[styles.container, { paddingTop: insets.top + 20 }, style]}
    >
      {/* Back Button Section */}
      {showBackButton && (
        <View style={styles.backButton}>
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.arrowCircle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backArrow, { color: iconColor }]}>←</Text>
          </TouchableOpacity>
          {backButtonTitle && (
            <ThemedText style={styles.backTitle} type="default">
              {backButtonTitle}
            </ThemedText>
          )}
        </View>
      )}

      {/* Title Section */}
      <View style={styles.titleSection}>
        <ThemedText style={styles.title} type="title">
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText style={styles.subtitle} type="default">
            {subtitle}
          </ThemedText>
        )}
      </View>

      {/* Custom Content Section */}
      {customContent && customContent}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 16,
  },
  titleSection: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    gap: 8,
  },
  arrowCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.icon + "20",
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: "300",
  },
  backTitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    fontWeight: "400",
  },
});
