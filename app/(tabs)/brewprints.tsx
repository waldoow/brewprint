import { Header } from "@/components/ui/Header";
import { SearchBar } from "@/components/ui/SearchBar";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { ThemedTabs } from "@/components/ui/ThemedTabs";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function BrewprintsTab() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const [brewprints, setBrewprints] = useState<Brewprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadBrewprints = useCallback(async () => {
    try {
      const result = await BrewprintsService.getAllBrewprints();
      if (result.success && result.data) {
        setBrewprints(result.data);
      } else {
        Alert.alert("Error", "Failed to load brewing recipes");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while loading recipes");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBrewprints();
    }, [loadBrewprints])
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadBrewprints();
  }, [loadBrewprints]);

  const getFilteredBrewprints = (): Brewprint[] => {
    let filtered = brewprints;

    // Filter by tab
    switch (activeTab) {
      case "experimenting":
        filtered = filtered.filter((b) => b.status === "experimenting");
        break;
      case "final":
        filtered = filtered.filter((b) => b.status === "final");
        break;
      case "archived":
        filtered = filtered.filter((b) => b.status === "archived");
        break;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          (b.description && b.description.toLowerCase().includes(query)) ||
          (b.method && b.method.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const getTabCounts = () => {
    const experimenting = brewprints.filter(
      (b) => b.status === "experimenting"
    ).length;
    const final = brewprints.filter((b) => b.status === "final").length;
    const archived = brewprints.filter((b) => b.status === "archived").length;

    return { experimenting, final, archived };
  };

  const filteredBrewprints = getFilteredBrewprints();
  const counts = getTabCounts();

  const tabOptions = [
    { value: "all", label: `All (${brewprints.length})` },
    { value: "experimenting", label: `Testing (${counts.experimenting})` },
    { value: "final", label: `Finalized (${counts.final})` },
    { value: "archived", label: `Archived (${counts.archived})` },
  ];

  const handleBrewprintPress = (brewprint: Brewprint) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/brewprints/${brewprint.id}`);
  };

  const handleNewBrewprint = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/brewprints/new");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Filter pressed");
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "experimenting":
        return {
          title: "No Experimental Recipes",
          description:
            "Create your first experimental brewing recipe to begin testing variables",
        };
      case "final":
        return {
          title: "No Finalized Recipes",
          description:
            "Test your experimental recipes and promote the best ones to finalized status",
        };
      case "archived":
        return {
          title: "No Archived Recipes",
          description:
            "Archive recipes that you no longer use but want to keep for reference",
        };
      default:
        return {
          title: "No Brewing Recipes",
          description:
            "Create your first brewing recipe to start perfecting your coffee",
        };
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Brewing Recipes" showBackButton={false} />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Loading recipes...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView noBackground={false} style={styles.container}>
      <Header
        title="Brewing Recipes"
        subtitle={`${filteredBrewprints.length} recipe${
          filteredBrewprints.length === 1 ? "" : "s"
        } • ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        showBackButton={false}
        showMenuButton={true}
        showProfileAvatar={true}
        showSearchButton={false}
        onMenuPress={() => console.log("Menu pressed")}
        onProfilePress={() => console.log("Profile pressed")}
        showTopSpacing={true}
      />

      <View style={styles.searchSection}>
        <SearchBar
          placeholder="Search recipes..."
          onSearch={handleSearch}
          onFilterPress={handleFilter}
        />
      </View>

      <ThemedView style={styles.actionContainer}>
        <ThemedButton
          title="New Recipe"
          size="default"
          variant="secondary"
          onPress={handleNewBrewprint}
          style={{ width: "100%" }}
        />
      </ThemedView>

      <ThemedView style={styles.tabsContainer}>
        <ThemedTabs
          items={tabOptions}
          defaultValue={activeTab}
          onValueChange={setActiveTab}
        />
      </ThemedView>

      <ThemedScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {filteredBrewprints.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              {getEmptyMessage().title}
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              {getEmptyMessage().description}
            </ThemedText>
            <ThemedButton
              title="Create Your First Recipe"
              onPress={handleNewBrewprint}
              style={styles.emptyButton}
            />
          </ThemedView>
        ) : (
          <View style={styles.section}>
            {filteredBrewprints.map((brewprint) => (
              <View
                key={brewprint.id}
                style={[
                  styles.brewprintCard,
                  {
                    backgroundColor: colors.primary + "20",
                    borderColor: colors.primary,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.brewprintContent}
                  onPress={() => handleBrewprintPress(brewprint)}
                >
                  <View style={styles.brewprintHeader}>
                    <View style={styles.brewprintMain}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={[styles.brewprintName, { color: colors.text }]}
                      >
                        {brewprint.name}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.brewprintSubtitle,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {brewprint.method
                          ? brewprint.method.charAt(0).toUpperCase() +
                            brewprint.method.slice(1).replace("-", " ")
                          : "Unknown Method"}
                      </ThemedText>
                    </View>
                    <View style={styles.brewprintStatus}>
                      <ThemedText
                        style={[
                          styles.statusBadge,
                          {
                            color:
                              brewprint.status === "final"
                                ? colors.statusGreen
                                : brewprint.status === "experimenting"
                                ? colors.primary
                                : colors.textSecondary,
                            backgroundColor:
                              brewprint.status === "final"
                                ? colors.statusGreen + "20"
                                : brewprint.status === "experimenting"
                                ? colors.primary + "20"
                                : colors.textSecondary + "20",
                          },
                        ]}
                      >
                        {brewprint.status
                          ? brewprint.status.toUpperCase()
                          : "DRAFT"}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.brewprintDetails}>
                    <View style={styles.brewprintDetailRow}>
                      <ThemedText
                        style={[
                          styles.brewprintDetailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Coffee Dose
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.brewprintDetailValue,
                          { color: colors.text },
                        ]}
                      >
                        {brewprint.parameters?.coffee_grams || "Unknown"}g
                      </ThemedText>
                    </View>

                    <View style={styles.brewprintDetailRow}>
                      <ThemedText
                        style={[
                          styles.brewprintDetailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Water Temp
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.brewprintDetailValue,
                          { color: colors.text },
                        ]}
                      >
                        {brewprint.parameters?.water_temp || "Unknown"}°C
                      </ThemedText>
                    </View>

                    <View style={styles.brewprintDetailRow}>
                      <ThemedText
                        style={[
                          styles.brewprintDetailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Brew Time
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.brewprintDetailValue,
                          { color: colors.text },
                        ]}
                      >
                        {brewprint.parameters?.total_time
                          ? `${Math.floor(
                              brewprint.parameters.total_time / 60
                            )}:${(brewprint.parameters.total_time % 60)
                              .toString()
                              .padStart(2, "0")}`
                          : "Unknown"}
                      </ThemedText>
                    </View>

                    {brewprint.description && (
                      <View style={styles.brewprintDescription}>
                        <ThemedText
                          style={[
                            styles.brewprintDescriptionText,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={2}
                        >
                          {brewprint.description}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={styles.brewprintActions}>
                  <ThemedButton
                    title="Start Brewing"
                    variant="default"
                    size="sm"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push(`/brewing/${brewprint.id}`);
                    }}
                    style={[styles.brewprintActionButton, styles.primaryAction]}
                  />

                  <ThemedButton
                    title="Duplicate"
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({
                        pathname: "/brewprints/new",
                        params: {
                          template: JSON.stringify({
                            name: `${brewprint.name} (Copy)`,
                            description: brewprint.description,
                            method: brewprint.method,
                            difficulty: brewprint.difficulty || 1,
                            parameters: brewprint.parameters,
                            steps: brewprint.steps || [],
                            bean_id: brewprint.bean_id,
                            grinder_id: brewprint.grinder_id,
                            brewer_id: brewprint.brewer_id,
                            water_profile_id: brewprint.water_profile_id,
                          }),
                        },
                      });
                    }}
                    style={styles.brewprintActionButton}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ThemedScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    marginBottom: 16,
  },
  actionContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
    justifyContent: "flex-end",
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  bottomSpacing: {
    height: 20,
  },

  // Professional Brewprint Card for Coffee Professionals (from home screen)
  brewprintCard: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  brewprintContent: {
    padding: 20,
  },
  brewprintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  brewprintMain: {
    flex: 1,
  },
  brewprintName: {
    fontSize: 16,
    marginBottom: 2,
  },
  brewprintSubtitle: {
    fontSize: 13,
  },
  brewprintStatus: {
    alignItems: "flex-end",
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  brewprintDetails: {
    gap: 6,
  },
  brewprintDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brewprintDetailLabel: {
    fontSize: 12,
    flex: 1,
  },
  brewprintDetailValue: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    fontVariant: ["tabular-nums"],
  },
  brewprintDescription: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  brewprintDescriptionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Professional Action System for Coffee Workflow
  brewprintActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  brewprintActionButton: {
    flex: 1,
  },
  primaryAction: {
    // Primary action styling handled by ThemedButton variant
  },
});
