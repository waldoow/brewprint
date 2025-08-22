import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";

import { GrinderCard } from "@/components/grinders/grinder-card";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Plus } from "lucide-react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

// Mock data for grinders (following the same pattern as beans)
const MOCK_GRINDERS = [
  {
    id: "1",
    name: "Morning Grinder",
    brand: "Baratza",
    model: "Encore",
    type: "electric" as const,
    burr_type: "conical" as const,
    burr_material: "steel" as const,
    default_setting: 15,
    setting_range: {
      min: 1,
      max: 40,
      increment: 1,
    },
    settings: [
      {
        setting_number: 12,
        description: "V60 Light Roast",
        method: "V60",
        bean_type: "Light Ethiopian",
      },
      {
        setting_number: 18,
        description: "French Press",
        method: "French Press",
        bean_type: "Medium Dark",
      },
    ],
    total_uses: 234,
    last_used: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    is_default: true,
    notes: "Perfect for daily brewing. Recently calibrated and runs smoothly.",
  },
  {
    id: "2", 
    name: "Travel Grinder",
    brand: "1Zpresso",
    model: "JX-Pro",
    type: "manual" as const,
    burr_type: "conical" as const,
    burr_material: "steel" as const,
    default_setting: 25,
    setting_range: {
      min: 1,
      max: 100,
      increment: 0.5,
    },
    settings: [
      {
        setting_number: 22,
        description: "Espresso Blend",
        method: "Espresso",
        bean_type: "Dark Roast",
      },
    ],
    total_uses: 89,
    last_used: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    is_default: false,
    notes: "Compact and portable. Great for travel and camping trips.",
  },
  {
    id: "3",
    name: "Espresso Specialist", 
    brand: "Niche",
    model: "Zero",
    type: "electric" as const,
    burr_type: "conical" as const,
    burr_material: "steel" as const,
    default_setting: 8,
    setting_range: {
      min: 1,
      max: 20,
      increment: 1,
    },
    settings: [],
    total_uses: 156,
    last_used: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    is_default: false,
  },
];

interface HomeGrinderSectionProps {
  onAddGrinderPress?: () => void;
}

export function HomeGrinderSection({ onAddGrinderPress }: HomeGrinderSectionProps) {
  const iconColor = useThemeColor({}, 'icon');
  
  const handleGrinderPress = (grinder: (typeof MOCK_GRINDERS)[0]) => {
    // Navigation to grinder detail - will be implemented later
    router.push(`/(tabs)/grinder-detail/${grinder.id}`);
  };

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Grinders</ThemedText>
        <ThemedText style={styles.seeAll} onPress={() => router.push("/(tabs)/library")}>
          View all →
        </ThemedText>
      </View>

      {/* Horizontal ScrollView with Grinder Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={192} // Card width (180) + margins (12)
        decelerationRate="fast"
      >
        {MOCK_GRINDERS.map((grinder) => (
          <GrinderCard key={grinder.id} grinder={grinder} onPress={() => handleGrinderPress(grinder)} />
        ))}

        {/* Add New Grinder Card */}
        <TouchableOpacity style={styles.addCard} onPress={onAddGrinderPress}>
          <ThemedView style={styles.addCardContent}>
            <Plus size={16} color={iconColor} strokeWidth={2} />
            <ThemedText style={styles.addCardText}>Add Grinder</ThemedText>
          </ThemedView>
        </TouchableOpacity>
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
    paddingVertical: 4, // For shadows
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
    opacity: 0.5,
  },

  addCardText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
});