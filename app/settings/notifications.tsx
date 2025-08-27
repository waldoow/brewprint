import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Switch,
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
    infoBanner: {
      backgroundColor: 'rgba(37, 99, 235, 0.05)',
      borderWidth: 1,
      borderColor: theme.colors.info,
      borderRadius: 6,
      padding: 16,
    },
    infoBannerTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    infoBannerText: {
      fontSize: 10,
      color: theme.colors.text.secondary,
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
            Notifications
          </Text>
          <Text style={styles.pageSubtitle}>
            Configure your notification preferences
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading notification settings...
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
          Notifications
        </Text>
        <Text style={styles.pageSubtitle}>
          Configure your notification preferences
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>
            Coming Soon
          </Text>
          <Text style={styles.infoBannerText}>
            💡 Notification features are coming soon. Configure your preferences here and we'll enable them when ready.
          </Text>
        </View>

        {/* Brewing Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Brewing Notifications
          </Text>
          <Text style={styles.sectionSubtitle}>
            Reminders and brewing alerts
          </Text>
          
          <View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Brewing Reminders
                </Text>
                <Text style={styles.settingDescription}>
                  Get reminded when it's time to start your next brew
                </Text>
              </View>
              <Switch
                value={settings.brewingReminders}
                onValueChange={(value) => updateSetting('brewingReminders', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.info }}
                thumbColor={theme.colors.background}
                disabled={true}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Daily Brew Reminders
                </Text>
                <Text style={styles.settingDescription}>
                  Daily reminder to log your coffee brewing sessions
                </Text>
              </View>
              <Switch
                value={settings.dailyBrewReminders}
                onValueChange={(value) => updateSetting('dailyBrewReminders', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.info }}
                thumbColor={theme.colors.background}
                disabled={true}
              />
            </View>

            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Grinding Reminders
                </Text>
                <Text style={styles.settingDescription}>
                  Reminders to grind beans fresh before brewing
                </Text>
              </View>
              <Switch
                value={settings.grindingReminders}
                onValueChange={(value) => updateSetting('grindingReminders', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.info }}
                thumbColor={theme.colors.background}
                disabled={true}
              />
            </View>
          </View>
        </View>

        {/* Inventory Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Inventory Alerts
          </Text>
          <Text style={styles.sectionSubtitle}>
            Bean and equipment notifications
          </Text>
          
          <View>
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Bean Expiration Alerts
                </Text>
                <Text style={styles.settingDescription}>
                  Get notified when your coffee beans are getting stale
                </Text>
              </View>
              <Switch
                value={settings.beanExpirationAlerts}
                onValueChange={(value) => updateSetting('beanExpirationAlerts', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.info }}
                thumbColor={theme.colors.background}
                disabled={true}
              />
            </View>
          </View>
        </View>

        {/* Progress Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Progress & Reports
          </Text>
          <Text style={styles.sectionSubtitle}>
            Weekly reports and achievements
          </Text>
          
          <View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Weekly Reports
                </Text>
                <Text style={styles.settingDescription}>
                  Weekly summary of your brewing activities and improvements
                </Text>
              </View>
              <Switch
                value={settings.weeklyReports}
                onValueChange={(value) => updateSetting('weeklyReports', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.info }}
                thumbColor={theme.colors.background}
                disabled={true}
              />
            </View>

            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Achievement Notifications
                </Text>
                <Text style={styles.settingDescription}>
                  Get notified when you reach brewing milestones
                </Text>
              </View>
              <Switch
                value={settings.achievementNotifications}
                onValueChange={(value) => updateSetting('achievementNotifications', value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.info }}
                thumbColor={theme.colors.background}
                disabled={true}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}