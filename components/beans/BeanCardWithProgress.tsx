import { getTheme } from "@/constants/DataFirstDesign";
import { type Bean } from "@/lib/services/beans";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  type ViewStyle,
} from "react-native";
import { Card, Text, View } from "react-native-ui-lib";

export type BeanCardWithProgressProps = {
  bean: Bean;
  onPress?: (bean: Bean) => void;
  style?: ViewStyle;
};

export function BeanCardWithProgress({
  bean,
  onPress,
  style,
}: BeanCardWithProgressProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");

  // Get roast level display
  const getRoastLevelDisplay = () => {
    const levels: Record<string, string> = {
      light: "Light",
      "light-medium": "Light-Medium",
      medium: "Medium",
      "medium-dark": "Medium-Dark",
      dark: "Dark",
    };
    return levels[bean.roast_level] || bean.roast_level;
  };

  // Get roast level color (dot indicator)
  const getRoastLevelColor = () => {
    const colors: Record<string, string> = {
      light: "#d4a574",
      "light-medium": "#b8935f",
      medium: "#8b6d47",
      "medium-dark": "#6b4e37",
      dark: "#4a3426",
    };
    return colors[bean.roast_level] || "#8b6d47";
  };

  // Get freshness status color
  const getFreshnessColor = () => {
    switch (bean.freshness_status) {
      case "too-fresh":
        return theme.colors.warning || "#f59e0b";
      case "peak":
        return theme.colors.success || "#22c55e";
      case "good":
        return theme.colors.primary || "#3b82f6";
      case "declining":
        return theme.colors.warning || "#f59e0b";
      case "stale":
        return theme.colors.error || "#ef4444";
      default:
        return theme.colors.text.secondary;
    }
  };

  // Get freshness label
  const getFreshnessLabel = () => {
    const labels = {
      "too-fresh": "Fresh",
      peak: "Peak",
      good: "Good",
      declining: "Declining",
      stale: "Stale",
    };
    return labels[bean.freshness_status] || bean.freshness_status;
  };

  // Calculate percentage remaining
  const percentageRemaining = Math.round(
    (bean.remaining_grams / bean.total_grams) * 100
  );

  // Get progress color based on remaining percentage
  const getProgressColor = () => {
    if (percentageRemaining > 60) return theme.colors.success || "#22c55e";
    if (percentageRemaining > 30) return theme.colors.warning || "#f59e0b";
    return theme.colors.error || "#ef4444";
  };

  const styles = StyleSheet.create({
    // Header section
    labelHeader: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.border,
      marginBottom: 12,
      paddingBottom: 12,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    specialtyLabel: {
      fontSize: 9,
      fontWeight: "700",
      color: theme.colors.text.tertiary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    percentageLabel: {
      fontSize: 9,
      fontWeight: "700",
      color: theme.colors.text.tertiary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    coffeeName: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.text.primary,
      textAlign: "left",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    originSubtext: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.colors.text.secondary,
      textAlign: "left",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },

    // Grid layout for info
    infoGrid: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 8,
    },
    gridRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    gridCell: {
      flex: 1,
      padding: 12,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      minHeight: 50,
      justifyContent: "center",
      position: "relative",
    },
    noBorderRight: {
      borderRightWidth: 0,
    },
    noBorderBottom: {
      borderBottomWidth: 0,
    },
    gridLabel: {
      fontSize: 9,
      fontWeight: "700",
      color: theme.colors.text.tertiary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 4,
    },
    gridValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text.primary,
      lineHeight: 18,
    },
    roastIndicator: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    // Footer section
    footerSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + "40",
    },
    footerText: {
      fontSize: 10,
      fontWeight: "600",
      color: theme.colors.text.tertiary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
  });

  return (
    <TouchableOpacity
      onPress={() => onPress?.(bean)}
      activeOpacity={0.7}
      style={style}
    >
      <Card>
        {/* Header Section */}
        <View style={styles.labelHeader}>
          <View style={styles.headerTop}>
            <Text style={styles.specialtyLabel}>SPECIALTY COFFEE</Text>
            <Text style={styles.percentageLabel}>
              {Math.round(percentageRemaining)}% LEFT
            </Text>
          </View>
          <Text style={styles.coffeeName}>{bean.name || "Unknown Bean"}</Text>
          <Text style={styles.originSubtext}>
            {bean.origin || "Unknown Origin"}
          </Text>
        </View>

        {/* Main Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.gridRow}>
            <View style={[styles.gridCell, styles.noBorderRight]}>
              <Text style={styles.gridLabel}>ROAST LEVEL</Text>
              <Text style={styles.gridValue}>{getRoastLevelDisplay()}</Text>
              <View
                style={[
                  styles.roastIndicator,
                  { backgroundColor: getRoastLevelColor() },
                ]}
              />
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.gridLabel}>PROCESS</Text>
              <Text style={styles.gridValue}>{bean.process || "Natural"}</Text>
            </View>
          </View>

          <View style={[styles.gridRow, styles.noBorderBottom]}>
            <View style={[styles.gridCell, styles.noBorderRight]}>
              <Text style={styles.gridLabel}>SUPPLIER</Text>
              <Text style={styles.gridValue}>
                {bean.supplier || "Local Roaster"}
              </Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.gridLabel}>FRESHNESS</Text>
              <Text style={[styles.gridValue, { color: getFreshnessColor() }]}>
                {getFreshnessLabel()}
              </Text>
            </View>
          </View>
        </View>

        {/* Roast Date Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            ROASTED:{" "}
            {new Date(bean.roast_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          {bean.cost && <Text style={styles.footerText}>${bean.cost}</Text>}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
