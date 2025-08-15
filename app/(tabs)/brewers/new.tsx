import { Header } from "@/components/ui/Header";
import { ThemedView } from "@/components/ui/ThemedView";
import { BrewerForm } from "@/forms/BrewerForm";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";

export default function NewBrewerScreen() {
  const router = useRouter();

  const handleSuccess = (brewer: any) => {
    toast.success("Brewer created successfully!");
    router.push(`/(tabs)/brewer-detail/${brewer.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView noBackground={false} style={styles.container}>
      <Header
        title="New Brewer"
        showBackButton={true}
        onBackPress={handleCancel}
        backButtonTitle="Inventory"
      />
      
      <BrewerForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});