import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { BeanCard, MOCK_BEANS } from "@/components/beans/bean-card";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { Plus } from "lucide-react-native";

export function HomeBeansSection() {
  const handleBeanPress = (bean: (typeof MOCK_BEANS)[0]) => {
    // Navigation vers le détail du grain
    router.push(`/(tabs)/beans/${bean.id}`);
  };

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Mes Grains</ThemedText>
        <ThemedText style={styles.seeAll} onPress={() => router.push("/beans")}>
          Voir tout →
        </ThemedText>
      </View>

      {/* Horizontal ScrollView with Bean Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={192} // Card width (180) + margins (12)
        decelerationRate="fast"
      >
        {MOCK_BEANS.map((bean) => (
          <BeanCard key={bean.id} bean={bean} onPress={handleBeanPress} />
        ))}

        {/* Add New Bean Card */}
        <View style={styles.addCard}>
          <ThemedView style={styles.addCardContent}>
            <Plus size={16} color={Colors.dark.text} strokeWidth={2} />
            <ThemedText>Ajouter</ThemedText>
          </ThemedView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  seeAll: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 4, // Pour les ombres
  },

  addCard: {
    width: 180,
    marginHorizontal: 6,
  },

  addCardContent: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "row",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.5,
  },
});
