import { useAuth } from "@/context/AuthContext";
import { GrindersService, type GrinderInput, type GrinderSetting, type SettingRange } from "@/lib/services/grinders";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

// Professional UI Components
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
const typeOptions = [
  { label: "Electric", value: "electric" },
  { label: "Manual", value: "manual" },
];

const burrTypeOptions = [
  { label: "Conical", value: "conical" },
  { label: "Flat", value: "flat" },
  { label: "Ghost", value: "ghost" },
];

const burrMaterialOptions = [
  { label: "Steel", value: "steel" },
  { label: "Ceramic", value: "ceramic" },
  { label: "Titanium Coated", value: "titanium-coated" },
];

export function GrinderForm({ onSuccess, onCancel, initialData }: GrinderFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
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
    <Container scrollable>
      <Section
        title="Basic Information"
        subtitle="Essential grinding equipment details"
        spacing="xl"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <Input
              label="Grinder Name"
              placeholder="Morning Grinder"
              value={watch("name")}
              onChangeText={(value) => setValue("name", value)}
              error={errors.name?.message}
              required
            />

            <View style={styles.row}>
              <Input
                label="Brand"
                placeholder="Baratza"
                value={watch("brand")}
                onChangeText={(value) => setValue("brand", value)}
                error={errors.brand?.message}
                style={{ flex: 1, marginRight: 8 }}
                required
              />

              <Input
                label="Model"
                placeholder="Encore"
                value={watch("model")}
                onChangeText={(value) => setValue("model", value)}
                error={errors.model?.message}
                style={{ flex: 1, marginLeft: 8 }}
                required
              />
            </View>

            <View style={styles.selectField}>
              <Text variant="caption" color="secondary" style={styles.selectLabel}>
                Grinder Type *
              </Text>
              <View style={styles.selectOptions}>
                {typeOptions.map((option) => (
                  <Button
                    key={option.value}
                    title={option.label}
                    variant={watch("type") === option.value ? "primary" : "secondary"}
                    size="sm"
                    onPress={() => setValue("type", option.value as any)}
                    style={styles.optionButton}
                  />
                ))}
              </View>
            </View>
          </View>
        </Card>
      </Section>

      <Section
        title="Technical Specifications"
        subtitle="Burr and grinding characteristics"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <View style={styles.selectField}>
              <Text variant="caption" color="secondary" style={styles.selectLabel}>
                Burr Type
              </Text>
              <View style={styles.selectOptions}>
                {burrTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    title={option.label}
                    variant={watch("burr_type") === option.value ? "primary" : "secondary"}
                    size="sm"
                    onPress={() => setValue("burr_type", option.value as any)}
                    style={styles.optionButton}
                  />
                ))}
              </View>
            </View>

            <View style={styles.selectField}>
              <Text variant="caption" color="secondary" style={styles.selectLabel}>
                Burr Material
              </Text>
              <View style={styles.selectOptions}>
                {burrMaterialOptions.map((option) => (
                  <Button
                    key={option.value}
                    title={option.label}
                    variant={watch("burr_material") === option.value ? "primary" : "secondary"}
                    size="sm"
                    onPress={() => setValue("burr_material", option.value as any)}
                    style={styles.optionButton}
                  />
                ))}
              </View>
            </View>

            <Input
              label="Microns per Step"
              placeholder="20"
              type="number"
              value={watch("microns_per_step")}
              onChangeText={(value) => setValue("microns_per_step", value)}
              error={errors.microns_per_step?.message}
            />
          </View>
        </Card>
      </Section>

      <Section
        title="Settings Configuration"
        subtitle="Grind settings and calibration"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <Input
              label="Default Setting"
              placeholder="15"
              type="number"
              value={watch("default_setting")}
              onChangeText={(value) => setValue("default_setting", value)}
              error={errors.default_setting?.message}
            />

            <View style={styles.row}>
              <Input
                label="Min Setting"
                placeholder="1"
                type="number"
                value={watch("setting_range_min")}
                onChangeText={(value) => setValue("setting_range_min", value)}
                error={errors.setting_range_min?.message}
                style={{ flex: 1, marginRight: 8 }}
              />

              <Input
                label="Max Setting"
                placeholder="40"
                type="number"
                value={watch("setting_range_max")}
                onChangeText={(value) => setValue("setting_range_max", value)}
                error={errors.setting_range_max?.message}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>

            <Input
              label="Setting Increment"
              placeholder="1"
              type="number"
              value={watch("setting_range_increment")}
              onChangeText={(value) => setValue("setting_range_increment", value)}
              error={errors.setting_range_increment?.message}
            />
          </View>
        </Card>
      </Section>

      <Section
        title="Maintenance Schedule"
        subtitle="Cleaning and maintenance tracking"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <Input
              label="Last Cleaned"
              placeholder="YYYY-MM-DD"
              type="date"
              value={watch("last_cleaned")}
              onChangeText={(value) => setValue("last_cleaned", value)}
              error={errors.last_cleaned?.message}
            />

            <Input
              label="Cleaning Frequency (days)"
              placeholder="30"
              type="number"
              value={watch("cleaning_frequency")}
              onChangeText={(value) => setValue("cleaning_frequency", value)}
              error={errors.cleaning_frequency?.message}
            />
          </View>
        </Card>
      </Section>

      <Section
        title="Additional Details"
        subtitle="Optional notes and settings"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <Input
              label="Notes"
              placeholder="Any additional notes about this grinder..."
              multiline
              numberOfLines={3}
              value={watch("notes")}
              onChangeText={(value) => setValue("notes", value)}
              error={errors.notes?.message}
            />
          </View>
        </Card>
      </Section>

      <Section
        title="Actions"
        subtitle="Save or cancel your changes"
        spacing="xl"
      >
        <View style={styles.actions}>
          <Button
            title="Add Grinder"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          />
          <Button
            title="Cancel"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={handleCancel}
            disabled={isLoading}
          />
        </View>
      </Section>
    </Container>
  );
}

const styles = {
  fieldGroup: {
    gap: 16,
  },
  row: {
    flexDirection: 'row' as const,
  },
  selectField: {
    gap: 8,
  },
  selectLabel: {
    marginBottom: 4,
  },
  selectOptions: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actions: {
    gap: 12,
  },
};