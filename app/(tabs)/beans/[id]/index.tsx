import { MOCK_BEANS, type Bean } from "@/components/beans/bean-card";
import { DescriptionCard } from "@/components/beans/DescriptionCard";
import { InfoSection } from "@/components/beans/InfoSection";
import { InventoryCard } from "@/components/beans/InventoryCard";
import { RatingSection } from "@/components/beans/RatingSection";
import { StatusCards } from "@/components/beans/StatusCards";
import { TastingNotes } from "@/components/beans/TastingNotes";
import { Header } from "@/components/ui/Header";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { router, useLocalSearchParams } from "expo-router";
import { Calendar, Coffee, MapPin, Scale, Timer } from "lucide-react-native";
import React from "react";
import { StyleSheet } from "react-native";

export default function BeanDetailScreen() {
  const { id } = useLocalSearchParams();

  // Find the bean by ID from mock data
  const bean = MOCK_BEANS.find((b) => b.id === id) as Bean | undefined;

  // Helper function for date formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Early return if bean not found
  if (!bean) {
    return (
      <>
        <Header
          title="Grain introuvable"
          subtitle="Ce grain n'existe pas"
          onBackPress={() => router.back()}
          backButtonTitle="Grains"
        />
        <ThemedView style={styles.container}>
          <ThemedView style={styles.notFoundContainer}>
            <ThemedText style={styles.notFoundText}>
              Aucun grain trouvé avec cet identifiant.
            </ThemedText>
            <ThemedButton
              title="Retour aux grains"
              onPress={() => router.back()}
              style={styles.notFoundButton}
            />
          </ThemedView>
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Header
        title={bean.name}
        subtitle={bean.supplier || "Sans fournisseur"}
        onBackPress={() => router.back()}
        backButtonTitle="Grains"
        customContent={
          <ThemedView style={styles.headerActions}>
            <ThemedButton
              title="Modifier"
              variant="outline"
              size="sm"
              onPress={() => {}}
            />
            <ThemedButton title="Nouveau Brew" onPress={() => {}} />
          </ThemedView>
        }
      />

      <ThemedScrollView
        showsVerticalScrollIndicator={false}
        paddingVertical={20}
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Status Cards */}
        <StatusCards
          roastLevel={bean.roast_level}
          freshnessStatus={bean.freshness_status}
          roastDate={bean.roast_date}
        />

        {/* Inventory Section */}
        <InventoryCard
          remainingGrams={bean.remaining_grams}
          totalGrams={bean.total_grams}
        />

        {/* Origin Information */}
        <InfoSection
          title="Origine"
          rows={[
            { icon: MapPin, label: "Pays", value: bean.origin },
            ...(bean.region
              ? [{ icon: MapPin, label: "Région", value: bean.region }]
              : []),
            ...(bean.farm
              ? [{ icon: Coffee, label: "Ferme", value: bean.farm }]
              : []),
            ...(bean.altitude
              ? [
                  {
                    icon: MapPin,
                    label: "Altitude",
                    value: `${bean.altitude}m`,
                  },
                ]
              : []),
          ]}
        />

        {/* Processing & Variety */}
        <InfoSection
          title="Traitement & Variété"
          rows={[
            ...(bean.variety
              ? [{ icon: Coffee, label: "Variété", value: bean.variety }]
              : []),
            ...(bean.process
              ? [{ icon: Timer, label: "Processus", value: bean.process }]
              : []),
          ]}
        />

        {/* Dates & Purchase */}
        <InfoSection
          title="Dates & Achat"
          rows={[
            {
              icon: Calendar,
              label: "Date de torréfaction",
              value: formatDate(bean.roast_date),
            },
            {
              icon: Calendar,
              label: "Date d'achat",
              value: formatDate(bean.purchase_date),
            },
            ...(bean.cost
              ? [{ icon: Scale, label: "Prix", value: `${bean.cost}€` }]
              : []),
          ]}
        />

        {/* Tasting Notes */}
        <TastingNotes notes={bean.tasting_notes || []} />

        {/* Rating */}
        {bean.rating && <RatingSection rating={bean.rating} />}

        {/* Official Description */}
        {bean.official_description && (
          <DescriptionCard
            title="Description officielle"
            content={bean.official_description}
          />
        )}

        {/* My Notes */}
        {bean.my_notes && (
          <DescriptionCard title="Mes notes" content={bean.my_notes} />
        )}

        {/* Action Buttons */}
        <ThemedView style={styles.actionsSection}>
          <ThemedButton
            title="Créer un Brew"
            size="lg"
            onPress={() => {}}
            style={styles.primaryAction}
          />
          <ThemedView style={styles.secondaryActions}>
            <ThemedButton
              title="Modifier"
              variant="outline"
              size="default"
              onPress={() => {}}
              style={styles.secondaryAction}
            />
            <ThemedButton
              title="Dupliquer"
              variant="outline"
              size="default"
              onPress={() => {}}
              style={styles.secondaryAction}
            />
          </ThemedView>
        </ThemedView>

        {/* Bottom spacing */}
      </ThemedScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 20,
  },
  notFoundText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  notFoundButton: {
    minWidth: 200,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionsSection: {
    gap: 16,
    marginTop: 8,
    paddingBottom: 20,
  },
  primaryAction: {
    width: "100%",
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryAction: {
    flex: 1,
  },
});
