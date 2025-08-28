import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { toast } from "sonner-native";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native-ui-lib";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

import { GrinderForm } from "@/forms/GrinderForm";
import { GrindersService } from "@/lib/services/grinders";

export default function EditGrinderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  const [grinderData, setGrinderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGrinder = React.useCallback(async () => {
    try {
      const result = await GrindersService.getGrinderById(id!);
      if (result.success && result.data) {
        setGrinderData(result.data);
      } else {
        toast.error("Failed to load grinder details");
        router.back();
      }
    } catch (error) {
      console.error("Error loading grinder:", error);
      toast.error("Failed to load grinder details");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadGrinder();
    }
  }, [id, loadGrinder]);

  const handleSuccess = () => {
    toast.success("Grinder updated successfully");
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
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing['3xl'],
      paddingBottom: theme.spacing.sm,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    content: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text body style={{ color: theme.colors.text.primary }}>← Back</Text>
          </TouchableOpacity>
          <Text h2 style={{ color: theme.colors.text.primary, marginBottom: 2, fontWeight: '600' }}>
            Loading Grinder...
          </Text>
          <Text tiny style={{ color: theme.colors.text.secondary, fontSize: 11 }}>
            Retrieving equipment information
          </Text>
        </View>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text body style={{ color: theme.colors.text.secondary }}>
            Loading grinder details...
          </Text>
        </View>
      </View>
    );
  }

  if (!grinderData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text body style={{ color: theme.colors.text.primary }}>← Back</Text>
          </TouchableOpacity>
          <Text h2 style={{ color: theme.colors.text.primary, marginBottom: 2, fontWeight: '600' }}>
            Grinder Not Found
          </Text>
          <Text tiny style={{ color: theme.colors.text.secondary, fontSize: 11 }}>
            Equipment could not be located
          </Text>
        </View>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text body style={{ color: theme.colors.text.secondary }}>
            Grinder not found
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
          <Text body style={{ color: theme.colors.text.primary }}>← Back</Text>
        </TouchableOpacity>
        <Text h2 style={{ color: theme.colors.text.primary, marginBottom: 2, fontWeight: '600' }}>
          Edit Grinder
        </Text>
        <Text tiny style={{ color: theme.colors.text.secondary, fontSize: 11 }}>
          Update equipment specifications
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <GrinderForm
          initialData={grinderData}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </ScrollView>
    </View>
  );
}
