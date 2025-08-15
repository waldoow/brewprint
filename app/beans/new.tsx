import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedInput } from '@/components/ui/ThemedInput';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { Header } from '@/components/ui/Header';
import { InteractiveSlider } from '@/components/ui/InteractiveSlider';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BeansService, type BeanInput } from '@/lib/services/beans';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

// Validation schema
const newBeanSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  roaster: z.string().optional(),
  origin: z.string().optional(),
  variety: z.string().optional(),
  process: z.string().optional(),
  roast_level: z.enum(['light', 'light-medium', 'medium', 'medium-dark', 'dark']).optional(),
  weight_grams: z.number().min(0, 'Weight must be positive').max(10000, 'Weight too high').optional(),
  price: z.number().min(0, 'Price must be positive').max(1000, 'Price too high').optional(),
  altitude: z.number().min(0).max(5000).optional(),
  roast_date: z.string().optional(),
  purchase_date: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof newBeanSchema>;

const ROAST_LEVELS = [
  { value: 'light', label: 'Light Roast', color: '#D2B48C' },
  { value: 'light-medium', label: 'Light-Medium', color: '#CD853F' },
  { value: 'medium', label: 'Medium', color: '#A0522D' },
  { value: 'medium-dark', label: 'Medium-Dark', color: '#8B4513' },
  { value: 'dark', label: 'Dark Roast', color: '#654321' },
] as const;

export default function NewBeanScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(newBeanSchema),
    defaultValues: {
      name: '',
      roaster: '',
      origin: '',
      variety: '',
      process: '',
      roast_level: 'medium',
      weight_grams: 340,
      price: 25,
      altitude: 1500,
      roast_date: new Date().toISOString().split('T')[0],
      purchase_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const selectedRoastLevel = watch('roast_level');

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const beanData: BeanInput = {
        ...data,
        // Convert empty strings to undefined
        roaster: data.roaster || undefined,
        origin: data.origin || undefined,
        variety: data.variety || undefined,
        process: data.process || undefined,
        notes: data.notes || undefined,
        // Convert date strings to ISO dates if provided
        roast_date: data.roast_date ? new Date(data.roast_date).toISOString() : undefined,
        purchase_date: data.purchase_date ? new Date(data.purchase_date).toISOString() : undefined,
        // Convert 0 values to undefined for optional numeric fields
        weight_grams: data.weight_grams || undefined,
        price: data.price || undefined,
        altitude: data.altitude || undefined,
      };

      const result = await BeansService.createBean(beanData);
      
      if (result.success) {
        toast.success('Bean added successfully!');
        router.back();
      } else {
        toast.error(result.error || 'Failed to create bean');
      }
    } catch (error) {
      console.error('Failed to create bean:', error);
      toast.error('Failed to create bean');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      // Show confirmation dialog if form has changes
      // For now, just go back
      router.back();
    } else {
      router.back();
    }
  };

  const selectedRoastColor = ROAST_LEVELS.find(r => r.value === selectedRoastLevel)?.color || colors.primary;

  return (
    <ThemedView style={styles.container}>
      <Header
        title="Add New Bean"
        onBack={handleCancel}
        rightAction={{
          label: 'Save',
          onPress: handleSubmit(onSubmit),
          loading: saving,
          disabled: !isDirty
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bean Preview Card */}
          <LinearGradient
            colors={[selectedRoastColor, colors.gradientEnd]}
            style={styles.previewCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText type="title" style={styles.previewTitle}>
              {watch('name') || 'New Bean'}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.previewSubtitle}>
              {watch('roaster') || 'Roaster'} • {watch('origin') || 'Origin'}
            </ThemedText>
          </LinearGradient>

          {/* Basic Information */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              Basic Information
            </ThemedText>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Bean Name *"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ethiopian Yirgacheffe"
                  error={errors.name?.message}
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="roaster"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Roaster"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Blue Bottle Coffee"
                  style={styles.input}
                />
              )}
            />

            <Controller
              control={control}
              name="origin"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Origin"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Ethiopia, Yirgacheffe"
                  style={styles.input}
                />
              )}
            />

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Controller
                  control={control}
                  name="variety"
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      label="Variety"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Heirloom"
                    />
                  )}
                />
              </View>

              <View style={styles.inputHalf}>
                <Controller
                  control={control}
                  name="process"
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      label="Process"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Washed"
                    />
                  )}
                />
              </View>
            </View>
          </View>

          {/* Roast Information */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              Roast Information
            </ThemedText>

            <ThemedText type="defaultSemiBold" style={[styles.label, { color: colors.text }]}>
              Roast Level
            </ThemedText>
            <View style={styles.roastLevels}>
              {ROAST_LEVELS.map((roast) => (
                <Controller
                  key={roast.value}
                  control={control}
                  name="roast_level"
                  render={({ field: { onChange, value } }) => (
                    <TouchableOpacity
                      style={[
                        styles.roastButton,
                        {
                          backgroundColor: value === roast.value ? roast.color : colors.surface,
                          borderColor: value === roast.value ? roast.color : colors.border,
                        }
                      ]}
                      onPress={() => {
                        onChange(roast.value);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <ThemedText
                        type="caption"
                        style={[
                          styles.roastText,
                          { color: value === roast.value ? '#fff' : colors.text }
                        ]}
                      >
                        {roast.label}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                />
              ))}
            </View>

            <View style={styles.dateInputs}>
              <View style={styles.dateInput}>
                <Controller
                  control={control}
                  name="roast_date"
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      label="Roast Date"
                      value={value}
                      onChangeText={onChange}
                      placeholder="YYYY-MM-DD"
                      keyboardType="default"
                    />
                  )}
                />
              </View>

              <View style={styles.dateInput}>
                <Controller
                  control={control}
                  name="purchase_date"
                  render={({ field: { onChange, value } }) => (
                    <ThemedInput
                      label="Purchase Date"
                      value={value}
                      onChangeText={onChange}
                      placeholder="YYYY-MM-DD"
                      keyboardType="default"
                    />
                  )}
                />
              </View>
            </View>
          </View>

          {/* Physical Properties */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              Physical Properties
            </ThemedText>

            <Controller
              control={control}
              name="weight_grams"
              render={({ field: { onChange, value } }) => (
                <InteractiveSlider
                  label="Weight (grams)"
                  min={50}
                  max={2000}
                  value={value || 340}
                  onChange={onChange}
                  unit="g"
                  style={styles.slider}
                />
              )}
            />

            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, value } }) => (
                <InteractiveSlider
                  label="Price (USD)"
                  min={5}
                  max={200}
                  value={value || 25}
                  onChange={onChange}
                  unit="$"
                  style={styles.slider}
                />
              )}
            />

            <Controller
              control={control}
              name="altitude"
              render={({ field: { onChange, value } }) => (
                <InteractiveSlider
                  label="Altitude (meters)"
                  min={500}
                  max={3000}
                  value={value || 1500}
                  onChange={onChange}
                  unit="m"
                  style={styles.slider}
                />
              )}
            />
          </View>

          {/* Tasting Notes */}
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              Tasting Notes
            </ThemedText>

            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, value } }) => (
                <ThemedInput
                  label="Notes"
                  value={value}
                  onChangeText={onChange}
                  placeholder="Floral, citrus, bright acidity, notes of bergamot..."
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                />
              )}
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  previewCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  previewTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 4,
    textAlign: 'center',
  },
  previewSubtitle: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
  },
  roastLevels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  roastButton: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '48%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  roastText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  slider: {
    marginBottom: 20,
  },
  textArea: {
    minHeight: 80,
  },
  bottomSpacing: {
    height: 20,
  },
});