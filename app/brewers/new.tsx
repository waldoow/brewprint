import { DataLayout } from "@/components/ui/DataLayout";
import { BrewerForm } from "@/forms/BrewerForm";
import { useRouter } from "expo-router";
import React from "react";
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
    <DataLayout
      title="New Equipment"
      subtitle="Add brewing equipment to your coffee arsenal"
      scrollable
    >
      <BrewerForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </DataLayout>
  );
}