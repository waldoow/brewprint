import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { toast } from "sonner-native";

import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Text } from "@/components/ui/Text";
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
            Loading grinder details...
          </Text>
        </View>
      </Container>
    );
  }

  if (!grinderData) {
    return (
      <Container>
        <PageHeader
          title="Not Found"
          action={{
            title: "Back",
            onPress: handleCancel,
          }}
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Grinder not found
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
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
    </Container>
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
