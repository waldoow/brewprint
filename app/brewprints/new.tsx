import { DataLayout } from "@/components/ui/DataLayout";
import { BrewprintForm } from "@/forms/BrewprintForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
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
    <DataLayout
      title={title}
      subtitle={
        initialData
          ? "Duplicate and customize existing recipe"
          : "Create your perfect brewing recipe"
      }
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable
    >
      <BrewprintForm
        initialData={initialData}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </DataLayout>
  );
}
