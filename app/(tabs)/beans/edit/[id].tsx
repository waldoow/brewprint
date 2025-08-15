import { Header } from "@/components/ui/Header";
import { ThemedView } from "@/components/ui/ThemedView";
import { BeanForm } from "@/forms/BeanForm";
import { BeansService } from "@/lib/services/beans";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";

export default function EditBeanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBean = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      router.back();
      return;
    }

    try {
      const result = await BeansService.getBeanById(id);
      if (result.success && result.data) {
        // Transform bean data to form format
        const bean = result.data;
        setInitialData({
          id: bean.id,
          name: bean.name,
          roaster: bean.roaster || "",
          origin: bean.origin || "",
          variety: bean.variety || "",
          process: bean.process || "",
          roast_level: bean.roast_level,
          roast_date: bean.roast_date || "",
          weight_g: bean.weight_g?.toString() || "",
          price: bean.price?.toString() || "",
          notes: bean.notes || "",
          rating: bean.rating?.toString() || "",
          flavor_notes: bean.flavor_notes?.join('\n') || "",
        });
      } else {
        toast.error("Failed to load bean");
        router.back();
      }
    } catch (error) {
      console.error("Failed to load bean:", error);
      toast.error("An error occurred while loading bean");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadBean();
  }, [loadBean]);

  const handleSuccess = (bean: any) => {
    toast.success("Bean updated successfully!");
    router.push(`/(tabs)/bean-detail/${bean.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <ThemedView noBackground={false} style={styles.container}>
        <Header
          title="Loading..."
          showBackButton={true}
          onBackPress={handleCancel}
          backButtonTitle="Back"
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView noBackground={false} style={styles.container}>
      <Header
        title="Edit Bean"
        showBackButton={true}
        onBackPress={handleCancel}
        backButtonTitle="Back"
      />
      
      {initialData && (
        <BeanForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          initialData={initialData}
          isEditing={true}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});