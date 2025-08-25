import { DataCard, InfoCard, MetricCard } from "@/components/ui/DataCard";
import { DataGrid, DataLayout, DataSection } from "@/components/ui/DataLayout";
import { DataMetric } from "@/components/ui/DataMetric";
import { DataText } from "@/components/ui/DataText";
import { useAuth } from "@/context/AuthContext";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { AnalyticsService, type BrewingStats } from "@/lib/services/analytics";
import { BeansService, type Bean } from "@/lib/services/beans";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import { toast } from "sonner-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brewprints, setBrewprints] = useState<Brewprint[]>([]);
  const [stats, setStats] = useState<BrewingStats | null>(null);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    (bean) => bean.current_stock && bean.current_stock > 0
  ).length;
  const totalRecipes = brewprints.length;
  const perfectedRecipes = brewprints.filter(
    (r) => r.status === "final"
  ).length;
  const averageRating = stats?.average_rating || 0;
  const totalBrews = stats?.total_brews || 0;
  const successRate = stats?.success_rate || 0;

  // Get recent brews for activity
  const recentBrews = brewprints
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  return (
    <DataLayout
      title="Dashboard"
      subtitle={`Welcome back, ${
        user?.user_metadata?.username || "Coffee Enthusiast"
      }`}
      scrollable
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Key Metrics Overview */}
      <DataSection title="Overview" spacing="lg">
        <DataGrid columns={2} gap="md">
          <MetricCard
            title="Brewing Activity"
            metrics={[
              <DataMetric
                key="total-brews"
                label="Total Brews"
                value={totalBrews}
                size="sm"
                trend={{ value: 5, direction: "up", period: "this week" }}
              />,
              <DataMetric
                key="success-rate"
                label="Success Rate"
                value={Math.round(successRate)}
                unit="%"
                size="sm"
                trend={{ value: 3, direction: "up", period: "this month" }}
              />,
            ]}
            onPress={() => router.push("/analytics")}
          />

          <MetricCard
            title="Quality Metrics"
            metrics={[
              <DataMetric
                key="avg-rating"
                label="Avg Rating"
                value={averageRating.toFixed(1)}
                unit="/5"
                size="sm"
              />,
              <DataMetric
                key="perfected"
                label="Perfected"
                value={perfectedRecipes}
                unit="recipes"
                size="sm"
              />,
            ]}
            onPress={() => router.push("/brewprints")}
          />
        </DataGrid>
      </DataSection>

      {/* Inventory Status */}
      <DataSection title="Inventory" spacing="lg">
        <DataCard
          title="Bean Inventory"
          variant="bordered"
          onPress={() => router.push("/library")}
        >
          <DataMetric
            label="Active Bean Types"
            value={activeBeans}
            size="md"
            trend={
              activeBeans > 0
                ? { value: 12, direction: "up", period: "vs last month" }
                : undefined
            }
          />
        </DataCard>
      </DataSection>

      {/* Recent Activity */}
      {recentBrews.length > 0 && (
        <DataSection
          title="Recent Brews"
          subtitle="Your latest brewing experiments"
        >
          <DataGrid columns={1} gap="sm">
            {recentBrews.map((brew) => (
              <InfoCard
                key={brew.id}
                title={brew.name}
                items={[
                  {
                    label: "Method",
                    value: brew.method?.toUpperCase() || "Unknown",
                  },
                  {
                    label: "Coffee",
                    value: `${brew.parameters?.coffee_grams || "?"}g`,
                  },
                  {
                    label: "Water",
                    value: `${brew.parameters?.water_grams || "?"}g`,
                  },
                  {
                    label: "Time",
                    value: brew.parameters?.total_time
                      ? `${Math.floor(brew.parameters.total_time / 60)}:${(
                          brew.parameters.total_time % 60
                        )
                          .toString()
                          .padStart(2, "0")}`
                      : "?",
                  },
                  {
                    label: "Temp",
                    value: `${brew.parameters?.water_temp || "?"}°C`,
                  },
                ]}
                variant="surface"
                onPress={() => {
                  console.log(
                    "Navigating to brewing with ID:",
                    brew.id,
                    "Full brew:",
                    brew
                  );
                  if (!brew.id) {
                    toast.error(
                      "Recipe ID missing - cannot start brewing session"
                    );
                    return;
                  }
                  router.push(`/brewing/${brew.id}`);
                }}
              />
            ))}
          </DataGrid>
        </DataSection>
      )}

      {/* Quick Actions */}
      <DataSection title="Quick Actions" spacing="lg">
        <DataGrid columns={1} gap="sm">
          <DataCard
            title="Start New Brew"
            subtitle="Begin a new brewing session"
            variant="bordered"
            onPress={() => router.push("/brewprints/new")}
          >
            <DataText variant="small" color="secondary">
              Create and track a new brewing recipe
            </DataText>
          </DataCard>

          <DataCard
            title="Browse Recipes"
            subtitle="Explore your brewing library"
            variant="surface"
            onPress={() => router.push("/brewprints")}
          >
            <DataText variant="small" color="secondary">
              {totalRecipes} recipes available
            </DataText>
          </DataCard>
        </DataGrid>
      </DataSection>
    </DataLayout>
  );
}
