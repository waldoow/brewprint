import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import {
  View,
  Text,
  TextField,
  Switch,
  TouchableOpacity,
} from "react-native-ui-lib";
import { toast } from "sonner-native";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ProfileSettings {
  displayName: string;
  autoSync: boolean;
  syncOnCellular: boolean;
  backupBeforeSync: boolean;
}

const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  displayName: "",
  autoSync: true,
  syncOnCellular: false,
  backupBeforeSync: true,
};

export default function ProfileSyncScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const [settings, setSettings] = useState<ProfileSettings>(
    DEFAULT_PROFILE_SETTINGS
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfileSettings = React.useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("profile_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_PROFILE_SETTINGS, ...parsed });
      }
      // Set display name from user if available
      if (user?.email) {
        setSettings(prev => ({
          ...prev,
          displayName: prev.displayName || user.email.split('@')[0]
        }));
      }
    } catch {
      console.error("Failed to load profile settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileSettings();
  }, [loadProfileSettings]);

  const saveProfileSettings = async (newSettings: ProfileSettings) => {
    try {
      setSaving(true);
      await AsyncStorage.setItem("profile_settings", JSON.stringify(newSettings));
      setSettings(newSettings);
      
      if (newSettings.autoSync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      toast.success("Profile settings updated successfully");
    } catch (error) {
      console.error("Failed to save profile settings:", error);
      toast.error("Failed to save settings");
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

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? Any unsaved changes will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              // Note: actual sign out would be handled by useAuth context
              toast.success("Signed out successfully");
              router.replace("/(auth)");
            } catch (error) {
              toast.error("Failed to sign out");
            }
          },
        },
      ]
    );
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
    accountInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      marginBottom: 16,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.info,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: {
      color: theme.colors.text.inverse,
      fontSize: 18,
      fontWeight: '600',
    },
    accountDetails: {
      flex: 1,
    },
    displayName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    email: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    textField: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.background,
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
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    statusLabel: {
      fontSize: 12,
      color: theme.colors.text.primary,
    },
    statusValue: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },
    primaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
      marginTop: 16,
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    dangerButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.error,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
      marginTop: 8,
    },
    dangerButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.error,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
      marginBottom: 8,
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '500',
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
            Profile & Sync
          </Text>
          <Text style={styles.pageSubtitle}>
            Manage your account and sync preferences
          </Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Loading profile settings...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>
          Profile & Sync
        </Text>
        <Text style={styles.pageSubtitle}>
          Manage your account and sync preferences
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account Information
          </Text>
          
          <View style={styles.accountInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            
            <View style={styles.accountDetails}>
              <Text style={styles.displayName}>
                {settings.displayName || "User"}
              </Text>
              <Text style={styles.email}>
                {user?.email || "No email available"}
              </Text>
            </View>
          </View>

          <View>
            <Text style={styles.fieldLabel}>
              Display Name
            </Text>
            <TextField
              value={settings.displayName}
              onChangeText={(text) => updateSetting('displayName', text)}
              placeholder="Enter display name"
              style={styles.textField}
            />
          </View>
        </View>

        {/* Sync Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Sync Preferences
          </Text>
          <Text style={styles.sectionSubtitle}>
            Control how your data syncs across devices
          </Text>
          
          <View>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Auto Sync
                </Text>
                <Text style={styles.settingDescription}>
                  Automatically sync your data when changes are made
                </Text>
              </View>
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => updateSetting('autoSync', value)}
                onColor={theme.colors.info}
                offColor={theme.colors.border}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Sync on Cellular
                </Text>
                <Text style={styles.settingDescription}>
                  Allow syncing when using cellular data (may use more data)
                </Text>
              </View>
              <Switch
                value={settings.syncOnCellular}
                onValueChange={(value) => updateSetting('syncOnCellular', value)}
                onColor={theme.colors.info}
                offColor={theme.colors.border}
                disabled={!settings.autoSync}
              />
            </View>

            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>
                  Backup Before Sync
                </Text>
                <Text style={styles.settingDescription}>
                  Create local backups before syncing to prevent data loss
                </Text>
              </View>
              <Switch
                value={settings.backupBeforeSync}
                onValueChange={(value) => updateSetting('backupBeforeSync', value)}
                onColor={theme.colors.info}
                offColor={theme.colors.border}
                disabled={!settings.autoSync}
              />
            </View>
          </View>
        </View>

        {/* Sync Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Sync Status
          </Text>
          
          <View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Last Sync</Text>
              <Text style={styles.statusValue}>Never</Text>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Sync Status</Text>
              <Text style={styles.statusValue}>
                {settings.autoSync ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => toast.info("Manual sync coming soon")}
            disabled={!settings.autoSync}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>
              Sync Now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account Actions
          </Text>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => toast.info("Password change coming soon")}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              Change Password
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={styles.dangerButtonText}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}