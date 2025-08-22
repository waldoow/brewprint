// app/brewing/[id]/results.tsx
import { Header } from "@/components/ui/Header";
import { RatingInput } from "@/components/ui/RatingInput";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedTextArea } from "@/components/ui/ThemedTextArea";
import { ThemedView } from "@/components/ui/ThemedView";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
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

  const form = useForm<ResultsForm>({
    defaultValues: {
      rating: 0,
      notes: "",
    },
  });

  const rating = form.watch("rating");

  const onSubmit = async (data: ResultsForm) => {
    if (!user) return;

    // Validate rating before submission
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      toast.error("Please provide a rating between 1 and 5");
      return;
    }

    setSaving(true);
    try {
      // Prepare the update data according to the actual schema
      const updateData: any = {
        rating: data.rating,
        brewing_notes: data.notes || "", // Ensure it's never null
        brew_date: new Date().toISOString(),
        status: "final",
      };

      // Add actual_metrics if TDS or extraction data is provided
      if (data.tds || data.extraction) {
        updateData.actual_metrics = {};
        if (data.tds && data.tds > 0) updateData.actual_metrics.tds = data.tds;
        if (data.extraction && data.extraction > 0) updateData.actual_metrics.extraction_yield = data.extraction;
      }

      const { error } = await supabase
        .from("brewprints")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Results saved successfully!");
      router.replace("/(tabs)");
    } catch (error) {
      toast.error("Failed to save results");
      console.error("Error saving results:", error);
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
        <Header title="How was it?" onBackPress={() => router.back()} />

        <Form {...form}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Rating Section */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Rate your brew
              </ThemedText>

              <FormField
                control={form.control}
                name="rating"
                rules={{ 
                  required: "Please rate your brew",
                  min: { value: 1, message: "Rating must be at least 1" },
                  max: { value: 5, message: "Rating cannot exceed 5" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RatingInput value={field.value} onChange={field.onChange} size="large" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ThemedTextArea
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Describe the taste, aroma, body, and any adjustments for next time..."
                      numberOfLines={6}
                      style={styles.textArea}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
                <FormField
                  control={form.control}
                  name="tds"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ThemedInput
                          value={field.value?.toString()}
                          onChangeText={(text) =>
                            field.onChange(parseFloat(text) || undefined)
                          }
                          onBlur={field.onBlur}
                          keyboardType="decimal-pad"
                          placeholder="1.35"
                          style={styles.measurementInput}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </View>

              <View style={styles.measurementItem}>
                <ThemedText type="default" style={styles.measurementLabel}>
                  Extraction %
                </ThemedText>
                <FormField
                  control={form.control}
                  name="extraction"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ThemedInput
                          value={field.value?.toString()}
                          onChangeText={(text) =>
                            field.onChange(parseFloat(text) || undefined)
                          }
                          onBlur={field.onBlur}
                          keyboardType="decimal-pad"
                          placeholder="20.5"
                          style={styles.measurementInput}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <ThemedButton
              title="Save & Finish"
              onPress={form.handleSubmit(onSubmit)}
              loading={saving}
              disabled={rating === 0}
              variant="default"
            />

            <ThemedButton
              title="Save & Brew Again"
              onPress={form.handleSubmit(async (data) => {
                await onSubmit(data);
                router.push(`/brewing/${id}`);
              })}
              loading={saving}
              disabled={rating === 0}
              variant="secondary"
            />
          </View>
        </ScrollView>
        </Form>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50, // Reduced from 100 to 50
  },
  section: {
    margin: 8, // Reduced from 16 to 8
    padding: 10, // Reduced from 20 to 10
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 8, // Reduced from 16 to 8
  },
  ratingText: {
    textAlign: "center",
    marginTop: 6, // Reduced from 12 to 6
    opacity: 0.6,
  },
  textArea: {
    minHeight: 120,
  },
  measurementsRow: {
    flexDirection: "row",
    gap: 8, // Reduced from 16 to 8
  },
  measurementItem: {
    flex: 1,
  },
  measurementLabel: {
    opacity: 0.6,
    marginBottom: 4, // Reduced from 8 to 4
  },
  measurementInput: {
    textAlign: "center",
  },
  actions: {
    padding: 8, // Reduced from 16 to 8
    gap: 6, // Reduced from 12 to 6
  },
});
