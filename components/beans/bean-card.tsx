import React from "react";
import { StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";

import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedSeparator } from "../ui/ThemedSeparator";

// Type basé sur votre table Supabase
export type Bean = {
  id: string;
  user_id: string;
  name: string;
  origin: string;
  farm: string | null;
  region: string | null;
  altitude: number | null;
  process: string | null;
  variety: string | null;
  purchase_date: string;
  roast_date: string;
  supplier: string | null;
  cost: number | null;
  total_grams: number;
  remaining_grams: number;
  roast_level: string;
  tasting_notes: string[] | null;
  official_description: string | null;
  my_notes: string | null;
  rating: number | null;
  freshness_level: number; // 1-5 auto-calculé
  freshness_status: "too-fresh" | "peak" | "good" | "declining" | "stale";
  created_at: string;
  updated_at: string;
};

export type BeanCardProps = {
  bean: Bean;
  onPress?: (bean: Bean) => void;
  style?: ViewStyle;
};

// Mock data pour tests
export const MOCK_BEANS: Bean[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    user_id: "user123-456-789",
    name: "Yirgacheffe Natural",
    origin: "Éthiopie",
    farm: "Kebele Aricha",
    region: "Gedeo Zone",
    altitude: 2100,
    process: "Natural",
    variety: "Heirloom",
    purchase_date: "2025-01-10",
    roast_date: "2025-01-08",
    supplier: "Belleville Brûlerie",
    cost: 42.5,
    total_grams: 500,
    remaining_grams: 380,
    roast_level: "light",
    tasting_notes: ["Fraise", "Chocolat blanc", "Floral"],
    official_description:
      "Un café complexe avec des notes fruitées intenses et une acidité vive",
    my_notes: "Excellent en V60, 15g pour 250ml, 2:30 de temps total",
    rating: 5,
    freshness_level: 5,
    freshness_status: "peak",
    created_at: "2025-01-10T10:00:00Z",
    updated_at: "2025-01-10T10:00:00Z",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    user_id: "user123-456-789",
    name: "Bourbon Rouge",
    origin: "Rwanda",
    farm: "Cooperative Kopakaki",
    region: "Nyamasheke",
    altitude: 1800,
    process: "Washed",
    variety: "Red Bourbon",
    purchase_date: "2024-12-28",
    roast_date: "2024-12-25",
    supplier: "Coutume Café",
    cost: 38.0,
    total_grams: 250,
    remaining_grams: 120,
    roast_level: "medium",
    tasting_notes: ["Cassis", "Caramel", "Citron"],
    official_description: "Profil équilibré avec une belle sucrosité",
    my_notes: "Très bon en espresso, 18g → 36g en 28s",
    rating: 4,
    freshness_level: 3,
    freshness_status: "good",
    created_at: "2024-12-28T14:30:00Z",
    updated_at: "2025-01-05T09:15:00Z",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-345678901234",
    user_id: "user123-456-789",
    name: "Geisha La Esmeralda",
    origin: "Panama",
    farm: "Hacienda La Esmeralda",
    region: "Boquete",
    altitude: 1650,
    process: "Honey",
    variety: "Geisha",
    purchase_date: "2024-12-15",
    roast_date: "2024-12-10",
    supplier: "La Caféothèque",
    cost: 85.0,
    total_grams: 200,
    remaining_grams: 50,
    roast_level: "light-medium",
    tasting_notes: ["Jasmin", "Bergamote", "Pêche", "Miel"],
    official_description:
      "Un des cafés les plus prisés au monde, profil floral exceptionnel",
    my_notes: "Réserver pour les occasions spéciales, sublime en Chemex",
    rating: 5,
    freshness_level: 2,
    freshness_status: "declining",
    created_at: "2024-12-15T11:00:00Z",
    updated_at: "2025-01-08T16:45:00Z",
  },
  {
    id: "d4e5f6a7-b8c9-0123-def0-456789012345",
    user_id: "user123-456-789",
    name: "Maragogype",
    origin: "Guatemala",
    farm: "Finca El Injerto",
    region: "Huehuetenango",
    altitude: 1500,
    process: "Semi-washed",
    variety: "Maragogype",
    purchase_date: "2024-11-20",
    roast_date: "2024-11-15",
    supplier: "Terres de Café",
    cost: 35.0,
    total_grams: 500,
    remaining_grams: 80,
    roast_level: "medium-dark",
    tasting_notes: ["Chocolat noir", "Noix", "Épices"],
    official_description: "Corps plein avec une finale chocolatée persistante",
    my_notes: "Bon pour la French Press, un peu trop torréfié à mon goût",
    rating: 3,
    freshness_level: 1,
    freshness_status: "stale",
    created_at: "2024-11-20T09:30:00Z",
    updated_at: "2025-01-02T14:20:00Z",
  },
  {
    id: "e5f6a7b8-c9d0-1234-ef01-567890123456",
    user_id: "user123-456-789",
    name: "Pacamara Anaerobic",
    origin: "Colombie",
    farm: "Finca El Paraiso",
    region: "Valle del Cauca",
    altitude: 1900,
    process: "Anaerobic Natural",
    variety: "Pacamara",
    purchase_date: "2025-01-12",
    roast_date: "2025-01-11",
    supplier: "Kaffa Roastery",
    cost: 52.0,
    total_grams: 250,
    remaining_grams: 250,
    roast_level: "light",
    tasting_notes: ["Mangue", "Vin rouge", "Cannelle"],
    official_description:
      "Fermentation anaérobie de 120h développant des saveurs uniques",
    my_notes: null,
    rating: null,
    freshness_level: 5,
    freshness_status: "too-fresh",
    created_at: "2025-01-12T08:00:00Z",
    updated_at: "2025-01-12T08:00:00Z",
  },
];

export function BeanCard({ bean, onPress, style }: BeanCardProps) {
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");

  // Get roast level display in French
  const getRoastLevelDisplay = () => {
    const levels: Record<string, string> = {
      light: "Clair",
      "light-medium": "Clair-Moyen",
      medium: "Moyen",
      "medium-dark": "Moyen-Foncé",
      dark: "Foncé",
    };
    return levels[bean.roast_level] || bean.roast_level;
  };

  // Get roast level color (dot indicator)
  const getRoastLevelColor = () => {
    const colors: Record<string, string> = {
      light: "#d4a574",
      "light-medium": "#b8935f",
      medium: "#8b6d47",
      "medium-dark": "#6b4e37",
      dark: "#4a3426",
    };
    return colors[bean.roast_level] || "#8b6d47";
  };

  // Get freshness badge variant based on status
  const getFreshnessVariant = () => {
    switch (bean.freshness_status) {
      case "too-fresh":
        return "secondary";
      case "peak":
        return "success";
      case "good":
        return "default";
      case "declining":
        return "warning";
      case "stale":
        return "destructive";
      default:
        return "default";
    }
  };

  // Get freshness label in French
  const getFreshnessLabel = () => {
    const labels = {
      "too-fresh": "Repos",
      peak: "Optimal",
      good: "Bon",
      declining: "Déclin",
      stale: "Vieux",
    };
    return labels[bean.freshness_status] || bean.freshness_status;
  };

  // Calculate percentage remaining
  const percentageRemaining = (bean.remaining_grams / bean.total_grams) * 100;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(bean)}
      activeOpacity={0.8}
      style={style}
    >
      <ThemedView style={styles.card}>
        {/* Top Section */}
        <ThemedView style={styles.topSection}>
          {/* Roast Level Dot */}
          <ThemedView style={styles.roastIndicator}>
            <ThemedView
              style={[
                styles.roastDot,
                { backgroundColor: getRoastLevelColor() },
              ]}
            />
            <ThemedText style={styles.roastLevel}>
              {getRoastLevelDisplay()}
            </ThemedText>
          </ThemedView>

          {/* Freshness Badge */}
          <ThemedBadge variant={getFreshnessVariant() as any} size="sm">
            {getFreshnessLabel()}
          </ThemedBadge>
        </ThemedView>

        {/* Coffee Name */}
        <ThemedText style={styles.name} numberOfLines={1}>
          {bean.name}
        </ThemedText>

        {/* Supplier */}
        <ThemedText style={styles.supplier} numberOfLines={1}>
          {bean.supplier || "Sans fournisseur"}
        </ThemedText>

        {/* Info Section */}
        <ThemedView style={styles.infoSection}>
          <ThemedText style={styles.infoText} numberOfLines={1}>
            {bean.origin}, {bean.region || bean.farm || "Région inconnue"}
          </ThemedText>

          {bean.process && (
            <>
              <ThemedSeparator
                orientation="vertical"
                size="sm"
                horizontalMargin={6}
              />
              <ThemedText style={styles.infoText} numberOfLines={1}>
                {bean.process}
              </ThemedText>
            </>
          )}

          {bean.altitude && (
            <>
              <ThemedSeparator
                orientation="vertical"
                size="sm"
                horizontalMargin={6}
              />
              <ThemedText style={styles.infoText}>{bean.altitude}m</ThemedText>
            </>
          )}
        </ThemedView>

        {/* Bottom Section with Progress Bar */}
        <ThemedView style={styles.bottomSection}>
          <ThemedText style={styles.quantityText}>
            {bean.remaining_grams}g / {bean.total_grams}g
          </ThemedText>
          <ThemedView style={styles.progressBar}>
            <ThemedView
              style={[
                styles.progressFill,
                {
                  width: `${percentageRemaining}%`,
                  backgroundColor:
                    percentageRemaining > 30
                      ? percentageRemaining > 60
                        ? tintColor
                        : "#f59e0b"
                      : "#ef4444",
                },
              ]}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 6,
    // Ombres subtiles
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roastIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  roastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  roastLevel: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: "500",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  supplier: {
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.6,
    marginBottom: 8,
  },
  infoSection: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 0,
  },
  infoText: {
    fontSize: 10,
    opacity: 0.5,
    lineHeight: 14,
  },
  bottomSection: {
    marginTop: "auto",
  },
  quantityText: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.7,
    marginBottom: 4,
  },
  progressBar: {
    backgroundColor: "rgba(128, 128, 128, 0.2)",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colors.dark.background,
    padding: 2,
  },
  progressFill: {
    height: 4,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
  },
});
