import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { ThemedInput } from '@/components/ui/ThemedInput';
import { ThemedSelect } from '@/components/ui/ThemedSelect';
import { ThemedTextArea } from '@/components/ui/ThemedTextArea';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';

// Form validation schema
const beanFormSchema = z.object({
  name: z.string().min(2, 'Bean name must be at least 2 characters'),
  origin: z.string().min(2, 'Origin must be at least 2 characters'),
  roastLevel: z.enum(['light', 'medium', 'dark'], {
    required_error: 'Please select a roast level',
  }),
  weight: z.number().min(1, 'Weight must be greater than 0'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  notes: z.string().optional(),
});

type BeanFormValues = z.infer<typeof beanFormSchema>;

const roastLevelOptions = [
  { label: 'Light Roast', value: 'light' },
  { label: 'Medium Roast', value: 'medium' },
  { label: 'Dark Roast', value: 'dark' },
];

export default function FormExample() {
  const form = useForm<BeanFormValues>({
    resolver: zodResolver(beanFormSchema),
    defaultValues: {
      name: '',
      origin: '',
      roastLevel: undefined,
      weight: 0,
      price: 0,
      notes: '',
    },
  });

  const onSubmit = (data: BeanFormValues) => {
    console.log('Form submitted:', data);
    // Handle form submission here
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Add New Coffee Bean</ThemedText>
      <ThemedText style={styles.subtitle}>
        Fill in the details for your coffee bean inventory
      </ThemedText>

      <Form {...form}>
        <View style={styles.form}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bean Name</FormLabel>
                <FormControl>
                  <ThemedInput
                    placeholder="Ethiopian Yirgacheffe"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormDescription>
                  Enter the name or variety of the coffee bean
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin</FormLabel>
                <FormControl>
                  <ThemedInput
                    placeholder="Ethiopia, Gedeo Zone"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormDescription>
                  Specify the region or country where the bean was grown
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roastLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Roast Level</FormLabel>
                <FormControl>
                  <ThemedSelect
                    placeholder="Select roast level"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={roastLevelOptions}
                  />
                </FormControl>
                <FormDescription>
                  Choose the roast level of your coffee beans
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (g)</FormLabel>
                    <FormControl>
                      <ThemedInput
                        placeholder="250"
                        value={field.value?.toString() || ''}
                        onChangeText={(text) => {
                          const num = parseFloat(text) || 0;
                          field.onChange(num);
                        }}
                        onBlur={field.onBlur}
                        keyboardType="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </View>

            <View style={styles.halfWidth}>
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <ThemedInput
                        placeholder="18.99"
                        value={field.value?.toString() || ''}
                        onChangeText={(text) => {
                          const num = parseFloat(text) || 0;
                          field.onChange(num);
                        }}
                        onBlur={field.onBlur}
                        keyboardType="numeric"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </View>
          </View>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tasting Notes</FormLabel>
                <FormControl>
                  <ThemedTextArea
                    placeholder="Bright acidity, floral aroma, notes of citrus and bergamot..."
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                  />
                </FormControl>
                <FormDescription>
                  Optional notes about flavor profile, aroma, or brewing recommendations
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <View style={styles.buttonContainer}>
            <ThemedButton
              title="Add Bean to Library"
              onPress={form.handleSubmit(onSubmit)}
              loading={form.formState.isSubmitting}
              disabled={!form.formState.isValid}
              style={styles.submitButton}
            />
          </View>
        </View>
      </Form>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 24,
  },
  submitButton: {
    marginTop: 16,
  },
});