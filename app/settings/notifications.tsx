import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
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

interface NotificationSettings {
  brewingReminders: boolean;
  beanExpirationAlerts: boolean;
  weeklyReports: boolean;
  achievementNotifications: boolean;
  dailyBrewReminders: boolean;
  grindingReminders: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  brewingReminders: true,
  beanExpirationAlerts: true,
  weeklyReports: false,
  dailyBrewReminders: false,
  achievementNotifications: true,
  grindingReminders: false,
};

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('notification_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async (newSettings: NotificationSettings) => {
    try {
      setSaving(true);
      await AsyncStorage.setItem('notification_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      
      if (newSettings.brewingReminders || newSettings.beanExpirationAlerts) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveNotificationSettings(newSettings);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Notifications" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ThemedText style={{ color: colors.textSecondary }}>
            Loading notification settings...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Notifications" 
        onBack={() => router.back()}
        loading={saving}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <ThemedText type="caption" style={[styles.infoText, { color: colors.textSecondary }]}>
            💡 Notification features are coming soon. Configure your preferences here and we&apos;ll enable them when ready.
          </ThemedText>
        </View>

        {/* Brewing Notifications */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              Brewing Notifications
            </ThemedText>
            <ThemedBadge variant="secondary" size="sm">Coming Soon</ThemedBadge>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Brewing Reminders
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get reminded when it&apos;s time to start your next brew
              </ThemedText>
            </View>
            <Switch
              value={settings.brewingReminders}
              onValueChange={(value) => updateSetting('brewingReminders', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.brewingReminders ? '#fff' : colors.text}
              disabled={true} // Disabled until feature is implemented
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Daily Brew Reminders
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Daily reminder to log your coffee brewing sessions
              </ThemedText>
            </View>
            <Switch
              value={settings.dailyBrewReminders}
              onValueChange={(value) => updateSetting('dailyBrewReminders', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.dailyBrewReminders ? '#fff' : colors.text}
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Grinding Reminders
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Reminders to grind beans fresh before brewing
              </ThemedText>
            </View>
            <Switch
              value={settings.grindingReminders}
              onValueChange={(value) => updateSetting('grindingReminders', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.grindingReminders ? '#fff' : colors.text}
              disabled={true}
            />
          </View>
        </View>

        {/* Inventory Notifications */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              Inventory Alerts
            </ThemedText>
            <ThemedBadge variant="secondary" size="sm">Coming Soon</ThemedBadge>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Bean Expiration Alerts
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get notified when your coffee beans are getting stale
              </ThemedText>
            </View>
            <Switch
              value={settings.beanExpirationAlerts}
              onValueChange={(value) => updateSetting('beanExpirationAlerts', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.beanExpirationAlerts ? '#fff' : colors.text}
              disabled={true}
            />
          </View>
        </View>

        {/* Progress Notifications */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              Progress & Reports
            </ThemedText>
            <ThemedBadge variant="secondary" size="sm">Coming Soon</ThemedBadge>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Weekly Reports
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Weekly summary of your brewing activities and improvements
              </ThemedText>
            </View>
            <Switch
              value={settings.weeklyReports}
              onValueChange={(value) => updateSetting('weeklyReports', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.weeklyReports ? '#fff' : colors.text}
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Achievement Notifications
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get notified when you reach brewing milestones
              </ThemedText>
            </View>
            <Switch
              value={settings.achievementNotifications}
              onValueChange={(value) => updateSetting('achievementNotifications', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.achievementNotifications ? '#fff' : colors.text}
              disabled={true}
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
  infoBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    marginBottom: 2,
    fontSize: 14,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});