import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Text } from "@/components/ui/Text";
import { BrewerForm } from "@/forms/BrewerForm";
import { BrewersService } from "@/lib/services/brewers";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { toast } from "sonner-native";

export default function EditBrewerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBrewer = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      router.back();
      return;
    }

    try {
      const result = await BrewersService.getBrewerById(id);
      if (result.success && result.data) {
        // Transform brewer data to form format
        const brewer = result.data;
        setInitialData({
          id: brewer.id,
          name: brewer.name,
          type: brewer.type,
          brand: brewer.brand || "",
          model: brewer.model || "",
          size: brewer.size || "",
          material: brewer.material || "",
          filter_type: brewer.filter_type || "",
          capacity_ml: brewer.capacity_ml?.toString() || "",
          optimal_dose_min: brewer.optimal_dose_range?.[0]?.toString() || "",
          optimal_dose_max: brewer.optimal_dose_range?.[1]?.toString() || "",
          optimal_ratio_min: brewer.optimal_ratio_range?.[0]?.toString() || "",
          optimal_ratio_max: brewer.optimal_ratio_range?.[1]?.toString() || "",
          optimal_temp_min: brewer.optimal_temp_range?.[0]?.toString() || "",
          optimal_temp_max: brewer.optimal_temp_range?.[1]?.toString() || "",
          optimal_grind_min: brewer.optimal_grind_range?.[0]?.toString() || "",
          optimal_grind_max: brewer.optimal_grind_range?.[1]?.toString() || "",
          purchase_date: brewer.purchase_date || "",
          purchase_price: brewer.purchase_price?.toString() || "",
          maintenance_schedule: brewer.maintenance_schedule || "",
          last_maintenance: brewer.last_maintenance || "",
          maintenance_notes: brewer.maintenance_notes || "",
          condition: brewer.condition,
          location: brewer.location || "",
          notes: brewer.notes || "",
          brewing_tips: brewer.brewing_tips?.join('\n') || "",
        });
      } else {
        toast.error("Failed to load brewer");
        router.back();
      }
    } catch (error) {
      console.error("Failed to load brewer:", error);
      toast.error("An error occurred while loading brewer");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadBrewer();
  }, [loadBrewer]);

  const handleSuccess = (brewer: any) => {
    toast.success("Brewer updated successfully!");
    router.push(`/(tabs)/brewer-detail/${brewer.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <Container>
        <PageHeader
          title="Loading..."
          action={{
            title: "Back",
            onPress: handleCancel,
          }}
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Loading brewer details...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title="Edit Brewer"
        subtitle="Update brewing equipment"
        action={{
          title: "Cancel",
          onPress: handleCancel,
        }}
      />
      
      {initialData && (
        <BrewerForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          initialData={initialData}
          isEditing={true}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});