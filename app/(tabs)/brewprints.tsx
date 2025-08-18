import { BrewprintCard } from "@/components/brewprints/brewprint-card";
import { Header } from "@/components/ui/Header";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { ThemedTabs } from "@/components/ui/ThemedTabs";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, StyleSheet } from "react-native";

export default function BrewprintsTab() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const [brewprints, setBrewprints] = useState<Brewprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

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
    switch (activeTab) {
      case "experimenting":
        return brewprints.filter((b) => b.status === "experimenting");
      case "final":
        return brewprints.filter((b) => b.status === "final");
      case "archived":
        return brewprints.filter((b) => b.status === "archived");
      default:
        return brewprints;
    }
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
    router.push(`/brewprints/${brewprint.id}`);
  };

  const handleNewBrewprint = () => {
    router.push("/(tabs)/new-brewprint");
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
        showSearchButton={true}
        onMenuPress={() => console.log("Menu pressed")}
        onProfilePress={() => console.log("Profile pressed")}
        onSearchPress={() => console.log("Search pressed")}
      />

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
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
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
              onPress={handleNewBrewprint}
              style={styles.emptyButton}
            >
              Create Your First Recipe
            </ThemedButton>
          </ThemedView>
        ) : (
          <ThemedView style={styles.grid}>
            {filteredBrewprints.map((brewprint) => (
              <BrewprintCard
                key={brewprint.id}
                brewprint={brewprint}
                onPress={() => handleBrewprintPress(brewprint)}
              />
            ))}
          </ThemedView>
        )}
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
  actionContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
    justifyContent: "flex-end",
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
  },
  newButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    padding: 16,
    gap: 16,
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
});
