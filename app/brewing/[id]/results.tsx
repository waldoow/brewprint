import { DataLayout, DataGrid, DataSection } from "@/components/ui/DataLayout";
import { DataCard } from "@/components/ui/DataCard";
import { DataText } from "@/components/ui/DataText";
import { DataButton } from "@/components/ui/DataButton";
import { Input } from "@/components/ui/Input";
import { ThemedInput } from "@/components/ui/ThemedInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/Form";
import {
  StyleSheet,

  View} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner-native";

interface ResultsForm {
  rating: number;
  notes: string;
  tds?: number;
  extraction?: number;
}

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
    <DataLayout
      title="How was it?"
      subtitle="Rate and review your brewing session"
      scrollable
    >

      <Form {...form}>
        {/* Rating Section */}
        <DataSection title="Rate Your Brew" spacing="lg">
          <DataCard>

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
                    <ThemedInput value={field.value?.toString() || ''} onChangeText={(text) => field.onChange(parseInt(text) || 0)} placeholder="Rating 1-5" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DataText variant="caption" color="secondary" style={styles.ratingText}>
              {rating === 0 && "Tap to rate"}
              {rating === 1 && "Poor - Major issues"}
              {rating === 2 && "Below average"}
              {rating === 3 && "Good - Room for improvement"}
              {rating === 4 && "Very good - Minor tweaks needed"}
              {rating === 5 && "Excellent - Perfect brew!"}
            </DataText>
          </DataCard>
        </DataSection>

        {/* Notes Section */}
        <DataSection title="Tasting Notes" spacing="lg">
          <DataCard>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Describe the taste, aroma, body, and any adjustments for next time..."
                      multiline
                      numberOfLines={6}
                      variant="outline"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </DataCard>
        </DataSection>

        {/* Measurements Section (Optional) */}
        <DataSection title="Measurements (Optional)" spacing="lg">
          <DataCard>

            <DataGrid columns={2} gap="md">
              <View style={styles.measurementItem}>
                <DataText variant="body" weight="medium" style={styles.measurementLabel}>
                  TDS %
                </DataText>
                <FormField
                  control={form.control}
                  name="tds"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          value={field.value?.toString()}
                          onChangeText={(text) =>
                            field.onChange(parseFloat(text) || undefined)
                          }
                          onBlur={field.onBlur}
                          keyboardType="decimal-pad"
                          placeholder="1.35"
                          variant="outline"
                          style={styles.measurementInput}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </View>

              <View style={styles.measurementItem}>
                <DataText variant="body" weight="medium" style={styles.measurementLabel}>
                  Extraction %
                </DataText>
                <FormField
                  control={form.control}
                  name="extraction"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          value={field.value?.toString()}
                          onChangeText={(text) =>
                            field.onChange(parseFloat(text) || undefined)
                          }
                          onBlur={field.onBlur}
                          keyboardType="decimal-pad"
                          placeholder="20.5"
                          variant="outline"
                          style={styles.measurementInput}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </View>
            </DataGrid>
          </DataCard>
        </DataSection>

        {/* Actions */}
        <DataSection title="Save Results" spacing="xl">
          <DataGrid columns={1} gap="md">
            <DataButton
              title="Save & Finish"
              onPress={form.handleSubmit(onSubmit)}
              loading={saving}
              disabled={rating === 0}
              variant="primary"
              size="lg"
              fullWidth
            />

            <DataButton
              title="Save & Brew Again"
              onPress={form.handleSubmit(async (data) => {
                await onSubmit(data);
                router.push(`/brewing/${id}`);
              })}
              loading={saving}
              disabled={rating === 0}
              variant="secondary"
              size="lg"
              fullWidth
            />
          </DataGrid>
        </DataSection>
      </Form>
    </DataLayout>
  );
}
const styles = StyleSheet.create({
  ratingText: {
    textAlign: "center" as const,
    marginTop: 8,
  },
  textArea: {
    minHeight: 120,
  },
  measurementItem: {
    flex: 1,
  },
  measurementLabel: {
    marginBottom: 8,
  },
  measurementInput: {
    textAlign: "center" as const,
  },
});
