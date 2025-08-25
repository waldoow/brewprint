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
    <View style={{ flex: 1, padding: 16, gap: 24 }}>
      {/* Basic Information */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Basic Information
        </DataText>
        <DataText variant="small" color="secondary">
          Essential coffee bean details
        </DataText>

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
      </View>

      {/* Processing & Roast */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Processing & Roast
        </DataText>
        <DataText variant="small" color="secondary">
          Process method and roast characteristics
        </DataText>

        <View style={styles.fieldGroup}>
            <ThemedSelect
              label="Process Method *"
              options={processOptions}
              value={watch("process")}
              onValueChange={(value) => setValue("process", value as any)}
              placeholder="Select process method"
              error={errors.process?.message}
            />

            <ThemedSelect
              label="Roast Level *"
              options={roastLevelOptions}
              value={watch("roast_level")}
              onValueChange={(value) => setValue("roast_level", value as any)}
              placeholder="Select roast level"
              error={errors.roast_level?.message}
            />
        </View>
      </View>

      {/* Purchase & Inventory */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Purchase & Inventory
        </DataText>
        <DataText variant="small" color="secondary">
          Purchase details and inventory tracking
        </DataText>

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
      </View>

      {/* Additional Details */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Additional Details
        </DataText>
        <DataText variant="small" color="secondary">
          Optional coffee characteristics and notes
        </DataText>

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

            <ThemedSelect
              label="Rating (Optional)"
              options={ratingOptions}
              value={watch("rating")}
              onValueChange={(value) => setValue("rating", value)}
              placeholder="Select rating"
              error={errors.rating?.message}
            />

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
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <View style={styles.actions}>
          <DataButton
            title="Add Bean"
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
  row: {
    flexDirection: 'row' as const,
  },
  actions: {
    gap: 12,
  },
};