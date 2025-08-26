import { DataLayout, DataGrid, DataSection } from "@/components/ui/DataLayout";
import { DataCard, InfoCard } from "@/components/ui/DataCard";
import { DataText } from "@/components/ui/DataText";
import { DataButton } from "@/components/ui/DataButton";
import { getTheme } from "@/constants/DataFirstDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "1";

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");

  const handleContactSupport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const email = "support@brewprint.app";
      const subject = "Brewprint Support Request";
      const body = `App Version: ${APP_VERSION}\nBuild: ${BUILD_NUMBER}\n\nPlease describe your issue:\n`;

      const url = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error("Email app not available");
      }
    } catch (error) {
      console.error("Failed to open email:", error);
      toast.error("Failed to open email");
    }
  };

  const handleOpenWebsite = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const url = "https://brewprint.app";

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error("Cannot open website");
      }
    } catch (error) {
      console.error("Failed to open website:", error);
      toast.error("Failed to open website");
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const url = "https://brewprint.app/privacy";

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error("Cannot open privacy policy");
      }
    } catch (error) {
      console.error("Failed to open privacy policy:", error);
      toast.error("Failed to open privacy policy");
    }
  };

  const handleOpenTerms = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const url = "https://brewprint.app/terms";

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error("Cannot open terms of service");
      }
    } catch (error) {
      console.error("Failed to open terms:", error);
      toast.error("Failed to open terms");
    }
  };

  return (
    <DataLayout
      title="About Brewprint"
      subtitle="App information and support"
      showBackButton={true}
      onBackPress={() => router.back()}
      scrollable
    >
      {/* App Info */}
      <DataSection title="Application Details" spacing="lg">
        <DataCard>
          <View style={styles.appHeader}>
            <DataText variant="h2" weight="bold">
              Brewprint
            </DataText>
            <DataText variant="caption" color="secondary">
              v{APP_VERSION}
            </DataText>
          </View>

          <DataText variant="body" color="secondary" style={styles.tagline}>
            Your complete coffee recipe tracker for perfecting every brew
          </DataText>

          <DataGrid columns={2} gap="md" style={{ marginTop: 16 }}>
            <View style={styles.versionItem}>
              <DataText variant="caption" color="secondary">
                Version
              </DataText>
              <DataText variant="body" weight="semibold">
                {APP_VERSION}
              </DataText>
            </View>
            <View style={styles.versionItem}>
              <DataText variant="caption" color="secondary">
                Build
              </DataText>
              <DataText variant="body" weight="semibold">
                {BUILD_NUMBER}
              </DataText>
            </View>
          </DataGrid>
        </DataCard>
      </DataSection>

      {/* Features */}
      <DataSection title="Features" subtitle="What's included in Brewprint" spacing="lg">
        <DataCard>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <DataText variant="body" style={styles.featureIcon}>☕</DataText>
              <View style={styles.featureContent}>
                <DataText variant="body" weight="semibold">
                  Recipe Management
                </DataText>
                <DataText variant="caption" color="secondary">
                  Create, edit, and perfect your coffee brewing recipes
                </DataText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <DataText variant="body" style={styles.featureIcon}>📊</DataText>
              <View style={styles.featureContent}>
                <DataText variant="body" weight="semibold">
                  Analytics & Insights
                </DataText>
                <DataText variant="caption" color="secondary">
                  Track your brewing progress and quality trends
                </DataText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <DataText variant="body" style={styles.featureIcon}>🫘</DataText>
              <View style={styles.featureContent}>
                <DataText variant="body" weight="semibold">
                  Bean Library
                </DataText>
                <DataText variant="caption" color="secondary">
                  Manage your coffee bean inventory and notes
                </DataText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <DataText variant="body" style={styles.featureIcon}>⏱️</DataText>
              <View style={styles.featureContent}>
                <DataText variant="body" weight="semibold">
                  Brewing Timer
                </DataText>
                <DataText variant="caption" color="secondary">
                  Guided brewing with precise timing and measurements
                </DataText>
              </View>
            </View>
          </View>
        </DataCard>
      </DataSection>

      {/* Support & Links */}
      <DataSection title="Support & Information" spacing="lg">
        <DataCard>
          <View style={styles.linkList}>
            <TouchableOpacity style={styles.linkItem} onPress={handleContactSupport}>
              <DataText variant="body" weight="semibold" color="primary">
                Contact Support
              </DataText>
              <DataText variant="body" color="secondary">→</DataText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={handleOpenWebsite}>
              <DataText variant="body" weight="semibold" color="primary">
                Visit Website
              </DataText>
              <DataText variant="body" color="secondary">→</DataText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={handleOpenPrivacyPolicy}>
              <DataText variant="body" weight="semibold" color="primary">
                Privacy Policy
              </DataText>
              <DataText variant="body" color="secondary">→</DataText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={handleOpenTerms}>
              <DataText variant="body" weight="semibold" color="primary">
                Terms of Service
              </DataText>
              <DataText variant="body" color="secondary">→</DataText>
            </TouchableOpacity>
          </View>
        </DataCard>
      </DataSection>

      {/* Credits */}
      <DataSection title="Credits" spacing="lg">
        <DataCard>
          <DataText variant="body" color="secondary" style={styles.creditsText}>
            Built with love for the coffee community.
            {"\n\n"}
            Special thanks to all the coffee enthusiasts who helped shape
            Brewprint into the perfect brewing companion.
          </DataText>
        </DataCard>
      </DataSection>
    </DataLayout>
  );
}

const styles = {
  appHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  tagline: {
    textAlign: "center" as const,
    marginTop: 8,
  },
  versionItem: {
    alignItems: "center" as const,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
  },
  featureIcon: {
    fontSize: 18,
    minWidth: 24,
  },
  featureContent: {
    flex: 1,
  },
  linkList: {
    gap: 4,
  },
  linkItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  creditsText: {
    textAlign: "center" as const,
    lineHeight: 18,
  },
};
