import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { DataLayout, DataGrid, DataSection } from '@/components/ui/DataLayout';
import { DataCard, InfoCard } from '@/components/ui/DataCard';
import { DataText } from '@/components/ui/DataText';
import { DataButton } from '@/components/ui/DataButton';
import { getTheme } from '@/constants/DataFirstDesign';
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
  const theme = getTheme(colorScheme ?? 'light');

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
      <DataLayout
        title="Notifications"
        subtitle="Configure your notification preferences"
        showBackButton={true}
        onBackPress={() => router.back()}
      >
        <View style={styles.loadingContainer}>
          <DataText variant="body" color="secondary">
            Loading notification settings...
          </DataText>
        </View>
      </DataLayout>
    );
  }

  return (
    <DataLayout
      title="Notifications"
      subtitle="Configure your notification preferences"
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable
    >
      {/* Info Banner */}
      <InfoCard
        title="Coming Soon"
        message="💡 Notification features are coming soon. Configure your preferences here and we'll enable them when ready."
        variant="info"
      />

      {/* Brewing Notifications */}
      <DataSection title="Brewing Notifications" spacing="lg">
        <DataCard>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">
                Brewing Reminders
              </DataText>
              <DataText variant="caption" color="secondary">
                Get reminded when it&apos;s time to start your next brew
              </DataText>
            </View>
            <Switch
              value={settings.brewingReminders}
              onValueChange={(value) => updateSetting('brewingReminders', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
              disabled={true} // Disabled until feature is implemented
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">
                Daily Brew Reminders
              </DataText>
              <DataText variant="caption" color="secondary">
                Daily reminder to log your coffee brewing sessions
              </DataText>
            </View>
            <Switch
              value={settings.dailyBrewReminders}
              onValueChange={(value) => updateSetting('dailyBrewReminders', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">
                Grinding Reminders
              </DataText>
              <DataText variant="caption" color="secondary">
                Reminders to grind beans fresh before brewing
              </DataText>
            </View>
            <Switch
              value={settings.grindingReminders}
              onValueChange={(value) => updateSetting('grindingReminders', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
              disabled={true}
            />
          </View>
        </DataCard>
      </DataSection>

      {/* Inventory Notifications */}
      <DataSection title="Inventory Alerts" spacing="lg">
        <DataCard>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">
                Bean Expiration Alerts
              </DataText>
              <DataText variant="caption" color="secondary">
                Get notified when your coffee beans are getting stale
              </DataText>
            </View>
            <Switch
              value={settings.beanExpirationAlerts}
              onValueChange={(value) => updateSetting('beanExpirationAlerts', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
              disabled={true}
            />
          </View>
        </DataCard>
      </DataSection>

      {/* Progress Notifications */}
      <DataSection title="Progress & Reports" spacing="lg">
        <DataCard>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">
                Weekly Reports
              </DataText>
              <DataText variant="caption" color="secondary">
                Weekly summary of your brewing activities and improvements
              </DataText>
            </View>
            <Switch
              value={settings.weeklyReports}
              onValueChange={(value) => updateSetting('weeklyReports', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">
                Achievement Notifications
              </DataText>
              <DataText variant="caption" color="secondary">
                Get notified when you reach brewing milestones
              </DataText>
            </View>
            <Switch
              value={settings.achievementNotifications}
              onValueChange={(value) => updateSetting('achievementNotifications', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
              disabled={true}
            />
          </View>
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