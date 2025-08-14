import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedCollapsible } from "@/components/ui/ThemedCollapsible";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedSelect } from "@/components/ui/ThemedSelect";
import { ThemedTextArea } from "@/components/ui/ThemedTextArea";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedScrollView } from "@/components/ui/ThemedScrollView";
import { BrewprintsService, type BrewprintInput, type BrewStep } from "@/lib/services";
import React, { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
  method: string;
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
  steps: Array<{
    title: string;
    description: string;
    duration: string;
    water_amount: string;
    technique: string;
    temperature?: string;
  }>;
}

const methodOptions = [
  { label: 'V60', value: 'v60' },
  { label: 'Chemex', value: 'chemex' },
  { label: 'French Press', value: 'french-press' },
  { label: 'AeroPress', value: 'aeropress' },
  { label: 'Espresso', value: 'espresso' },
  { label: 'Cold Brew', value: 'cold-brew' },
  { label: 'Siphon', value: 'siphon' },
  { label: 'Percolator', value: 'percolator' },
  { label: 'Turkish', value: 'turkish' },
  { label: 'Moka Pot', value: 'moka' },
];

const difficultyOptions = [
  { label: 'Facile', value: '1' },
  { label: 'Intermédiaire', value: '2' },
  { label: 'Avancé', value: '3' },
];

const techniqueOptions = [
  { label: 'Versement circulaire', value: 'circular' },
  { label: 'Versement au centre', value: 'center-pour' },
  { label: 'Agiter', value: 'agitate' },
  { label: 'Versement spirale', value: 'spiral' },
  { label: 'Bloom', value: 'bloom' },
  { label: 'Immersion', value: 'immersion' },
];

export function BrewprintForm({
  onSuccess,
  onCancel,
  initialData,
}: BrewprintFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      method: initialData?.method || '',
      difficulty: initialData?.difficulty?.toString() || '1',
      coffee_grams: initialData?.parameters?.coffee_grams?.toString() || '',
      water_grams: initialData?.parameters?.water_grams?.toString() || '',
      water_temp: initialData?.parameters?.water_temp?.toString() || '',
      grind_setting: initialData?.parameters?.grind_setting?.toString() || '',
      bloom_time: initialData?.parameters?.bloom_time?.toString() || '',
      total_time: initialData?.parameters?.total_time?.toString() || '',
      target_tds: initialData?.target_metrics?.target_tds?.toString() || '',
      target_extraction: initialData?.target_metrics?.target_extraction?.toString() || '',
      target_strength: initialData?.target_metrics?.target_strength?.toString() || '',
      target_time: initialData?.target_metrics?.target_time?.toString() || '',
      steps: initialData?.steps?.map(step => ({
        title: step.title,
        description: step.description,
        duration: step.duration.toString(),
        water_amount: step.water_amount.toString(),
        technique: step.technique,
        temperature: step.temperature?.toString() || '',
      })) || [{
        title: 'Bloom',
        description: 'Versement initial pour dégazer le café',
        duration: '30',
        water_amount: '50',
        technique: 'circular',
        temperature: '',
      }],
    },
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps',
  });

  const watchedCoffeeGrams = watch('coffee_grams');
  const watchedWaterGrams = watch('water_grams');

  // Calculate ratio automatically
  const calculateRatio = () => {
    const coffee = parseFloat(watchedCoffeeGrams);
    const water = parseFloat(watchedWaterGrams);
    if (coffee && water && coffee > 0) {
      const ratio = water / coffee;
      return `1:${ratio.toFixed(1)}`;
    }
    return '';
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Convert form data to BrewprintInput format
      const brewprintData: BrewprintInput = {
        name: data.name,
        description: data.description || undefined,
        method: data.method as any,
        difficulty: parseInt(data.difficulty) as 1 | 2 | 3,
        parameters: {
          coffee_grams: parseFloat(data.coffee_grams),
          water_grams: parseFloat(data.water_grams),
          water_temp: parseFloat(data.water_temp),
          grind_setting: data.grind_setting ? parseFloat(data.grind_setting) : undefined,
          bloom_time: data.bloom_time ? parseFloat(data.bloom_time) : undefined,
          total_time: data.total_time ? parseFloat(data.total_time) : undefined,
        },
        target_metrics: {
          target_tds: data.target_tds ? parseFloat(data.target_tds) : undefined,
          target_extraction: data.target_extraction ? parseFloat(data.target_extraction) : undefined,
          target_strength: data.target_strength ? parseFloat(data.target_strength) : undefined,
          target_time: data.target_time ? parseFloat(data.target_time) : undefined,
        },
        steps: data.steps.map((step, index): BrewStep => ({
          id: index + 1,
          order: index + 1,
          title: step.title,
          description: step.description,
          duration: parseFloat(step.duration),
          water_amount: parseFloat(step.water_amount),
          technique: step.technique,
          temperature: step.temperature ? parseFloat(step.temperature) : undefined,
        })),
      };

      const result = await BrewprintsService.createBrewprint(brewprintData);

      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        Alert.alert('Erreur', result.error || 'Une erreur inconnue s\'est produite');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la recette');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStep = () => {
    appendStep({
      title: '',
      description: '',
      duration: '30',
      water_amount: '0',
      technique: 'circular',
      temperature: '',
    });
  };

  return (
    <ThemedScrollView style={styles.container}>
      <ThemedView style={styles.form}>
        {/* Basic Info Section */}
        <ThemedCollapsible title="Informations de base" showBorder={false}>
          <ThemedView noBackground style={styles.section}>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Le nom est requis' }}
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Nom de la recette"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  placeholder="Ma recette V60"
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <ThemedTextArea
                  label="Description (optionnel)"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Description de cette recette..."
                  numberOfLines={3}
                />
              )}
            />

            <Controller
              control={control}
              name="method"
              rules={{ required: 'La méthode est requise' }}
              render={({ field: { onChange, value } }) => (
                <ThemedSelect
                  label="Méthode de préparation"
                  value={value}
                  onValueChange={onChange}
                  options={methodOptions}
                  error={errors.method?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="difficulty"
              rules={{ required: 'La difficulté est requise' }}
              render={({ field: { onChange, value } }) => (
                <ThemedSelect
                  label="Niveau de difficulté"
                  value={value}
                  onValueChange={onChange}
                  options={difficultyOptions}
                  error={errors.difficulty?.message}
                />
              )}
            />
          </ThemedView>
        </ThemedCollapsible>

        {/* Parameters Section */}
        <ThemedCollapsible title="Paramètres de brassage" showBorder={false}>
          <ThemedView noBackground style={styles.section}>
            <ThemedView noBackground style={styles.row}>
              <Controller
                control={control}
                name="coffee_grams"
                rules={{ 
                  required: 'La quantité de café est requise',
                  pattern: { value: /^\d+(\.\d+)?$/, message: 'Veuillez entrer un nombre valide' }
                }}
                render={({ field: { onChange, value } }) => (
                  <ThemedInput
                    label="Café (g)"
                    value={value}
                    onChangeText={onChange}
                    error={errors.coffee_grams?.message}
                    keyboardType="numeric"
                    style={styles.halfWidth}
                  />
                )}
              />

              <Controller
                control={control}
                name="water_grams"
                rules={{ 
                  required: 'La quantité d\'eau est requise',
                  pattern: { value: /^\d+(\.\d+)?$/, message: 'Veuillez entrer un nombre valide' }
                }}
                render={({ field: { onChange, value } }) => (
                  <ThemedInput
                    label="Eau (g)"
                    value={value}
                    onChangeText={onChange}
                    error={errors.water_grams?.message}
                    keyboardType="numeric"
                    style={styles.halfWidth}
                  />
                )}
              />
            </ThemedView>

            {calculateRatio() && (
              <ThemedText style={styles.ratioText}>
                Ratio: {calculateRatio()}
              </ThemedText>
            )}

            <ThemedView noBackground style={styles.row}>
              <Controller
                control={control}
                name="water_temp"
                rules={{ 
                  required: 'La température est requise',
                  pattern: { value: /^\d+(\.\d+)?$/, message: 'Veuillez entrer un nombre valide' }
                }}
                render={({ field: { onChange, value } }) => (
                  <ThemedInput
                    label="Température (°C)"
                    value={value}
                    onChangeText={onChange}
                    error={errors.water_temp?.message}
                    keyboardType="numeric"
                    style={styles.halfWidth}
                  />
                )}
              />

              <Controller
                control={control}
                name="grind_setting"
                render={({ field: { onChange, value } }) => (
                  <ThemedInput
                    label="Réglage mouture (optionnel)"
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
                control={control}
                name="bloom_time"
                render={({ field: { onChange, value } }) => (
                  <ThemedInput
                    label="Temps de bloom (s)"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    style={styles.halfWidth}
                  />
                )}
              />

              <Controller
                control={control}
                name="total_time"
                render={({ field: { onChange, value } }) => (
                  <ThemedInput
                    label="Temps total (s)"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    style={styles.halfWidth}
                  />
                )}
              />
            </ThemedView>
          </ThemedView>
        </ThemedCollapsible>

        {/* Target Metrics Section */}
        <ThemedCollapsible title="Objectifs de mesures (optionnel)" showBorder={false}>
          <ThemedView noBackground style={styles.section}>
            <ThemedView noBackground style={styles.row}>
              <Controller
                control={control}
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
                control={control}
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
                control={control}
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
                control={control}
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
          </ThemedView>
        </ThemedCollapsible>

        {/* Steps Section */}
        <ThemedCollapsible title="Étapes de préparation" showBorder={false}>
          <ThemedView noBackground style={styles.section}>
            {stepFields.map((field, index) => (
              <ThemedView key={field.id} style={styles.stepCard}>
                <ThemedView noBackground style={styles.stepHeader}>
                  <ThemedText style={styles.stepNumber}>Étape {index + 1}</ThemedText>
                  {stepFields.length > 1 && (
                    <ThemedButton
                      variant="destructive"
                      size="sm"
                      onPress={() => removeStep(index)}
                    >
                      Supprimer
                    </ThemedButton>
                  )}
                </ThemedView>

                <Controller
                  control={control}
                  name={`steps.${index}.title`}
                  rules={{ required: 'Le titre est requis' }}
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      label="Titre de l'étape"
                      value={value}
                      onChangeText={onChange}
                      error={errors.steps?.[index]?.title?.message}
                      placeholder="Bloom, Premier versement, etc."
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`steps.${index}.description`}
                  rules={{ required: 'La description est requise' }}
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextArea
                      label="Description"
                      value={value}
                      onChangeText={onChange}
                      error={errors.steps?.[index]?.description?.message}
                      placeholder="Décrivez cette étape..."
                      numberOfLines={2}
                    />
                  )}
                />

                <ThemedView noBackground style={styles.row}>
                  <Controller
                    control={control}
                    name={`steps.${index}.duration`}
                    rules={{ 
                      required: 'La durée est requise',
                      pattern: { value: /^\d+(\.\d+)?$/, message: 'Nombre valide requis' }
                    }}
                    render={({ field: { onChange, value } }) => (
                      <ThemedInput
                        label="Durée (s)"
                        value={value}
                        onChangeText={onChange}
                        error={errors.steps?.[index]?.duration?.message}
                        keyboardType="numeric"
                        style={styles.halfWidth}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`steps.${index}.water_amount`}
                    rules={{ 
                      required: 'La quantité d\'eau est requise',
                      pattern: { value: /^\d+(\.\d+)?$/, message: 'Nombre valide requis' }
                    }}
                    render={({ field: { onChange, value } }) => (
                      <ThemedInput
                        label="Eau (g)"
                        value={value}
                        onChangeText={onChange}
                        error={errors.steps?.[index]?.water_amount?.message}
                        keyboardType="numeric"
                        style={styles.halfWidth}
                      />
                    )}
                  />
                </ThemedView>

                <ThemedView noBackground style={styles.row}>
                  <Controller
                    control={control}
                    name={`steps.${index}.technique`}
                    rules={{ required: 'La technique est requise' }}
                    render={({ field: { onChange, value } }) => (
                      <ThemedSelect
                        label="Technique"
                        value={value}
                        onValueChange={onChange}
                        options={techniqueOptions}
                        error={errors.steps?.[index]?.technique?.message}
                        style={styles.halfWidth}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`steps.${index}.temperature`}
                    render={({ field: { onChange, value } }) => (
                      <ThemedInput
                        label="Temp. spécifique (°C)"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numeric"
                        style={styles.halfWidth}
                      />
                    )}
                  />
                </ThemedView>
              </ThemedView>
            ))}

            <ThemedButton variant="outline" onPress={addStep}>
              Ajouter une étape
            </ThemedButton>
          </ThemedView>
        </ThemedCollapsible>

        {/* Action Buttons */}
        <ThemedView noBackground style={styles.actions}>
          <ThemedButton 
            variant="outline" 
            onPress={onCancel}
            style={styles.actionButton}
          >
            Annuler
          </ThemedButton>
          
          <ThemedButton
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.actionButton}
          >
            Créer la recette
          </ThemedButton>
        </ThemedView>
      </ThemedView>
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    gap: 16,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  ratioText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: -8,
    marginBottom: 8,
  },
  stepCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
});