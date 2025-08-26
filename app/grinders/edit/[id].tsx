import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { toast } from "sonner-native";

import { DataLayout } from "@/components/ui/DataLayout";
import { DataText } from "@/components/ui/DataText";
import { GrinderForm } from "@/forms/GrinderForm";
import { GrindersService } from "@/lib/services/grinders";

export default function EditGrinderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [grinderData, setGrinderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGrinder = React.useCallback(async () => {
    try {
      const result = await GrindersService.getGrinderById(id!);
      if (result.success && result.data) {
        setGrinderData(result.data);
      } else {
        toast.error("Failed to load grinder details");
        router.back();
      }
    } catch (error) {
      console.error("Error loading grinder:", error);
      toast.error("Failed to load grinder details");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadGrinder();
    }
  }, [id, loadGrinder]);

  const handleSuccess = () => {
    toast.success("Grinder updated successfully");
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <DataLayout
        title="Loading Grinder Details..."
        subtitle="Retrieving grinding equipment information for editing"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <View style={styles.loadingContainer}>
          <DataText variant="body" color="secondary">
            Loading grinder details...
          </DataText>
        </View>
      </DataLayout>
    );
  }

  if (!grinderData) {
    return (
      <DataLayout
        title="Grinder Not Found"
        subtitle="Grinding equipment could not be located"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <View style={styles.loadingContainer}>
          <DataText variant="body" color="secondary">
            Grinder not found
          </DataText>
        </View>
      </DataLayout>
    );
  }

  return (
    <DataLayout
      title="Edit Grinder"
      subtitle="Update grinding equipment specifications"
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable
    >
      <GrinderForm
        initialData={grinderData}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </DataLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
});
