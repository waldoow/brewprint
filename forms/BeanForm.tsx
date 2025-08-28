import React from "react";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";
import {
  View,
  Text,
  TextField,
  Picker,
  TouchableOpacity,
} from "react-native-ui-lib";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

// Services and Context
import { useAuth } from "@/context/AuthContext";
import { BeansService, type BeanInput } from "@/lib/services";

// Form data interface
interface BeanFormData {
  name: string;
  origin: string;
  farm: string;
  region: string;
  altitude: string;
  process: string;
  variety: string;
  purchase_date: string;
  roast_date: string;
  supplier: string;
  cost: string;
  total_grams: string;
  remaining_grams: string;
  roast_level: string;
  tasting_notes: string;
  official_description: string;
  my_notes: string;
  rating: string;
}

interface BeanFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<BeanFormData>;
}

const processOptions = [
  { label: "Washed", value: "washed" },
  { label: "Natural", value: "natural" },
  { label: "Honey", value: "honey" },
  { label: "Pulped Natural", value: "pulped-natural" },
  { label: "Semi-Washed", value: "semi-washed" },
  { label: "White Honey", value: "white-honey" },
  { label: "Yellow Honey", value: "yellow-honey" },
  { label: "Red Honey", value: "red-honey" },
  { label: "Black Honey", value: "black-honey" },
  { label: "Wet Hulled", value: "wet-hulled" },
  { label: "Anaerobic", value: "anaerobic" },
  { label: "Carbonic Maceration", value: "carbonic-maceration" },
  { label: "Extended Fermentation", value: "extended-fermentation" },
  { label: "Other", value: "other" },
];

const roastLevelOptions = [
  { label: "Light", value: "light" },
  { label: "Medium-Light", value: "medium-light" },
  { label: "Medium", value: "medium" },
  { label: "Medium-Dark", value: "medium-dark" },
  { label: "Dark", value: "dark" },
];

const ratingOptions = [
  { label: "★☆☆☆☆ (1)", value: "1" },
  { label: "★★☆☆☆ (2)", value: "2" },
  { label: "★★★☆☆ (3)", value: "3" },
  { label: "★★★★☆ (4)", value: "4" },
  { label: "★★★★★ (5)", value: "5" },
];

export function BeanForm({ onSuccess, onCancel, initialData }: BeanFormProps) {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = React.useState<BeanFormData>({
    name: initialData?.name || "",
    origin: initialData?.origin || "",
    farm: initialData?.farm || "",
    region: initialData?.region || "",
    altitude: initialData?.altitude || "",
    process: initialData?.process || "washed",
    variety: initialData?.variety || "",
    purchase_date: initialData?.purchase_date || new Date().toISOString().split('T')[0],
    roast_date: initialData?.roast_date || new Date().toISOString().split('T')[0],
    supplier: initialData?.supplier || "",
    cost: initialData?.cost || "",
    total_grams: initialData?.total_grams || "",
    remaining_grams: initialData?.remaining_grams || "",
    roast_level: initialData?.roast_level || "medium",
    tasting_notes: initialData?.tasting_notes || "",
    official_description: initialData?.official_description || "",
    my_notes: initialData?.my_notes || "",
    rating: initialData?.rating || "",
  });

  const updateField = (field: keyof BeanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const formatTastingNotes = (notes: string): string[] => {
    return notes
      .split(",")
      .map((note) => note.trim())
      .filter((note) => note.length > 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Bean name is required";
    if (!formData.origin.trim()) newErrors.origin = "Origin is required";
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier is required";
    if (!formData.cost.trim()) newErrors.cost = "Cost is required";
    if (!formData.total_grams.trim()) newErrors.total_grams = "Total grams is required";
    if (!formData.remaining_grams.trim()) newErrors.remaining_grams = "Remaining grams is required";
    if (!formData.purchase_date) newErrors.purchase_date = "Purchase date is required";
    if (!formData.roast_date) newErrors.roast_date = "Roast date is required";
    
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
      const beanData: BeanInput = {
        name: formData.name,
        origin: formData.origin,
        farm: formData.farm || undefined,
        region: formData.region || undefined,
        altitude: formData.altitude ? parseInt(formData.altitude) : undefined,
        process: formData.process as any,
        variety: formData.variety || undefined,
        purchase_date: formData.purchase_date,
        roast_date: formData.roast_date,
        supplier: formData.supplier,
        cost: parseFloat(formData.cost),
        total_grams: parseInt(formData.total_grams),
        remaining_grams: parseInt(formData.remaining_grams),
        roast_level: formData.roast_level as any,
        tasting_notes: formData.tasting_notes
          ? formatTastingNotes(formData.tasting_notes)
          : undefined,
        official_description: formData.official_description || undefined,
        my_notes: formData.my_notes || undefined,
        rating: formData.rating ? parseInt(formData.rating) : undefined,
      };

      const {
        data: newBean,
        error,
        success,
      } = await BeansService.createBean(beanData);

      if (!success || error) {
        console.error("Error creating bean:", error);
        toast.error(error || "Failed to add bean. Please try again.");
        return;
      }

      toast.success("Bean added successfully!");
      onSuccess?.();
    } catch (error) {
      console.error("Error adding bean:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const styles = StyleSheet.create({
    container: {
      gap: 32,
    },
    section: {
      gap: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginBottom: 16,
    },
    fieldGroup: {
      gap: 16,
    },
    fieldRow: {
      flexDirection: 'row',
      gap: 12,
    },
    fieldHalf: {
      flex: 1,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    textField: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background,
    },
    textFieldError: {
      borderColor: theme.colors.error,
    },
    picker: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      backgroundColor: theme.colors.background,
      height: 40,
    },
    errorText: {
      fontSize: 10,
      color: theme.colors.error,
      marginTop: 4,
    },
    actions: {
      gap: 12,
      marginTop: 16,
    },
    primaryButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    disabledButton: {
      opacity: 0.5,
    },
  });

  return (
    <View style={styles.container}>
      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Basic Information
        </Text>
        <Text style={styles.sectionSubtitle}>
          Essential coffee bean details
        </Text>

        <View style={styles.fieldGroup}>
          <View>
            <Text style={styles.fieldLabel}>Bean Name *</Text>
            <TextField
              placeholder="Ethiopian Yirgacheffe"
              value={formData.name}
              onChangeText={(value) => updateField("name", value)}
              style={[styles.textField, errors.name && styles.textFieldError]}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View>
            <Text style={styles.fieldLabel}>Origin *</Text>
            <TextField
              placeholder="Ethiopia"
              value={formData.origin}
              onChangeText={(value) => updateField("origin", value)}
              style={[styles.textField, errors.origin && styles.textFieldError]}
            />
            {errors.origin && <Text style={styles.errorText}>{errors.origin}</Text>}
          </View>

          <View>
            <Text style={styles.fieldLabel}>Supplier *</Text>
            <TextField
              placeholder="Blue Bottle Coffee"
              value={formData.supplier}
              onChangeText={(value) => updateField("supplier", value)}
              style={[styles.textField, errors.supplier && styles.textFieldError]}
            />
            {errors.supplier && <Text style={styles.errorText}>{errors.supplier}</Text>}
          </View>
        </View>
      </View>

      {/* Processing & Roast */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Processing & Roast
        </Text>
        <Text style={styles.sectionSubtitle}>
          Process method and roast characteristics
        </Text>

        <View style={styles.fieldGroup}>
          <View>
            <Text style={styles.fieldLabel}>Process Method *</Text>
            <Picker
              value={formData.process}
              onChange={(value) => updateField("process", value as string)}
              topBarProps={{ title: "Select Process Method" }}
              style={styles.picker}
            >
              {processOptions.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>

          <View>
            <Text style={styles.fieldLabel}>Roast Level *</Text>
            <Picker
              value={formData.roast_level}
              onChange={(value) => updateField("roast_level", value as string)}
              topBarProps={{ title: "Select Roast Level" }}
              style={styles.picker}
            >
              {roastLevelOptions.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Purchase & Inventory */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Purchase & Inventory
        </Text>
        <Text style={styles.sectionSubtitle}>
          Purchase details and inventory tracking
        </Text>

        <View style={styles.fieldGroup}>
          <View>
            <Text style={styles.fieldLabel}>Purchase Date *</Text>
            <TextField
              placeholder="YYYY-MM-DD"
              value={formData.purchase_date}
              onChangeText={(value) => updateField("purchase_date", value)}
              style={[styles.textField, errors.purchase_date && styles.textFieldError]}
            />
            {errors.purchase_date && <Text style={styles.errorText}>{errors.purchase_date}</Text>}
          </View>

          <View>
            <Text style={styles.fieldLabel}>Roast Date *</Text>
            <TextField
              placeholder="YYYY-MM-DD"
              value={formData.roast_date}
              onChangeText={(value) => updateField("roast_date", value)}
              style={[styles.textField, errors.roast_date && styles.textFieldError]}
            />
            {errors.roast_date && <Text style={styles.errorText}>{errors.roast_date}</Text>}
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Cost ($) *</Text>
              <TextField
                placeholder="24.95"
                keyboardType="numeric"
                value={formData.cost}
                onChangeText={(value) => updateField("cost", value)}
                style={[styles.textField, errors.cost && styles.textFieldError]}
              />
              {errors.cost && <Text style={styles.errorText}>{errors.cost}</Text>}
            </View>

            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Total (g) *</Text>
              <TextField
                placeholder="340"
                keyboardType="numeric"
                value={formData.total_grams}
                onChangeText={(value) => updateField("total_grams", value)}
                style={[styles.textField, errors.total_grams && styles.textFieldError]}
              />
              {errors.total_grams && <Text style={styles.errorText}>{errors.total_grams}</Text>}
            </View>
          </View>

          <View>
            <Text style={styles.fieldLabel}>Remaining Grams *</Text>
            <TextField
              placeholder="340"
              keyboardType="numeric"
              value={formData.remaining_grams}
              onChangeText={(value) => updateField("remaining_grams", value)}
              style={[styles.textField, errors.remaining_grams && styles.textFieldError]}
            />
            {errors.remaining_grams && <Text style={styles.errorText}>{errors.remaining_grams}</Text>}
          </View>
        </View>
      </View>

      {/* Additional Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Additional Details
        </Text>
        <Text style={styles.sectionSubtitle}>
          Optional coffee characteristics and notes
        </Text>

        <View style={styles.fieldGroup}>
          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Farm</Text>
              <TextField
                placeholder="Chelchele Washing Station"
                value={formData.farm}
                onChangeText={(value) => updateField("farm", value)}
                style={styles.textField}
              />
            </View>

            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Region</Text>
              <TextField
                placeholder="Yirgacheffe"
                value={formData.region}
                onChangeText={(value) => updateField("region", value)}
                style={styles.textField}
              />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Altitude (m)</Text>
              <TextField
                placeholder="1800"
                keyboardType="numeric"
                value={formData.altitude}
                onChangeText={(value) => updateField("altitude", value)}
                style={styles.textField}
              />
            </View>

            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Variety</Text>
              <TextField
                placeholder="Heirloom"
                value={formData.variety}
                onChangeText={(value) => updateField("variety", value)}
                style={styles.textField}
              />
            </View>
          </View>

          <View>
            <Text style={styles.fieldLabel}>Tasting Notes</Text>
            <TextField
              placeholder="fruity, bright, citrus (comma separated)"
              value={formData.tasting_notes}
              onChangeText={(value) => updateField("tasting_notes", value)}
              style={styles.textField}
            />
          </View>

          <View>
            <Text style={styles.fieldLabel}>Rating (Optional)</Text>
            <Picker
              value={formData.rating}
              onChange={(value) => updateField("rating", value as string)}
              topBarProps={{ title: "Select Rating" }}
              style={styles.picker}
            >
              <Picker.Item value="" label="No rating" />
              {ratingOptions.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>

          <View>
            <Text style={styles.fieldLabel}>Official Description</Text>
            <TextField
              placeholder="Roaster's official tasting notes and description..."
              multiline
              numberOfLines={3}
              value={formData.official_description}
              onChangeText={(value) => updateField("official_description", value)}
              style={[styles.textField, { height: 72 }]}
            />
          </View>

          <View>
            <Text style={styles.fieldLabel}>My Notes</Text>
            <TextField
              placeholder="Your personal notes about this bean..."
              multiline
              numberOfLines={3}
              value={formData.my_notes}
              onChangeText={(value) => updateField("my_notes", value)}
              style={[styles.textField, { height: 72 }]}
            />
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={onSubmit}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? "Adding Bean..." : "Add Bean"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryButton, isLoading && styles.disabledButton]}
          onPress={handleCancel}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}