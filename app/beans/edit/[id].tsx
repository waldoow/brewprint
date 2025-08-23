import { ProfessionalContainer } from "@/components/ui/professional/Container";
import { ProfessionalHeader } from "@/components/ui/professional/Header";
import { ProfessionalText } from "@/components/ui/professional/Text";
import { BeanForm } from "@/forms/BeanForm";
import { BeansService } from "@/lib/services/beans";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
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
      <ProfessionalContainer>
        <ProfessionalHeader
          title="Loading..."
          action={{
            title: "Back",
            onPress: handleCancel,
          }}
        />
        <View style={styles.loadingContainer}>
          <ProfessionalText variant="body" color="secondary">
            Loading bean details...
          </ProfessionalText>
        </View>
      </ProfessionalContainer>
    );
  }

  return (
    <ProfessionalContainer>
      <ProfessionalHeader
        title="Edit Bean"
        subtitle="Update coffee inventory"
        action={{
          title: "Cancel",
          onPress: handleCancel,
        }}
      />
      
      {initialData && (
        <BeanForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          initialData={initialData}
          isEditing={true}
        />
      )}
    </ProfessionalContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});