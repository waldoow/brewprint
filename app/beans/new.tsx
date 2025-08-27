import { BeanForm } from "@/forms/BeanForm";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native-ui-lib";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { toast } from "sonner-native";

export default function NewBeanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const handleSuccess = () => {
    toast.success("Bean added successfully!");
    router.back();
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
  });

  return (
    <View style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>
          Add New Bean
        </Text>
        <Text style={styles.pageSubtitle}>
          Expand your coffee inventory with detailed tracking
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BeanForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </ScrollView>
    </View>
  );
}

