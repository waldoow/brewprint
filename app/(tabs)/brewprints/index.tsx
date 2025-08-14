import { Header } from "@/components/ui/Header";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedTabs } from "@/components/ui/ThemedTabs";
import { BrewprintCard } from "@/components/brewprints/brewprint-card";
import { BrewprintsService, type Brewprint } from "@/lib/services";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, RefreshControl, Alert } from "react-native";

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
        Alert.alert("Erreur", "Impossible de charger les recettes");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite lors du chargement");
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
        return brewprints.filter(b => b.status === "experimenting");
      case "final":
        return brewprints.filter(b => b.status === "final");
      case "archived":
        return brewprints.filter(b => b.status === "archived");
      default:
        return brewprints;
    }
  };

  const getTabCounts = () => {
    const experimenting = brewprints.filter(b => b.status === "experimenting").length;
    const final = brewprints.filter(b => b.status === "final").length;
    const archived = brewprints.filter(b => b.status === "archived").length;
    
    return { experimenting, final, archived };
  };

  const filteredBrewprints = getFilteredBrewprints();
  const counts = getTabCounts();

  const tabOptions = [
    { value: "all", label: `Toutes (${brewprints.length})` },
    { value: "experimenting", label: `Tests (${counts.experimenting})` },
    { value: "final", label: `Finales (${counts.final})` },
    { value: "archived", label: `Archivées (${counts.archived})` },
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
          title: "Aucun test en cours",
          description: "Créez votre première recette expérimentale"
        };
      case "final":
        return {
          title: "Aucune recette finalisée",
          description: "Testez vos recettes et marquez les meilleures comme finales"
        };
      case "archived":
        return {
          title: "Aucune recette archivée",
          description: "Les anciennes recettes apparaîtront ici"
        };
      default:
        return {
          title: "Aucune recette",
          description: "Commencez par créer votre première recette de café"
        };
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <Header
          title="Mes Recettes"
          showBack={false}
        />
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Chargement...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Mes Recettes"
        showBack={false}
        rightContent={
          <ThemedButton
            size="sm"
            onPress={handleNewBrewprint}
          >
            Nouvelle
          </ThemedButton>
        }
      />

      <ThemedView style={styles.tabsContainer}>
        <ThemedTabs
          options={tabOptions}
          value={activeTab}
          onValueChange={setActiveTab}
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
                  Créer ma première recette
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
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
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
    gap: 12,
  },
});