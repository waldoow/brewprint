import React, { useEffect, useState } from "react";
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
import {
  BeansService,
  BrewersService,
  BrewprintsService,
  GrindersService,
  type BrewprintInput,
  type BrewStep,
} from "@/lib/services";

interface BrewprintFormProps {
  onSuccess: (brewprint: any) => void;
  onCancel: () => void;
  initialData?: Partial<BrewprintInput>;
}

// Form data interface
interface BrewprintFormData {
  // Basic info
  name: string;
  description: string;
  method: string;
  brewer_id: string;
  bean_id: string;
  grinder_id: string;
  difficulty: string;

  // Parameters
  coffee_grams: string;
  water_grams: string;
  water_temp: string;
  grind_setting: string;
  bloom_time: string;
  total_time: string;

  // Target metrics
  target_tds: string;
  target_extraction: string;
  target_strength: string;
  target_time: string;

  // Steps
  steps: {
    title: string;
    description: string;
    duration: string;
    water_amount: string;
    technique: string;
    temperature: string;
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


export function BrewprintForm({
  onSuccess,
  onCancel,
  initialData,
}: BrewprintFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [brewers, setBrewers] = useState<{ label: string; value: string }[]>([]);
  const [beans, setBeans] = useState<{ label: string; value: string }[]>([]);
  const [grinders, setGrinders] = useState<{ label: string; value: string }[]>([]);
  const [selectedGrinder, setSelectedGrinder] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<BrewprintFormData>({
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
    target_extraction: initialData?.target_metrics?.target_extraction?.toString() || "",
    target_strength: initialData?.target_metrics?.target_strength?.toString() || "",
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
  });

  const updateField = (field: keyof BrewprintFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const updateStep = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        title: "",
        description: "",
        duration: "30",
        water_amount: "0",
        technique: "circular",
        temperature: "",
      }]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Recipe name is required";
    if (!formData.method.trim()) newErrors.method = "Brewing method is required";
    if (!formData.brewer_id.trim()) newErrors.brewer_id = "Brewer is required";
    if (!formData.bean_id.trim()) newErrors.bean_id = "Bean is required";
    if (!formData.difficulty.trim()) newErrors.difficulty = "Difficulty is required";
    if (!formData.coffee_grams.trim()) newErrors.coffee_grams = "Coffee amount is required";
    if (!formData.water_grams.trim()) newErrors.water_grams = "Water amount is required";
    if (!formData.water_temp.trim()) newErrors.water_temp = "Water temperature is required";
    
    // Validate steps
    formData.steps.forEach((step, index) => {
      if (!step.title.trim()) newErrors[`step_${index}_title`] = `Step ${index + 1} title is required`;
      if (!step.description.trim()) newErrors[`step_${index}_description`] = `Step ${index + 1} description is required`;
      if (!step.duration.trim()) newErrors[`step_${index}_duration`] = `Step ${index + 1} duration is required`;
      if (!step.water_amount.trim()) newErrors[`step_${index}_water_amount`] = `Step ${index + 1} water amount is required`;
      if (!step.technique.trim()) newErrors[`step_${index}_technique`] = `Step ${index + 1} technique is required`;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      if (formData.grinder_id) {
        try {
          const result = await GrindersService.getGrinderById(formData.grinder_id);
          if (result.success && result.data) {
            setSelectedGrinder(result.data);

            // Auto-populate grind setting if grinder has a default and current setting is empty
            if (result.data.default_setting && !formData.grind_setting) {
              updateField("grind_setting", result.data.default_setting.toString());
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
  }, [formData.grinder_id]);

  // Calculate ratio automatically
  const calculateRatio = () => {
    const coffee = parseFloat(formData.coffee_grams);
    const water = parseFloat(formData.water_grams);
    if (coffee && water && coffee > 0) {
      const ratio = water / coffee;
      return `1:${ratio.toFixed(1)}`;
    }
    return "";
  };

  const onSubmit = async () => {
    if (!validateForm()) return;
    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Convert form data to BrewprintInput format
      const brewprintData: BrewprintInput = {
        name: formData.name,
        description: formData.description || undefined,
        method: formData.method as any,
        brewer_id: formData.brewer_id,
        bean_id: formData.bean_id,
        grinder_id: formData.grinder_id || undefined,
        difficulty: parseInt(formData.difficulty) as 1 | 2 | 3,
        parameters: {
          coffee_grams: parseFloat(formData.coffee_grams),
          water_grams: parseFloat(formData.water_grams),
          water_temp: parseFloat(formData.water_temp),
          grind_setting: formData.grind_setting
            ? parseFloat(formData.grind_setting)
            : undefined,
          bloom_time: formData.bloom_time ? parseFloat(formData.bloom_time) : undefined,
          total_time: formData.total_time ? parseFloat(formData.total_time) : undefined,
        },
        target_metrics: {
          target_tds: formData.target_tds ? parseFloat(formData.target_tds) : undefined,
          target_extraction: formData.target_extraction
            ? parseFloat(formData.target_extraction)
            : undefined,
          target_strength: formData.target_strength
            ? parseFloat(formData.target_strength)
            : undefined,
          target_time: formData.target_time
            ? parseFloat(formData.target_time)
            : undefined,
        },
        steps: formData.steps.map(
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

  const handleCancel = () => {
    onCancel();
  };

  if (isLoading && brewers.length === 0) {
    return (
      <View flex center paddingH-page>
        <Text body textSecondary>
          Loading brewprint data...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Basic Information */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Basic Information
        </Text>
        <Text caption textSecondary marginB-md>
          Recipe details and brewing method
        </Text>

        <View style={styles.fieldGroup}>
          <TextField
            label="Recipe Name *"
            placeholder="My V60 Recipe"
            value={formData.name}
            onChangeText={(value) => updateField("name", value)}
            enableErrors={!!errors.name}
            errorMessage={errors.name}
            fieldStyle={styles.textField}
          />

          <TextField
            label="Description"
            placeholder="Description of this recipe..."
            multiline
            numberOfLines={3}
            value={formData.description}
            onChangeText={(value) => updateField("description", value)}
            fieldStyle={styles.textField}
          />

          <View>
            <Text body textColor marginB-sm>Brewing Method *</Text>
            <Picker
              value={formData.method}
              onChange={(value) => updateField("method", value as string)}
              topBarProps={{ title: "Select Brewing Method" }}
              style={styles.picker}
            >
              {methodOptions.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>

          <View>
            <Text body textColor marginB-sm>Difficulty *</Text>
            <Picker
              value={formData.difficulty}
              onChange={(value) => updateField("difficulty", value as string)}
              topBarProps={{ title: "Select Difficulty" }}
              style={styles.picker}
            >
              {difficultyOptions.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Equipment Selection */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Equipment Selection
        </Text>
        <Text caption textSecondary marginB-md>
          Choose your brewing equipment
        </Text>

        <View style={styles.fieldGroup}>
          <View>
            <Text body textColor marginB-sm>Brewer *</Text>
            <Picker
              value={formData.brewer_id}
              onChange={(value) => updateField("brewer_id", value as string)}
              topBarProps={{ title: "Select Brewer" }}
              style={styles.picker}
            >
              {brewers.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>

          <View>
            <Text body textColor marginB-sm>Coffee Bean *</Text>
            <Picker
              value={formData.bean_id}
              onChange={(value) => updateField("bean_id", value as string)}
              topBarProps={{ title: "Select Coffee Bean" }}
              style={styles.picker}
            >
              {beans.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>

          <View>
            <Text body textColor marginB-sm>Grinder (Optional)</Text>
            <Picker
              value={formData.grinder_id}
              onChange={(value) => updateField("grinder_id", value as string)}
              topBarProps={{ title: "Select Grinder" }}
              style={styles.picker}
            >
              {grinders.map(option => (
                <Picker.Item key={option.value} value={option.value} label={option.label} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Recipe Parameters */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Recipe Parameters
        </Text>
        <Text caption textSecondary marginB-md>
          Brewing ratios and temperatures
        </Text>

        <View style={styles.fieldGroup}>
          <View row gap-md>
            <View flex>
              <TextField
                label="Coffee (g) *"
                placeholder="20"
                keyboardType="numeric"
                value={formData.coffee_grams}
                onChangeText={(value) => updateField("coffee_grams", value)}
                enableErrors={!!errors.coffee_grams}
                errorMessage={errors.coffee_grams}
                fieldStyle={styles.textField}
              />
            </View>
            <View flex>
              <TextField
                label="Water (g) *"
                placeholder="320"
                keyboardType="numeric"
                value={formData.water_grams}
                onChangeText={(value) => updateField("water_grams", value)}
                enableErrors={!!errors.water_grams}
                errorMessage={errors.water_grams}
                fieldStyle={styles.textField}
              />
            </View>
          </View>

          {calculateRatio() && (
            <View centerH marginV-sm>
              <Text body textColor weight="semibold">
                Ratio: {calculateRatio()}
              </Text>
            </View>
          )}

          <View row gap-md>
            <View flex>
              <TextField
                label="Water Temp (°C) *"
                placeholder="92"
                keyboardType="numeric"
                value={formData.water_temp}
                onChangeText={(value) => updateField("water_temp", value)}
                enableErrors={!!errors.water_temp}
                errorMessage={errors.water_temp}
                fieldStyle={styles.textField}
              />
            </View>
            <View flex>
              <TextField
                label="Grind Setting"
                placeholder="15"
                keyboardType="numeric"
                value={formData.grind_setting}
                onChangeText={(value) => updateField("grind_setting", value)}
                fieldStyle={styles.textField}
              />
            </View>
          </View>

          <View row gap-md>
            <View flex>
              <TextField
                label="Bloom Time (s)"
                placeholder="30"
                keyboardType="numeric"
                value={formData.bloom_time}
                onChangeText={(value) => updateField("bloom_time", value)}
                fieldStyle={styles.textField}
              />
            </View>
            <View flex>
              <TextField
                label="Total Time (s)"
                placeholder="240"
                keyboardType="numeric"
                value={formData.total_time}
                onChangeText={(value) => updateField("total_time", value)}
                fieldStyle={styles.textField}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Brewing Steps */}
      <View style={styles.section}>
        <Text h3 textColor marginB-sm>
          Brewing Steps
        </Text>
        <Text caption textSecondary marginB-md>
          Step-by-step brewing instructions
        </Text>

        <View style={styles.fieldGroup}>
          {formData.steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <Text body textColor weight="semibold">
                  Step {index + 1}
                </Text>
                {formData.steps.length > 1 && (
                  <Button
                    label="Remove"
                    backgroundColor={Colors.grey40}
                    size="small"
                    onPress={() => removeStep(index)}
                  />
                )}
              </View>

              <TextField
                label="Title *"
                placeholder="Bloom"
                value={step.title}
                onChangeText={(value) => updateStep(index, "title", value)}
                enableErrors={!!errors[`step_${index}_title`]}
                errorMessage={errors[`step_${index}_title`]}
                fieldStyle={styles.textField}
              />

              <TextField
                label="Description *"
                placeholder="Initial pour to degas the coffee"
                multiline
                numberOfLines={2}
                value={step.description}
                onChangeText={(value) => updateStep(index, "description", value)}
                enableErrors={!!errors[`step_${index}_description`]}
                errorMessage={errors[`step_${index}_description`]}
                fieldStyle={styles.textField}
              />

              <View row gap-md>
                <View flex>
                  <TextField
                    label="Duration (s) *"
                    placeholder="30"
                    keyboardType="numeric"
                    value={step.duration}
                    onChangeText={(value) => updateStep(index, "duration", value)}
                    enableErrors={!!errors[`step_${index}_duration`]}
                    errorMessage={errors[`step_${index}_duration`]}
                    fieldStyle={styles.textField}
                  />
                </View>
                <View flex>
                  <TextField
                    label="Water (g) *"
                    placeholder="50"
                    keyboardType="numeric"
                    value={step.water_amount}
                    onChangeText={(value) => updateStep(index, "water_amount", value)}
                    enableErrors={!!errors[`step_${index}_water_amount`]}
                    errorMessage={errors[`step_${index}_water_amount`]}
                    fieldStyle={styles.textField}
                  />
                </View>
              </View>

              <View>
                <Text body textColor marginB-sm>Technique *</Text>
                <Picker
                  value={step.technique}
                  onChange={(value) => updateStep(index, "technique", value as string)}
                  topBarProps={{ title: "Select Technique" }}
                  style={styles.picker}
                >
                  {techniqueOptions.map(option => (
                    <Picker.Item key={option.value} value={option.value} label={option.label} />
                  ))}
                </Picker>
              </View>
            </View>
          ))}

          <Button
            label="Add Step"
            backgroundColor={Colors.grey40}
            onPress={addStep}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <View style={styles.actions}>
          <Button
            label={initialData ? "Duplicate Recipe" : "Create Recipe"}
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
  stepCard: {
    backgroundColor: Colors.grey50,
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
});
