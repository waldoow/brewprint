import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { View } from "react-native";
import { toast } from "sonner-native";

// Data-First UI Components
import { DataText } from "@/components/ui/DataText";
import { DataButton } from "@/components/ui/DataButton";
import { Input } from "@/components/ui/Input";
import { ThemedSelect } from "@/components/ui/ThemedSelect";

// Services and Context
import { useAuth } from "@/context/AuthContext";
import { FoldersService, type FolderInput } from "@/lib/services/folders";

// Folder form validation schema
const folderFormSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  is_default: z.boolean().optional(),
});

type FolderFormData = z.infer<typeof folderFormSchema>;

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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FolderFormData>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      color: initialData?.color || "#6d28d9",
      icon: initialData?.icon || "folder",
      is_default: initialData?.is_default || false,
    },
  });

  const onSubmit = async (data: FolderFormData) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Convert form data to database format
      const folderData: FolderInput = {
        name: data.name,
        description: data.description || undefined,
        color: data.color || undefined,
        icon: data.icon || undefined,
        is_default: data.is_default || false,
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
      reset();
      onSuccess?.(newFolder);
    } catch (error) {
      console.error("Error creating folder:", error);
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
    <View style={{ flex: 1, padding: 16, gap: 24 }}>
      {/* Basic Information */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Basic Information
        </DataText>
        <DataText variant="small" color="secondary">
          Folder details and organization
        </DataText>

        <View style={styles.fieldGroup}>
            <Input
              label="Folder Name"
              placeholder="My Espresso Recipes"
              value={watch("name")}
              onChangeText={(value) => setValue("name", value)}
              error={errors.name?.message}
              required
            />

            <Input
              label="Description"
              placeholder="Collection of my favorite espresso brewing methods..."
              multiline
              numberOfLines={2}
              value={watch("description")}
              onChangeText={(value) => setValue("description", value)}
              error={errors.description?.message}
            />
        </View>
      </View>

      {/* Customization */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Customization
        </DataText>
        <DataText variant="small" color="secondary">
          Personalize your folder appearance
        </DataText>

        <View style={styles.fieldGroup}>
            <ThemedSelect
              label="Color"
              options={colorOptions}
              value={watch("color")}
              onValueChange={(value) => setValue("color", value)}
              placeholder="Select folder color"
              error={errors.color?.message}
            />

            <ThemedSelect
              label="Icon"
              options={iconOptions}
              value={watch("icon")}
              onValueChange={(value) => setValue("icon", value)}
              placeholder="Select folder icon"
              error={errors.icon?.message}
            />
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Settings
        </DataText>
        <DataText variant="small" color="secondary">
          Folder behavior and preferences
        </DataText>

        <View style={styles.fieldGroup}>
            <View style={styles.checkboxField}>
              <DataText variant="body" weight="medium">
                Set as Default Folder
              </DataText>
              <DataText variant="small" color="secondary" style={{ marginBottom: 8 }}>
                New recipes will automatically be saved to this folder
              </DataText>
              <DataButton
                title={watch("is_default") ? "✓ Default Folder" : "Set as Default"}
                variant={watch("is_default") ? "primary" : "secondary"}
                size="sm"
                onPress={() => setValue("is_default", !watch("is_default"))}
              />
            </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <View style={styles.actions}>
          <DataButton
            title="Create Folder"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          />
          <DataButton
            title="Cancel"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={handleCancel}
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );
}

const styles = {
  section: {
    gap: 16,
  },
  fieldGroup: {
    gap: 16,
  },
  checkboxField: {
    gap: 4,
  },
  actions: {
    gap: 12,
  },
};