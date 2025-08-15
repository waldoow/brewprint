import { useAuth } from "@/context/AuthContext";
import { BrewersService, type BrewerInput } from "@/lib/services/brewers";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

// UI Components
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedCollapsible } from "@/components/ui/ThemedCollapsible";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { SelectOption, ThemedSelect } from "@/components/ui/ThemedSelect";
import { ThemedTextArea } from "@/components/ui/ThemedTextArea";
import { ThemedView } from "@/components/ui/ThemedView";

// Brewer form validation schema
const brewerFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Brewer name is required"),
  type: z.enum([
    "v60",
    "chemex",
    "french-press",
    "aeropress",
    "espresso",
    "cold-brew",
    "siphon",
    "percolator",
    "turkish",
    "moka",
    "clever",
    "kalita-wave",
    "origami",
    "orea",
    "april",
    "other",
  ]),
  brand: z.string().optional(),
  model: z.string().optional(),
  size: z.string().optional(),

  // Physical Characteristics
  material: z
    .enum(["ceramic", "plastic", "glass", "metal", "wood", "other"])
    .optional(),
  filter_type: z.string().optional(),
  capacity_ml: z.string().optional(),

  // Brewing Parameters
  optimal_dose_min: z.string().optional(),
  optimal_dose_max: z.string().optional(),
  optimal_ratio_min: z.string().optional(),
  optimal_ratio_max: z.string().optional(),
  optimal_temp_min: z.string().optional(),
  optimal_temp_max: z.string().optional(),
  optimal_grind_min: z.string().optional(),
  optimal_grind_max: z.string().optional(),

  // Purchase & Care
  purchase_date: z.string().optional(),
  purchase_price: z.string().optional(),
  maintenance_schedule: z
    .enum(["daily", "weekly", "monthly", "quarterly", "annually"])
    .optional(),
  last_maintenance: z.string().optional(),
  maintenance_notes: z.string().optional(),

  // Status
  condition: z.enum(["excellent", "good", "fair", "needs-replacement"]),
  location: z.string().optional(),

  // Notes
  notes: z.string().optional(),
  brewing_tips: z.string().optional(),
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
  { label: "V60", value: "v60" },
  { label: "Chemex", value: "chemex" },
  { label: "French Press", value: "french-press" },
  { label: "AeroPress", value: "aeropress" },
  { label: "Espresso Machine", value: "espresso" },
  { label: "Cold Brew", value: "cold-brew" },
  { label: "Siphon", value: "siphon" },
  { label: "Percolator", value: "percolator" },
  { label: "Turkish/Cezve", value: "turkish" },
  { label: "Moka Pot", value: "moka" },
  { label: "Clever Dripper", value: "clever" },
  { label: "Kalita Wave", value: "kalita-wave" },
  { label: "Origami", value: "origami" },
  { label: "Orea", value: "orea" },
  { label: "April Brewer", value: "april" },
  { label: "Other", value: "other" },
];

const materialOptions: SelectOption[] = [
  { label: "Ceramic", value: "ceramic" },
  { label: "Plastic", value: "plastic" },
  { label: "Glass", value: "glass" },
  { label: "Metal", value: "metal" },
  { label: "Wood", value: "wood" },
  { label: "Other", value: "other" },
];

const conditionOptions: SelectOption[] = [
  { label: "Excellent", value: "excellent" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
  { label: "Needs Replacement", value: "needs-replacement" },
];

const maintenanceScheduleOptions: SelectOption[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Annually", value: "annually" },
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
    setValue,
    watch,
    reset,
  } = useForm<BrewerFormData>({
    resolver: zodResolver(brewerFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "v60",
      brand: initialData?.brand || "",
      model: initialData?.model || "",
      size: initialData?.size || "",
      material: initialData?.material || "ceramic",
      filter_type: initialData?.filter_type || "",
      capacity_ml: initialData?.capacity_ml || "",
      optimal_dose_min: initialData?.optimal_dose_min || "",
      optimal_dose_max: initialData?.optimal_dose_max || "",
      optimal_ratio_min: initialData?.optimal_ratio_min || "",
      optimal_ratio_max: initialData?.optimal_ratio_max || "",
      optimal_temp_min: initialData?.optimal_temp_min || "",
      optimal_temp_max: initialData?.optimal_temp_max || "",
      optimal_grind_min: initialData?.optimal_grind_min || "",
      optimal_grind_max: initialData?.optimal_grind_max || "",
      purchase_date: initialData?.purchase_date || "",
      purchase_price: initialData?.purchase_price || "",
      maintenance_schedule: initialData?.maintenance_schedule || "weekly",
      last_maintenance: initialData?.last_maintenance || "",
      maintenance_notes: initialData?.maintenance_notes || "",
      condition: initialData?.condition || "excellent",
      location: initialData?.location || "",
      notes: initialData?.notes || "",
      brewing_tips: initialData?.brewing_tips || "",
    },
  });

  const handleFormSubmit = async (data: BrewerFormData) => {
    if (!user) {
      toast.error("You must be logged in to save a brewer");
      return;
    }

    try {
      // Transform form data to match service expectations
      const brewerData: BrewerInput = {
        name: data.name,
        type: data.type,
        brand: data.brand || undefined,
        model: data.model || undefined,
        size: data.size || undefined,
        material: data.material || undefined,
        filter_type: data.filter_type || undefined,
        capacity_ml: data.capacity_ml ? parseInt(data.capacity_ml) : undefined,
        optimal_dose_range:
          data.optimal_dose_min && data.optimal_dose_max
            ? [
                parseFloat(data.optimal_dose_min),
                parseFloat(data.optimal_dose_max),
              ]
            : undefined,
        optimal_ratio_range:
          data.optimal_ratio_min && data.optimal_ratio_max
            ? [
                parseFloat(data.optimal_ratio_min),
                parseFloat(data.optimal_ratio_max),
              ]
            : undefined,
        optimal_temp_range:
          data.optimal_temp_min && data.optimal_temp_max
            ? [
                parseFloat(data.optimal_temp_min),
                parseFloat(data.optimal_temp_max),
              ]
            : undefined,
        optimal_grind_range:
          data.optimal_grind_min && data.optimal_grind_max
            ? [
                parseFloat(data.optimal_grind_min),
                parseFloat(data.optimal_grind_max),
              ]
            : undefined,
        purchase_date: data.purchase_date || undefined,
        purchase_price: data.purchase_price
          ? parseFloat(data.purchase_price)
          : undefined,
        maintenance_schedule: data.maintenance_schedule || undefined,
        last_maintenance: data.last_maintenance || undefined,
        maintenance_notes: data.maintenance_notes || undefined,
        condition: data.condition,
        location: data.location || undefined,
        notes: data.notes || undefined,
        brewing_tips: data.brewing_tips
          ? data.brewing_tips.split("\n").filter((tip) => tip.trim())
          : undefined,
        is_active: true, // New brewers are active by default
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
          {/* Basic Information */}
          <ThemedCollapsible title="Basic Information">
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
                name="brand"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedInput
                    label="Brand"
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
                    label="Model"
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
                name="size"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedInput
                    label="Size"
                    placeholder="e.g., 02, 6-cup, 350ml"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.size?.message}
                    style={styles.input}
                  />
                )}
              />
            </ThemedView>
          </ThemedCollapsible>

          {/* Physical Characteristics */}
          <ThemedCollapsible title="Physical Characteristics">
            <ThemedView style={styles.section}>
              <Controller
                control={control}
                name="material"
                render={({ field: { onChange, value } }) => (
                  <ThemedSelect
                    label="Material"
                    value={value || ""}
                    onValueChange={onChange}
                    options={materialOptions}
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
                name="capacity_ml"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedInput
                    label="Capacity (ml)"
                    placeholder="e.g., 500, 900"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    error={errors.capacity_ml?.message}
                    style={styles.input}
                  />
                )}
              />
            </ThemedView>
          </ThemedCollapsible>

          {/* Optimal Brewing Parameters */}
          <ThemedCollapsible title="Optimal Brewing Parameters">
            <ThemedView style={styles.section}>
              <ThemedView style={styles.rangeContainer}>
                <Controller
                  control={control}
                  name="optimal_dose_min"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Coffee Dose Min (g)"
                      placeholder="15"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      error={errors.optimal_dose_min?.message}
                      style={[styles.input, styles.halfInput]}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="optimal_dose_max"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Coffee Dose Max (g)"
                      placeholder="30"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      error={errors.optimal_dose_max?.message}
                      style={[styles.input, styles.halfInput]}
                    />
                  )}
                />
              </ThemedView>

              <ThemedView style={styles.rangeContainer}>
                <Controller
                  control={control}
                  name="optimal_ratio_min"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Ratio Min (1:X)"
                      placeholder="15"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      error={errors.optimal_ratio_min?.message}
                      style={[styles.input, styles.halfInput]}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="optimal_ratio_max"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Ratio Max (1:X)"
                      placeholder="17"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      error={errors.optimal_ratio_max?.message}
                      style={[styles.input, styles.halfInput]}
                    />
                  )}
                />
              </ThemedView>

              <ThemedView style={styles.rangeContainer}>
                <Controller
                  control={control}
                  name="optimal_temp_min"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Temperature Min (°C)"
                      placeholder="88"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      error={errors.optimal_temp_min?.message}
                      style={[styles.input, styles.halfInput]}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="optimal_temp_max"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Temperature Max (°C)"
                      placeholder="96"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      error={errors.optimal_temp_max?.message}
                      style={[styles.input, styles.halfInput]}
                    />
                  )}
                />
              </ThemedView>

              <ThemedView style={styles.rangeContainer}>
                <Controller
                  control={control}
                  name="optimal_grind_min"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Grind Setting Min"
                      placeholder="10"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      error={errors.optimal_grind_min?.message}
                      style={[styles.input, styles.halfInput]}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="optimal_grind_max"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ThemedInput
                      label="Grind Setting Max"
                      placeholder="15"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      error={errors.optimal_grind_max?.message}
                      style={[styles.input, styles.halfInput]}
                    />
                  )}
                />
              </ThemedView>
            </ThemedView>
          </ThemedCollapsible>

          {/* Purchase & Maintenance */}
          <ThemedCollapsible title="Purchase & Maintenance">
            <ThemedView style={styles.section}>
              <Controller
                control={control}
                name="purchase_date"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedInput
                    label="Purchase Date"
                    placeholder="YYYY-MM-DD"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.purchase_date?.message}
                    style={styles.input}
                  />
                )}
              />

              <Controller
                control={control}
                name="purchase_price"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedInput
                    label="Purchase Price"
                    placeholder="29.99"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    error={errors.purchase_price?.message}
                    style={styles.input}
                  />
                )}
              />

              <Controller
                control={control}
                name="maintenance_schedule"
                render={({ field: { onChange, value } }) => (
                  <ThemedSelect
                    label="Maintenance Schedule"
                    value={value || ""}
                    onValueChange={onChange}
                    options={maintenanceScheduleOptions}
                    error={errors.maintenance_schedule?.message}
                    style={styles.input}
                  />
                )}
              />

              <Controller
                control={control}
                name="last_maintenance"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedInput
                    label="Last Maintenance"
                    placeholder="YYYY-MM-DD"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.last_maintenance?.message}
                    style={styles.input}
                  />
                )}
              />

              <Controller
                control={control}
                name="maintenance_notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedTextArea
                    label="Maintenance Notes"
                    placeholder="Cleaning routine, replacement parts needed, etc."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.maintenance_notes?.message}
                    style={styles.input}
                    numberOfLines={3}
                  />
                )}
              />
            </ThemedView>
          </ThemedCollapsible>

          {/* Status & Location */}
          <ThemedCollapsible title="Status & Location">
            <ThemedView style={styles.section}>
              <Controller
                control={control}
                name="condition"
                render={({ field: { onChange, value } }) => (
                  <ThemedSelect
                    label="Condition *"
                    value={value}
                    onValueChange={onChange}
                    options={conditionOptions}
                    error={errors.condition?.message}
                    style={styles.input}
                  />
                )}
              />

              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedInput
                    label="Location"
                    placeholder="e.g., Kitchen, Office, Travel Kit"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.location?.message}
                    style={styles.input}
                  />
                )}
              />
            </ThemedView>
          </ThemedCollapsible>

          {/* Notes & Tips */}
          <ThemedCollapsible title="Notes & Brewing Tips">
            <ThemedView style={styles.section}>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedTextArea
                    label="General Notes"
                    placeholder="Personal observations, modifications, etc."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.notes?.message}
                    style={styles.input}
                    numberOfLines={4}
                  />
                )}
              />

              <Controller
                control={control}
                name="brewing_tips"
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedTextArea
                    label="Brewing Tips"
                    placeholder="One tip per line:&#10;Use circular pouring motion&#10;Start with 30g bloom for 30 seconds&#10;Maintain steady pour rate"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.brewing_tips?.message}
                    style={styles.input}
                    numberOfLines={6}
                  />
                )}
              />
            </ThemedView>
          </ThemedCollapsible>

          {/* Action Buttons */}
          <ThemedView style={styles.buttonContainer}>
            <ThemedButton
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
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
  rangeContainer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  halfInput: {
    flex: 1,
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
