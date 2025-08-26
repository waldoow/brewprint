import { getTheme } from "@/constants/ProfessionalDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import { Button } from "./Button";
import { Text } from "./Text";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  action?: {
    title: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export function PageHeader({
  title,
  subtitle,
  showBackButton,
  onBackPress,
  action,
  style,
}: PageHeaderProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");

  return (
    <View
      style={[
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          marginBottom: theme.spacing["2xl"],
        },
      ]}
    >
      {/* Back Button - Above the title */}
      {showBackButton && onBackPress && (
        <TouchableOpacity
          onPress={onBackPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: theme.spacing.lg,
          }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={theme.colors.text.primary} />
          <Text
            variant="body"
            weight="medium"
            style={{ marginLeft: theme.spacing.xs }}
          >
            Back
          </Text>
        </TouchableOpacity>
      )}

      {/* Header Content */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {/* Title Section */}
        <View
          style={{
            flex: 1,
            marginRight: action ? theme.spacing.lg : 0,
          }}
        >
          <Text variant="3xl" weight="extrabold" style={{ letterSpacing: -1 }}>
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="body"
              color="secondary"
              style={{ marginTop: theme.spacing.xs }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Action Button */}
        {action && (
          <Button
            title={action.title}
            onPress={action.onPress}
            variant="primary"
            size="sm"
          />
        )}
      </View>
    </View>
  );
}
