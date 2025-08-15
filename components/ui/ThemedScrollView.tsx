import { ScrollView, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedScrollViewProps = ScrollViewProps & {
  lightColor?: string;
  darkColor?: string;
  spacing?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  ignoreBottomSafeArea?: boolean;
  ignoreTopSafeArea?: boolean;
};

export function ThemedScrollView({
  style,
  lightColor,
  darkColor,
  spacing = 16,
  paddingHorizontal = 20,
  paddingVertical = 16,
  marginHorizontal = 0,
  marginVertical = 0,
  ignoreBottomSafeArea = false,
  ignoreTopSafeArea = true,
  contentContainerStyle,
  ...otherProps
}: ThemedScrollViewProps) {
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor(
    {
      light: lightColor || Colors.light.background,
      dark: darkColor || Colors.dark.background,
    },
    "background"
  );

  const spacingStyle = spacing > 0 ? { gap: spacing } : {};

  const paddingStyle = {
    paddingHorizontal: paddingHorizontal > 0 ? paddingHorizontal : undefined,
    // Handle bottom padding more efficiently
    paddingBottom: ignoreBottomSafeArea
      ? paddingVertical > 0
        ? paddingVertical
        : undefined
      : (paddingVertical > 0 ? paddingVertical : 0) + insets.bottom + 32, // Extra 32px buffer for tab bar
    // Handle top padding only if specifically requested
    paddingTop: ignoreTopSafeArea
      ? paddingVertical > 0
        ? paddingVertical
        : undefined
      : (paddingVertical > 0 ? paddingVertical : 0) + insets.top,
  };

  const marginStyle = {
    marginHorizontal: marginHorizontal > 0 ? marginHorizontal : undefined,
    marginVertical: marginVertical > 0 ? marginVertical : undefined,
  };

  return (
    <ScrollView
      style={[{ backgroundColor }, marginStyle, style]}
      contentContainerStyle={[
        spacingStyle,
        paddingStyle,
        contentContainerStyle,
      ]}
      {...otherProps}
    />
  );
}
