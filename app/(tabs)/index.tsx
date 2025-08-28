import BrewprintCard from "@/components/brewprints/brewprint-card";
import { BeansSection } from "@/components/screens/home/BeansSection";
import { getTheme } from "@/constants/ProfessionalDesign";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { AnalyticsService, type BrewingStats } from "@/lib/services/analytics";
import { BeansService, type Bean } from "@/lib/services/beans";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Carousel, Text, TouchableOpacity, View } from "react-native-ui-lib";
import { toast } from "sonner-native";

// // Analytics Component
// interface AnalyticsProps {
//   totalBrews: number;
//   averageRating: number;
//   perfectedRecipes: number;
//   theme: any;
// }

// const AnalyticsSection: React.FC<AnalyticsProps> = ({
//   totalBrews,
//   averageRating,
//   perfectedRecipes,
//   theme,
// }) => {
//   const styles = StyleSheet.create({
//     sectionHeader: {
//       marginBottom: 16,
//     },
//     metricsRow: {
//       flexDirection: "row",
//       gap: 24,
//     },
//     metricItem: {
//       flex: 1,
//     },
//     metricValue: {
//       fontSize: 20,
//       fontWeight: "600",
//       color: theme.colors.text.primary,
//       lineHeight: 24,
//       marginTop: 4,
//       marginBottom: 2,
//     },
//     metricLabel: {
//       fontSize: 10,
//       color: theme.colors.text.secondary,
//       textTransform: "uppercase",
//       letterSpacing: 0.5,
//       marginBottom: 4,
//     },
//     metricSubtext: {
//       fontSize: 11,
//       color: theme.colors.text.tertiary,
//       marginBottom: 8,
//     },
//     metricButton: {
//       paddingVertical: 6,
//       paddingHorizontal: 10,
//       backgroundColor: theme.colors.surface,
//       borderRadius: 4,
//       alignSelf: "flex-start",
//     },
//     sectionTitle: {
//       fontSize: 14,
//       fontWeight: "500",
//       color: theme.colors.text.primary,
//     },
//   });

//   return (
//     <View>
//       <Text style={[styles.sectionTitle, styles.sectionHeader]}>Analytics</Text>

//       <View style={styles.metricsRow}>
//         <View style={styles.metricItem}>
//           <Text style={styles.metricLabel}>ACTIVITY</Text>
//           <Text style={styles.metricValue}>{totalBrews}</Text>
//           <Text style={styles.metricSubtext}>Total brews</Text>
//           <TouchableOpacity
//             style={styles.metricButton}
//             onPress={() => router.push("/analytics")}
//             activeOpacity={0.7}
//           >
//             <Text style={{ fontSize: 11, color: theme.colors.text.primary }}>
//               View details
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.metricItem}>
//           <Text style={styles.metricLabel}>QUALITY</Text>
//           <Text style={styles.metricValue}>{averageRating.toFixed(1)}/5</Text>
//           <Text style={styles.metricSubtext}>{perfectedRecipes} perfected</Text>
//           <TouchableOpacity
//             style={styles.metricButton}
//             onPress={() => router.push("/brewprints")}
//             activeOpacity={0.7}
//           >
//             <Text style={{ fontSize: 11, color: theme.colors.text.primary }}>
//               View recipes
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// Inventory Component
interface InventoryProps {
  activeBeans: number;
  theme: any;
}

const InventorySection: React.FC<InventoryProps> = ({ activeBeans, theme }) => {
  const styles = StyleSheet.create({
    sectionHeader: {
      marginBottom: 16,
    },
    metricLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    inventoryValue: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.text.primary,
      lineHeight: 24,
      marginTop: 4,
      marginBottom: 8,
    },
    inventoryButton: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: theme.colors.surface,
      borderRadius: 4,
      alignSelf: "flex-start",
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text.primary,
    },
  });

  return (
    <View>
      <Text style={[styles.sectionTitle, styles.sectionHeader]}>Inventory</Text>

      <View>
        <Text style={styles.metricLabel}>BEANS</Text>
        <Text style={styles.inventoryValue}>{activeBeans} active types</Text>
        <TouchableOpacity
          style={styles.inventoryButton}
          onPress={() => router.push("/library")}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 11, color: theme.colors.text.primary }}>
            Manage inventory
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Recent Activity Component
interface RecentActivityProps {
  recentBrews: Brewprint[];
  theme: any;
}

const RecentActivitySection: React.FC<RecentActivityProps> = ({
  recentBrews,
  theme,
}) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
    },
    brewItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    brewRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    brewName: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text.primary,
      flex: 1,
      marginRight: 8,
    },
    brewMethod: {
      fontSize: 9,
      color: theme.colors.text.tertiary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    brewParams: {
      flexDirection: "row",
      gap: 8,
    },
    brewParam: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text.primary,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
  });

  if (recentBrews.length === 0) {
    return null;
  }

  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <View style={styles.container}>
        <View style={[styles.sectionHeader]}>
          <Text style={[styles.sectionTitle]}>Recent Brews</Text>
          <TouchableOpacity
            onPress={() => router.push("/brewprints")}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 14, color: theme.colors.text.secondary }}>
              View all
            </Text>
          </TouchableOpacity>
        </View>

        <Carousel
          pageControlPosition="under"
          horizontal
          containerPaddingVertical={0}
          itemSpacings={40}
        >
          {recentBrews.map((brew, index) => (
            <View
              key={index}
              style={{
                marginVertical: 8,
                marginHorizontal: 2,
                borderRadius: 12,
              }}
            >
              <BrewprintCard brewprint={brew} theme={theme} />
            </View>
          ))}
        </Carousel>
      </View>
    </View>
  );
};

// Quick Actions Component
interface QuickActionsProps {
  totalRecipes: number;
  theme: any;
}

const QuickActionsSection: React.FC<QuickActionsProps> = ({
  totalRecipes,
  theme,
}) => {
  const styles = StyleSheet.create({
    sectionHeader: {
      marginBottom: 16,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    actionSubtitle: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text.primary,
    },
  });

  return (
    <View>
      <Text style={[styles.sectionTitle, styles.sectionHeader]}>
        Quick Actions
      </Text>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push("/brewprints/new")}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.actionTitle}>Start New Brew</Text>
          <Text style={styles.actionSubtitle}>
            Create and track brewing recipe
          </Text>
        </View>
        <Text style={{ fontSize: 16, color: theme.colors.text.tertiary }}>
          ›
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push("/brewprints")}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.actionTitle}>Browse Recipes</Text>
          <Text style={styles.actionSubtitle}>
            {totalRecipes} available recipes
          </Text>
        </View>
        <Text style={{ fontSize: 16, color: theme.colors.text.tertiary }}>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brewprints, setBrewprints] = useState<Brewprint[]>([]);
  const [stats, setStats] = useState<BrewingStats | null>(null);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [beansResult, brewprintsResult, statsResult] = await Promise.all([
        BeansService.getAllBeans(),
        BrewprintsService.getAllBrewprints(),
        AnalyticsService.getBrewingStats(),
      ]);

      if (beansResult.success) setBeans(beansResult.data || []);
      if (brewprintsResult.success) setBrewprints(brewprintsResult.data || []);
      if (statsResult.success) setStats(statsResult.data);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Calculate key metrics
  const activeBeans = beans.filter(
    (bean) => bean.remaining_grams && bean.remaining_grams > 0
  ).length;
  const totalRecipes = brewprints.length;
  const perfectedRecipes = brewprints.filter(
    (r) => r.status === "final"
  ).length;
  const averageRating = stats?.averageRating || 0;
  const totalBrews = stats?.totalBrews || 0;

  // Get recent brews for activity
  const recentBrews = brewprints
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 64,
      paddingBottom: 24,
    },
    content: {
      paddingBottom: 32,
      gap: 32,
    },
    sectionTitle: {
      fontSize: 40,
      fontWeight: "700",
      color: theme.colors.text.primary,
      fontFamily: "SpaceMono_700Bold",
      lineHeight: 40,
    },
  });

  console.log(beans);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom", "left", "right"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <Text
            style={{
              fontSize: 20,
              color: theme.colors.text.secondary,
              marginTop: 2,
            }}
          >
            Welcome back, {user?.user_metadata?.username || "Coffee Enthusiast"}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* <AnalyticsSection
            totalBrews={totalBrews}
            averageRating={averageRating}
            perfectedRecipes={perfectedRecipes}
            theme={theme}
          /> */}

          <View
            style={{
              backgroundColor: theme.colors.surface,
              paddingVertical: 24,
              paddingHorizontal: 16,
              marginHorizontal: -16,
              borderRadius: 12,
            }}
          >
            <InventorySection activeBeans={activeBeans} theme={theme} />
          </View>

          <BeansSection beans={beans} theme={theme} />

          <View
            style={{
              backgroundColor: theme.colors.surface,
              paddingVertical: 24,
              paddingHorizontal: 16,
              marginHorizontal: -16,
              borderRadius: 12,
            }}
          >
            <RecentActivitySection recentBrews={recentBrews} theme={theme} />
          </View>

          <QuickActionsSection totalRecipes={totalRecipes} theme={theme} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
