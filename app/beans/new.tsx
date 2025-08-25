import { DataLayout } from "@/components/ui/DataLayout";
import { BeanForm } from "@/forms/BeanForm";
import { useRouter } from "expo-router";
import React from "react";
import { toast } from "sonner-native";

export default function NewBeanScreen() {
  const router = useRouter();

  const handleSuccess = () => {
    toast.success("Bean added successfully!");
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <DataLayout
      title="Add New Bean"
      subtitle="Expand your coffee inventory with detailed tracking"
      scrollable
    >
      <BeanForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </DataLayout>
  );
}
