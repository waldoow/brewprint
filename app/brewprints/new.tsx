import { Header } from "@/components/ui/Header";
import { ThemedView } from "@/components/ui/ThemedView";
import { BrewprintForm } from "@/forms/BrewprintForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";

export default function NewBrewprintScreen() {
  const router = useRouter();
  const { template } = useLocalSearchParams<{ template?: string }>();

  const initialData = useMemo(() => {
    if (template) {
      try {
        return JSON.parse(template);
      } catch (error) {
        console.error("Failed to parse template data:", error);
        return undefined;
      }
    }
    return undefined;
  }, [template]);

  const handleSuccess = (brewprint: any) => {
    const message = initialData
      ? "Recette dupliquée avec succès!"
      : "Recette créée avec succès!";
    toast.success(message);
    router.replace(`/brewprints/${brewprint.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  const title = initialData ? "Dupliquer Recette" : "Nouvelle Recette";

  return (
    <ThemedView noBackground={false} style={styles.container}>
      <Header
        title={title}
        showBackButton={true}
        onBackPress={handleCancel}
        backButtonTitle="Recipes"
      />

      <BrewprintForm
        initialData={initialData}
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
