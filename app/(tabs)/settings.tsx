import { getTheme } from "@/constants/ProfessionalDesign";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Text, TouchableOpacity, View } from "react-native-ui-lib";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? You can sign back in anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: signOut,
        },
      ]
    );
  };

  const handleSettingPress = (route: string, label: string) => {
    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
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
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 16,
    },
    profileSection: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      marginBottom: 32,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    profileEmail: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingContent: {
      flex: 1,
      marginRight: 16,
    },
    settingTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 11,
      color: theme.colors.text.secondary,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      backgroundColor: theme.colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.error,
      marginTop: 16,
    },
    pageTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>
          Settings
        </Text>
        <Text style={{ fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 }}>
          Account and preferences for {user?.user_metadata?.username || "Coffee Enthusiast"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile */}
        <View style={styles.profileSection}>
          <Text style={styles.profileName}>
            {user?.user_metadata?.username || "Coffee Enthusiast"}
          </Text>
          <Text style={styles.profileEmail}>
            {user?.email}
          </Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress("/settings/profile", "Profile")}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Profile Settings
              </Text>
              <Text style={styles.settingDescription}>
                Update your username and personal info
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: theme.colors.text.tertiary }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Preferences
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress("/settings/notifications", "Notifications")}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Notifications
              </Text>
              <Text style={styles.settingDescription}>
                Push notifications and alerts
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: theme.colors.text.tertiary }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress("/settings/preferences", "Units")}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Default Units
              </Text>
              <Text style={styles.settingDescription}>
                Metric (grams, Celsius)
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: theme.colors.text.tertiary }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data & Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Data & Support
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress("/settings/data", "Data Management")}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                Data Management
              </Text>
              <Text style={styles.settingDescription}>
                Export, backup, and sync your brewing data
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: theme.colors.text.tertiary }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingPress("/settings/about", "About")}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                About
              </Text>
              <Text style={styles.settingDescription}>
                App version, privacy policy, and support
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: theme.colors.text.tertiary }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Account Overview
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Recipes Created</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>—</Text>
              <Text style={styles.statLabel}>Total Brews</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>1.0.0</Text>
              <Text style={styles.statLabel}>App Version</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.error }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
