import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedInput } from '@/components/ui/ThemedInput';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedBadge } from '@/components/ui/ThemedBadge';
import { Header } from '@/components/ui/Header';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

interface ProfileSettings {
  displayName: string;
  autoSync: boolean;
  syncOnCellular: boolean;
  backupBeforeSync: boolean;
}

const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  displayName: '',
  autoSync: true,
  syncOnCellular: false,
  backupBeforeSync: true,
};

export default function ProfileSyncScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { user } = useAuth();

  const [settings, setSettings] = useState<ProfileSettings>(DEFAULT_PROFILE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfileSettings();
  }, []);

  const loadProfileSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('profile_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_PROFILE_SETTINGS, ...parsed });
      } else if (user?.email) {
        // Initialize with user email as display name
        const initialSettings = {
          ...DEFAULT_PROFILE_SETTINGS,
          displayName: user.email.split('@')[0],
        };
        setSettings(initialSettings);
      }
    } catch (error) {
      console.error('Failed to load profile settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfileSettings = async (newSettings: ProfileSettings) => {
    try {
      setSaving(true);
      await AsyncStorage.setItem('profile_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toast.success('Profile settings updated');
    } catch (error) {
      console.error('Failed to save profile settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof ProfileSettings>(
    key: K,
    value: ProfileSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveProfileSettings(newSettings);
  };

  const handleForceSync = () => {
    Alert.alert(
      'Sync Data',
      'This will sync your local data with the cloud. This may take a few moments.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sync Now', 
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toast.success('Sync completed (simulated)');
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Header title="Profile & Sync" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ThemedText style={{ color: colors.textSecondary }}>
            Loading profile settings...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="Profile & Sync" 
        onBack={() => router.back()}
        loading={saving}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Information */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Profile Information
          </ThemedText>

          <View style={styles.profileField}>
            <ThemedText type="defaultSemiBold" style={[styles.fieldLabel, { color: colors.text }]}>
              Email Address
            </ThemedText>
            <View style={[styles.emailContainer, { backgroundColor: colors.surface }]}>
              <ThemedText style={[styles.emailText, { color: colors.text }]}>
                {user?.email || 'Not available'}
              </ThemedText>
              <ThemedBadge variant="success" size="sm">Verified</ThemedBadge>
            </View>
          </View>

          <View style={styles.profileField}>
            <ThemedInput
              label="Display Name"
              value={settings.displayName}
              onChangeText={(value) => updateSetting('displayName', value)}
              placeholder="Your display name"
            />
          </View>
        </View>

        {/* Sync Settings */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              Sync Settings
            </ThemedText>
            <ThemedBadge variant="secondary" size="sm">Coming Soon</ThemedBadge>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Automatic Sync
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Automatically sync your data when changes are made
              </ThemedText>
            </View>
            <Switch
              value={settings.autoSync}
              onValueChange={(value) => updateSetting('autoSync', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.autoSync ? '#fff' : colors.text}
              disabled={true} // Disabled until sync is implemented
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Sync on Cellular
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Allow syncing when using cellular data (may use data)
              </ThemedText>
            </View>
            <Switch
              value={settings.syncOnCellular}
              onValueChange={(value) => updateSetting('syncOnCellular', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.syncOnCellular ? '#fff' : colors.text}
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText type="defaultSemiBold" style={[styles.settingLabel, { color: colors.text }]}>
                Backup Before Sync
              </ThemedText>
              <ThemedText type="caption" style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Create a backup before syncing changes
              </ThemedText>
            </View>
            <Switch
              value={settings.backupBeforeSync}
              onValueChange={(value) => updateSetting('backupBeforeSync', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={settings.backupBeforeSync ? '#fff' : colors.text}
              disabled={true}
            />
          </View>
        </View>

        {/* Sync Actions */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Sync Actions
          </ThemedText>

          <View style={styles.syncStatus}>
            <ThemedText type="caption" style={[styles.statusText, { color: colors.textSecondary }]}>
              Last sync: Never (sync feature coming soon)
            </ThemedText>
          </View>

          <ThemedButton
            title="Sync Now"
            onPress={handleForceSync}
            variant="secondary"
            size="default"
            disabled={true} // Disabled until sync is implemented
            style={styles.syncButton}
          />

          <View style={styles.infoBox}>
            <ThemedText type="caption" style={[styles.infoText, { color: colors.textSecondary }]}>
              💡 Cloud sync functionality is coming soon. Your data is currently stored locally and backed up securely on your device.
            </ThemedText>
          </View>
        </View>

        {/* Account Actions */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Account Actions
          </ThemedText>

          <View style={styles.actionGrid}>
            <ThemedButton
              title="Change Password"
              variant="outline"
              size="default"
              disabled={true} // TODO: Implement password change
              style={styles.actionButton}
            />

            <ThemedButton
              title="Delete Account"
              variant="destructive"
              size="default"
              disabled={true} // TODO: Implement account deletion
              style={styles.actionButton}
            />
          </View>

          <View style={styles.warningBox}>
            <ThemedText type="caption" style={[styles.warningText, { color: colors.textSecondary }]}>
              Account management features are coming soon. For now, you can manage your account through the authentication system.
            </ThemedText>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  profileField: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    fontSize: 14,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  emailText: {
    fontSize: 14,
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
  syncStatus: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 13,
    textAlign: 'center',
  },
  syncButton: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  actionGrid: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
  warningBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  warningText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});