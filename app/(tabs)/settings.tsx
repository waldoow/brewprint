import { DataCard } from "@/components/ui/DataCard";
import { DataGrid, DataLayout, DataSection } from "@/components/ui/DataLayout";
import { DataText } from "@/components/ui/DataText";
import { getTheme } from "@/constants/DataFirstDesign";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Alert, View } from "react-native";

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

  return (
    <DataLayout
      title="Settings"
      subtitle={`Account and preferences for ${
        user?.user_metadata?.username || "Coffee Enthusiast"
      }`}
      scrollable
    >
      {/* Account Section */}
      <DataSection title="Account" spacing="lg">
        <DataGrid columns={1} gap="sm">
          <DataCard
            onPress={() => handleSettingPress("/settings/profile", "Profile")}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <DataText variant="h4" color="primary" weight="semibold">
                  Profile
                </DataText>
                <DataText variant="small" color="secondary">
                  {user?.user_metadata?.username || "Not set"}
                </DataText>
              </View>
              <DataText variant="small" color="tertiary">
                →
              </DataText>
            </View>
          </DataCard>

          <DataCard
            onPress={() => handleSettingPress("/settings/profile", "Email")}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <DataText variant="h4" color="primary" weight="semibold">
                  Email
                </DataText>
                <DataText variant="small" color="secondary">
                  {user?.email || "Not set"}
                </DataText>
              </View>
              <DataText variant="small" color="tertiary">
                →
              </DataText>
            </View>
          </DataCard>
        </DataGrid>
      </DataSection>

      {/* Preferences Section */}
      <DataSection title="Preferences" spacing="lg">
        <DataGrid columns={1} gap="sm">
          <DataCard
            onPress={() =>
              handleSettingPress("/settings/notifications", "Notifications")
            }
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <DataText variant="h4" color="primary" weight="semibold">
                  Notifications
                </DataText>
                <DataText variant="small" color="secondary">
                  Push notifications and alerts
                </DataText>
              </View>
              <DataText variant="small" color="tertiary">
                →
              </DataText>
            </View>
          </DataCard>

          <DataCard
            onPress={() => handleSettingPress("/settings/preferences", "Units")}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <DataText variant="h4" color="primary" weight="semibold">
                  Default Units
                </DataText>
                <DataText variant="small" color="secondary">
                  Metric (grams, Celsius)
                </DataText>
              </View>
              <DataText variant="small" color="tertiary">
                →
              </DataText>
            </View>
          </DataCard>
        </DataGrid>
      </DataSection>

      {/* Data & Analytics Section */}
      <DataSection title="Data & Analytics" spacing="lg">
        <DataGrid columns={1} gap="sm">
          <DataCard
            onPress={() => handleSettingPress("/settings/data", "Export")}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <DataText variant="h4" color="primary" weight="semibold">
                  Export Data
                </DataText>
                <DataText variant="small" color="secondary">
                  Download your brewing recipes and logs
                </DataText>
              </View>
              <DataText variant="small" color="tertiary">
                →
              </DataText>
            </View>
          </DataCard>

          <DataCard
            onPress={() => handleSettingPress("/settings/data", "Analytics")}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <DataText variant="h4" color="primary" weight="semibold">
                  Analytics
                </DataText>
                <DataText variant="small" color="secondary">
                  View brewing statistics and trends
                </DataText>
              </View>
              <DataText variant="small" color="tertiary">
                →
              </DataText>
            </View>
          </DataCard>
        </DataGrid>
      </DataSection>

      {/* Account Overview */}
      <DataSection title="Account Overview" spacing="lg">
        <DataGrid columns={2} gap="md">
          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Recipes Created
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              —
            </DataText>
            <DataText variant="tiny" color="tertiary">
              Coming soon
            </DataText>
          </DataCard>

          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Total Brews
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              —
            </DataText>
            <DataText variant="tiny" color="tertiary">
              Coming soon
            </DataText>
          </DataCard>

          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Favorite Bean
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              —
            </DataText>
            <DataText variant="tiny" color="tertiary">
              Coming soon
            </DataText>
          </DataCard>

          <DataCard>
            <DataText variant="small" color="secondary" weight="medium">
              Member Since
            </DataText>
            <DataText
              variant="h2"
              color="primary"
              weight="bold"
              style={{ marginVertical: theme.spacing[1] }}
            >
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </DataText>
            <DataText variant="tiny" color="tertiary">
              Account age
            </DataText>
          </DataCard>
        </DataGrid>
      </DataSection>

      {/* Support Section */}
      <DataSection title="Support" spacing="lg">
        <DataCard
          onPress={() => handleSettingPress("/settings/about", "About")}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <DataText variant="h4" color="primary" weight="semibold">
                About Brewprint
              </DataText>
              <DataText variant="small" color="secondary">
                Version 1.0.0 • Learn more
              </DataText>
            </View>
            <DataText variant="small" color="tertiary">
              →
            </DataText>
          </View>
        </DataCard>
      </DataSection>

      {/* Sign Out Section */}
      <DataSection title="Account Actions" spacing="lg">
        <DataCard
          title="Sign Out"
          message="You can always sign back in to access your recipes and data."
          variant="warning"
          action={{
            title: "Sign Out",
            onPress: handleSignOut,
            variant: "destructive",
          }}
        />
      </DataSection>
    </DataLayout>
  );
}
