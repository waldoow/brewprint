import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

// Enable layout animation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ThemedCollapsibleProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showBorder?: boolean;
  noPadding?: boolean;
  noBackground?: boolean;
  lightColor?: string;
  darkColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
  containerStyle?: ViewStyle;
  triggerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  onToggle?: (isOpen: boolean) => void;
}

export function ThemedCollapsible({
  title,
  subtitle,
  children,
  defaultOpen = false,
  disabled = false,
  variant = "default",
  size = "default",
  showBorder = false,
  noPadding = true,
  noBackground = true,
  lightColor,
  darkColor,
  lightTextColor,
  darkTextColor,
  lightBorderColor,
  darkBorderColor,
  containerStyle,
  triggerStyle,
  contentStyle,
  onToggle,
}: ThemedCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const rotation = useSharedValue(defaultOpen ? 1 : 0);

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "cardBackground"
  );
  const textColor = useThemeColor(
    { light: lightTextColor, dark: darkTextColor },
    "text"
  );
  const borderColor = useThemeColor(
    { light: lightBorderColor, dark: darkBorderColor },
    "icon"
  );
  const iconColor = useThemeColor({}, "icon");

  const handleToggle = () => {
    if (disabled) return;

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onToggle?.(newIsOpen);

    // Animate rotation
    rotation.value = withTiming(newIsOpen ? 1 : 0, {
      duration: 200,
    });

    // Enable layout animation for smooth height transition
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
  };

  const getContainerStyles = (): ViewStyle => {
    const baseStyle = styles.container;
    const sizeStyle = noPadding ? {} : styles[`container_${size}`];

    let variantStyle: ViewStyle = {};

    switch (variant) {
      case "default":
        variantStyle = {
          backgroundColor: backgroundColor,
        };
        break;
      case "outline":
        variantStyle = {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: borderColor + "30",
        };
        break;
      case "ghost":
        variantStyle = {
          backgroundColor: "transparent",
        };
        break;
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTriggerStyles = (): ViewStyle => {
    const baseStyle = styles.trigger;
    const sizeStyle = styles[`trigger_${size}`];

    return {
      ...baseStyle,
      ...sizeStyle,
    };
  };

  const getTitleStyles = (): TextStyle => {
    const baseStyle = styles.title;
    const sizeStyle = styles[`title_${size}`];

    return {
      ...baseStyle,
      ...sizeStyle,
      color: textColor,
    };
  };

  const getSubtitleStyles = (): TextStyle => {
    const baseStyle = styles.subtitle;
    const sizeStyle = styles[`subtitle_${size}`];

    return {
      ...baseStyle,
      ...sizeStyle,
      color: textColor + "80",
    };
  };

  const getContentStyles = (): ViewStyle => {
    const baseStyle = showBorder ? styles.content : styles.contentNoBorder;
    const sizeStyle = styles[`content_${size}`];

    let borderStyles: ViewStyle = {};
    if (showBorder) {
      borderStyles = {
        borderTopColor: borderColor + "20",
      };
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...borderStyles,
    };
  };

  const animatedChevronStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotation.value, [0, 1], [0, 180]);

    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  return (
    <ThemedView
      style={[getContainerStyles(), containerStyle]}
      noBackground={noBackground || variant === "ghost"}
    >
      <TouchableOpacity
        style={[getTriggerStyles(), triggerStyle]}
        onPress={handleToggle}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={styles.titleContainer}>
          <ThemedText style={getTitleStyles()}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={getSubtitleStyles()}>{subtitle}</ThemedText>
          )}
        </View>

        <Animated.View style={animatedChevronStyle}>
          <ChevronDown
            size={size === "sm" ? 16 : size === "lg" ? 24 : 20}
            color={iconColor}
          />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <View style={[getContentStyles(), contentStyle]}>{children}</View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },

  // Container size variants
  container_default: {
    padding: 0,
  },
  container_sm: {
    padding: 12,
  },
  container_lg: {
    padding: 20,
  },

  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Trigger size variants
  trigger_default: {
    minHeight: 44,
  },
  trigger_sm: {
    minHeight: 36,
  },
  trigger_lg: {
    minHeight: 52,
  },

  titleContainer: {
    flex: 1,
    marginRight: 12,
  },

  title: {
    fontWeight: "600",
  },

  // Title size variants
  title_default: {
    fontSize: 16,
  },
  title_sm: {
    fontSize: 14,
  },
  title_lg: {
    fontSize: 18,
  },

  subtitle: {
    fontWeight: "400",
    marginTop: 2,
  },

  // Subtitle size variants
  subtitle_default: {
    fontSize: 14,
  },
  subtitle_sm: {
    fontSize: 12,
  },
  subtitle_lg: {
    fontSize: 16,
  },

  content: {
    borderTopWidth: 1,
    // borderTopColor will be set dynamically in getContentStyles
  },

  contentNoBorder: {
    // No border, just spacing
  },

  // Content size variants
  content_default: {
    paddingTop: 16,
    marginTop: 16,
  },
  content_sm: {
    paddingTop: 12,
    marginTop: 12,
  },
  content_lg: {
    paddingTop: 20,
    marginTop: 20,
  },
});
