import { useAuth } from "@/context/AuthContext";
import { BeansService, type BeanInput } from "@/lib/services";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm, Controller } from "react-hook-form";
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
import { ThemedDatePicker } from "@/components/ui/ThemedDatePicker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";

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
  purchase_date: z.date({ required_error: "Purchase date is required" }),
  roast_date: z.date({ required_error: "Roast date is required" }),
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

  const form = useForm<BeanFormData>({
    resolver: zodResolver(beanFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      origin: initialData?.origin || "",
      farm: initialData?.farm || "",
      region: initialData?.region || "",
      altitude: initialData?.altitude || "",
      process: initialData?.process || "washed",
      variety: initialData?.variety || "",
      purchase_date: initialData?.purchase_date ? new Date(initialData.purchase_date) : new Date(),
      roast_date: initialData?.roast_date ? new Date(initialData.roast_date) : new Date(),
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
        purchase_date: data.purchase_date ? data.purchase_date.toISOString().split('T')[0] : undefined,
        roast_date: data.roast_date ? data.roast_date.toISOString().split('T')[0] : undefined,
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
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding bean:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
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
        <Form {...form}>
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bean Name *</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Ethiopian Yirgacheffe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin *</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Ethiopia"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="process"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process *</FormLabel>
                    <FormControl>
                      <ThemedSelect
                        options={processOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roast_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roast Level *</FormLabel>
                    <FormControl>
                      <ThemedSelect
                        options={roastLevelOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
              <FormField
                control={form.control}
                name="farm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Chelchele Washing Station"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Yirgacheffe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="altitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altitude (meters)</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="1800"
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="variety"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variety</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Heirloom"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tasting_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tasting Notes</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="fruity, bright, citrus"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="official_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Official Description</FormLabel>
                    <FormControl>
                      <ThemedTextArea
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Roaster's official tasting notes and description..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="my_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>My Notes</FormLabel>
                    <FormControl>
                      <ThemedTextArea
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Your personal notes about this bean..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <ThemedSelect
                        options={ratingOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Rate this bean"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date *</FormLabel>
                    <FormControl>
                      <ThemedDatePicker
                        value={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select purchase date"
                        error={form.formState.errors.purchase_date?.message}
                        maximumDate={new Date()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roast_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roast Date *</FormLabel>
                    <FormControl>
                      <ThemedDatePicker
                        value={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select roast date"
                        error={form.formState.errors.roast_date?.message}
                        maximumDate={new Date()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Blue Bottle Coffee"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($) *</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="24.95"
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_grams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Grams *</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="340"
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remaining_grams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remaining Grams *</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="340"
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </ThemedCollapsible>

          {/* Form Actions */}
          <ThemedView style={styles.actions} noBackground>
              <ThemedButton
                title="Add Bean"
                onPress={form.handleSubmit(onSubmit)}
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
        </Form>
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
    gap: 8, // Reduced from 16 to 8
  },
  actions: {
    flexDirection: "column",
    gap: 6, // Reduced from 12 to 6
    marginTop: 12, // Reduced from 24 to 12
    marginBottom: 16, // Reduced from 32 to 16
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
