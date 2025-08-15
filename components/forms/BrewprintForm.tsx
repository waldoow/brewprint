import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedInput } from '@/components/ui/ThemedInput';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedBadge } from '@/components/ui/ThemedBadge';
import { InteractiveSlider } from '@/components/ui/InteractiveSlider';
import { RatingInput } from '@/components/ui/RatingInput';
import { Header } from '@/components/ui/Header';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BrewprintsService, type BrewprintInput, type Brewprint, type BrewStep } from '@/lib/services/brewprints';
import { BeansService } from '@/lib/services/beans';
import { GrindersService } from '@/lib/services/grinders';
import { BrewersService } from '@/lib/services/brewers';
import { WaterProfilesService } from '@/lib/services/water-profiles';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

// Form validation schema
const brewprintSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  method: z.enum(['v60', 'chemex', 'french-press', 'aeropress', 'espresso', 'cold-brew', 'siphon', 'percolator', 'turkish', 'moka']),
  difficulty: z.enum([1, 2, 3]),
  bean_id: z.string().optional(),
  grinder_id: z.string().optional(),
  brewer_id: z.string().optional(),
  water_profile_id: z.string().optional(),
  coffee_grams: z.number().min(1, 'Coffee amount required').max(200, 'Amount too high'),
  water_grams: z.number().min(1, 'Water amount required').max(2000, 'Amount too high'),
  water_temp: z.number().min(50, 'Temperature too low').max(100, 'Temperature too high'),
  grind_setting: z.number().min(1).max(20).optional(),
  bloom_time: z.number().min(0).max(120).optional(),
  total_time: z.number().min(30, 'Time too short').max(600, 'Time too long'),
});

type FormData = z.infer<typeof brewprintSchema>;

interface BrewprintFormProps {
  brewprint?: Brewprint;
  onSave?: (brewprint: Brewprint) => void;
  onCancel?: () => void;
}

const BREWING_METHODS = [
  { value: 'v60', label: 'V60', icon: '☕' },
  { value: 'chemex', label: 'Chemex', icon: '🧪' },
  { value: 'french-press', label: 'French Press', icon: '🫖' },
  { value: 'aeropress', label: 'AeroPress', icon: '💨' },
  { value: 'espresso', label: 'Espresso', icon: '⚡' },
  { value: 'cold-brew', label: 'Cold Brew', icon: '🧊' },
  { value: 'siphon', label: 'Siphon', icon: '🔥' },
  { value: 'percolator', label: 'Percolator', icon: '♻️' },
  { value: 'turkish', label: 'Turkish', icon: '🏺' },
  { value: 'moka', label: 'Moka Pot', icon: '⛰️' },
] as const;

export function BrewprintForm({ brewprint, onSave, onCancel }: BrewprintFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [loading, setLoading] = useState(false);
  const [beans, setBeans] = useState<Array<{id: string, name: string, roaster?: string}>>([]);
  const [grinders, setGrinders] = useState<Array<{id: string, name: string, brand?: string}>>([]);
  const [brewers, setBrewers] = useState<Array<{id: string, name: string, type: string}>>([]);
  const [waterProfiles, setWaterProfiles] = useState<Array<{id: string, name: string}>>([]);
  const [steps, setSteps] = useState<BrewStep[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(brewprintSchema),
    defaultValues: {
      name: '',
      description: '',
      method: 'v60',
      difficulty: 2,
      coffee_grams: 20,
      water_grams: 320,
      water_temp: 90,
      grind_setting: 5,
      bloom_time: 30,
      total_time: 240,
    }
  });

  const selectedMethod = watch('method');
  const coffeeGrams = watch('coffee_grams');
  const waterGrams = watch('water_grams');
  const ratio = waterGrams && coffeeGrams ? (waterGrams / coffeeGrams).toFixed(1) : '16.0';

  // Load form data if editing existing brewprint
  useEffect(() => {
    if (brewprint) {
      reset({
        name: brewprint.name,
        description: brewprint.description || '',
        method: brewprint.method,
        difficulty: brewprint.difficulty,
        bean_id: brewprint.bean_id,
        grinder_id: brewprint.grinder_id,
        brewer_id: brewprint.brewer_id,
        water_profile_id: brewprint.water_profile_id,
        coffee_grams: brewprint.parameters.coffee_grams,
        water_grams: brewprint.parameters.water_grams,
        water_temp: brewprint.parameters.water_temp,
        grind_setting: brewprint.parameters.grind_setting,
        bloom_time: brewprint.parameters.bloom_time,
        total_time: brewprint.parameters.total_time,
      });
      setSteps(brewprint.steps || []);
    }
  }, [brewprint, reset]);

  // Load equipment options
  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const [beansResult, grindersResult, brewersResult, waterResult] = await Promise.all([
        BeansService.getAllBeans(),
        GrindersService.getAllGrinders(),
        BrewersService.getAllBrewers(),
        WaterProfilesService.getAllWaterProfiles()
      ]);

      if (beansResult.success) {
        setBeans(beansResult.data?.map(b => ({
          id: b.id,
          name: b.name,
          roaster: b.roaster
        })) || []);
      }

      if (grindersResult.success) {
        setGrinders(grindersResult.data?.map(g => ({
          id: g.id,
          name: g.name,
          brand: g.brand
        })) || []);
      }

      if (brewersResult.success) {
        setBrewers(brewersResult.data?.map(b => ({
          id: b.id,
          name: b.name,
          type: b.type
        })) || []);
      }

      if (waterResult.success) {
        setWaterProfiles(waterResult.data?.map(w => ({
          id: w.id,
          name: w.name
        })) || []);
      }
    } catch (error) {
      console.error('Failed to load equipment:', error);
    }
  };

  // Generate default steps based on method
  useEffect(() => {
    if (!brewprint && selectedMethod && steps.length === 0) {
      generateDefaultSteps(selectedMethod);
    }
  }, [selectedMethod, brewprint]);

  const generateDefaultSteps = (method: string) => {
    const defaultSteps: Record<string, BrewStep[]> = {
      v60: [
        { id: 1, order: 1, title: 'Bloom', description: 'Pour 2x coffee weight in water', duration: 30, water_amount: coffeeGrams * 2, technique: 'circular' },
        { id: 2, order: 2, title: 'First Pour', description: 'Pour to 60% total water', duration: 30, water_amount: waterGrams * 0.4, technique: 'circular' },
        { id: 3, order: 3, title: 'Final Pour', description: 'Pour remaining water', duration: 60, water_amount: waterGrams * 0.4, technique: 'center-pour' },
        { id: 4, order: 4, title: 'Drawdown', description: 'Let coffee finish dripping', duration: 120, water_amount: 0, technique: 'wait' }
      ],
      chemex: [
        { id: 1, order: 1, title: 'Bloom', description: 'Pour 2.5x coffee weight', duration: 45, water_amount: coffeeGrams * 2.5, technique: 'spiral' },
        { id: 2, order: 2, title: 'Main Pour', description: 'Pour steadily to total water', duration: 180, water_amount: waterGrams - (coffeeGrams * 2.5), technique: 'steady-stream' },
        { id: 3, order: 3, title: 'Drawdown', description: 'Wait for complete extraction', duration: 120, water_amount: 0, technique: 'wait' }
      ],
      aeropress: [
        { id: 1, order: 1, title: 'Add Coffee', description: 'Add ground coffee to chamber', duration: 10, water_amount: 0, technique: 'preparation' },
        { id: 2, order: 2, title: 'Add Water', description: 'Pour all water and stir', duration: 10, water_amount: waterGrams, technique: 'stir' },
        { id: 3, order: 3, title: 'Steep', description: 'Let coffee steep', duration: 90, water_amount: 0, technique: 'wait' },
        { id: 4, order: 4, title: 'Press', description: 'Press down slowly', duration: 30, water_amount: 0, technique: 'press' }
      ]
    };

    const methodSteps = defaultSteps[method] || [];
    setSteps(methodSteps);
  };

  const addStep = () => {
    const newStep: BrewStep = {
      id: Date.now(),
      order: steps.length + 1,
      title: 'New Step',
      description: '',
      duration: 30,
      water_amount: 50,
      technique: 'pour'
    };
    setSteps([...steps, newStep]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateStep = (id: number, field: keyof BrewStep, value: any) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const removeStep = (id: number) => {
    setSteps(steps.filter(step => step.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const brewprintData: BrewprintInput = {
        name: data.name,
        description: data.description,
        method: data.method,
        difficulty: data.difficulty,
        bean_id: data.bean_id || undefined,
        grinder_id: data.grinder_id || undefined,
        brewer_id: data.brewer_id || undefined,
        water_profile_id: data.water_profile_id || undefined,
        parameters: {
          coffee_grams: data.coffee_grams,
          water_grams: data.water_grams,
          water_temp: data.water_temp,
          grind_setting: data.grind_setting,
          bloom_time: data.bloom_time,
          total_time: data.total_time,
          ratio: `1:${ratio}`
        },
        steps: steps
      };

      let result;
      if (brewprint) {
        result = await BrewprintsService.updateBrewprint({
          id: brewprint.id,
          ...brewprintData
        });
      } else {
        result = await BrewprintsService.createBrewprint(brewprintData);
      }

      if (result.success && result.data) {
        toast.success(brewprint ? 'Recipe updated!' : 'Recipe created!');
        onSave?.(result.data);
      } else {
        toast.error(result.error || 'Failed to save recipe');
      }
    } catch (error) {
      toast.error('Failed to save recipe');
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const difficultyLabels = {
    1: { label: 'Easy', color: colors.success },
    2: { label: 'Medium', color: colors.warning },
    3: { label: 'Hard', color: colors.error }
  };

  return (
    <ThemedView style={styles.container}>
      <Header
        title={brewprint ? 'RECIPE MODIFICATION' : 'NEW RECIPE PROTOCOL'}
        subtitle={`${brewprint ? 'Edit' : 'Create'} advanced brewing specifications`}
        onBack={onCancel}
        rightAction={{
          label: 'SAVE',
          onPress: handleSubmit(onSubmit),
          loading: loading
        }}
        showTopSpacing={true}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Basic Info Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            RECIPE SPECIFICATIONS
          </ThemedText>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <ThemedInput
                label="Recipe Name"
                value={value}
                onChangeText={onChange}
                placeholder="My Perfect V60"
                error={errors.name?.message}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <ThemedInput
                label="Description (Optional)"
                value={value || ''}
                onChangeText={onChange}
                placeholder="Notes about this recipe..."
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            )}
          />

          {/* Brewing Method Selection */}
          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            EXTRACTION METHOD
          </ThemedText>
          <View style={styles.methodGrid}>
            {BREWING_METHODS.map((method) => (
              <Controller
                key={method.value}
                control={control}
                name="method"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[
                      styles.methodCard,
                      { 
                        backgroundColor: value === method.value 
                          ? colors.primary 
                          : colors.cardBackgroundSecondary,
                        borderColor: value === method.value 
                          ? colors.primary 
                          : colors.border
                      }
                    ]}
                    onPress={() => {
                      onChange(method.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={styles.methodIcon}>{method.icon}</Text>
                    <ThemedText 
                      type="caption" 
                      style={[
                        styles.methodLabel,
                        { color: value === method.value ? '#fff' : colors.text }
                      ]}
                    >
                      {method.label}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>

          {/* Difficulty */}
          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
            COMPLEXITY LEVEL
          </ThemedText>
          <Controller
            control={control}
            name="difficulty"
            render={({ field: { onChange, value } }) => (
              <View style={styles.difficultyContainer}>
                {[1, 2, 3].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      { 
                        backgroundColor: value === level 
                          ? difficultyLabels[level as keyof typeof difficultyLabels].color
                          : colors.cardBackgroundSecondary 
                      }
                    ]}
                    onPress={() => {
                      onChange(level);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <ThemedText 
                      type="defaultSemiBold"
                      style={[
                        styles.difficultyText,
                        { color: value === level ? '#fff' : colors.text }
                      ]}
                    >
                      {difficultyLabels[level as keyof typeof difficultyLabels].label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Brewing Parameters Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            EXTRACTION PARAMETERS
          </ThemedText>

          <View style={styles.ratioContainer}>
            <View style={styles.amountInput}>
              <Controller
                control={control}
                name="coffee_grams"
                render={({ field: { onChange, value } }) => (
                  <InteractiveSlider
                    label="Coffee"
                    min={10}
                    max={50}
                    value={value}
                    onChange={onChange}
                    unit="g"
                  />
                )}
              />
            </View>

            <View style={styles.ratioDisplay}>
              <ThemedText type="caption" style={{ opacity: 0.6 }}>
                Ratio
              </ThemedText>
              <ThemedText type="subtitle" style={styles.ratioText}>
                1:{ratio}
              </ThemedText>
            </View>

            <View style={styles.amountInput}>
              <Controller
                control={control}
                name="water_grams"
                render={({ field: { onChange, value } }) => (
                  <InteractiveSlider
                    label="Water"
                    min={150}
                    max={800}
                    value={value}
                    onChange={onChange}
                    unit="g"
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="water_temp"
            render={({ field: { onChange, value } }) => (
              <InteractiveSlider
                label="Water Temperature"
                min={80}
                max={100}
                value={value}
                onChange={onChange}
                unit="°C"
                style={styles.slider}
              />
            )}
          />

          <Controller
            control={control}
            name="grind_setting"
            render={({ field: { onChange, value } }) => (
              <InteractiveSlider
                label="Grind Setting (Optional)"
                min={1}
                max={20}
                value={value || 5}
                onChange={onChange}
                unit=""
                style={styles.slider}
              />
            )}
          />

          <View style={styles.timeInputs}>
            <View style={styles.timeInput}>
              <Controller
                control={control}
                name="bloom_time"
                render={({ field: { onChange, value } }) => (
                  <InteractiveSlider
                    label="Bloom Time"
                    min={0}
                    max={120}
                    value={value || 30}
                    onChange={onChange}
                    unit="s"
                  />
                )}
              />
            </View>

            <View style={styles.timeInput}>
              <Controller
                control={control}
                name="total_time"
                render={({ field: { onChange, value } }) => (
                  <InteractiveSlider
                    label="Total Time"
                    min={60}
                    max={600}
                    value={value}
                    onChange={onChange}
                    unit="s"
                  />
                )}
              />
            </View>
          </View>
        </View>

        {/* Brewing Steps Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              PROTOCOL STEPS ({steps.length})
            </ThemedText>
            <ThemedButton
              title="Add Step"
              onPress={addStep}
              variant="ghost"
              size="sm"
            />
          </View>

          {steps.map((step, index) => (
            <View key={step.id} style={[styles.stepCard, { backgroundColor: colors.cardBackgroundSecondary }]}>
              <View style={styles.stepHeader}>
                <ThemedBadge variant="outline" size="sm">
                  Step {index + 1}
                </ThemedBadge>
                <TouchableOpacity
                  onPress={() => removeStep(step.id)}
                  style={styles.removeButton}
                >
                  <ThemedText type="caption" style={{ color: colors.error }}>
                    Remove
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedInput
                label="Title"
                value={step.title}
                onChangeText={(text) => updateStep(step.id, 'title', text)}
                style={styles.stepInput}
              />

              <ThemedInput
                label="Description"
                value={step.description}
                onChangeText={(text) => updateStep(step.id, 'description', text)}
                multiline
                numberOfLines={2}
                style={styles.stepInput}
              />

              <View style={styles.stepParams}>
                <View style={styles.stepParam}>
                  <InteractiveSlider
                    label="Duration"
                    min={5}
                    max={300}
                    value={step.duration}
                    onChange={(value) => updateStep(step.id, 'duration', value)}
                    unit="s"
                  />
                </View>

                <View style={styles.stepParam}>
                  <InteractiveSlider
                    label="Water Amount"
                    min={0}
                    max={500}
                    value={step.water_amount}
                    onChange={(value) => updateStep(step.id, 'water_amount', value)}
                    unit="g"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Equipment Selection (Optional) */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            EQUIPMENT LINKING
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Associate specific equipment for consistent extraction results
          </ThemedText>

          <Controller
            control={control}
            name="bean_id"
            render={({ field: { onChange, value } }) => (
              <View style={styles.equipmentSelect}>
                <ThemedText style={[styles.equipmentLabel, { color: colors.textSecondary }]}>
                  BEAN SELECTION
                </ThemedText>
                <View style={styles.equipmentOptions}>
                  <TouchableOpacity
                    style={[
                      styles.equipmentOption,
                      { 
                        backgroundColor: !value ? colors.primary : colors.cardBackgroundSecondary,
                        borderColor: !value ? colors.primary : colors.border
                      }
                    ]}
                    onPress={() => onChange(undefined)}
                  >
                    <ThemedText 
                      type="caption"
                      style={{ color: !value ? '#fff' : colors.text }}
                    >
                      Any Beans
                    </ThemedText>
                  </TouchableOpacity>
                  {beans.slice(0, 3).map((bean) => (
                    <TouchableOpacity
                      key={bean.id}
                      style={[
                        styles.equipmentOption,
                        { 
                          backgroundColor: value === bean.id ? colors.primary : colors.cardBackgroundSecondary,
                          borderColor: value === bean.id ? colors.primary : colors.border
                        }
                      ]}
                      onPress={() => onChange(bean.id)}
                    >
                      <ThemedText 
                        type="caption"
                        style={{ color: value === bean.id ? '#fff' : colors.text }}
                      >
                        {bean.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  
  // Advanced minimal sections
  section: {
    padding: 16,
    borderRadius: 8, // 8px border radius for minimal design
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(139, 92, 246, 0.8)', // Primary color left border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 11,
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  // Professional form elements
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  methodCard: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '48%',
    alignItems: 'center',
    padding: 8, // Reduced padding
    borderRadius: 8, // 8px border radius
    borderWidth: 1,
  },
  methodIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  methodLabel: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  difficultyButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8, // 8px border radius
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  ratioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  amountInput: {
    flex: 1,
  },
  ratioDisplay: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  ratioText: {
    marginTop: 4,
    fontWeight: '700',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  slider: {
    marginBottom: 16,
  },
  timeInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInput: {
    flex: 1,
  },
  
  // Advanced step cards
  stepCard: {
    padding: 12,
    borderRadius: 8, // 8px border radius
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(139, 92, 246, 0.6)',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  removeButton: {
    padding: 4,
  },
  stepInput: {
    marginBottom: 12,
  },
  stepParams: {
    flexDirection: 'row',
    gap: 16,
  },
  stepParam: {
    flex: 1,
  },
  
  // Professional equipment selection
  equipmentSelect: {
    marginBottom: 16,
  },
  equipmentLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  equipmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8, // 8px border radius
    borderWidth: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});