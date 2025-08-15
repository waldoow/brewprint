import { Header } from "@/components/ui/Header";
import { ThemedView } from "@/components/ui/ThemedView";
import { BrewprintForm } from "@/forms/BrewprintForm";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";

export default function NewBrewprintScreen() {
  const router = useRouter();

  const handleSuccess = (brewprint: any) => {
    toast.success("Recette créée avec succès!");
    router.push(`/(tabs)/brewprints/${brewprint.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView noBackground={false} style={styles.container}>
      <Header
        title="Nouvelle Recette"
        showBackButton={true}
        onBackPress={handleCancel}
        backButtonTitle="Recipes"
      />
      
      <BrewprintForm
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