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
    router.push(`/brewprints/${brewprint.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Nouvelle Recette"
        showBack={true}
        onBack={handleCancel}
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