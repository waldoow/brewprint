import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <Container>
      <PageHeader
        title="Add New Bean"
        subtitle="Coffee inventory management"
        action={{
          title: "Cancel",
          onPress: handleCancel,
        }}
      />

      <BeanForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </Container>
  );
}

const styles = StyleSheet.create({});
