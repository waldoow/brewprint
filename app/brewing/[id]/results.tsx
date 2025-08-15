// app/brewing/[id]/results.tsx
import { Header } from "@/components/ui/Header";
import { RatingInput } from "@/components/ui/RatingInput";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedTextArea } from "@/components/ui/ThemedTextArea";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { toast } from "sonner-native";

interface ResultsForm {
  rating: number;
  notes: string;
  tds?: number;
  extraction?: number;
}

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, watch } = useForm<ResultsForm>({
    defaultValues: {
      rating: 0,
      notes: "",
    },
  });

  const rating = watch("rating");

  const onSubmit = async (data: ResultsForm) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("brewprints")
        .update({
          results: {
            rating: data.rating,
            notes: data.notes,
            tds: data.tds,
            extraction: data.extraction,
            brewedAt: new Date().toISOString(),
          },
          status: "final",
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Results saved successfully!");
      router.replace("/(tabs)");
    } catch (error) {
      toast.error("Failed to save results");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedView style={styles.container}>
        <Header title="How was it?" onBack={() => router.back()} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Rating Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Rate your brew
            </ThemedText>

            <Controller
              control={control}
              name="rating"
              rules={{ required: true, min: 1 }}
              render={({ field: { onChange, value } }) => (
                <RatingInput value={value} onChange={onChange} size="large" />
              )}
            />

            <ThemedText type="caption" style={styles.ratingText}>
              {rating === 0 && "Tap to rate"}
              {rating === 1 && "Poor - Major issues"}
              {rating === 2 && "Below average"}
              {rating === 3 && "Good - Room for improvement"}
              {rating === 4 && "Very good - Minor tweaks needed"}
              {rating === 5 && "Excellent - Perfect brew!"}
            </ThemedText>
          </View>

          {/* Notes Section */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Tasting notes
            </ThemedText>

            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <ThemedTextArea
                  value={value}
                  onChangeText={onChange}
                  placeholder="Describe the taste, aroma, body, and any adjustments for next time..."
                  numberOfLines={6}
                  style={styles.textArea}
                />
              )}
            />
          </View>

          {/* Measurements Section (Optional) */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Measurements (Optional)
            </ThemedText>

            <View style={styles.measurementsRow}>
              <View style={styles.measurementItem}>
                <ThemedText type="default" style={styles.measurementLabel}>
                  TDS %
                </ThemedText>
                <Controller
                  control={control}
                  name="tds"
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      value={value?.toString()}
                      onChangeText={(text) =>
                        onChange(parseFloat(text) || undefined)
                      }
                      keyboardType="decimal-pad"
                      placeholder="1.35"
                      style={styles.measurementInput}
                    />
                  )}
                />
              </View>

              <View style={styles.measurementItem}>
                <ThemedText type="default" style={styles.measurementLabel}>
                  Extraction %
                </ThemedText>
                <Controller
                  control={control}
                  name="extraction"
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      value={value?.toString()}
                      onChangeText={(text) =>
                        onChange(parseFloat(text) || undefined)
                      }
                      keyboardType="decimal-pad"
                      placeholder="20.5"
                      style={styles.measurementInput}
                    />
                  )}
                />
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <ThemedButton
              title="Save & Finish"
              onPress={handleSubmit(onSubmit)}
              loading={saving}
              disabled={rating === 0}
              variant="default"
            />

            <ThemedButton
              title="Save & Brew Again"
              onPress={handleSubmit(async (data) => {
                await onSubmit(data);
              })}
              loading={saving}
              disabled={rating === 0}
              variant="secondary"
            />
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  ratingText: {
    textAlign: "center",
    marginTop: 12,
    opacity: 0.6,
  },
  textArea: {
    minHeight: 120,
  },
  measurementsRow: {
    flexDirection: "row",
    gap: 16,
  },
  measurementItem: {
    flex: 1,
  },
  measurementLabel: {
    opacity: 0.6,
    marginBottom: 8,
  },
  measurementInput: {
    textAlign: "center",
  },
  actions: {
    padding: 16,
    gap: 12,
  },
});
