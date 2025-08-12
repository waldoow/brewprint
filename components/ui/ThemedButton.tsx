import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TextStyle,
  type TouchableOpacityProps,
  type ViewStyle,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
  lightColor?: string;
  darkColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
};

export function ThemedButton({
  title,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  style,
  lightColor,
  darkColor,
  lightTextColor,
  darkTextColor,
  ...rest
}: ThemedButtonProps) {
  const textColor = useThemeColor(
    { light: lightTextColor, dark: darkTextColor },
    "text"
  );
  const tintColor = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");

  const getButtonStyles = (): ViewStyle => {
    const baseStyle = styles.base;
    const sizeStyle = styles[`size_${size}`];

    let variantStyle: ViewStyle = {};

    switch (variant) {
      case "default":
        variantStyle = {
          backgroundColor: tintColor,
        };
        break;
      case "destructive":
        variantStyle = {
          backgroundColor: "#dc2626",
        };
        break;
      case "outline":
        variantStyle = {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: iconColor + "40",
        };
        break;
      case "secondary":
        variantStyle = {
          backgroundColor: iconColor + "20",
        };
        break;
      case "ghost":
        variantStyle = {
          backgroundColor: "transparent",
        };
        break;
      case "link":
        variantStyle = {
          backgroundColor: "transparent",
          paddingHorizontal: 0,
          paddingVertical: 0,
        };
        break;
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const getTextColor = (): string => {
    // If custom text colors are provided, use them
    if (lightTextColor || darkTextColor) {
      return textColor; // This already uses the custom colors from the hook above
    }

    // Otherwise, determine text color based on variant
    switch (variant) {
      case "default":
        // For default variant, ensure good contrast with tint background
        // In dark mode, tint is white, so use dark text
        // In light mode, tint is blue, so use white text
        return tintColor === Colors.dark.tint ? Colors.light.text : "#ffffff";
      case "destructive":
        // For destructive variant, use white text on red background
        return "#ffffff";
      case "outline":
      case "secondary":
      case "ghost":
        // For these variants, use theme text color
        return textColor;
      case "link":
        // For link variant, use tint color
        return tintColor;
      default:
        return textColor;
    }
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyle = styles.text;
    const sizeTextStyle = styles[`text_${size}`];
    const color = getTextColor();

    const variantTextStyle: TextStyle = {
      color,
      ...(variant === "link" && { textDecorationLine: "underline" }),
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
      ...variantTextStyle,
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      <>
        {loading && (
          <ActivityIndicator
            size="small"
            color={
              variant === "default" || variant === "destructive"
                ? "#ffffff"
                : getTextColor()
            }
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={getTextStyles()}>{title}</Text>
      </>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    flexDirection: "row",
  },

  // Size variants
  size_default: {
    height: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  size_sm: {
    height: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  size_lg: {
    height: 52,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  size_icon: {
    height: 44,
    width: 44,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  // Text styles
  text: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  text_default: {
    fontSize: 16,
  },
  text_sm: {
    fontSize: 14,
  },
  text_lg: {
    fontSize: 18,
  },
  text_icon: {
    fontSize: 16,
  },
});
