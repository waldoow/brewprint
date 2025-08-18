import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedCollapsible } from "@/components/ui/ThemedCollapsible";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { ThemedSelect } from "@/components/ui/ThemedSelect";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedTextArea } from "@/components/ui/ThemedTextArea";
import { ThemedView } from "@/components/ui/ThemedView";
import {
  BrewprintsService,
  BrewersService,
  BeansService,
  type BrewprintInput,
  type BrewStep,
} from "@/lib/services";
import React, { useState, useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Alert, StyleSheet } from "react-native";
// No external UUID dependency needed

interface BrewprintFormProps {
  onSuccess: (brewprint: any) => void;
  onCancel: () => void;
  initialData?: Partial<BrewprintInput>;
}

interface FormData {
  // Basic info
  name: string;
  description: string;
  brewer_id: string;
  bean_id: string;
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
  { label: "Facile", value: "1" },
  { label: "Intermédiaire", value: "2" },
  { label: "Avancé", value: "3" },
];

const techniqueOptions = [
  { label: "Versement circulaire", value: "circular" },
  { label: "Versement au centre", value: "center-pour" },
  { label: "Agiter", value: "agitate" },
  { label: "Versement spirale", value: "spiral" },
  { label: "Bloom", value: "bloom" },
  { label: "Immersion", value: "immersion" },
];

export function BrewprintForm({
  onSuccess,
  onCancel,
  initialData,
}: BrewprintFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brewers, setBrewers] = useState<{ label: string; value: string }[]>([]);
  const [beans, setBeans] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load brewers and beans
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load brewers
        const brewersResult = await BrewersService.getBrewers();
        if (brewersResult.success && brewersResult.data) {
          const brewerOptions = brewersResult.data.map((brewer) => ({
            label: brewer.name,
            value: brewer.id,
          }));
          setBrewers(brewerOptions);
        }

        // Load beans
        const beansResult = await BeansService.getBeans();
        if (beansResult.success && beansResult.data) {
          const beanOptions = beansResult.data.map((bean) => ({
            label: bean.name,
            value: bean.id,
          }));
          setBeans(beanOptions);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const form = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      brewer_id: initialData?.brewer_id || "",
      bean_id: initialData?.bean_id || "",
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
          description: "Versement initial pour dégazer le café",
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
    control: form.control,
    name: "steps",
  });

  const watchedCoffeeGrams = form.watch("coffee_grams");
  const watchedWaterGrams = form.watch("water_grams");

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
    try {
      setIsSubmitting(true);

      // Convert form data to BrewprintInput format
      const brewprintData: BrewprintInput = {
        name: data.name,
        description: data.description || undefined,
        brewer_id: data.brewer_id,
        bean_id: data.bean_id,
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
        onSuccess(result.data);
      } else {
        Alert.alert(
          "Erreur",
          result.error || "Une erreur inconnue s'est produite"
        );
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer la recette");
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <ThemedScrollView style={styles.container}>
        <ThemedView style={[styles.form, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
          <ThemedText>Chargement des données...</ThemedText>
        </ThemedView>
      </ThemedScrollView>
    );
  }

  return (
    <ThemedScrollView style={styles.container}>
      <Form {...form}>
        <ThemedView style={styles.form}>
          {/* Basic Info Section - Always Visible */}
          <ThemedView noBackground style={styles.section}>
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Le nom est requis" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la recette</FormLabel>
                  <FormControl>
                    <ThemedInput
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Ma recette V60"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <ThemedTextArea
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Description de cette recette..."
                      numberOfLines={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ThemedView noBackground style={styles.row}>
              <FormField
                control={form.control}
                name="brewer_id"
                rules={{ required: "Le brewer est requis" }}
                render={({ field }) => (
                  <FormItem style={styles.thirdWidth}>
                    <FormLabel>Brewer</FormLabel>
                    <FormControl>
                      <ThemedSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={brewers}
                        placeholder="Sélectionner un brewer"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bean_id"
                rules={{ required: "Le café est requis" }}
                render={({ field }) => (
                  <FormItem style={styles.thirdWidth}>
                    <FormLabel>Café</FormLabel>
                    <FormControl>
                      <ThemedSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={beans}
                        placeholder="Sélectionner un café"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                rules={{ required: "La difficulté est requise" }}
                render={({ field }) => (
                  <FormItem style={styles.thirdWidth}>
                    <FormLabel>Niveau de difficulté</FormLabel>
                    <FormControl>
                      <ThemedSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={difficultyOptions}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ThemedView>
          </ThemedView>

          {/* Parameters Section - Always Visible */}
          <ThemedView noBackground style={styles.section}>
            <ThemedView noBackground style={styles.row}>
              <FormField
                control={form.control}
                name="coffee_grams"
                rules={{
                  required: "La quantité de café est requise",
                  pattern: {
                    value: /^\d+(\.\d+)?$/,
                    message: "Veuillez entrer un nombre valide",
                  },
                }}
                render={({ field }) => (
                  <FormItem style={styles.thirdWidth}>
                    <FormLabel>Café (g)</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        keyboardType="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="water_grams"
                rules={{
                  required: "La quantité d'eau est requise",
                  pattern: {
                    value: /^\d+(\.\d+)?$/,
                    message: "Veuillez entrer un nombre valide",
                  },
                }}
                render={({ field }) => (
                  <FormItem style={styles.thirdWidth}>
                    <FormLabel>Eau (g)</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        keyboardType="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="water_temp"
                rules={{
                  required: "La température est requise",
                  pattern: {
                    value: /^\d+(\.\d+)?$/,
                    message: "Veuillez entrer un nombre valide",
                  },
                }}
                render={({ field }) => (
                  <FormItem style={styles.thirdWidth}>
                    <FormLabel>Température (°C)</FormLabel>
                    <FormControl>
                      <ThemedInput
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        keyboardType="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ThemedView>

            {calculateRatio() && (
              <ThemedText style={styles.ratioText}>
                Ratio: {calculateRatio()}
              </ThemedText>
            )}
          </ThemedView>

          {/* Steps Section - Always Visible */}
          <ThemedView noBackground style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Étapes de préparation
            </ThemedText>
            {stepFields.map((field, index) => (
              <ThemedView key={field.id} style={styles.stepCard}>
                <ThemedView noBackground style={styles.stepHeader}>
                  <ThemedText style={styles.stepNumber}>
                    Étape {index + 1}
                  </ThemedText>
                  {stepFields.length > 1 && (
                    <ThemedButton
                      title="Supprimer"
                      variant="destructive"
                      size="sm"
                      onPress={() => removeStep(index)}
                    />
                  )}
                </ThemedView>

                <ThemedView noBackground style={styles.row}>
                  <Controller
                    control={form.control}
                    name={`steps.${index}.title`}
                    rules={{ required: "Le titre est requis" }}
                    render={({ field: { onChange, value } }) => (
                      <ThemedInput
                        label="Titre de l'étape"
                        value={value}
                        onChangeText={onChange}
                        error={
                          form.formState.errors.steps?.[index]?.title?.message
                        }
                        placeholder="Bloom, Premier versement, etc."
                        style={styles.halfWidth}
                      />
                    )}
                  />

                  <Controller
                    control={form.control}
                    name={`steps.${index}.technique`}
                    rules={{ required: "La technique est requise" }}
                    render={({ field: { onChange, value } }) => (
                      <ThemedSelect
                        label="Technique"
                        value={value}
                        onValueChange={onChange}
                        options={techniqueOptions}
                        error={
                          form.formState.errors.steps?.[index]?.technique?.message
                        }
                        style={styles.halfWidth}
                      />
                    )}
                  />
                </ThemedView>

                <Controller
                  control={form.control}
                  name={`steps.${index}.description`}
                  rules={{ required: "La description est requise" }}
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextArea
                      label="Description"
                      value={value}
                      onChangeText={onChange}
                      error={
                        form.formState.errors.steps?.[index]?.description
                          ?.message
                      }
                      placeholder="Décrivez cette étape..."
                      numberOfLines={2}
                    />
                  )}
                />

                <ThemedView noBackground style={styles.row}>
                  <Controller
                    control={form.control}
                    name={`steps.${index}.duration`}
                    rules={{
                      required: "La durée est requise",
                      pattern: {
                        value: /^\d+(\.\d+)?$/,
                        message: "Nombre valide requis",
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <ThemedInput
                        label="Durée (s)"
                        value={value}
                        onChangeText={onChange}
                        error={
                          form.formState.errors.steps?.[index]?.duration
                            ?.message
                        }
                        keyboardType="numeric"
                        style={styles.halfWidth}
                      />
                    )}
                  />

                  <Controller
                    control={form.control}
                    name={`steps.${index}.water_amount`}
                    rules={{
                      required: "La quantité d'eau est requise",
                      pattern: {
                        value: /^\d+(\.\d+)?$/,
                        message: "Nombre valide requis",
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <ThemedInput
                        label="Eau (g)"
                        value={value}
                        onChangeText={onChange}
                        error={
                          form.formState.errors.steps?.[index]?.water_amount
                            ?.message
                        }
                        keyboardType="numeric"
                        style={styles.halfWidth}
                      />
                    )}
                  />
                </ThemedView>
              </ThemedView>
            ))}

            <ThemedButton
              title="Ajouter une étape"
              variant="outline"
              onPress={addStep}
            />
          </ThemedView>

          {/* Advanced Optional Fields - Collapsible */}
          <ThemedCollapsible title="Options avancées" showBorder={false}>
            <ThemedView noBackground style={styles.section}>
              {/* Optional Brewing Parameters */}
              <ThemedView noBackground style={styles.row}>
                <FormField
                  control={form.control}
                  name="grind_setting"
                  render={({ field }) => (
                    <FormItem style={styles.thirdWidth}>
                      <FormLabel>Réglage mouture (optionnel)</FormLabel>
                      <FormControl>
                        <ThemedInput
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                          keyboardType="numeric"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bloom_time"
                  render={({ field }) => (
                    <FormItem style={styles.thirdWidth}>
                      <FormLabel>Temps de bloom (s)</FormLabel>
                      <FormControl>
                        <ThemedInput
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                          keyboardType="numeric"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total_time"
                  render={({ field }) => (
                    <FormItem style={styles.thirdWidth}>
                      <FormLabel>Temps total (s)</FormLabel>
                      <FormControl>
                        <ThemedInput
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                          keyboardType="numeric"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </ThemedView>

              {/* Target Metrics */}
              <ThemedText style={styles.subSectionTitle}>
                Objectifs de mesures
              </ThemedText>
              <ThemedView noBackground style={styles.row}>
                <Controller
                  control={form.control}
                  name="target_tds"
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      label="TDS cible (%)"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      style={styles.halfWidth}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="target_extraction"
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      label="Extraction cible (%)"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      style={styles.halfWidth}
                    />
                  )}
                />
              </ThemedView>

              <ThemedView noBackground style={styles.row}>
                <Controller
                  control={form.control}
                  name="target_strength"
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      label="Force cible (mg/ml)"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      style={styles.halfWidth}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="target_time"
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      label="Temps cible (s)"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                      style={styles.halfWidth}
                    />
                  )}
                />
              </ThemedView>

              {/* Step-specific temperatures */}
              <ThemedText style={styles.subSectionTitle}>
                Températures spécifiques par étape
              </ThemedText>
              {stepFields.map((field, index) => (
                <Controller
                  key={field.id}
                  control={form.control}
                  name={`steps.${index}.temperature`}
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      label={`Température étape ${index + 1} (°C)`}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="numeric"
                    />
                  )}
                />
              ))}
            </ThemedView>
          </ThemedCollapsible>

          {/* Action Buttons */}
          <ThemedView noBackground style={styles.actions}>
            <ThemedButton
              title="Annuler"
              variant="outline"
              onPress={onCancel}
              style={styles.actionButton}
            />

            <ThemedButton
              title={initialData ? "Dupliquer la recette" : "Créer la recette"}
              onPress={form.handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.actionButton}
            />
          </ThemedView>
        </ThemedView>
      </Form>
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  // Professional Coffee Form Design
  container: {
    flex: 1,
  },
  form: {
    paddingBottom: 20, // Reduced from 40 to 20
  },
  section: {
    gap: 10, // Reduced from 20 to 10
    paddingTop: 6, // Reduced from 12 to 6
  },
  row: {
    flexDirection: "row",
    gap: 8, // Reduced from 16 to 8
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
  },

  // Professional Coffee Ratio Display
  ratioText: {
    fontSize: 15, // Slightly larger
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.85, // Higher opacity for better readability
    marginTop: -4, // Adjusted positioning
    marginBottom: 6, // Reduced from 12 to 6
    letterSpacing: 0.2,
  },

  // Professional Step Card Design
  stepCard: {
    backgroundColor: "rgba(255, 255, 255, 0.03)", // Slightly more visible
    borderRadius: 12, // More rounded for modern look
    padding: 10, // Reduced from 20 to 10
    gap: 8, // Reduced from 16 to 8
    marginBottom: 8, // Reduced from 16 to 8
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)", // Subtle border
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2, // Reduced from 4 to 2
  },
  stepNumber: {
    fontSize: 15, // Slightly larger
    fontWeight: "600",
    letterSpacing: 0.1,
  },

  // Professional Section Titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 0.1,
    opacity: 0.9,
  },

  // Professional Action Button Layout
  actions: {
    flexDirection: "row",
    gap: 8, // Reduced from 16 to 8
    marginTop: 16, // Reduced from 32 to 16
    paddingHorizontal: 4, // Added horizontal padding
  },
  actionButton: {
    flex: 1,
  },
});
