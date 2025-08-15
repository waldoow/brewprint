import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedBadge } from '@/components/ui/ThemedBadge';
import { Header } from '@/components/ui/Header';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

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
  const colors = Colors[colorScheme ?? 'dark'];

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
      
      toast.success('Preferences updated');
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

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Preferences" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ThemedText style={{ color: colors.textSecondary }}>
            Loading preferences...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Preferences" 
        onBack={() => router.back()}
        loading={saving}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Units Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Units
          </ThemedText>

          {/* Temperature Unit */}
          <View style={styles.settingRow}>
            <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
              Temperature
            </ThemedText>
            <View style={styles.unitOptions}>
              {TEMPERATURE_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitButton,
                    {
                      backgroundColor: preferences.temperatureUnit === unit.value 
                        ? colors.primary 
                        : colors.surface,
                      borderColor: preferences.temperatureUnit === unit.value 
                        ? colors.primary 
                        : colors.border,
                    }
                  ]}
                  onPress={() => updatePreference('temperatureUnit', unit.value as 'celsius' | 'fahrenheit')}
                >
                  <ThemedText
                    type="caption"
                    style={[
                      styles.unitText,
                      { color: preferences.temperatureUnit === unit.value ? '#fff' : colors.text }
                    ]}
                  >
                    {unit.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight Unit */}
          <View style={styles.settingRow}>
            <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
              Weight
            </ThemedText>
            <View style={styles.unitOptions}>
              {WEIGHT_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitButton,
                    {
                      backgroundColor: preferences.weightUnit === unit.value 
                        ? colors.primary 
                        : colors.surface,
                      borderColor: preferences.weightUnit === unit.value 
                        ? colors.primary 
                        : colors.border,
                    }
                  ]}
                  onPress={() => updatePreference('weightUnit', unit.value as 'grams' | 'ounces')}
                >
                  <ThemedText
                    type="caption"
                    style={[
                      styles.unitText,
                      { color: preferences.weightUnit === unit.value ? '#fff' : colors.text }
                    ]}
                  >
                    {unit.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Volume Unit */}
          <View style={styles.settingRow}>
            <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
              Volume
            </ThemedText>
            <View style={styles.unitOptions}>
              {VOLUME_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitButton,
                    {
                      backgroundColor: preferences.volumeUnit === unit.value 
                        ? colors.primary 
                        : colors.surface,
                      borderColor: preferences.volumeUnit === unit.value 
                        ? colors.primary 
                        : colors.border,
                    }
                  ]}
                  onPress={() => updatePreference('volumeUnit', unit.value as 'ml' | 'fl_oz')}
                >
                  <ThemedText
                    type="caption"
                    style={[
                      styles.unitText,
                      { color: preferences.volumeUnit === unit.value ? '#fff' : colors.text }
                    ]}
                  >
                    {unit.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Brewing Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Brewing
          </ThemedText>

          {/* Default Brew Method */}
          <View style={styles.settingRow}>
            <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
              Default Method
            </ThemedText>
            <View style={styles.methodOptions}>
              {BREW_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.value}
                  style={[
                    styles.methodButton,
                    {
                      backgroundColor: preferences.defaultBrewMethod === method.value 
                        ? colors.primary 
                        : colors.surface,
                      borderColor: preferences.defaultBrewMethod === method.value 
                        ? colors.primary 
                        : colors.border,
                    }
                  ]}
                  onPress={() => updatePreference('defaultBrewMethod', method.value)}
                >
                  <ThemedText
                    type="caption"
                    style={[
                      styles.methodText,
                      { color: preferences.defaultBrewMethod === method.value ? '#fff' : colors.text }
                    ]}
                  >
                    {method.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Auto-start Timer */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Auto-start Timer
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Start timer automatically when brewing begins
              </ThemedText>
            </View>
            <Switch
              value={preferences.timerAutoStart}
              onValueChange={(value) => updatePreference('timerAutoStart', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={preferences.timerAutoStart ? '#fff' : colors.text}
            />
          </View>

          {/* Auto-save Brews */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Auto-save Brews
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Automatically save completed brewing sessions
              </ThemedText>
            </View>
            <Switch
              value={preferences.autoSaveBrews}
              onValueChange={(value) => updatePreference('autoSaveBrews', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={preferences.autoSaveBrews ? '#fff' : colors.text}
            />
          </View>

          {/* Show Detailed Metrics */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Detailed Metrics
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Show advanced brewing metrics and analytics
              </ThemedText>
            </View>
            <Switch
              value={preferences.showDetailedMetrics}
              onValueChange={(value) => updatePreference('showDetailedMetrics', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={preferences.showDetailedMetrics ? '#fff' : colors.text}
            />
          </View>
        </View>

        {/* Interface Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Interface
          </ThemedText>

          {/* Haptic Feedback */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Haptic Feedback
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Vibration feedback for button taps and interactions
              </ThemedText>
            </View>
            <Switch
              value={preferences.hapticFeedback}
              onValueChange={(value) => updatePreference('hapticFeedback', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={preferences.hapticFeedback ? '#fff' : colors.text}
            />
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  settingRow: {
    marginBottom: 20,
  },
  settingLabel: {
    marginBottom: 8,
    fontSize: 14,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  unitOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  unitButton: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  methodOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  methodButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  bottomSpacing: {
    height: 20,
  },
});