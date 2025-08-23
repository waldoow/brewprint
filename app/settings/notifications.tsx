import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
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
      <Container>
        <PageHeader
          title="Notifications"
          subtitle="Configure your notification preferences"
          action={{
            title: "Back",
            onPress: () => router.back(),
          }}
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Loading notification settings...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container scrollable>
      <PageHeader
        title="Notifications"
        subtitle="Configure your notification preferences"
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
        {/* Info Banner */}
        <Card variant="outlined" style={styles.infoBanner}>
          <Text variant="body" color="secondary" style={styles.infoText}>
            💡 Notification features are coming soon. Configure your preferences here and we&apos;ll enable them when ready.
          </Text>
        </Card>

        {/* Brewing Notifications */}
        <Card variant="default" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h4" weight="semibold">
              Brewing Notifications
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text variant="caption" color="secondary">
                Coming Soon
              </Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                Brewing Reminders
              </Text>
              <Text variant="caption" color="secondary">
                Get reminded when it&apos;s time to start your next brew
              </Text>
            </View>
            <Switch
              value={settings.brewingReminders}
              onValueChange={(value) => updateSetting('brewingReminders', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.brewingReminders ? theme.colors.surface : theme.colors.textSecondary}
              disabled={true} // Disabled until feature is implemented
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                Daily Brew Reminders
              </Text>
              <Text variant="caption" color="secondary">
                Daily reminder to log your coffee brewing sessions
              </Text>
            </View>
            <Switch
              value={settings.dailyBrewReminders}
              onValueChange={(value) => updateSetting('dailyBrewReminders', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.dailyBrewReminders ? theme.colors.surface : theme.colors.textSecondary}
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                Grinding Reminders
              </Text>
              <Text variant="caption" color="secondary">
                Reminders to grind beans fresh before brewing
              </Text>
            </View>
            <Switch
              value={settings.grindingReminders}
              onValueChange={(value) => updateSetting('grindingReminders', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.grindingReminders ? theme.colors.surface : theme.colors.textSecondary}
              disabled={true}
            />
          </View>
        </Card>

        {/* Inventory Notifications */}
        <Card variant="default" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h4" weight="semibold">
              Inventory Alerts
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text variant="caption" color="secondary">
                Coming Soon
              </Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                Bean Expiration Alerts
              </Text>
              <Text variant="caption" color="secondary">
                Get notified when your coffee beans are getting stale
              </Text>
            </View>
            <Switch
              value={settings.beanExpirationAlerts}
              onValueChange={(value) => updateSetting('beanExpirationAlerts', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.beanExpirationAlerts ? theme.colors.surface : theme.colors.textSecondary}
              disabled={true}
            />
          </View>
        </Card>

        {/* Progress Notifications */}
        <Card variant="default" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h4" weight="semibold">
              Progress & Reports
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text variant="caption" color="secondary">
                Coming Soon
              </Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                Weekly Reports
              </Text>
              <Text variant="caption" color="secondary">
                Weekly summary of your brewing activities and improvements
              </Text>
            </View>
            <Switch
              value={settings.weeklyReports}
              onValueChange={(value) => updateSetting('weeklyReports', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.weeklyReports ? theme.colors.surface : theme.colors.textSecondary}
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="medium">
                Achievement Notifications
              </Text>
              <Text variant="caption" color="secondary">
                Get notified when you reach brewing milestones
              </Text>
            </View>
            <Switch
              value={settings.achievementNotifications}
              onValueChange={(value) => updateSetting('achievementNotifications', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={settings.achievementNotifications ? theme.colors.surface : theme.colors.textSecondary}
              disabled={true}
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
  infoBanner: {
    marginBottom: 16,
  },
  infoText: {
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  bottomSpacing: {
    height: 20,
  },
});