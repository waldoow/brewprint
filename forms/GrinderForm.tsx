import React from "react";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";
import {
  View,
  Text,
  TextField,
  Button,
  Picker,
  Colors,
} from "react-native-ui-lib";

// Services and Context
import { useAuth } from "@/context/AuthContext";
import { GrindersService, type GrinderInput } from "@/lib/services/grinders";

// Form data interface
interface GrinderFormData {
  name: string;
  brand: string;
  model: string;
  type: string;
  burr_type: string;
  burr_material: string;
  microns_per_step: string;
  default_setting: string;
  setting_range_min: string;
  setting_range_max: string;
  setting_range_increment: string;
  last_cleaned: string;
  cleaning_frequency: string;
  notes: string;
  is_default: boolean;
}

interface GrinderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<GrinderFormData>;
}

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
  { label: "Titanium-Coated", value: "titanium-coated" },
];

const cleaningFrequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "As needed", value: "as-needed" },
];

export function GrinderForm({ onSuccess, onCancel, initialData }: GrinderFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = React.useState<GrinderFormData>({
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    model: initialData?.model || "",
    type: initialData?.type || "electric",
    burr_type: initialData?.burr_type || "conical",
    burr_material: initialData?.burr_material || "steel",
    microns_per_step: initialData?.microns_per_step || "",
    default_setting: initialData?.default_setting || "",
    setting_range_min: initialData?.setting_range_min || "",
    setting_range_max: initialData?.setting_range_max || "",
    setting_range_increment: initialData?.setting_range_increment || "",
    last_cleaned: initialData?.last_cleaned || new Date().toISOString().split('T')[0],
    cleaning_frequency: initialData?.cleaning_frequency || "weekly",
    notes: initialData?.notes || "",
    is_default: initialData?.is_default || false,
  });

  const updateField = (field: keyof GrinderFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Grinder name is required";
    if (!formData.brand.trim()) newErrors.brand = "Brand is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;
    
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Convert form data to database format
      const grinderData: GrinderInput = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        type: formData.type as any,
        burr_type: formData.burr_type as any || undefined,
        burr_material: formData.burr_material as any || undefined,
        microns_per_step: formData.microns_per_step ? parseInt(formData.microns_per_step) : undefined,
        default_setting: formData.default_setting || undefined,
        setting_range: formData.setting_range_min && formData.setting_range_max ? {
          min: parseInt(formData.setting_range_min),
          max: parseInt(formData.setting_range_max),
          increment: formData.setting_range_increment ? parseFloat(formData.setting_range_increment) : undefined,
        } : undefined,
        last_cleaned: formData.last_cleaned || undefined,
        cleaning_frequency: formData.cleaning_frequency as any || undefined,
        notes: formData.notes || undefined,
        is_default: formData.is_default,
      };

      const {
        data: newGrinder,
        error,
        success,
      } = await GrindersService.createGrinder(grinderData);

      if (!success || error) {
        console.error("Error creating grinder:", error);
        toast.error(error || "Failed to add grinder. Please try again.");
        return;
      }

      toast.success("Grinder added successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error adding grinder:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <View style={styles.container}>
      {/* Basic Information */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Basic Information
        </Text>
        <Text caption textSecondary marginB-md>
          Essential grinder details
        </Text>

        <View style={styles.fieldGroup}>
          <TextField
            label="Grinder Name *"
            placeholder="My Comandante, Kitchen Baratza"
            value={formData.name}
            onChangeText={(value) => updateField("name", value)}
            enableErrors={!!errors.name}
            errorMessage={errors.name}
            fieldStyle={styles.textField}
          />

          <View row gap-md>
            <View flex>
              <TextField
                label="Brand *"
                placeholder="Baratza, Comandante, Fellow"
                value={formData.brand}
                onChangeText={(value) => updateField("brand", value)}
                enableErrors={!!errors.brand}
                errorMessage={errors.brand}
                fieldStyle={styles.textField}
              />
            </View>
            <View flex>
              <TextField
                label="Model *"
                placeholder="Encore, C40, Ode Gen 2"
                value={formData.model}
                onChangeText={(value) => updateField("model", value)}
                enableErrors={!!errors.model}
                errorMessage={errors.model}
                fieldStyle={styles.textField}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Grinder Specifications */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Grinder Specifications
        </Text>
        <Text caption textSecondary marginB-md>
          Type and burr characteristics
        </Text>

        <View style={styles.fieldGroup}>
          <View>
            <Text body textColor marginB-sm>Grinder Type *</Text>
            <Picker
              value={formData.type}
              onChange={(value) => updateField("type", value as string)}
              topBarProps={{ title: "Select Grinder Type" }}
              style={styles.picker}
            >
              {typeOptions.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>

          <View row gap-md>
            <View flex>
              <Text body textColor marginB-sm>Burr Type</Text>
              <Picker
                value={formData.burr_type}
                onChange={(value) => updateField("burr_type", value as string)}
                topBarProps={{ title: "Select Burr Type" }}
                style={styles.picker}
              >
                {burrTypeOptions.map(option => (
                  <Picker.Item key={option.value} value={option.value} label={option.label} />
                ))}
              </Picker>
            </View>
            <View flex>
              <Text body textColor marginB-sm>Burr Material</Text>
              <Picker
                value={formData.burr_material}
                onChange={(value) => updateField("burr_material", value as string)}
                topBarProps={{ title: "Select Burr Material" }}
                style={styles.picker}
              >
                {burrMaterialOptions.map(option => (
                  <Picker.Item key={option.value} value={option.value} label={option.label} />
                ))}
              </Picker>
            </View>
          </View>

          <TextField
            label="Microns per Step"
            placeholder="20"
            keyboardType="numeric"
            value={formData.microns_per_step}
            onChangeText={(value) => updateField("microns_per_step", value)}
            fieldStyle={styles.textField}
          />
        </View>
      </View>

      {/* Settings Configuration */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Settings Configuration
        </Text>
        <Text caption textSecondary marginB-md>
          Default settings and range information
        </Text>

        <View style={styles.fieldGroup}>
          <TextField
            label="Default Setting"
            placeholder="18"
            value={formData.default_setting}
            onChangeText={(value) => updateField("default_setting", value)}
            fieldStyle={styles.textField}
          />

          <View row gap-md>
            <View flex>
              <TextField
                label="Min Setting"
                placeholder="1"
                keyboardType="numeric"
                value={formData.setting_range_min}
                onChangeText={(value) => updateField("setting_range_min", value)}
                fieldStyle={styles.textField}
              />
            </View>
            <View flex>
              <TextField
                label="Max Setting"
                placeholder="40"
                keyboardType="numeric"
                value={formData.setting_range_max}
                onChangeText={(value) => updateField("setting_range_max", value)}
                fieldStyle={styles.textField}
              />
            </View>
          </View>

          <TextField
            label="Setting Increment"
            placeholder="0.5"
            keyboardType="numeric"
            value={formData.setting_range_increment}
            onChangeText={(value) => updateField("setting_range_increment", value)}
            fieldStyle={styles.textField}
          />
        </View>
      </View>

      {/* Maintenance */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Maintenance
        </Text>
        <Text caption textSecondary marginB-md>
          Cleaning schedule and maintenance tracking
        </Text>

        <View style={styles.fieldGroup}>
          <TextField
            label="Last Cleaned"
            placeholder="YYYY-MM-DD"
            value={formData.last_cleaned}
            onChangeText={(value) => updateField("last_cleaned", value)}
            fieldStyle={styles.textField}
          />

          <View>
            <Text body textColor marginB-sm>Cleaning Frequency</Text>
            <Picker
              value={formData.cleaning_frequency}
              onChange={(value) => updateField("cleaning_frequency", value as string)}
              topBarProps={{ title: "Select Cleaning Frequency" }}
              style={styles.picker}
            >
              {cleaningFrequencyOptions.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Additional Details */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Additional Details
        </Text>
        <Text caption textSecondary marginB-md>
          Optional notes and observations
        </Text>

        <View style={styles.fieldGroup}>
          <TextField
            label="Notes"
            placeholder="Any additional notes about this grinder..."
            multiline
            numberOfLines={3}
            value={formData.notes}
            onChangeText={(value) => updateField("notes", value)}
            fieldStyle={styles.textField}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <View style={styles.actions}>
          <Button
            label="Add Grinder"
            onPress={onSubmit}
            backgroundColor={Colors.blue30}
            size="large"
            fullWidth
            disabled={isLoading}
          />
          <Button
            label="Cancel"
            onPress={handleCancel}
            backgroundColor={Colors.grey40}
            size="large"
            fullWidth
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  fieldGroup: {
    gap: 16,
  },
  textField: {
    borderWidth: 1,
    borderColor: Colors.grey40,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: Colors.grey40,
    borderRadius: 8,
    backgroundColor: Colors.white,
    height: 44,
  },
  actions: {
    gap: 12,
  },
});