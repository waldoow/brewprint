import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
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
      ? "Recipe duplicated successfully!"
      : "Recipe created successfully!";
    toast.success(message);
    router.replace(`/brewprints/${brewprint.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  const title = initialData ? "Duplicate Recipe" : "New Recipe";

  return (
    <Container>
      <PageHeader
        title={title}
        subtitle={initialData ? "Duplicate existing recipe" : "Create new recipe"}
        action={{
          title: "Cancel",
          onPress: handleCancel,
        }}
      />

      <BrewprintForm
        initialData={initialData}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </Container>
  );
}

const styles = StyleSheet.create({});
