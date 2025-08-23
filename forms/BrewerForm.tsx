import { useAuth } from "@/context/AuthContext";
import { BrewersService, type BrewerInput } from "@/lib/services/brewers";
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

const materialOptions = [
  { label: "Ceramic", value: "ceramic" },
  { label: "Glass", value: "glass" },
  { label: "Plastic", value: "plastic" },
  { label: "Stainless Steel", value: "stainless-steel" },
  { label: "Aluminum", value: "aluminum" },
  { label: "Other", value: "other" },
];

export function BrewerForm({
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
}: BrewerFormProps) {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
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

  const onSubmit = async (data: BrewerFormData) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);

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
        reset();
        onSuccess(result.data);
      } else {
        console.error("Error saving brewer:", result.error);
        toast.error(result.error || "Failed to save brewer. Please try again.");
      }
    } catch (error) {
      console.error("Error saving brewer:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Container scrollable>
      <Section
        title="Basic Information"
        subtitle="Essential brewing equipment details"
        spacing="xl"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <Input
              label="Brewer Name"
              placeholder="My V60, Kitchen Chemex"
              value={watch("name")}
              onChangeText={(value) => setValue("name", value)}
              error={errors.name?.message}
              required
            />

            <View style={styles.row}>
              <Input
                label="Brand"
                placeholder="Hario, Chemex, AeroPress"
                value={watch("brand")}
                onChangeText={(value) => setValue("brand", value)}
                error={errors.brand?.message}
                style={{ flex: 1, marginRight: 8 }}
                required
              />

              <Input
                label="Model"
                placeholder="V60-02, Classic, Original"
                value={watch("model")}
                onChangeText={(value) => setValue("model", value)}
                error={errors.model?.message}
                style={{ flex: 1, marginLeft: 8 }}
                required
              />
            </View>
          </View>
        </Card>
      </Section>

      <Section
        title="Brewing Method"
        subtitle="Type and brewing characteristics"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <View style={styles.selectField}>
              <Text variant="caption" color="secondary" style={styles.selectLabel}>
                Brewer Type *
              </Text>
              <View style={styles.selectOptions}>
                {brewerTypeOptions.map((option) => (
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

            <View style={styles.row}>
              <Input
                label="Capacity (ml)"
                placeholder="500"
                type="number"
                value={watch("capacity_ml")}
                onChangeText={(value) => setValue("capacity_ml", value)}
                error={errors.capacity_ml?.message}
                style={{ flex: 1, marginRight: 8 }}
              />

              <Input
                label="Material"
                placeholder="ceramic, glass, plastic"
                value={watch("material")}
                onChangeText={(value) => setValue("material", value)}
                error={errors.material?.message}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>

            <Input
              label="Filter Type"
              placeholder="V60 02, Chemex Square, Metal"
              value={watch("filter_type")}
              onChangeText={(value) => setValue("filter_type", value)}
              error={errors.filter_type?.message}
            />
          </View>
        </Card>
      </Section>

      <Section
        title="Additional Details"
        subtitle="Optional notes and specifications"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <Input
              label="Notes"
              placeholder="Any additional notes about this brewer..."
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
            title={isEditing ? "Update Brewer" : "Add Brewer"}
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