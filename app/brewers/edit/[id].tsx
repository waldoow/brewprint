import { DataLayout } from "@/components/ui/DataLayout";
import { DataText } from "@/components/ui/DataText";
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
      <DataLayout
        title="Loading Equipment Details..."
        subtitle="Retrieving brewing equipment information for editing"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <View style={styles.loadingContainer}>
          <DataText variant="body" color="secondary">
            Loading brewer details...
          </DataText>
        </View>
      </DataLayout>
    );
  }

  return (
    <DataLayout
      title="Edit Equipment"
      subtitle="Update brewing equipment specifications"
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable
    >
      {initialData && (
        <BrewerForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          initialData={initialData}
          isEditing={true}
        />
      )}
    </DataLayout>
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