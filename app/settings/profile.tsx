import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Section } from "@/components/ui/Section";
import { getTheme } from "@/constants/ProfessionalDesign";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Switch, View } from "react-native";
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

  useEffect(() => {
    loadProfileSettings();
  }, []);

  const loadProfileSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem("profile_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_PROFILE_SETTINGS, ...parsed });
      } else if (user?.email) {
        // Initialize with user email as display name
        const initialSettings = {
          ...DEFAULT_PROFILE_SETTINGS,
          displayName: user.email.split("@")[0],
        };
        setSettings(initialSettings);
      }
    } catch (error) {
      console.error("Failed to load profile settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfileSettings = async (newSettings: ProfileSettings) => {
    try {
      setSaving(true);
      await AsyncStorage.setItem(
        "profile_settings",
        JSON.stringify(newSettings)
      );
      setSettings(newSettings);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toast.success("Profile settings updated");
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

  const handleForceSync = () => {
    Alert.alert(
      "Sync Data",
      "This will sync your local data with the cloud. This may take a few moments.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sync Now",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toast.success("Sync completed (simulated)");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Container>
        <PageHeader
          title="Profile & Sync"
          action={{
            title: "Back",
            onPress: () => router.back(),
          }}
        />
        <View style={styles.loadingContainer}>
          <Text variant="body" color="secondary">
            Loading profile settings...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container scrollable>
      <Section 
        title="Profile & Sync"
        subtitle="Account settings and data synchronization"
        spacing="xl"
      />

      <Section
        title="Profile Information"
        subtitle="Email address and display preferences"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.profileField}>
            <Text
              variant="body"
              weight="semibold"
              style={styles.fieldLabel}
            >
              Email Address
            </Text>
            <View
              style={[
                styles.emailContainer,
                { backgroundColor: theme.colors.gray[100] },
              ]}
            >
              <Text variant="body">
                {user?.email || "Not available"}
              </Text>
              <View style={styles.verifiedBadge}>
                <Text variant="caption" color="inverse">
                  Verified
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.profileField}>
            <Input
              label="Display Name"
              value={settings.displayName}
              onChangeText={(value) => updateSetting("displayName", value)}
              placeholder="Your display name"
            />
          </View>
        </Card>
      </Section>

      <Section
        title="Sync Settings"
        subtitle="Automatic synchronization preferences"
        spacing="lg"
      >
        <Card variant="default">
          <View style={styles.sectionHeader}>
            <Text variant="h4" weight="semibold">
              Sync Controls
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text variant="caption" color="inverse">
                Coming Soon
              </Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="semibold">
                Automatic Sync
              </Text>
              <Text variant="caption" color="secondary">
                Automatically sync your data when changes are made
              </Text>
            </View>
            <Switch
              value={settings.autoSync}
              onValueChange={(value) => updateSetting("autoSync", value)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                settings.autoSync
                  ? theme.colors.surface
                  : theme.colors.textSecondary
              }
              disabled={true} // Disabled until sync is implemented
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="semibold">
                Sync on Cellular
              </Text>
              <Text variant="caption" color="secondary">
                Allow syncing when using cellular data (may use data)
              </Text>
            </View>
            <Switch
              value={settings.syncOnCellular}
              onValueChange={(value) => updateSetting("syncOnCellular", value)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                settings.syncOnCellular
                  ? theme.colors.surface
                  : theme.colors.textSecondary
              }
              disabled={true}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="body" weight="semibold">
                Backup Before Sync
              </Text>
              <Text variant="caption" color="secondary">
                Create a backup before syncing changes
              </Text>
            </View>
            <Switch
              value={settings.backupBeforeSync}
              onValueChange={(value) =>
                updateSetting("backupBeforeSync", value)
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={
                settings.backupBeforeSync
                  ? theme.colors.surface
                  : theme.colors.textSecondary
              }
              disabled={true}
            />
          </View>
        </Card>
      </Section>

      <Section
        title="Sync Actions"
        subtitle="Manual sync controls and status"
        spacing="lg"
      >
        <Card variant="default">

          <View style={styles.syncStatus}>
            <Text
              variant="caption"
              color="secondary"
              style={styles.statusText}
            >
              Last sync: Never (sync feature coming soon)
            </Text>
          </View>

          <Button
            title="Sync Now"
            onPress={handleForceSync}
            variant="outline"
            disabled={true} // Disabled until sync is implemented
            fullWidth
          />

          <View style={styles.infoBox}>
            <Text
              variant="caption"
              color="secondary"
              style={styles.infoText}
            >
              💡 Cloud sync functionality is coming soon. Your data is currently
              stored locally and backed up securely on your device.
            </Text>
          </View>
        </Card>
      </Section>

      <Section
        title="Account Actions"
        subtitle="Manage your account security and data"
        spacing="lg"
      >
        <Card variant="default">

          <View style={styles.actionGrid}>
            <Button
              title="Change Password"
              onPress={() => {}}
              variant="outline"
              disabled={true} // TODO: Implement password change
              fullWidth
            />

            <Button
              title="Delete Account"
              variant="destructive"
              onPress={() => {}}
              disabled={true} // TODO: Implement account deletion
              fullWidth
            />
          </View>

          <View style={styles.warningBox}>
            <Text
              variant="caption"
              color="secondary"
              style={styles.warningText}
            >
              Account management features are coming soon. For now, you can
              manage your account through the authentication system.
            </Text>
          </View>
        </Card>
      </Section>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#6B7280",
    borderRadius: 4,
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#059669",
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  profileField: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  syncStatus: {
    marginBottom: 16,
  },
  statusText: {
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  infoText: {
    textAlign: "center",
  },
  actionGrid: {
    gap: 12,
    marginBottom: 16,
  },
  warningBox: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.2)",
  },
  warningText: {
    textAlign: "center",
  },
});
