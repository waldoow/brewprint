import { BeanForm } from "@/forms/BeanForm";
import { BeansService } from "@/lib/services/beans";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { toast } from "sonner-native";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native-ui-lib";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function EditBeanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBean = useCallback(async () => {
    if (!id || typeof id !== "string") {
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
          flavor_notes: bean.flavor_notes?.join("\n") || "",
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 64,
      paddingBottom: 24,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 8,
    },
    backButtonText: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    pageTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    pageSubtitle: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>
            Loading Bean...
          </Text>
          <Text style={styles.pageSubtitle}>
            Retrieving coffee information
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading bean details...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>
          Edit Bean
        </Text>
        <Text style={styles.pageSubtitle}>
          Update {initialData?.name || "coffee"} details
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {initialData && (
          <BeanForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            initialData={initialData}
            isEditing={true}
          />
        )}
      </ScrollView>
    </View>
  );
}
