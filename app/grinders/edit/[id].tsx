import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { toast } from "sonner-native";

import { ProfessionalContainer } from "@/components/ui/professional/Container";
import { ProfessionalHeader } from "@/components/ui/professional/Header";
import { ProfessionalText } from "@/components/ui/professional/Text";
import { GrinderForm } from "@/forms/GrinderForm";
import { GrindersService } from "@/lib/services/grinders";

export default function EditGrinderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [grinderData, setGrinderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGrinder();
    }
  }, [id]);

  const loadGrinder = async () => {
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
  };

  const handleSuccess = () => {
    toast.success("Grinder updated successfully");
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ProfessionalContainer>
        <ProfessionalHeader
          title="Loading..."
          action={{
            title: "Back",
            onPress: handleCancel,
          }}
        />
        <View style={styles.loadingContainer}>
          <ProfessionalText variant="body" color="secondary">
            Loading grinder details...
          </ProfessionalText>
        </View>
      </ProfessionalContainer>
    );
  }

  if (!grinderData) {
    return (
      <ProfessionalContainer>
        <ProfessionalHeader
          title="Not Found"
          action={{
            title: "Back",
            onPress: handleCancel,
          }}
        />
        <View style={styles.loadingContainer}>
          <ProfessionalText variant="body" color="secondary">
            Grinder not found
          </ProfessionalText>
        </View>
      </ProfessionalContainer>
    );
  }

  return (
    <ProfessionalContainer>
      <ProfessionalHeader
        title="Edit Grinder"
        subtitle="Update grinding equipment"
        action={{
          title: "Cancel",
          onPress: handleCancel,
        }}
      />

      <GrinderForm
        initialData={grinderData}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </ProfessionalContainer>
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
