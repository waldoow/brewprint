import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./IconSymbol";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  backButtonTitle?: string;
  customContent?: React.ReactNode;
  showTopSpacing?: boolean;
  style?: ViewStyle;
  // New props for scheduler-style header
  showMenuButton?: boolean;
  showProfileAvatar?: boolean;
  showSearchButton?: boolean;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  onSearchPress?: () => void;
  profileImageUri?: string;
}

export function Header({
  title,
  subtitle,
  onBackPress,
  showBackButton = true,
  backButtonTitle,
  customContent,
  showTopSpacing = true,
  style,
  showMenuButton = false,
  showProfileAvatar = false,
  showSearchButton = false,
  onMenuPress,
  onProfilePress,
  onSearchPress,
  profileImageUri,
}: HeaderProps) {
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const insets = useSafeAreaInsets();

  const getContainerStyles = () => {
    const safePadding = showTopSpacing ? insets.top + 20 : insets.top;
    return [
      showTopSpacing ? styles.container : styles.containerNoSpacing,
      { paddingTop: safePadding },
      style,
    ];
  };

  // Show scheduler-style header if menu or profile buttons are enabled
  const isSchedulerStyle =
    showMenuButton || showProfileAvatar || showSearchButton;

  return (
    <ThemedView style={getContainerStyles()}>
      {/* Scheduler-style header with menu and profile */}
      {isSchedulerStyle && (
        <View style={styles.schedulerHeader}>
          <View style={styles.leftSection}>
            <View>
              <ThemedText style={styles.schedulerTitle}>{title}</ThemedText>
              {subtitle && (
                <ThemedText style={styles.schedulerSubtitle}>
                  {subtitle}
                </ThemedText>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Original header style */}
      {!isSchedulerStyle && (
        <>
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
        </>
      )}

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
  containerNoSpacing: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 16,
  },
  // Scheduler-style header
  schedulerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profilePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  schedulerTitle: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  schedulerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  // Original styles
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
