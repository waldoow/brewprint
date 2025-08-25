import { getTheme } from "@/constants/DataFirstDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import {
  RefreshControlProps,
  SafeAreaView,
  ScrollView,
  View,
  ViewStyle,
} from "react-native";
import { DataText } from "./DataText";

interface DataLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scrollable?: boolean;
  padding?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function DataLayout({
  children,
  title,
  subtitle,
  scrollable = true,
  padding = true,
  style,
  contentContainerStyle,
  refreshControl,
}: DataLayoutProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...style,
  };

  const contentPadding = padding
    ? {
        paddingHorizontal: theme.spacing[4], // 16px
        paddingTop: theme.spacing[6], // 24px
        paddingBottom: 120, // Fixed bottom padding to ensure tab bar visibility
      }
    : {};

  const renderHeader = () => {
    if (!title && !subtitle) return null;

    return (
      <View
        style={{
          marginBottom: theme.spacing[8], // 32px
          paddingHorizontal: padding ? 0 : theme.spacing[4],
        }}
      >
        {title && (
          <DataText
            variant="h1"
            color="primary"
            weight="bold"
            style={{
              marginBottom: subtitle ? theme.spacing[2] : 0,
              letterSpacing: -0.5,
            }}
          >
            {title}
          </DataText>
        )}
        {subtitle && (
          <DataText variant="body" color="secondary">
            {subtitle}
          </DataText>
        )}
      </View>
    );
  };

  const content = (
    <>
      {renderHeader()}
      {children}
    </>
  );

  if (scrollable) {
    return (
      <SafeAreaView style={containerStyle}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[contentPadding, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {content}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <View style={[{ flex: 1 }, contentPadding, contentContainerStyle]}>
        {content}
      </View>
    </SafeAreaView>
  );
}

// Grid layout for cards - inspired by modern dashboards
interface DataGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  gap?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

export function DataGrid({
  children,
  columns = 1,
  gap = "md",
  style,
}: DataGridProps) {
  const theme = getTheme(useColorScheme() ?? "light");

  const getGapValue = () => {
    switch (gap) {
      case "sm":
        return theme.layout.card.gap.sm;
      case "lg":
        return theme.layout.card.gap.lg;
      default:
        return theme.layout.card.gap.md;
    }
  };

  const gapValue = getGapValue();

  if (columns === 1) {
    return <View style={[{ gap: gapValue }, style]}>{children}</View>;
  }

  // Two column grid
  return (
    <View style={[{ flexDirection: "row", gap: gapValue }, style]}>
      <View style={{ flex: 1, gap: gapValue }}>
        {React.Children.toArray(children).filter((_, index) => index % 2 === 0)}
      </View>
      <View style={{ flex: 1, gap: gapValue }}>
        {React.Children.toArray(children).filter((_, index) => index % 2 === 1)}
      </View>
    </View>
  );
}

// Section component for grouping related content
interface DataSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  spacing?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

export function DataSection({
  children,
  title,
  subtitle,
  spacing = "md",
  style,
}: DataSectionProps) {
  const theme = getTheme(useColorScheme() ?? "light");

  const getSpacingValue = () => {
    switch (spacing) {
      case "sm":
        return theme.spacing[6];
      case "lg":
        return theme.spacing[12];
      default:
        return theme.spacing[8];
    }
  };

  return (
    <View style={[{ marginBottom: getSpacingValue() }, style]}>
      {(title || subtitle) && (
        <View style={{ marginBottom: theme.spacing[4] }}>
          {title && (
            <DataText
              variant="h3"
              color="primary"
              weight="semibold"
              style={{ marginBottom: subtitle ? theme.spacing[1] : 0 }}
            >
              {title}
            </DataText>
          )}
          {subtitle && (
            <DataText variant="small" color="secondary">
              {subtitle}
            </DataText>
          )}
        </View>
      )}
      {children}
    </View>
  );
}
