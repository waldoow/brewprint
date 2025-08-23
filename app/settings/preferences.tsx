import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { getTheme } from '@/constants/ProfessionalDesign';
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
      <Container>
        <PageHeader
          title="Preferences"
          subtitle="Customize your coffee tracking experience"
          action={{
            title: "Back",
            onPress: () => router.back(),
          }}
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Loading preferences...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container scrollable>
      <PageHeader
        title="Preferences"
        subtitle="Customize your coffee tracking experience"
        action={{
          title: "Back",
          onPress: () => router.back(),
        }}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Units Section */}
        <Card variant="default" style={styles.section}>
          <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
            Units
          </Text>

          {/* Temperature Unit */}
          <View style={styles.settingRow}>
            <Text variant="body" weight="medium" style={styles.settingLabel}>
              Temperature
            </Text>
            <View style={styles.unitOptions}>
              {TEMPERATURE_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitButton,
                    {
                      backgroundColor: preferences.temperatureUnit === unit.value 
                        ? theme.colors.primary 
                        : theme.colors.surface,
                      borderColor: preferences.temperatureUnit === unit.value 
                        ? theme.colors.primary 
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => updatePreference('temperatureUnit', unit.value as 'celsius' | 'fahrenheit')}
                >
                  <Text
                    variant="caption"
                    style={[
                      styles.unitText,
                      { color: preferences.temperatureUnit === unit.value ? theme.colors.surface : theme.colors.text }
                    ]}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight Unit */}
          <View style={styles.settingRow}>
            <Text variant="body" weight="medium" style={styles.settingLabel}>
              Weight
            </Text>
            <View style={styles.unitOptions}>
              {WEIGHT_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitButton,
                    {
                      backgroundColor: preferences.weightUnit === unit.value 
                        ? theme.colors.primary 
                        : theme.colors.surface,
                      borderColor: preferences.weightUnit === unit.value 
                        ? theme.colors.primary 
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => updatePreference('weightUnit', unit.value as 'grams' | 'ounces')}
                >
                  <Text
                    variant="caption"
                    style={[
                      styles.unitText,
                      { color: preferences.weightUnit === unit.value ? theme.colors.surface : theme.colors.text }
                    ]}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Volume Unit */}
          <View style={styles.settingRow}>
            <Text variant="body" weight="medium" style={styles.settingLabel}>
              Volume
            </Text>
            <View style={styles.unitOptions}>
              {VOLUME_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[
                    styles.unitButton,
                    {
                      backgroundColor: preferences.volumeUnit === unit.value 
                        ? theme.colors.primary 
                        : theme.colors.surface,
                      borderColor: preferences.volumeUnit === unit.value 
                        ? theme.colors.primary 
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => updatePreference('volumeUnit', unit.value as 'ml' | 'fl_oz')}
                >
                  <Text
                    variant="caption"
                    style={[
                      styles.unitText,
                      { color: preferences.volumeUnit === unit.value ? theme.colors.surface : theme.colors.text }
                    ]}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Brewing Section */}
        <Card variant="default" style={styles.section}>
          <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
            Brewing
          </Text>

          {/* Default Brew Method */}
          <View style={styles.settingRow}>
            <Text variant="body" weight="medium" style={styles.settingLabel}>
              Default Method
            </Text>
            <View style={styles.methodOptions}>
              {BREW_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.value}
                  style={[
                    styles.methodButton,
                    {
                      backgroundColor: preferences.defaultBrewMethod === method.value 
                        ? theme.colors.primary 
                        : theme.colors.surface,
                      borderColor: preferences.defaultBrewMethod === method.value 
                        ? theme.colors.primary 
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => updatePreference('defaultBrewMethod', method.value)}
                >
                  <Text
                    variant="caption"
                    style={[
                      styles.methodText,
                      { color: preferences.defaultBrewMethod === method.value ? theme.colors.surface : theme.colors.text }
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Auto-start Timer */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text variant="body" weight="medium">
                Auto-start Timer
              </Text>
              <Text variant="caption" color="secondary">
                Start timer automatically when brewing begins
              </Text>
            </View>
            <Switch
              value={preferences.timerAutoStart}
              onValueChange={(value) => updatePreference('timerAutoStart', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={preferences.timerAutoStart ? theme.colors.surface : theme.colors.textSecondary}
            />
          </View>

          {/* Auto-save Brews */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text variant="body" weight="medium">
                Auto-save Brews
              </Text>
              <Text variant="caption" color="secondary">
                Automatically save completed brewing sessions
              </Text>
            </View>
            <Switch
              value={preferences.autoSaveBrews}
              onValueChange={(value) => updatePreference('autoSaveBrews', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={preferences.autoSaveBrews ? theme.colors.surface : theme.colors.textSecondary}
            />
          </View>

          {/* Show Detailed Metrics */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text variant="body" weight="medium">
                Detailed Metrics
              </Text>
              <Text variant="caption" color="secondary">
                Show advanced brewing metrics and analytics
              </Text>
            </View>
            <Switch
              value={preferences.showDetailedMetrics}
              onValueChange={(value) => updatePreference('showDetailedMetrics', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={preferences.showDetailedMetrics ? theme.colors.surface : theme.colors.textSecondary}
            />
          </View>
        </Card>

        {/* Interface Section */}
        <Card variant="default" style={styles.section}>
          <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
            Interface
          </Text>

          {/* Haptic Feedback */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text variant="body" weight="medium">
                Haptic Feedback
              </Text>
              <Text variant="caption" color="secondary">
                Vibration feedback for button taps and interactions
              </Text>
            </View>
            <Switch
              value={preferences.hapticFeedback}
              onValueChange={(value) => updatePreference('hapticFeedback', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={preferences.hapticFeedback ? theme.colors.surface : theme.colors.textSecondary}
            />
          </View>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingRow: {
    marginBottom: 20,
  },
  settingLabel: {
    marginBottom: 8,
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