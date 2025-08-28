import { BrewprintCard } from "@/components/brewprints/brewprint-card";
import { Header } from "@/components/ui/Header";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { ThemedTabs } from "@/components/ui/ThemedTabs";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, StyleSheet } from "react-native";

export default function BrewprintsScreen() {
  const router = useRouter();
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
    } catch {
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
    router.push("/brewprints/new");
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
            "Outdated or discontinued recipes will appear here for reference",
        };
      default:
        return {
          title: "No Brewing Recipes",
          description:
            "Import or create your first brewing recipe to start optimizing extraction parameters",
        };
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Brewing Recipes" showBack={false} />
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
        showTopSpacing={true}
      />

      <ThemedView style={styles.actionContainer}>
        <ThemedView style={styles.tabsContainer}>
          <ThemedTabs
            items={tabOptions}
            defaultValue={activeTab}
            onValueChange={setActiveTab}
          />
        </ThemedView>

        <ThemedButton
          size="sm"
          onPress={handleNewBrewprint}
          style={styles.newButton}
          title="New Recipe"
        />
      </ThemedView>

      <ThemedScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <ThemedView style={styles.content}>
          {filteredBrewprints.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyTitle}>
                {getEmptyMessage().title}
              </ThemedText>
              <ThemedText style={styles.emptyDescription}>
                {getEmptyMessage().description}
              </ThemedText>
              {activeTab === "all" && (
                <ThemedButton
                  onPress={handleNewBrewprint}
                  style={styles.emptyButton}
                >
                  Create First Recipe
                </ThemedButton>
              )}
            </ThemedView>
          ) : (
            <ThemedView noBackground style={styles.brewprintsList}>
              {filteredBrewprints.map((brewprint) => (
                <BrewprintCard
                  key={brewprint.id}
                  brewprint={brewprint}
                  onPress={() => handleBrewprintPress(brewprint)}
                />
              ))}
            </ThemedView>
          )}
        </ThemedView>
      </ThemedScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24, // Increased for consistency
    paddingVertical: 12, // Increased for better spacing
    gap: 16, // Increased gap
  },
  tabsContainer: {
    flex: 1,
  },
  newButton: {
    minWidth: 100,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24, // Increased for professional spacing
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  brewprintsList: {
    gap: 16, // Increased gap for better separation
  },
});
