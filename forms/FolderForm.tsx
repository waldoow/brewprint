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
import { FoldersService, type FolderInput } from "@/lib/services/folders";

// Form data interface
interface FolderFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  is_default: boolean;
}

interface FolderFormProps {
  onSuccess?: (folder: any) => void;
  onCancel?: () => void;
  initialData?: Partial<FolderFormData>;
}

const colorOptions = [
  { label: "Purple", value: "#6d28d9" },
  { label: "Blue", value: "#2563eb" },
  { label: "Green", value: "#059669" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Pink", value: "#db2777" },
  { label: "Gray", value: "#4b5563" },
];

const iconOptions = [
  { label: "☕ Coffee", value: "coffee" },
  { label: "🧪 Flask", value: "flask" },
  { label: "❤️ Heart", value: "heart" },
  { label: "⭐ Star", value: "star" },
  { label: "📁 Folder", value: "folder" },
  { label: "📋 List", value: "list" },
  { label: "🎯 Target", value: "target" },
];

export function FolderForm({ onSuccess, onCancel, initialData }: FolderFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = React.useState<FolderFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    color: initialData?.color || "#6d28d9",
    icon: initialData?.icon || "folder",
    is_default: initialData?.is_default || false,
  });

  const updateField = (field: keyof FolderFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Folder name is required";
    
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
      const folderData: FolderInput = {
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color || undefined,
        icon: formData.icon || undefined,
        is_default: formData.is_default || false,
      };

      const {
        data: newFolder,
        error,
        success,
      } = await FoldersService.createFolder(folderData);

      if (!success || error) {
        console.error("Error creating folder:", error);
        toast.error(error || "Failed to create folder. Please try again.");
        return;
      }

      toast.success("Folder created successfully!");
      onSuccess?.(newFolder);
    } catch (error) {
      console.error("Error creating folder:", error);
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
          Folder details and organization
        </Text>

        <View style={styles.fieldGroup}>
          <TextField
            label="Folder Name *"
            placeholder="My Espresso Recipes"
            value={formData.name}
            onChangeText={(value) => updateField("name", value)}
            enableErrors={!!errors.name}
            errorMessage={errors.name}
            fieldStyle={styles.textField}
          />

          <TextField
            label="Description"
            placeholder="Collection of my favorite espresso brewing methods..."
            multiline
            numberOfLines={3}
            value={formData.description}
            onChangeText={(value) => updateField("description", value)}
            fieldStyle={styles.textField}
          />
        </View>
      </View>

      {/* Customization */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Customization
        </Text>
        <Text caption textSecondary marginB-md>
          Personalize your folder appearance
        </Text>

        <View style={styles.fieldGroup}>
          <View>
            <Text body textColor marginB-sm>Color</Text>
            <Picker
              value={formData.color}
              onChange={(value) => updateField("color", value as string)}
              topBarProps={{ title: "Select Folder Color" }}
              style={styles.picker}
            >
              {colorOptions.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>

          <View>
            <Text body textColor marginB-sm>Icon</Text>
            <Picker
              value={formData.icon}
              onChange={(value) => updateField("icon", value as string)}
              topBarProps={{ title: "Select Folder Icon" }}
              style={styles.picker}
            >
              {iconOptions.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Settings
        </Text>
        <Text caption textSecondary marginB-md>
          Folder behavior and preferences
        </Text>

        <View style={styles.fieldGroup}>
          <View style={styles.checkboxField}>
            <Text body textColor weight="medium">
              Set as Default Folder
            </Text>
            <Text caption textSecondary marginB-sm>
              New recipes will automatically be saved to this folder
            </Text>
            <Button
              label={formData.is_default ? "✓ Default Folder" : "Set as Default"}
              backgroundColor={formData.is_default ? Colors.blue30 : Colors.grey40}
              size="medium"
              onPress={() => updateField("is_default", !formData.is_default)}
            />
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <View style={styles.actions}>
          <Button
            label="Create Folder"
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
  checkboxField: {
    gap: 8,
  },
  actions: {
    gap: 12,
  },
});