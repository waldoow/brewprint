import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet } from "react-native";

import { BeanCard, MOCK_BEANS, type Bean } from "@/components/beans/bean-card";
import { Header } from "@/components/ui/Header";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";

export default function BeansScreen() {
  // Check for beans running low (less than 30% remaining)
  const lowBeans = MOCK_BEANS.filter((bean) => {
    const percentageRemaining = (bean.remaining_grams / bean.total_grams) * 100;
    return percentageRemaining < 30;
  });

  // Check for stale beans
  const staleBeans = MOCK_BEANS.filter(
    (bean) => bean.freshness_status === "stale"
  );

  const handleBeanPress = (bean: Bean) => {
    // Navigate to bean detail screen
    router.push({
      pathname: "/(tabs)/bean-detail",
      params: { id: bean.id },
    });
  };

  const renderBeanCard = ({ item }: { item: Bean }) => (
    <ThemedView style={styles.cardContainer}>
      <BeanCard
        bean={item}
        onPress={handleBeanPress}
        style={styles.cardOverride}
      />
    </ThemedView>
  );

  const renderHeader = () => (
    <ThemedView noBackground style={styles.headerContainer}>
      <ThemedText style={styles.title}>Mes Grains</ThemedText>
      <ThemedText style={styles.subtitle}>
        {MOCK_BEANS.length} café{MOCK_BEANS.length > 1 ? "s" : ""}
      </ThemedText>
    </ThemedView>
  );

  return (
    <>
      <Header
        title="Grains"
        subtitle={
          lowBeans.length > 0 || staleBeans.length > 0
            ? `${MOCK_BEANS.length} café${MOCK_BEANS.length > 1 ? "s" : ""} • ${
                lowBeans.length + staleBeans.length
              } attention requise`
            : `${MOCK_BEANS.length} café${MOCK_BEANS.length > 1 ? "s" : ""}`
        }
        onBackPress={() => router.back()}
        backButtonTitle="Accueil"
        customContent={
          <ThemedView noBackground style={styles.headerActions}>
            <ThemedButton
              title="Ajouter"
              variant="outline"
              size="sm"
              onPress={() => {}}
            />
            <ThemedButton title="Nouveau Grain" size="sm" onPress={() => {}} />
          </ThemedView>
        }
      />

      <FlatList
        data={MOCK_BEANS}
        renderItem={renderBeanCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        ItemSeparatorComponent={() => (
          <ThemedView noBackground style={styles.separator} />
        )}
        style={styles.container}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
  },
  listContent: {
    // padding: 10,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  cardContainer: {
    width: "100%",
    borderRadius: 12,
  },
  cardOverride: {
    width: "100%",
    marginHorizontal: 0,
  },
  separator: {
    height: 20,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
