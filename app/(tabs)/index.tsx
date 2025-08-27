import { useAuth } from "@/context/AuthContext";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { AnalyticsService, type BrewingStats } from "@/lib/services/analytics";
import { BeansService, type Bean } from "@/lib/services/beans";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native-ui-lib";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { toast } from "sonner-native";

export default function HomeScreen() {
  const { user } = useAuth();
  const [beans, setBeans] = useState<Bean[]>([]);
  const [brewprints, setBrewprints] = useState<Brewprint[]>([]);
  const [stats, setStats] = useState<BrewingStats | null>(null);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

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
      paddingHorizontal: 16,
      paddingBottom: 32,
      gap: 32,
    },
    sectionHeader: {
      marginBottom: 16,
    },
    metricsRow: {
      flexDirection: 'row',
      gap: 24,
    },
    metricItem: {
      flex: 1,
    },
    metricValue: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      lineHeight: 24,
      marginTop: 4,
      marginBottom: 2,
    },
    metricLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    metricSubtext: {
      fontSize: 11,
      color: theme.colors.text.tertiary,
      marginBottom: 8,
    },
    metricButton: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: theme.colors.surface,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    inventoryValue: {
      fontSize: 20,
      fontWeight: '600',
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
      alignSelf: 'flex-start',
    },
    brewItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    brewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    brewName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      flex: 1,
      marginRight: 8,
    },
    brewMethod: {
      fontSize: 9,
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    brewParams: {
      flexDirection: 'row',
      gap: 8,
    },
    brewParam: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    actionSubtitle: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          Dashboard
        </Text>
        <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>
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
        {/* Analytics */}
        <View>
          <Text style={[styles.sectionTitle, styles.sectionHeader]}>
            Analytics
          </Text>
          
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>ACTIVITY</Text>
              <Text style={styles.metricValue}>
                {totalBrews}
              </Text>
              <Text style={styles.metricSubtext}>
                Total brews
              </Text>
              <TouchableOpacity
                style={styles.metricButton}
                onPress={() => router.push("/analytics")}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 11, color: theme.colors.text.primary }}>
                  View details
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>QUALITY</Text>
              <Text style={styles.metricValue}>
                {averageRating.toFixed(1)}/5
              </Text>
              <Text style={styles.metricSubtext}>
                {perfectedRecipes} perfected
              </Text>
              <TouchableOpacity
                style={styles.metricButton}
                onPress={() => router.push("/brewprints")}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 11, color: theme.colors.text.primary }}>
                  View recipes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Inventory */}
        <View>
          <Text style={[styles.sectionTitle, styles.sectionHeader]}>
            Inventory
          </Text>
          
          <View>
            <Text style={styles.metricLabel}>BEANS</Text>
            <Text style={styles.inventoryValue}>
              {activeBeans} active types
            </Text>
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

        {/* Recent Activity */}
        {recentBrews.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, styles.sectionHeader]}>
              Recent Brews
            </Text>
            
            <View>
              {recentBrews.map((brew, index) => (
                <TouchableOpacity
                  key={brew.id}
                  style={[styles.brewItem, index === recentBrews.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => {
                    if (!brew.id) {
                      toast.error("Recipe ID missing - cannot start brewing session");
                      return;
                    }
                    router.push(`/brewing/${brew.id}`);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.brewRow}>
                    <Text style={styles.brewName}>
                      {brew.name}
                    </Text>
                    <Text style={styles.brewMethod}>
                      {brew.method?.toUpperCase() || "METHOD"}
                    </Text>
                  </View>
                  <View style={styles.brewParams}>
                    <Text style={styles.brewParam}>
                      {brew.parameters?.coffee_grams || "?"}g coffee
                    </Text>
                    <Text style={styles.brewParam}>•</Text>
                    <Text style={styles.brewParam}>
                      {brew.parameters?.water_grams || "?"}g water
                    </Text>
                    <Text style={styles.brewParam}>•</Text>
                    <Text style={styles.brewParam}>
                      {brew.parameters?.water_temp || "?"}°C
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
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
              <Text style={styles.actionTitle}>
                Start New Brew
              </Text>
              <Text style={styles.actionSubtitle}>
                Create and track brewing recipe
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: theme.colors.text.tertiary }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/brewprints")}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.actionTitle}>
                Browse Recipes
              </Text>
              <Text style={styles.actionSubtitle}>
                {totalRecipes} available recipes
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: theme.colors.text.tertiary }}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

