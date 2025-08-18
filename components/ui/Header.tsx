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
  // Professional Coffee App Header Styles
  
  container: {
    paddingHorizontal: 24, // Increased for better spacing
    paddingTop: 32, // Reduced for cleaner look
    paddingBottom: 16, // Reduced bottom padding
    flexDirection: "column",
    gap: 12, // Reduced gap for tighter layout
  },
  containerNoSpacing: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 16,
    flexDirection: "column",
    gap: 12,
  },
  
  // Coffee Professional Scheduler Header
  schedulerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Changed to flex-start for better alignment
    paddingBottom: 4, // Reduced padding
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16, // Increased gap for better spacing
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // Reduced gap for icons
  },
  iconButton: {
    width: 40, // Slightly smaller
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8, // More square for professional look
    backgroundColor: "rgba(255, 255, 255, 0.05)", // Subtle background
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 8, // Matching icon buttons
    overflow: "hidden",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.dark.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Professional Typography for Coffee App
  schedulerTitle: {
    fontSize: 26, // Larger for impact
    fontWeight: "600",
    letterSpacing: -0.8, // Tighter letter spacing
    lineHeight: 30,
  },
  schedulerSubtitle: {
    fontSize: 13,
    opacity: 0.6, // More subtle
    marginTop: 1,
    letterSpacing: 0.1,
  },
  
  // Refined Original Header Styles
  titleSection: {
    flexDirection: "column",
    gap: 2, // Tighter gap
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 0,
    gap: 12, // Increased gap
  },
  arrowCircle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)", // More subtle background
    borderRadius: 8, // Square corners for consistency
    width: 36, // Smaller
    height: 36,
  },
  backArrow: {
    fontSize: 20, // Smaller
    fontWeight: "400",
  },
  backTitle: {
    fontSize: 15,
    opacity: 0.6, // More subtle
    fontWeight: "400",
  },
  title: {
    fontSize: 28, // Slightly smaller for cleaner look
    fontWeight: "600", // Lighter weight
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.6, // More subtle
    fontWeight: "400",
    letterSpacing: 0.1,
  },
});
