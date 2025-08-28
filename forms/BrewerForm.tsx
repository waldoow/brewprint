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
import { BrewersService, type BrewerInput } from "@/lib/services/brewers";

// Form data interface
interface BrewerFormData {
  name: string;
  brand: string;
  model: string;
  type: string;
  capacity_ml: string;
  material: string;
  filter_type: string;
  notes: string;
}

interface BrewerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<BrewerFormData>;
}

const brewerTypeOptions = [
  { label: "Pour Over", value: "pour-over" },
  { label: "Immersion", value: "immersion" },
  { label: "Espresso Machine", value: "espresso" },
  { label: "Cold Brew", value: "cold-brew" },
  { label: "Siphon", value: "siphon" },
  { label: "Percolator", value: "percolator" },
  { label: "Turkish/Cezve", value: "turkish" },
  { label: "Moka Pot", value: "moka" },
];

export function BrewerForm({ onSuccess, onCancel, initialData }: BrewerFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = React.useState<BrewerFormData>({
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    model: initialData?.model || "",
    type: initialData?.type || "pour-over",
    capacity_ml: initialData?.capacity_ml || "",
    material: initialData?.material || "",
    filter_type: initialData?.filter_type || "",
    notes: initialData?.notes || "",
  });

  const updateField = (field: keyof BrewerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Brewer name is required";
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
      const brewerData: BrewerInput = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        type: formData.type as any,
        capacity_ml: formData.capacity_ml ? parseInt(formData.capacity_ml) : undefined,
        material: formData.material || undefined,
        filter_type: formData.filter_type || undefined,
        notes: formData.notes || undefined,
      };

      const {
        data: newBrewer,
        error,
        success,
      } = await BrewersService.createBrewer(brewerData);

      if (!success || error) {
        console.error("Error creating brewer:", error);
        toast.error(error || "Failed to add brewer. Please try again.");
        return;
      }

      toast.success("Brewer added successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error adding brewer:", error);
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
          Essential brewing equipment details
        </Text>

        <View style={styles.fieldGroup}>
          <TextField
            label="Brewer Name *"
            placeholder="My V60, Kitchen Chemex"
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
                placeholder="Hario, Chemex, AeroPress"
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
                placeholder="V60-02, Classic, Original"
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

      {/* Brewing Method */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Brewing Method
        </Text>
        <Text caption textSecondary marginB-md>
          Type and brewing characteristics
        </Text>

        <View style={styles.fieldGroup}>
          <View>
            <Text body textColor marginB-sm>Brewer Type *</Text>
            <Picker
              value={formData.type}
              onChange={(value) => updateField("type", value as string)}
              topBarProps={{ title: "Select Brewer Type" }}
              style={styles.picker}
            >
              {brewerTypeOptions.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>

          <View row gap-md>
            <View flex>
              <TextField
                label="Capacity (ml)"
                placeholder="500"
                keyboardType="numeric"
                value={formData.capacity_ml}
                onChangeText={(value) => updateField("capacity_ml", value)}
                fieldStyle={styles.textField}
              />
            </View>
            <View flex>
              <TextField
                label="Material"
                placeholder="ceramic, glass, plastic"
                value={formData.material}
                onChangeText={(value) => updateField("material", value)}
                fieldStyle={styles.textField}
              />
            </View>
          </View>

          <TextField
            label="Filter Type"
            placeholder="V60 02, Chemex Square, Metal"
            value={formData.filter_type}
            onChangeText={(value) => updateField("filter_type", value)}
            fieldStyle={styles.textField}
          />
        </View>
      </View>

      {/* Additional Details */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Additional Details
        </Text>
        <Text caption textSecondary marginB-md>
          Optional notes and specifications
        </Text>

        <View style={styles.fieldGroup}>
          <TextField
            label="Notes"
            placeholder="Any additional notes about this brewer..."
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
            label="Add Brewer"
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