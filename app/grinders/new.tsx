import React from 'react';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import { ScrollView, StyleSheet } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native-ui-lib";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

import { GrinderForm } from '@/forms/GrinderForm';

export default function NewGrinderScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const handleSuccess = () => {
    toast.success('Grinder added successfully!');
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
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>
          Add New Grinder
        </Text>
        <Text style={styles.pageSubtitle}>
          Precision grinding setup
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GrinderForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </ScrollView>
    </View>
  );
}