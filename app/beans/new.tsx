import { ProfessionalContainer } from "@/components/ui/professional/Container";
import { ProfessionalHeader } from "@/components/ui/professional/Header";
import { BeanForm } from "@/forms/BeanForm";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
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
    <ProfessionalContainer>
      <ProfessionalHeader
        title="Add New Bean"
        subtitle="Coffee inventory management"
        action={{
          title: "Cancel",
          onPress: handleCancel,
        }}
      />

      <BeanForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </ProfessionalContainer>
  );
}

const styles = StyleSheet.create({});
