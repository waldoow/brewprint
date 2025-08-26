import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { DataLayout, DataGrid, DataSection } from '@/components/ui/DataLayout';
import { DataCard } from '@/components/ui/DataCard';
import { DataText } from '@/components/ui/DataText';
import { DataButton } from '@/components/ui/DataButton';
import { getTheme } from '@/constants/DataFirstDesign';
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

  if (loading) {
    return (
      <DataLayout
        title="Preferences"
        subtitle="Customize your brewing experience"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <View style={styles.loadingContainer}>
          <DataText variant="body" color="secondary">
            Loading preferences...
          </DataText>
        </View>
      </DataLayout>
    );
  }

  return (
    <DataLayout
      title="Preferences"
      subtitle="Customize your brewing experience"
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable
    >
      {/* Units Section */}
      <DataSection title="Units of Measurement" subtitle="Choose your preferred units for brewing" spacing="lg">
        <DataCard>
          <View style={styles.unitGroup}>
            <DataText variant="body" weight="semibold">Temperature</DataText>
            <DataGrid columns={2} gap="sm">
              {TEMPERATURE_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitOption,
                    preferences.temperatureUnit === unit.value && styles.unitOptionSelected
                  ]}
                  onPress={() => updatePreference('temperatureUnit', unit.value as 'celsius' | 'fahrenheit')}
                >
                  <DataText 
                    variant="body" 
                    color={preferences.temperatureUnit === unit.value ? 'primary' : 'secondary'}
                    weight={preferences.temperatureUnit === unit.value ? 'semibold' : 'normal'}
                  >
                    {unit.label}
                  </DataText>
                </TouchableOpacity>
              ))}
            </DataGrid>
          </View>

          <View style={styles.unitGroup}>
            <DataText variant="body" weight="semibold">Weight</DataText>
            <DataGrid columns={2} gap="sm">
              {WEIGHT_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitOption,
                    preferences.weightUnit === unit.value && styles.unitOptionSelected
                  ]}
                  onPress={() => updatePreference('weightUnit', unit.value as 'grams' | 'ounces')}
                >
                  <DataText 
                    variant="body" 
                    color={preferences.weightUnit === unit.value ? 'primary' : 'secondary'}
                    weight={preferences.weightUnit === unit.value ? 'semibold' : 'normal'}
                  >
                    {unit.label}
                  </DataText>
                </TouchableOpacity>
              ))}
            </DataGrid>
          </View>

          <View style={styles.unitGroup}>
            <DataText variant="body" weight="semibold">Volume</DataText>
            <DataGrid columns={2} gap="sm">
              {VOLUME_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitOption,
                    preferences.volumeUnit === unit.value && styles.unitOptionSelected
                  ]}
                  onPress={() => updatePreference('volumeUnit', unit.value as 'ml' | 'fl_oz')}
                >
                  <DataText 
                    variant="body" 
                    color={preferences.volumeUnit === unit.value ? 'primary' : 'secondary'}
                    weight={preferences.volumeUnit === unit.value ? 'semibold' : 'normal'}
                  >
                    {unit.label}
                  </DataText>
                </TouchableOpacity>
              ))}
            </DataGrid>
          </View>
        </DataCard>
      </DataSection>

      {/* Brewing Preferences */}
      <DataSection title="Brewing Preferences" subtitle="Customize your brewing workflow" spacing="lg">
        <DataCard>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">Timer Auto-Start</DataText>
              <DataText variant="caption" color="secondary">
                Automatically start timer when brewing begins
              </DataText>
            </View>
            <Switch
              value={preferences.timerAutoStart}
              onValueChange={(value) => updatePreference('timerAutoStart', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">Auto-Save Brews</DataText>
              <DataText variant="caption" color="secondary">
                Automatically save brewing sessions when completed
              </DataText>
            </View>
            <Switch
              value={preferences.autoSaveBrews}
              onValueChange={(value) => updatePreference('autoSaveBrews', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">Detailed Metrics</DataText>
              <DataText variant="caption" color="secondary">
                Show advanced brewing metrics and analytics
              </DataText>
            </View>
            <Switch
              value={preferences.showDetailedMetrics}
              onValueChange={(value) => updatePreference('showDetailedMetrics', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
            />
          </View>
        </DataCard>
      </DataSection>

      {/* App Experience */}
      <DataSection title="App Experience" subtitle="Customize interface and feedback" spacing="lg">
        <DataCard>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">Haptic Feedback</DataText>
              <DataText variant="caption" color="secondary">
                Enable vibration feedback for interactions
              </DataText>
            </View>
            <Switch
              value={preferences.hapticFeedback}
              onValueChange={(value) => updatePreference('hapticFeedback', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
            />
          </View>
        </DataCard>
      </DataSection>

      {/* Default Brew Method */}
      <DataSection title="Default Brew Method" subtitle="Select your preferred brewing method" spacing="lg">
        <DataCard>
          <DataGrid columns={1} gap="sm">
            {BREW_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.methodOption,
                  preferences.defaultBrewMethod === method.value && styles.methodOptionSelected
                ]}
                onPress={() => updatePreference('defaultBrewMethod', method.value)}
              >
                <DataText 
                  variant="body" 
                  color={preferences.defaultBrewMethod === method.value ? 'primary' : 'default'}
                  weight={preferences.defaultBrewMethod === method.value ? 'semibold' : 'normal'}
                >
                  {method.label}
                </DataText>
              </TouchableOpacity>
            ))}
          </DataGrid>
        </DataCard>
      </DataSection>
    </DataLayout>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 32,
  },
  unitGroup: {
    marginBottom: 20,
    gap: 12,
  },
  unitOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center' as const,
  },
  unitOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  methodOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  methodOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  settingRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
    gap: 4,
  },
};