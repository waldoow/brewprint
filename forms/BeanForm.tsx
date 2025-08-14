import { useAuth } from "@/context/AuthContext";
import { BeansService, type BeanInput } from "@/lib/services";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

// UI Components
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedCollapsible } from "@/components/ui/ThemedCollapsible";
import { SheetHeader } from "@/components/ui/SheetHeader";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { SelectOption, ThemedSelect } from "@/components/ui/ThemedSelect";
import { ThemedTextArea } from "@/components/ui/ThemedTextArea";
import { ThemedView } from "@/components/ui/ThemedView";

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

// Dropdown options
const processOptions: SelectOption[] = [
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

const roastLevelOptions: SelectOption[] = [
  { label: "Light", value: "light" },
  { label: "Medium-Light", value: "medium-light" },
  { label: "Medium", value: "medium" },
  { label: "Medium-Dark", value: "medium-dark" },
  { label: "Dark", value: "dark" },
];

const ratingOptions: SelectOption[] = [
  { label: "● ○ ○ ○ ○", value: "1" },
  { label: "● ● ○ ○ ○", value: "2" },
  { label: "● ● ● ○ ○", value: "3" },
  { label: "● ● ● ● ○", value: "4" },
  { label: "● ● ● ● ●", value: "5" },
];

export function BeanForm({ onSuccess, onCancel, initialData }: BeanFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
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
      purchase_date:
        initialData?.purchase_date || new Date().toISOString().split("T")[0],
      roast_date:
        initialData?.roast_date || new Date().toISOString().split("T")[0],
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

      const { data: newBean, error, success } = await BeansService.createBean(beanData);

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
    <ThemedView noBackground style={styles.container}>
      <SheetHeader
        title="Add New Bean"
        subtitle="Coffee inventory management"
        onClose={handleCancel}
        showCloseButton={true}
      />

      <ThemedScrollView
        paddingVertical={0}
        paddingHorizontal={0}
        style={styles.scrollView}
      >
        <ThemedView style={styles.form} noBackground>
          {/* Basic Information Section - Required Fields Only */}
          <ThemedCollapsible
            title="Basic Information"
            subtitle="Essential coffee details"
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
                  label="Bean Name *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  placeholder="Ethiopian Yirgacheffe"
                />
              )}
            />

            <Controller
              control={control}
              name="origin"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Origin *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.origin?.message}
                  placeholder="Ethiopia"
                />
              )}
            />

            <Controller
              control={control}
              name="process"
              render={({ field: { onChange, value } }) => (
                <ThemedSelect
                  label="Process *"
                  options={processOptions}
                  value={value}
                  onValueChange={onChange}
                  error={errors.process?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="roast_level"
              render={({ field: { onChange, value } }) => (
                <ThemedSelect
                  label="Roast Level *"
                  options={roastLevelOptions}
                  value={value}
                  onValueChange={onChange}
                  error={errors.roast_level?.message}
                />
              )}
            />
          </ThemedCollapsible>

          {/* Advanced Parameters Section - All Optional Fields */}
          <ThemedCollapsible
            title="Advanced Parameters"
            subtitle="Detailed coffee information (optional)"
            defaultOpen={false}
            variant="ghost"
            showBorder={false}
            noPadding={true}
            noBackground={true}
          >
            <Controller
              control={control}
              name="farm"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Farm"
                  value={value}
                  onChangeText={onChange}
                  error={errors.farm?.message}
                  placeholder="Chelchele Washing Station"
                />
              )}
            />

            <Controller
              control={control}
              name="region"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Region"
                  value={value}
                  onChangeText={onChange}
                  error={errors.region?.message}
                  placeholder="Yirgacheffe"
                />
              )}
            />

            <Controller
              control={control}
              name="altitude"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Altitude (meters)"
                  value={value}
                  onChangeText={onChange}
                  error={errors.altitude?.message}
                  placeholder="1800"
                  type="number"
                />
              )}
            />

            <Controller
              control={control}
              name="variety"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Variety"
                  value={value}
                  onChangeText={onChange}
                  error={errors.variety?.message}
                  placeholder="Heirloom"
                />
              )}
            />

            <Controller
              control={control}
              name="tasting_notes"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Tasting Notes"
                  value={value}
                  onChangeText={onChange}
                  error={errors.tasting_notes?.message}
                  placeholder="fruity, bright, citrus"
                />
              )}
            />

            <Controller
              control={control}
              name="official_description"
              render={({ field: { onChange, value } }) => (
                <ThemedTextArea
                  label="Official Description"
                  value={value}
                  onChangeText={onChange}
                  error={errors.official_description?.message}
                  placeholder="Roaster's official tasting notes and description..."
                />
              )}
            />

            <Controller
              control={control}
              name="my_notes"
              render={({ field: { onChange, value } }) => (
                <ThemedTextArea
                  label="My Notes"
                  value={value}
                  onChangeText={onChange}
                  error={errors.my_notes?.message}
                  placeholder="Your personal notes about this bean..."
                />
              )}
            />

            <Controller
              control={control}
              name="rating"
              render={({ field: { onChange, value } }) => (
                <ThemedSelect
                  label="Rating"
                  options={ratingOptions}
                  value={value}
                  onValueChange={onChange}
                  error={errors.rating?.message}
                  placeholder="Rate this bean"
                />
              )}
            />
          </ThemedCollapsible>

          {/* Purchase & Inventory Section - Required Fields */}
          <ThemedCollapsible
            title="Purchase & Inventory"
            subtitle="Purchase details and inventory tracking"
            defaultOpen={true}
            variant="ghost"
            showBorder={false}
            noPadding={true}
            noBackground={true}
          >
            <Controller
              control={control}
              name="purchase_date"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Purchase Date *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.purchase_date?.message}
                  placeholder="YYYY-MM-DD"
                />
              )}
            />

            <Controller
              control={control}
              name="roast_date"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Roast Date *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.roast_date?.message}
                  placeholder="YYYY-MM-DD"
                />
              )}
            />

            <Controller
              control={control}
              name="supplier"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Supplier *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.supplier?.message}
                  placeholder="Blue Bottle Coffee"
                />
              )}
            />

            <Controller
              control={control}
              name="cost"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Cost ($) *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.cost?.message}
                  placeholder="24.95"
                  type="number"
                />
              )}
            />

            <Controller
              control={control}
              name="total_grams"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Total Grams *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.total_grams?.message}
                  placeholder="340"
                  type="number"
                />
              )}
            />

            <Controller
              control={control}
              name="remaining_grams"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Remaining Grams *"
                  value={value}
                  onChangeText={onChange}
                  error={errors.remaining_grams?.message}
                  placeholder="340"
                  type="number"
                />
              )}
            />
          </ThemedCollapsible>

          {/* Form Actions */}
          <ThemedView style={styles.actions} noBackground>
            <ThemedButton
              title="Add Bean"
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
