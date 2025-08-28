import { getTheme } from "@/constants/DataFirstDesign";
import { Brewprint } from "@/lib/services";
import { router } from "expo-router";
import { StyleSheet, useColorScheme } from "react-native";
import { Card, Text, TouchableOpacity, View } from "react-native-ui-lib";
import { toast } from "sonner-native";

interface BrewprintCardProps {
  brewprint: Brewprint;
  theme: any;
}

const BrewprintCard: React.FC<BrewprintCardProps> = ({ brewprint }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");

  // Calculate useful metrics
  const ratio =
    brewprint.parameters?.coffee_grams && brewprint.parameters?.water_grams
      ? (
          brewprint.parameters.water_grams / brewprint.parameters.coffee_grams
        ).toFixed(1)
      : null;

  const totalTime =
    brewprint.steps?.reduce((total, step) => total + step.duration, 0) || 0;
  const timeDisplay =
    totalTime > 0
      ? `${Math.floor(totalTime / 60)}:${(totalTime % 60)
          .toString()
          .padStart(2, "0")}`
      : null;

  const stepCount = brewprint.steps?.length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "final":
        return theme.colors.success || "#22c55e";
      case "experimenting":
        return theme.colors.warning || "#f59e0b";
      case "archived":
        return theme.colors.text.tertiary;
      default:
        return theme.colors.text.secondary;
    }
  };

  const styles = StyleSheet.create({
    brewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    brewMain: {
      flex: 1,
      marginRight: 12,
    },
    brewName: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    brewMethod: {
      fontSize: 10,
      color: theme.colors.text.tertiary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontWeight: "500",
    },
    brewMeta: {
      alignItems: "flex-end",
    },
    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginBottom: 4,
    },
    statusText: {
      fontSize: 8,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    ratingText: {
      fontSize: 11,
      fontWeight: "500",
      color: theme.colors.text.secondary,
      marginLeft: 2,
    },
    brewParams: {},
    paramRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 2,
    },
    paramLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      fontWeight: "500",
    },
    paramValue: {
      fontSize: 12,
      color: theme.colors.text.primary,
      fontWeight: "600",
    },
    brewMetrics: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 8,
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    metricGroup: {
      flexDirection: "row",
      gap: 12,
    },
    metric: {
      fontSize: 10,
      color: theme.colors.text.tertiary,
      fontWeight: "500",
    },
    difficultyStars: {
      fontSize: 10,
      color: theme.colors.warning || "#f59e0b",
    },
  });

  return (
    <TouchableOpacity
      onPress={() => {
        if (!brewprint.id) {
          toast.error("Recipe ID missing - cannot start brewing session");
          return;
        }
        router.push(`/brewing/${brewprint.id}`);
      }}
      activeOpacity={0.7}
    >
      <Card>
        {/* Header with name, method, status and rating */}
        <View style={styles.brewHeader}>
          <View style={styles.brewMain}>
            <Text style={styles.brewName}>{brewprint.name}</Text>
            <Text style={styles.brewMethod}>
              {brewprint.method?.toUpperCase() || "METHOD"}
              {brewprint.description && ` • ${brewprint.description}`}
            </Text>
          </View>
          <View style={styles.brewMeta}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(brewprint.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(brewprint.status) },
                ]}
              >
                {brewprint.status?.toUpperCase() || "UNKNOWN"}
              </Text>
            </View>
          </View>
        </View>

        {/* Brewing parameters - column layout */}
        <View style={styles.brewParams}>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Coffee</Text>
            <Text style={styles.paramValue}>
              {brewprint.parameters?.coffee_grams || "?"}g
            </Text>
          </View>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Water</Text>
            <Text style={styles.paramValue}>
              {brewprint.parameters?.water_grams || "?"}g
            </Text>
          </View>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Temperature</Text>
            <Text style={styles.paramValue}>
              {brewprint.parameters?.water_temp || "?"}°C
            </Text>
          </View>
          {ratio && (
            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>Ratio</Text>
              <Text style={styles.paramValue}>1:{ratio}</Text>
            </View>
          )}
          {brewprint.parameters?.grind_setting && (
            <View style={styles.paramRow}>
              <Text style={styles.paramLabel}>Grind Setting</Text>
              <Text style={styles.paramValue}>
                #{brewprint.parameters.grind_setting}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom metrics - inline layout */}
        <View style={styles.brewMetrics}>
          <View style={styles.metricGroup}>
            {stepCount > 0 && (
              <Text style={styles.metric}>{stepCount} steps</Text>
            )}
            {timeDisplay && (
              <Text style={styles.metric}>{timeDisplay} total</Text>
            )}
          </View>
          {brewprint.difficulty && (
            <Text style={styles.difficultyStars}>
              {"★".repeat(brewprint.difficulty)}
              {"☆".repeat(5 - brewprint.difficulty)}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default BrewprintCard;
