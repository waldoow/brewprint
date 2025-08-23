import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Text } from "@/components/ui/Text";
import { getTheme } from "@/constants/ProfessionalDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
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
    <Container scrollable>
      <PageHeader
        title="About"
        subtitle="App information and support"
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
        {/* App Info */}
        <Card variant="default" style={styles.section}>
          <View style={styles.appHeader}>
            <Text variant="h1" weight="bold" style={styles.appName}>
              Brewprint
            </Text>
            <View style={styles.versionBadge}>
              <Text variant="caption" color="secondary">
                v{APP_VERSION}
              </Text>
            </View>
          </View>

          <Text
            variant="body"
            color="secondary"
            style={styles.tagline}
          >
            Your complete coffee recipe tracker for perfecting every brew
          </Text>

          <View style={styles.versionInfo}>
            <View style={styles.versionItem}>
              <Text variant="caption" color="secondary">
                Version
              </Text>
              <Text variant="body" weight="semibold">
                {APP_VERSION}
              </Text>
            </View>

            <View style={styles.versionItem}>
              <Text variant="caption" color="secondary">
                Build
              </Text>
              <Text variant="body" weight="semibold">
                {BUILD_NUMBER}
              </Text>
            </View>
          </View>
        </Card>

        {/* Features */}
        <Card variant="default" style={styles.section}>
          <Text
            variant="h4"
            weight="semibold"
            style={styles.sectionTitle}
          >
            What&apos;s Included
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>
                  ☕
                </Text>
              </View>
              <View style={styles.featureContent}>
                <Text variant="body" weight="semibold">
                  Recipe Management
                </Text>
                <Text variant="caption" color="secondary">
                  Create, edit, and perfect your coffee brewing recipes
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.primary },
                ]}
              >
                <ThemedText style={styles.featureIconText}>📊</ThemedText>
              </View>
              <View style={styles.featureContent}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.featureTitle, { color: colors.text }]}
                >
                  Analytics & Insights
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={[
                    styles.featureDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Track your brewing progress and quality trends
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.primary },
                ]}
              >
                <ThemedText style={styles.featureIconText}>🫘</ThemedText>
              </View>
              <View style={styles.featureContent}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.featureTitle, { color: colors.text }]}
                >
                  Bean Library
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={[
                    styles.featureDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Manage your coffee bean inventory and notes
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.primary },
                ]}
              >
                <ThemedText style={styles.featureIconText}>⏱️</ThemedText>
              </View>
              <View style={styles.featureContent}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.featureTitle, { color: colors.text }]}
                >
                  Brewing Timer
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={[
                    styles.featureDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Guided brewing with precise timing and measurements
                </ThemedText>
              </View>
            </View>
          </View>
        </Card>

        {/* Support & Links */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: colors.text }]}
          >
            Support & Information
          </ThemedText>

          <View style={styles.linkList}>
            <TouchableOpacity
              style={styles.linkItem}
              onPress={handleContactSupport}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[styles.linkText, { color: colors.primary }]}
              >
                Contact Support
              </ThemedText>
              <ThemedText style={styles.linkArrow}>→</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={handleOpenWebsite}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[styles.linkText, { color: colors.primary }]}
              >
                Visit Website
              </ThemedText>
              <ThemedText style={styles.linkArrow}>→</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkItem}
              onPress={handleOpenPrivacyPolicy}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[styles.linkText, { color: colors.primary }]}
              >
                Privacy Policy
              </ThemedText>
              <ThemedText style={styles.linkArrow}>→</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={handleOpenTerms}>
              <ThemedText
                type="defaultSemiBold"
                style={[styles.linkText, { color: colors.primary }]}
              >
                Terms of Service
              </ThemedText>
              <ThemedText style={styles.linkArrow}>→</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Credits */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: colors.text }]}
          >
            Credits
          </ThemedText>

          <ThemedText
            type="caption"
            style={[styles.creditsText, { color: colors.textSecondary }]}
          >
            Built with love for the coffee community.
            {"\n\n"}
            Special thanks to all the coffee enthusiasts who helped shape
            Brewprint into the perfect brewing companion.
          </ThemedText>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Container>
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
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  appName: {
    fontWeight: "700",
    fontSize: 28,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  versionInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  versionItem: {
    alignItems: "center",
  },
  versionLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  versionValue: {
    fontSize: 14,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconText: {
    fontSize: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  linkList: {
    gap: 4,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 15,
  },
  linkArrow: {
    fontSize: 16,
    opacity: 0.7,
  },
  creditsText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 20,
  },
});
