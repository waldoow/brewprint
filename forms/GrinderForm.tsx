import { useAuth } from "@/context/AuthContext";
import { GrindersService, type GrinderInput, type GrinderSetting, type SettingRange } from "@/lib/services/grinders";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

// UI Components
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedCheckBox } from "@/components/ui/ThemedCheckBox";
import { ThemedCollapsible } from "@/components/ui/ThemedCollapsible";
import { SheetHeader } from "@/components/ui/SheetHeader";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { SelectOption, ThemedSelect } from "@/components/ui/ThemedSelect";
import { ThemedTextArea } from "@/components/ui/ThemedTextArea";
import { ThemedView } from "@/components/ui/ThemedView";

// Grinder form validation schema
const grinderFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Grinder name is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  type: z.enum(["electric", "manual"]),
  burr_type: z.enum(["conical", "flat", "ghost"]).optional(),
  burr_material: z.enum(["steel", "ceramic", "titanium-coated"]).optional(),
  microns_per_step: z.string().optional(),

  // Settings & Configuration
  default_setting: z.string().optional(),
  setting_range_min: z.string().optional(),
  setting_range_max: z.string().optional(),
  setting_range_increment: z.string().optional(),

  // Maintenance
  last_cleaned: z.string().optional(),
  cleaning_frequency: z.string().optional(),

  // Other
  notes: z.string().optional(),
  is_default: z.boolean().optional(),
});

type GrinderFormData = z.infer<typeof grinderFormSchema>;

interface GrinderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<GrinderFormData>;
}

// Dropdown options
const typeOptions: SelectOption[] = [
  { label: "Electric", value: "electric" },
  { label: "Manual", value: "manual" },
];

const burrTypeOptions: SelectOption[] = [
  { label: "Conical", value: "conical" },
  { label: "Flat", value: "flat" },
  { label: "Ghost", value: "ghost" },
];

const burrMaterialOptions: SelectOption[] = [
  { label: "Steel", value: "steel" },
  { label: "Ceramic", value: "ceramic" },
  { label: "Titanium Coated", value: "titanium-coated" },
];

export function GrinderForm({ onSuccess, onCancel, initialData }: GrinderFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<GrinderFormData>({
    resolver: zodResolver(grinderFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      brand: initialData?.brand || "",
      model: initialData?.model || "",
      type: initialData?.type || "electric",
      burr_type: initialData?.burr_type,
      burr_material: initialData?.burr_material,
      microns_per_step: initialData?.microns_per_step || "",
      default_setting: initialData?.default_setting || "",
      setting_range_min: initialData?.setting_range_min || "1",
      setting_range_max: initialData?.setting_range_max || "40",
      setting_range_increment: initialData?.setting_range_increment || "1",
      last_cleaned: initialData?.last_cleaned || "",
      cleaning_frequency: initialData?.cleaning_frequency || "",
      notes: initialData?.notes || "",
      is_default: initialData?.is_default || false,
    },
  });

  const watchedType = watch("type");

  const onSubmit = async (data: GrinderFormData) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Convert form data to database format
      const settingRange: SettingRange | undefined = 
        data.setting_range_min && data.setting_range_max && data.setting_range_increment ? {
          min: parseInt(data.setting_range_min),
          max: parseInt(data.setting_range_max),
          increment: parseFloat(data.setting_range_increment),
        } : undefined;

      const grinderData: GrinderInput = {
        name: data.name,
        brand: data.brand,
        model: data.model,
        type: data.type,
        burr_type: data.burr_type || undefined,
        burr_material: data.burr_material || undefined,
        microns_per_step: data.microns_per_step ? parseInt(data.microns_per_step) : undefined,
        default_setting: data.default_setting ? parseInt(data.default_setting) : undefined,
        setting_range: settingRange,
        last_cleaned: data.last_cleaned || undefined,
        cleaning_frequency: data.cleaning_frequency ? parseInt(data.cleaning_frequency) : undefined,
        notes: data.notes || undefined,
        is_default: data.is_default || false,
      };

      const { data: newGrinder, error, success } = await GrindersService.createGrinder(grinderData);

      if (!success || error) {
        console.error("Error creating grinder:", error);
        toast.error(error || "Failed to add grinder. Please try again.");
        return;
      }

      toast.success("Grinder added successfully!");
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding grinder:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <ThemedView noBackground style={styles.container}>
      <SheetHeader
        title="Add New Grinder"
        subtitle="Coffee grinding equipment"
        onClose={handleCancel}
        showCloseButton={true}
      />

      <ThemedScrollView
        paddingVertical={0}
        paddingHorizontal={0}
        style={styles.scrollView}
      >
        <ThemedView style={styles.form} noBackground>
          {/* Basic Information Section */}
          <ThemedCollapsible
            title="Basic Information"
            subtitle="Essential grinder details"
            defaultOpen={true}
            variant="ghost"
            showBorder={false}
            noPadding={true}
            noBackground={true}
          >
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Grinder Name *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  placeholder="Morning Grinder"
                />
              )}
            />

            <Controller
              control={control}
              name="brand"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Brand *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.brand?.message}
                  placeholder="Baratza"
                />
              )}
            />

            <Controller
              control={control}
              name="model"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Model *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.model?.message}
                  placeholder="Encore"
                />
              )}
            />

            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <ThemedSelect
                  label="Type *"
                  options={typeOptions}
                  value={value}
                  onValueChange={onChange}
                  error={errors.type?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="is_default"
              render={({ field: { onChange, value } }) => (
                <ThemedCheckBox
                  label="Set as default grinder"
                  value={value || false}
                  onValueChange={onChange}
                />
              )}
            />
          </ThemedCollapsible>

          {/* Technical Specifications */}
          <ThemedCollapsible
            title="Technical Specifications"
            subtitle="Burr and grinding details (optional)"
            defaultOpen={false}
            variant="ghost"
            showBorder={false}
            noPadding={true}
            noBackground={true}
          >
            <Controller
              control={control}
              name="burr_type"
              render={({ field: { onChange, value } }) => (
                <ThemedSelect
                  label="Burr Type"
                  options={burrTypeOptions}
                  value={value}
                  onValueChange={onChange}
                  error={errors.burr_type?.message}
                  placeholder="Select burr type"
                />
              )}
            />

            <Controller
              control={control}
              name="burr_material"
              render={({ field: { onChange, value } }) => (
                <ThemedSelect
                  label="Burr Material"
                  options={burrMaterialOptions}
                  value={value}
                  onValueChange={onChange}
                  error={errors.burr_material?.message}
                  placeholder="Select burr material"
                />
              )}
            />

            <Controller
              control={control}
              name="microns_per_step"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Microns per Step"
                  value={value}
                  onChangeText={onChange}
                  error={errors.microns_per_step?.message}
                  placeholder="20"
                  type="number"
                />
              )}
            />
          </ThemedCollapsible>

          {/* Settings Configuration */}
          <ThemedCollapsible
            title="Settings Configuration"
            subtitle="Grind settings and calibration"
            defaultOpen={false}
            variant="ghost"
            showBorder={false}
            noPadding={true}
            noBackground={true}
          >
            <Controller
              control={control}
              name="default_setting"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Default Setting"
                  value={value}
                  onChangeText={onChange}
                  error={errors.default_setting?.message}
                  placeholder="15"
                  type="number"
                />
              )}
            />

            <ThemedView style={styles.settingRangeRow} noBackground>
              <Controller
                control={control}
                name="setting_range_min"
                render={({ field: { onChange, value } }) => (
                  <ThemedInput
                    label="Min Setting"
                    value={value}
                    onChangeText={onChange}
                    error={errors.setting_range_min?.message}
                    placeholder="1"
                    type="number"
                    style={styles.settingRangeInput}
                  />
                )}
              />

              <Controller
                control={control}
                name="setting_range_max"
                render={({ field: { onChange, value } }) => (
                  <ThemedInput
                    label="Max Setting"
                    value={value}
                    onChangeText={onChange}
                    error={errors.setting_range_max?.message}
                    placeholder="40"
                    type="number"
                    style={styles.settingRangeInput}
                  />
                )}
              />
            </ThemedView>

            <Controller
              control={control}
              name="setting_range_increment"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Setting Increment"
                  value={value}
                  onChangeText={onChange}
                  error={errors.setting_range_increment?.message}
                  placeholder="1"
                  type="number"
                />
              )}
            />
          </ThemedCollapsible>

          {/* Maintenance Schedule */}
          <ThemedCollapsible
            title="Maintenance Schedule"
            subtitle="Cleaning and maintenance tracking"
            defaultOpen={false}
            variant="ghost"
            showBorder={false}
            noPadding={true}
            noBackground={true}
          >
            <Controller
              control={control}
              name="last_cleaned"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Last Cleaned"
                  value={value}
                  onChangeText={onChange}
                  error={errors.last_cleaned?.message}
                  placeholder="YYYY-MM-DD"
                />
              )}
            />

            <Controller
              control={control}
              name="cleaning_frequency"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Cleaning Frequency (days)"
                  value={value}
                  onChangeText={onChange}
                  error={errors.cleaning_frequency?.message}
                  placeholder="30"
                  type="number"
                />
              )}
            />
          </ThemedCollapsible>

          {/* Notes Section */}
          <ThemedCollapsible
            title="Notes"
            subtitle="Additional information"
            defaultOpen={false}
            variant="ghost"
            showBorder={false}
            noPadding={true}
            noBackground={true}
          >
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <ThemedTextArea
                  label="Notes"
                  value={value}
                  onChangeText={onChange}
                  error={errors.notes?.message}
                  placeholder="Any additional notes about this grinder..."
                />
              )}
            />
          </ThemedCollapsible>

          {/* Form Actions */}
          <ThemedView style={styles.actions} noBackground>
            <ThemedButton
              title="Add Grinder"
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
              loading={isLoading}
              disabled={isLoading}
            />
            <ThemedButton
              title="Cancel"
              variant="outline"
              onPress={handleCancel}
              style={styles.cancelButton}
              disabled={isLoading}
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
    gap: 16,
  },
  settingRangeRow: {
    flexDirection: "row",
    gap: 12,
  },
  settingRangeInput: {
    flex: 1,
  },
  actions: {
    flexDirection: "column",
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});