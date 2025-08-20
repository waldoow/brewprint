import { Header } from "@/components/ui/Header";
import { ThemedView } from "@/components/ui/ThemedView";
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
    <ThemedView noBackground={false} style={styles.container}>
      <Header
        title="Add New Bean"
        subtitle="Coffee inventory management"
        showBackButton={true}
        onBackPress={handleCancel}
        backButtonTitle="Back"
      />

      <BeanForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
