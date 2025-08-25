// Data-First UI Components
import { DataButton } from "@/components/ui/DataButton";
import { DataText } from "@/components/ui/DataText";
import { Input } from "@/components/ui/Input";
import { ThemedSelect } from "@/components/ui/ThemedSelect";
import { useAuth } from "@/context/AuthContext";
import {
  BeansService,
  BrewersService,
  BrewprintsService,
  GrindersService,
  type BrewprintInput,
  type BrewStep,
} from "@/lib/services";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { View } from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

interface BrewprintFormProps {
  onSuccess: (brewprint: any) => void;
  onCancel: () => void;
  initialData?: Partial<BrewprintInput>;
}

interface FormData {
  // Basic info
  name: string;
  description: string;
  method: string;
  brewer_id: string;
  bean_id: string;
  grinder_id?: string;
  difficulty: string;

  // Parameters
  coffee_grams: string;
  water_grams: string;
  water_temp: string;
  grind_setting?: string;
  bloom_time?: string;
  total_time?: string;

  // Target metrics
  target_tds?: string;
  target_extraction?: string;
  target_strength?: string;
  target_time?: string;

  // Steps
  steps: {
    title: string;
    description: string;
    duration: string;
    water_amount: string;
    technique: string;
    temperature?: string;
  }[];
}

const difficultyOptions = [
  { label: "Easy", value: "1" },
  { label: "Intermediate", value: "2" },
  { label: "Advanced", value: "3" },
];

const methodOptions = [
  { label: "V60", value: "v60" },
  { label: "Chemex", value: "chemex" },
  { label: "French Press", value: "french-press" },
  { label: "AeroPress", value: "aeropress" },
  { label: "Espresso", value: "espresso" },
  { label: "Cold Brew", value: "cold-brew" },
  { label: "Siphon", value: "siphon" },
  { label: "Percolator", value: "percolator" },
  { label: "Turkish", value: "turkish" },
  { label: "Moka Pot", value: "moka" },
];

const techniqueOptions = [
  { label: "Circular Pour", value: "circular" },
  { label: "Center Pour", value: "center-pour" },
  { label: "Agitate", value: "agitate" },
  { label: "Spiral Pour", value: "spiral" },
  { label: "Bloom", value: "bloom" },
  { label: "Immersion", value: "immersion" },
];

// Validation schema
const brewprintFormSchema = z.object({
  name: z.string().min(1, "Brewprint name is required"),
  description: z.string().optional(),
  method: z.enum(["v60", "chemex", "french-press", "aeropress", "espresso", "cold-brew", "siphon", "percolator", "turkish", "moka"], {
    errorMap: () => ({ message: "Please select a valid brewing method" })
  }),
  brewer_id: z.string().min(1, "Brewer is required"),
  bean_id: z.string().min(1, "Bean is required"),
  grinder_id: z.string().optional(),
  difficulty: z.string().min(1, "Difficulty is required"),
  coffee_grams: z.string().min(1, "Coffee amount is required"),
  water_grams: z.string().min(1, "Water amount is required"),
  water_temp: z.string().min(1, "Water temperature is required"),
  grind_setting: z.string().optional(),
  bloom_time: z.string().optional(),
  total_time: z.string().optional(),
  target_tds: z.string().optional(),
  target_extraction: z.string().optional(),
  target_strength: z.string().optional(),
  target_time: z.string().optional(),
  steps: z.array(
    z.object({
      title: z.string().min(1, "Step title is required"),
      description: z.string().min(1, "Step description is required"),
      duration: z.string().min(1, "Duration is required"),
      water_amount: z.string().min(1, "Water amount is required"),
      technique: z.string().min(1, "Technique is required"),
      temperature: z.string().optional(),
    })
  ),
});

export function BrewprintForm({
  onSuccess,
  onCancel,
  initialData,
}: BrewprintFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [brewers, setBrewers] = useState<{ label: string; value: string }[]>(
    []
  );
  const [beans, setBeans] = useState<{ label: string; value: string }[]>([]);
  const [grinders, setGrinders] = useState<{ label: string; value: string }[]>(
    []
  );
  const [selectedGrinder, setSelectedGrinder] = useState<any>(null);

  // Initialize form with validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(brewprintFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      method: initialData?.method || "v60",
      brewer_id: initialData?.brewer_id || "",
      bean_id: initialData?.bean_id || "",
      grinder_id: initialData?.grinder_id || "",
      difficulty: initialData?.difficulty?.toString() || "1",
      coffee_grams: initialData?.parameters?.coffee_grams?.toString() || "",
      water_grams: initialData?.parameters?.water_grams?.toString() || "",
      water_temp: initialData?.parameters?.water_temp?.toString() || "",
      grind_setting: initialData?.parameters?.grind_setting?.toString() || "",
      bloom_time: initialData?.parameters?.bloom_time?.toString() || "",
      total_time: initialData?.parameters?.total_time?.toString() || "",
      target_tds: initialData?.target_metrics?.target_tds?.toString() || "",
      target_extraction:
        initialData?.target_metrics?.target_extraction?.toString() || "",
      target_strength:
        initialData?.target_metrics?.target_strength?.toString() || "",
      target_time: initialData?.target_metrics?.target_time?.toString() || "",
      steps: initialData?.steps?.map((step) => ({
        title: step.title,
        description: step.description,
        duration: step.duration.toString(),
        water_amount: step.water_amount.toString(),
        technique: step.technique,
        temperature: step.temperature?.toString() || "",
      })) || [
        {
          title: "Bloom",
          description: "Initial pour to degas the coffee",
          duration: "30",
          water_amount: "50",
          technique: "circular",
          temperature: "",
        },
      ],
    },
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "steps",
  });

  const watchedCoffeeGrams = watch("coffee_grams");
  const watchedWaterGrams = watch("water_grams");
  const watchedGrinderId = watch("grinder_id");

  // Load brewers, beans, and grinders
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load brewers
        const brewersResult = await BrewersService.getAllBrewers();
        if (brewersResult.success && brewersResult.data) {
          const brewerOptions = brewersResult.data.map((brewer) => ({
            label: brewer.name,
            value: brewer.id,
          }));
          setBrewers(brewerOptions);
        }

        // Load beans
        const beansResult = await BeansService.getAllBeans();
        if (beansResult.success && beansResult.data) {
          const beanOptions = beansResult.data.map((bean) => ({
            label: bean.name,
            value: bean.id,
          }));
          setBeans(beanOptions);
        }

        // Load grinders
        const grindersResult = await GrindersService.getAllGrinders();
        if (grindersResult.success && grindersResult.data) {
          const grinderOptions = grindersResult.data.map((grinder) => ({
            label: grinder.name,
            value: grinder.id,
          }));
          setGrinders(grinderOptions);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load selected grinder details
  useEffect(() => {
    const loadGrinderDetails = async () => {
      if (watchedGrinderId) {
        try {
          const result = await GrindersService.getGrinderById(watchedGrinderId);
          if (result.success && result.data) {
            setSelectedGrinder(result.data);

            // Auto-populate grind setting if grinder has a default and current setting is empty
            if (result.data.default_setting && !getValues("grind_setting")) {
              setValue("grind_setting", result.data.default_setting.toString());
            }
          }
        } catch (error) {
          console.error("Error loading grinder details:", error);
        }
      } else {
        setSelectedGrinder(null);
      }
    };

    loadGrinderDetails();
  }, [watchedGrinderId, setValue, getValues]);

  // Calculate ratio automatically
  const calculateRatio = () => {
    const coffee = parseFloat(watchedCoffeeGrams);
    const water = parseFloat(watchedWaterGrams);
    if (coffee && water && coffee > 0) {
      const ratio = water / coffee;
      return `1:${ratio.toFixed(1)}`;
    }
    return "";
  };

  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Convert form data to BrewprintInput format
      const brewprintData: BrewprintInput = {
        name: data.name,
        description: data.description || undefined,
        method: data.method as any,
        brewer_id: data.brewer_id,
        bean_id: data.bean_id,
        grinder_id: data.grinder_id || undefined,
        difficulty: parseInt(data.difficulty) as 1 | 2 | 3,
        parameters: {
          coffee_grams: parseFloat(data.coffee_grams),
          water_grams: parseFloat(data.water_grams),
          water_temp: parseFloat(data.water_temp),
          grind_setting: data.grind_setting
            ? parseFloat(data.grind_setting)
            : undefined,
          bloom_time: data.bloom_time ? parseFloat(data.bloom_time) : undefined,
          total_time: data.total_time ? parseFloat(data.total_time) : undefined,
        },
        target_metrics: {
          target_tds: data.target_tds ? parseFloat(data.target_tds) : undefined,
          target_extraction: data.target_extraction
            ? parseFloat(data.target_extraction)
            : undefined,
          target_strength: data.target_strength
            ? parseFloat(data.target_strength)
            : undefined,
          target_time: data.target_time
            ? parseFloat(data.target_time)
            : undefined,
        },
        steps: data.steps.map(
          (step, index): BrewStep => ({
            id: index + 1,
            order: index + 1,
            title: step.title,
            description: step.description,
            duration: parseFloat(step.duration),
            water_amount: parseFloat(step.water_amount),
            technique: step.technique,
            temperature: step.temperature
              ? parseFloat(step.temperature)
              : undefined,
          })
        ),
      };

      const result = await BrewprintsService.createBrewprint(brewprintData);

      if (result.success && result.data) {
        toast.success("Brewprint created successfully!");
        reset();
        onSuccess(result.data);
      } else {
        console.error("Error creating brewprint:", result.error);
        toast.error(
          result.error || "Failed to create brewprint. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating brewprint:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addStep = () => {
    appendStep({
      title: "",
      description: "",
      duration: "30",
      water_amount: "0",
      technique: "circular",
      temperature: "",
    });
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        <DataText variant="body" color="secondary">
          Loading brewprint data...
        </DataText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 24 }}>
      {/* Basic Information */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Basic Information
        </DataText>
        <DataText variant="small" color="secondary">
          Recipe details and brewing method
        </DataText>

        <View style={styles.fieldGroup}>
            <Input
              label="Recipe Name"
              placeholder="My V60 Recipe"
              value={watch("name")}
              onChangeText={(value) => setValue("name", value)}
              error={errors.name?.message}
              required
            />

            <Input
              label="Description"
              placeholder="Description of this recipe..."
              multiline
              numberOfLines={3}
              value={watch("description")}
              onChangeText={(value) => setValue("description", value)}
              error={errors.description?.message}
            />

            <ThemedSelect
              label="Brewing Method *"
              options={methodOptions}
              value={watch("method")}
              onValueChange={(value) => setValue("method", value)}
              placeholder="Select brewing method"
              error={errors.method?.message}
            />

            <ThemedSelect
              label="Difficulty *"
              options={difficultyOptions}
              value={watch("difficulty")}
              onValueChange={(value) => setValue("difficulty", value)}
              placeholder="Select difficulty"
              error={errors.difficulty?.message}
            />
        </View>
      </View>

      {/* Equipment Selection */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Equipment Selection
        </DataText>
        <DataText variant="small" color="secondary">
          Choose your brewing equipment
        </DataText>

        <View style={styles.fieldGroup}>
            <ThemedSelect
              label="Brewer *"
              options={brewers}
              value={watch("brewer_id")}
              onValueChange={(value) => setValue("brewer_id", value)}
              placeholder="Select a brewer"
              error={errors.brewer_id?.message}
            />

            <ThemedSelect
              label="Coffee Bean *"
              options={beans}
              value={watch("bean_id")}
              onValueChange={(value) => setValue("bean_id", value)}
              placeholder="Select a coffee bean"
              error={errors.bean_id?.message}
            />

            <ThemedSelect
              label="Grinder (Optional)"
              options={grinders}
              value={watch("grinder_id")}
              onValueChange={(value) => setValue("grinder_id", value)}
              placeholder="Select a grinder"
              error={errors.grinder_id?.message}
            />
        </View>
      </View>

      {/* Recipe Parameters */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Recipe Parameters
        </DataText>
        <DataText variant="small" color="secondary">
          Brewing ratios and temperatures
        </DataText>

        <View style={styles.fieldGroup}>
            <View style={styles.row}>
              <Input
                label="Coffee (g)"
                placeholder="20"
                type="number"
                value={watch("coffee_grams")}
                onChangeText={(value) => setValue("coffee_grams", value)}
                error={errors.coffee_grams?.message}
                style={{ flex: 1, marginRight: 8 }}
                required
              />

              <Input
                label="Water (g)"
                placeholder="320"
                type="number"
                value={watch("water_grams")}
                onChangeText={(value) => setValue("water_grams", value)}
                error={errors.water_grams?.message}
                style={{ flex: 1, marginLeft: 8 }}
                required
              />
            </View>

            {calculateRatio() && (
              <View style={{ alignItems: "center", marginVertical: 8 }}>
                <DataText variant="body" weight="semibold">
                  Ratio: {calculateRatio()}
                </DataText>
              </View>
            )}

            <View style={styles.row}>
              <Input
                label="Water Temp (°C)"
                placeholder="92"
                type="number"
                value={watch("water_temp")}
                onChangeText={(value) => setValue("water_temp", value)}
                error={errors.water_temp?.message}
                style={{ flex: 1, marginRight: 8 }}
                required
              />

              <Input
                label="Grind Setting"
                placeholder="15"
                type="number"
                value={watch("grind_setting")}
                onChangeText={(value) => setValue("grind_setting", value)}
                error={errors.grind_setting?.message}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>

            <View style={styles.row}>
              <Input
                label="Bloom Time (s)"
                placeholder="30"
                type="number"
                value={watch("bloom_time")}
                onChangeText={(value) => setValue("bloom_time", value)}
                error={errors.bloom_time?.message}
                style={{ flex: 1, marginRight: 8 }}
              />

              <Input
                label="Total Time (s)"
                placeholder="240"
                type="number"
                value={watch("total_time")}
                onChangeText={(value) => setValue("total_time", value)}
                error={errors.total_time?.message}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
        </View>
      </View>

      {/* Brewing Steps */}
      <View style={styles.section}>
        <DataText variant="h3" weight="semibold">
          Brewing Steps
        </DataText>
        <DataText variant="small" color="secondary">
          Step-by-step brewing instructions
        </DataText>

        <View style={styles.fieldGroup}>
            {stepFields.map((field, index) => (
              <View key={field.id} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <DataText variant="body" weight="semibold">
                    Step {index + 1}
                  </DataText>
                  {stepFields.length > 1 && (
                    <DataButton
                      title="Remove"
                      variant="secondary"
                      size="sm"
                      onPress={() => removeStep(index)}
                    />
                  )}
                </View>

                <Input
                  label="Title"
                  placeholder="Bloom"
                  value={watch(`steps.${index}.title`)}
                  onChangeText={(value) =>
                    setValue(`steps.${index}.title`, value)
                  }
                  error={errors.steps?.[index]?.title?.message}
                  required
                />

                <Input
                  label="Description"
                  placeholder="Initial pour to degas the coffee"
                  multiline
                  numberOfLines={2}
                  value={watch(`steps.${index}.description`)}
                  onChangeText={(value) =>
                    setValue(`steps.${index}.description`, value)
                  }
                  error={errors.steps?.[index]?.description?.message}
                  required
                />

                <View style={styles.row}>
                  <Input
                    label="Duration (s)"
                    placeholder="30"
                    type="number"
                    value={watch(`steps.${index}.duration`)}
                    onChangeText={(value) =>
                      setValue(`steps.${index}.duration`, value)
                    }
                    error={errors.steps?.[index]?.duration?.message}
                    style={{ flex: 1, marginRight: 8 }}
                    required
                  />

                  <Input
                    label="Water (g)"
                    placeholder="50"
                    type="number"
                    value={watch(`steps.${index}.water_amount`)}
                    onChangeText={(value) =>
                      setValue(`steps.${index}.water_amount`, value)
                    }
                    error={errors.steps?.[index]?.water_amount?.message}
                    style={{ flex: 1, marginLeft: 8 }}
                    required
                  />
                </View>

                <ThemedSelect
                  label="Technique *"
                  options={techniqueOptions}
                  value={watch(`steps.${index}.technique`)}
                  onValueChange={(value) => setValue(`steps.${index}.technique`, value)}
                  placeholder="Select technique"
                  error={errors.steps?.[index]?.technique?.message}
                />
              </View>
            ))}

            <DataButton
              title="Add Step"
              variant="secondary"
              onPress={addStep}
            />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <View style={styles.actions}>
          <DataButton
            title={initialData ? "Duplicate Recipe" : "Create Recipe"}
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
    flexDirection: "row" as const,
  },
  stepCard: {
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    padding: 16,
    borderRadius: 12,
    gap: 16,
    marginBottom: 8,
  },
  stepHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
};
