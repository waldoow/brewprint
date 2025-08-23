import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { View } from "react-native";
import { toast } from "sonner-native";

// Professional UI Components
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// Services and Context
import { useAuth } from "@/context/AuthContext";
import { BeansService, type BeanInput } from "@/lib/services";

// Bean form validation schema
const beanFormSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Bean name is required"),
  origin: z.string().min(1, "Origin is required"),
  farm: z.string().optional(),
  region: z.string().optional(),
  altitude: z.string().optional(),
  process: z.enum([
    "washed",
    "natural", 
    "honey",
    "pulped-natural",
    "semi-washed",
    "white-honey",
    "yellow-honey",
    "red-honey",
    "black-honey",
    "wet-hulled",
    "anaerobic",
    "carbonic-maceration",
    "extended-fermentation",
    "other",
  ]),
  variety: z.string().optional(),

  // Purchase & Inventory
  purchase_date: z.string().min(1, "Purchase date is required"),
  roast_date: z.string().min(1, "Roast date is required"),
  supplier: z.string().min(1, "Supplier is required"),
  cost: z.string().min(1, "Cost is required"),
  total_grams: z.string().min(1, "Total grams is required"),
  remaining_grams: z.string().min(1, "Remaining grams is required"),

  // Tasting & Rating
  roast_level: z.enum([
    "light",
    "medium-light",
    "medium",
    "medium-dark",
    "dark",
  ]),
  tasting_notes: z.string().optional(),
  official_description: z.string().optional(),
  my_notes: z.string().optional(),
  rating: z.string().optional(),
});

type BeanFormData = z.infer<typeof beanFormSchema>;

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
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BeanFormData>({
    resolver: zodResolver(beanFormSchema),
    defaultValues: {
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
    },
  });

  const formatTastingNotes = (notes: string): string[] => {
    return notes
      .split(",")
      .map((note) => note.trim())
      .filter((note) => note.length > 0);
  };

  const onSubmit = async (data: BeanFormData) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Convert form data to database format
      const beanData: BeanInput = {
        name: data.name,
        origin: data.origin,
        farm: data.farm || undefined,
        region: data.region || undefined,
        altitude: data.altitude ? parseInt(data.altitude) : undefined,
        process: data.process,
        variety: data.variety || undefined,
        purchase_date: data.purchase_date,
        roast_date: data.roast_date,
        supplier: data.supplier,
        cost: parseFloat(data.cost),
        total_grams: parseInt(data.total_grams),
        remaining_grams: parseInt(data.remaining_grams),
        roast_level: data.roast_level,
        tasting_notes: data.tasting_notes
          ? formatTastingNotes(data.tasting_notes)
          : undefined,
        official_description: data.official_description || undefined,
        my_notes: data.my_notes || undefined,
        rating: data.rating ? parseInt(data.rating) : undefined,
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
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding bean:", error);
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
        subtitle="Essential coffee bean details"
        spacing="xl"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <Input
              label="Bean Name"
              placeholder="Ethiopian Yirgacheffe"
              value={watch("name")}
              onChangeText={(value) => setValue("name", value)}
              error={errors.name?.message}
              required
            />

            <Input
              label="Origin"
              placeholder="Ethiopia"
              value={watch("origin")}
              onChangeText={(value) => setValue("origin", value)}
              error={errors.origin?.message}
              required
            />

            <Input
              label="Supplier"
              placeholder="Blue Bottle Coffee"
              value={watch("supplier")}
              onChangeText={(value) => setValue("supplier", value)}
              error={errors.supplier?.message}
              required
            />
          </View>
        </Card>
      </Section>

      <Section
        title="Processing & Roast"
        subtitle="Process method and roast characteristics"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <View style={styles.selectField}>
              <Text variant="caption" color="secondary" style={styles.selectLabel}>
                Process Method *
              </Text>
              <View style={styles.selectOptions}>
                {processOptions.map((option) => (
                  <Button
                    key={option.value}
                    title={option.label}
                    variant={watch("process") === option.value ? "primary" : "secondary"}
                    size="sm"
                    onPress={() => setValue("process", option.value as any)}
                    style={styles.optionButton}
                  />
                ))}
              </View>
            </View>

            <View style={styles.selectField}>
              <Text variant="caption" color="secondary" style={styles.selectLabel}>
                Roast Level *
              </Text>
              <View style={styles.selectOptions}>
                {roastLevelOptions.map((option) => (
                  <Button
                    key={option.value}
                    title={option.label}
                    variant={watch("roast_level") === option.value ? "primary" : "secondary"}
                    size="sm"
                    onPress={() => setValue("roast_level", option.value as any)}
                    style={styles.optionButton}
                  />
                ))}
              </View>
            </View>
          </View>
        </Card>
      </Section>

      <Section
        title="Purchase & Inventory"
        subtitle="Purchase details and inventory tracking"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <Input
              label="Purchase Date"
              type="date"
              value={watch("purchase_date")}
              onChangeText={(value) => setValue("purchase_date", value)}
              error={errors.purchase_date?.message}
              required
            />

            <Input
              label="Roast Date"
              type="date"
              value={watch("roast_date")}
              onChangeText={(value) => setValue("roast_date", value)}
              error={errors.roast_date?.message}
              required
            />

            <View style={styles.row}>
              <Input
                label="Cost ($)"
                placeholder="24.95"
                type="number"
                value={watch("cost")}
                onChangeText={(value) => setValue("cost", value)}
                error={errors.cost?.message}
                style={{ flex: 1, marginRight: 8 }}
                required
              />

              <Input
                label="Total (g)"
                placeholder="340"
                type="number"
                value={watch("total_grams")}
                onChangeText={(value) => setValue("total_grams", value)}
                error={errors.total_grams?.message}
                style={{ flex: 1, marginLeft: 8 }}
                required
              />
            </View>

            <Input
              label="Remaining Grams"
              placeholder="340"
              type="number"
              value={watch("remaining_grams")}
              onChangeText={(value) => setValue("remaining_grams", value)}
              error={errors.remaining_grams?.message}
              required
            />
          </View>
        </Card>
      </Section>

      <Section
        title="Additional Details"
        subtitle="Optional coffee characteristics and notes"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.fieldGroup}>
            <View style={styles.row}>
              <Input
                label="Farm"
                placeholder="Chelchele Washing Station"
                value={watch("farm")}
                onChangeText={(value) => setValue("farm", value)}
                style={{ flex: 1, marginRight: 8 }}
              />

              <Input
                label="Region"
                placeholder="Yirgacheffe"
                value={watch("region")}
                onChangeText={(value) => setValue("region", value)}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>

            <View style={styles.row}>
              <Input
                label="Altitude (m)"
                placeholder="1800"
                type="number"
                value={watch("altitude")}
                onChangeText={(value) => setValue("altitude", value)}
                style={{ flex: 1, marginRight: 8 }}
              />

              <Input
                label="Variety"
                placeholder="Heirloom"
                value={watch("variety")}
                onChangeText={(value) => setValue("variety", value)}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>

            <Input
              label="Tasting Notes"
              placeholder="fruity, bright, citrus (comma separated)"
              value={watch("tasting_notes")}
              onChangeText={(value) => setValue("tasting_notes", value)}
            />

            <View style={styles.selectField}>
              <Text variant="caption" color="secondary" style={styles.selectLabel}>
                Rating (Optional)
              </Text>
              <View style={styles.selectOptions}>
                {ratingOptions.map((option) => (
                  <Button
                    key={option.value}
                    title={option.label}
                    variant={watch("rating") === option.value ? "primary" : "secondary"}
                    size="sm"
                    onPress={() => setValue("rating", option.value)}
                    style={styles.ratingButton}
                  />
                ))}
              </View>
            </View>

            <Input
              label="Official Description"
              placeholder="Roaster's official tasting notes and description..."
              multiline
              numberOfLines={3}
              value={watch("official_description")}
              onChangeText={(value) => setValue("official_description", value)}
            />

            <Input
              label="My Notes"
              placeholder="Your personal notes about this bean..."
              multiline
              numberOfLines={3}
              value={watch("my_notes")}
              onChangeText={(value) => setValue("my_notes", value)}
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
            title="Add Bean"
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
  ratingButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actions: {
    gap: 12,
  },
};