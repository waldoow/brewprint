import { useAuth } from "@/context/AuthContext";
import { BrewersService, type BrewerInput } from "@/lib/services/brewers";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

// UI Components
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { SelectOption, ThemedSelect } from "@/components/ui/ThemedSelect";
import { ThemedTextArea } from "@/components/ui/ThemedTextArea";
import { ThemedView } from "@/components/ui/ThemedView";

// Brewer form validation schema - only fields that exist in database
const brewerFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Brewer name is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  type: z.enum([
    "pour-over",
    "immersion", 
    "espresso",
    "cold-brew",
    "siphon",
    "percolator",
    "turkish",
    "moka",
  ]),

  // General Specifications (optional)
  capacity_ml: z.string().optional(),
  material: z.string().optional(),
  filter_type: z.string().optional(),

  // Espresso-specific fields (only for espresso type)
  espresso_specs: z.string().optional(),

  // Notes
  notes: z.string().optional(),
});

type BrewerFormData = z.infer<typeof brewerFormSchema>;

interface BrewerFormProps {
  onSuccess: (brewer: any) => void;
  onCancel: () => void;
  initialData?: Partial<BrewerFormData> & { id?: string };
  isEditing?: boolean;
}

// Options for selects
const brewerTypeOptions: SelectOption[] = [
  { label: "Pour Over", value: "pour-over" },
  { label: "Immersion", value: "immersion" },
  { label: "Espresso Machine", value: "espresso" },
  { label: "Cold Brew", value: "cold-brew" },
  { label: "Siphon", value: "siphon" },
  { label: "Percolator", value: "percolator" },
  { label: "Turkish/Cezve", value: "turkish" },
  { label: "Moka Pot", value: "moka" },
];

export function BrewerForm({
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
}: BrewerFormProps) {
  const { user } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BrewerFormData>({
    resolver: zodResolver(brewerFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      brand: initialData?.brand || "",
      model: initialData?.model || "",
      type: initialData?.type || "pour-over",
      capacity_ml: initialData?.capacity_ml?.toString() || "",
      material: initialData?.material || "",
      filter_type: initialData?.filter_type || "",
      espresso_specs: initialData?.espresso_specs ? JSON.stringify(initialData.espresso_specs) : "",
      notes: initialData?.notes || "",
    },
  });

  const handleFormSubmit = async (data: BrewerFormData) => {
    if (!user) {
      toast.error("You must be logged in to save a brewer");
      return;
    }

    try {
      // Transform form data to match service expectations (only available fields)
      const brewerData: BrewerInput = {
        name: data.name,
        brand: data.brand,
        model: data.model,
        type: data.type,
        capacity_ml: data.capacity_ml ? parseInt(data.capacity_ml) : undefined,
        material: data.material || undefined,
        filter_type: data.filter_type || undefined,
        espresso_specs: data.espresso_specs ? JSON.parse(data.espresso_specs) : undefined,
        notes: data.notes || undefined,
      };

      let result;
      if (isEditing && initialData?.id) {
        // For editing, we need to include the ID and use update service
        result = await BrewersService.updateBrewer({
          id: initialData.id,
          ...brewerData,
        });
      } else {
        result = await BrewersService.createBrewer(brewerData);
      }

      if (result.success && result.data) {
        toast.success(
          isEditing
            ? "Brewer updated successfully!"
            : "Brewer created successfully!"
        );
        onSuccess(result.data);
        reset();
      } else {
        toast.error(result.error || "Failed to save brewer");
      }
    } catch (error) {
      console.error("Error saving brewer:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <ThemedView style={styles.form}>
          {/* Basic Info */}
          <ThemedView style={styles.section}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedInput
                  label="Brewer Name *"
                  placeholder="e.g., My V60, Kitchen Chemex"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="brand"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedInput
                  label="Brand *"
                  placeholder="e.g., Hario, Chemex, AeroPress"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.brand?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="model"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedInput
                  label="Model *"
                  placeholder="e.g., V60-02, Classic, Original"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.model?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <ThemedSelect
                  label="Brewer Type *"
                  value={value}
                  onValueChange={onChange}
                  options={brewerTypeOptions}
                  error={errors.type?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="capacity_ml"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedInput
                  label="Capacity (ml)"
                  placeholder="e.g., 500, 900"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.capacity_ml?.message}
                  style={styles.input}
                  keyboardType="numeric"
                />
              )}
            />

            <Controller
              control={control}
              name="material"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedInput
                  label="Material"
                  placeholder="e.g., ceramic, glass, plastic"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.material?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="filter_type"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedInput
                  label="Filter Type"
                  placeholder="e.g., V60 02, Chemex Square, Metal"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.filter_type?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedTextArea
                  label="Notes"
                  placeholder="Any additional notes about this brewer..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.notes?.message}
                  style={styles.input}
                  rows={3}
                />
              )}
            />
          </ThemedView>

          {/* Form Actions */}
          <ThemedView style={styles.buttonContainer}>
            <ThemedButton
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <ThemedButton
              title={isEditing ? "Update Brewer" : "Create Brewer"}
              onPress={handleSubmit(handleFormSubmit)}
              loading={isSubmitting}
              style={styles.submitButton}
            />
          </ThemedView>
        </ThemedView>
      </ThemedScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    gap: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});