import React, { useState, useEffect } from 'react';
import {
  Switch,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native-ui-lib';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface UserPreferences {
  temperatureUnit: 'celsius' | 'fahrenheit';
  weightUnit: 'grams' | 'ounces';
  volumeUnit: 'ml' | 'fl_oz';
  timerAutoStart: boolean;
  hapticFeedback: boolean;
  autoSaveBrews: boolean;
  showDetailedMetrics: boolean;
  defaultBrewMethod: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  temperatureUnit: 'celsius',
  weightUnit: 'grams',
  volumeUnit: 'ml',
  timerAutoStart: false,
  hapticFeedback: true,
  autoSaveBrews: true,
  showDetailedMetrics: false,
  defaultBrewMethod: 'v60',
};

const TEMPERATURE_UNITS = [
  { value: 'celsius', label: 'Celsius (°C)' },
  { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
];

const WEIGHT_UNITS = [
  { value: 'grams', label: 'Grams (g)' },
  { value: 'ounces', label: 'Ounces (oz)' },
];

const VOLUME_UNITS = [
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'fl_oz', label: 'Fluid Ounces (fl oz)' },
];

const BREW_METHODS = [
  { value: 'v60', label: 'V60' },
  { value: 'chemex', label: 'Chemex' },
  { value: 'french-press', label: 'French Press' },
  { value: 'aeropress', label: 'AeroPress' },
  { value: 'espresso', label: 'Espresso' },
];

export default function PreferencesScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      setSaving(true);
      await AsyncStorage.setItem('user_preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
      
      if (newPreferences.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 64,
      paddingBottom: 24,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 8,
    },
    backButtonText: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    pageTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    pageSubtitle: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      gap: 32,
    },
    section: {
      gap: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginBottom: 16,
    },
    unitGroup: {
      marginBottom: 20,
      gap: 12,
    },
    unitLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    unitRow: {
      flexDirection: 'row',
      gap: 8,
    },
    unitOption: {
      flex: 1,
      padding: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    unitOptionSelected: {
      borderColor: theme.colors.info,
      backgroundColor: 'rgba(37, 99, 235, 0.05)',
    },
    unitOptionText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    unitOptionTextSelected: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.info,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },
    methodOption: {
      padding: 16,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    methodOptionSelected: {
      borderColor: theme.colors.info,
      backgroundColor: 'rgba(37, 99, 235, 0.05)',
    },
    methodText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    methodTextSelected: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.info,
    },
    methodList: {
      gap: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>
            Preferences
          </Text>
          <Text style={styles.pageSubtitle}>
            Customize your brewing experience
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading preferences...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>
          Preferences
        </Text>
        <Text style={styles.pageSubtitle}>
          Customize your brewing experience
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Units Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Units of Measurement
          </Text>
          <Text style={styles.sectionSubtitle}>
            Choose your preferred units for brewing
          </Text>
          
          <View style={styles.unitGroup}>
            <Text style={styles.unitLabel}>Temperature</Text>
            <View style={styles.unitRow}>
              {TEMPERATURE_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitOption,
                    preferences.temperatureUnit === unit.value && styles.unitOptionSelected
                  ]}
                  onPress={() => updatePreference('temperatureUnit', unit.value as 'celsius' | 'fahrenheit')}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      styles.unitOptionText,
                      preferences.temperatureUnit === unit.value && styles.unitOptionTextSelected
                    ]}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.unitGroup}>
            <Text style={styles.unitLabel}>Weight</Text>
            <View style={styles.unitRow}>
              {WEIGHT_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitOption,
                    preferences.weightUnit === unit.value && styles.unitOptionSelected
                  ]}
                  onPress={() => updatePreference('weightUnit', unit.value as 'grams' | 'ounces')}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      styles.unitOptionText,
                      preferences.weightUnit === unit.value && styles.unitOptionTextSelected
                    ]}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.unitGroup}>
            <Text style={styles.unitLabel}>Volume</Text>
            <View style={styles.unitRow}>
              {VOLUME_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitOption,
                    preferences.volumeUnit === unit.value && styles.unitOptionSelected
                  ]}
                  onPress={() => updatePreference('volumeUnit', unit.value as 'ml' | 'fl_oz')}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      styles.unitOptionText,
                      preferences.volumeUnit === unit.value && styles.unitOptionTextSelected
                    ]}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Brewing Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Brewing Preferences
          </Text>
          <Text style={styles.sectionSubtitle}>
            Customize your brewing workflow
          </Text>
          
          <View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Timer Auto-Start</Text>
                <Text style={styles.settingDescription}>
                  Automatically start timer when brewing begins
                </Text>
              </View>
              <Switch
                value={preferences.timerAutoStart}
                onValueChange={(value) => updatePreference('timerAutoStart', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.info }}
                thumbColor={theme.colors.background}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Auto-Save Brews</Text>
                <Text style={styles.settingDescription}>
                  Automatically save brewing sessions when completed
                </Text>
              </View>
              <Switch
                value={preferences.autoSaveBrews}
                onValueChange={(value) => updatePreference('autoSaveBrews', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.info }}
                thumbColor={theme.colors.background}
              />
            </View>

            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Detailed Metrics</Text>
                <Text style={styles.settingDescription}>
                  Show advanced brewing metrics and analytics
                </Text>
              </View>
              <Switch
                value={preferences.showDetailedMetrics}
                onValueChange={(value) => updatePreference('showDetailedMetrics', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.info }}
                thumbColor={theme.colors.background}
              />
            </View>
          </View>
        </View>

        {/* App Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            App Experience
          </Text>
          <Text style={styles.sectionSubtitle}>
            Customize interface and feedback
          </Text>
          
          <View>
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Haptic Feedback</Text>
                <Text style={styles.settingDescription}>
                  Enable vibration feedback for interactions
                </Text>
              </View>
              <Switch
                value={preferences.hapticFeedback}
                onValueChange={(value) => updatePreference('hapticFeedback', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.info }}
                thumbColor={theme.colors.background}
              />
            </View>
          </View>
        </View>

        {/* Default Brew Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Default Brew Method
          </Text>
          <Text style={styles.sectionSubtitle}>
            Select your preferred brewing method
          </Text>
          
          <View style={styles.methodList}>
            {BREW_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.methodOption,
                  preferences.defaultBrewMethod === method.value && styles.methodOptionSelected
                ]}
                onPress={() => updatePreference('defaultBrewMethod', method.value)}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.methodText,
                    preferences.defaultBrewMethod === method.value && styles.methodTextSelected
                  ]}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}