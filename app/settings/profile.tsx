import { DataLayout, DataGrid, DataSection } from "@/components/ui/DataLayout";
import { DataCard } from "@/components/ui/DataCard";
import { DataText } from "@/components/ui/DataText";
import { DataButton } from "@/components/ui/DataButton";
import { Input } from "@/components/ui/Input";
import { getTheme } from "@/constants/DataFirstDesign";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Switch, View } from "react-native";
import { toast } from "sonner-native";

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
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");
  const { user } = useAuth();

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

  if (loading) {
    return (
      <DataLayout
        title="Profile & Sync"
        subtitle="Manage your account and sync preferences"
      >
        <View style={styles.loadingContainer}>
          <DataText variant="body" color="secondary">
            Loading profile settings...
          </DataText>
        </View>
      </DataLayout>
    );
  }

  return (
    <DataLayout
      title="Profile & Sync"
      subtitle="Manage your account and sync preferences"
      scrollable
    >
      {/* Account Information */}
      <DataSection title="Account Information" spacing="lg">
        <DataCard>
          <View style={styles.accountInfo}>
            <View style={styles.avatar}>
              <DataText variant="h2" weight="bold" style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </DataText>
            </View>
            
            <View style={styles.accountDetails}>
              <DataText variant="h4" weight="semibold">
                {settings.displayName || "User"}
              </DataText>
              <DataText variant="body" color="secondary">
                {user?.email || "No email available"}
              </DataText>
            </View>
          </View>

          <View style={styles.formField}>
            <DataText variant="body" weight="medium" style={styles.fieldLabel}>
              Display Name
            </DataText>
            <Input
              value={settings.displayName}
              onChangeText={(text) => updateSetting('displayName', text)}
              placeholder="Enter display name"
              variant="outline"
            />
          </View>
        </DataCard>
      </DataSection>

      {/* Sync Preferences */}
      <DataSection title="Sync Preferences" subtitle="Control how your data syncs across devices" spacing="lg">
        <DataCard>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">
                Auto Sync
              </DataText>
              <DataText variant="caption" color="secondary">
                Automatically sync your data when changes are made
              </DataText>
            </View>
            <Switch
              value={settings.autoSync}
              onValueChange={(value) => updateSetting('autoSync', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">
                Sync on Cellular
              </DataText>
              <DataText variant="caption" color="secondary">
                Allow syncing when using cellular data (may use more data)
              </DataText>
            </View>
            <Switch
              value={settings.syncOnCellular}
              onValueChange={(value) => updateSetting('syncOnCellular', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
              disabled={!settings.autoSync}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <DataText variant="body" weight="semibold">
                Backup Before Sync
              </DataText>
              <DataText variant="caption" color="secondary">
                Create local backups before syncing to prevent data loss
              </DataText>
            </View>
            <Switch
              value={settings.backupBeforeSync}
              onValueChange={(value) => updateSetting('backupBeforeSync', value)}
              trackColor={{ false: theme.colors.gray[200], true: theme.colors.interactive.default }}
              thumbColor={theme.colors.white}
              disabled={!settings.autoSync}
            />
          </View>
        </DataCard>
      </DataSection>

      {/* Sync Status */}
      <DataSection title="Sync Status" spacing="lg">
        <DataCard>
          <View style={styles.syncStatus}>
            <View style={styles.statusItem}>
              <DataText variant="body" weight="medium">Last Sync</DataText>
              <DataText variant="caption" color="secondary">Never</DataText>
            </View>
            
            <View style={styles.statusItem}>
              <DataText variant="body" weight="medium">Sync Status</DataText>
              <DataText variant="caption" color="secondary">
                {settings.autoSync ? "Enabled" : "Disabled"}
              </DataText>
            </View>
          </View>
          
          <DataButton
            title="Sync Now"
            onPress={() => toast.info("Manual sync coming soon")}
            variant="secondary"
            disabled={!settings.autoSync}
          />
        </DataCard>
      </DataSection>

      {/* Account Actions */}
      <DataSection title="Account Actions" spacing="xl">
        <DataCard>
          <DataGrid columns={1} gap="md">
            <DataButton
              title="Change Password"
              onPress={() => toast.info("Password change coming soon")}
              variant="outline"
            />
            
            <DataButton
              title="Sign Out"
              onPress={handleSignOut}
              variant="destructive"
            />
          </DataGrid>
        </DataCard>
      </DataSection>
    </DataLayout>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 32,
  },
  accountInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
  },
  accountDetails: {
    flex: 1,
    gap: 4,
  },
  formField: {
    gap: 8,
  },
  fieldLabel: {
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
    gap: 4,
  },
  syncStatus: {
    gap: 12,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
};