import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native-ui-lib";
import { toast } from "sonner-native";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "1";

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

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
    appCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      padding: 16,
    },
    appHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    appName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    appVersion: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },
    tagline: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: 8,
    },
    versionInfo: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 16,
    },
    versionItem: {
      flex: 1,
      alignItems: 'center',
    },
    versionLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },
    versionValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    featureList: {
      gap: 16,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    featureIcon: {
      fontSize: 18,
      minWidth: 24,
    },
    featureContent: {
      flex: 1,
    },
    featureName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    featureDescription: {
      fontSize: 10,
      color: theme.colors.text.secondary,
    },
    linkList: {
      gap: 4,
    },
    linkItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    linkText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    linkArrow: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    creditsText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });

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
          About Brewprint
        </Text>
        <Text style={styles.pageSubtitle}>
          App information and support
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Application Details
          </Text>
          <Text style={styles.sectionSubtitle}>
            App version and build information
          </Text>
          
          <View style={styles.appCard}>
            <View style={styles.appHeader}>
              <Text style={styles.appName}>
                Brewprint
              </Text>
              <Text style={styles.appVersion}>
                v{APP_VERSION}
              </Text>
            </View>

            <Text style={styles.tagline}>
              Your complete coffee recipe tracker for perfecting every brew
            </Text>

            <View style={styles.versionInfo}>
              <View style={styles.versionItem}>
                <Text style={styles.versionLabel}>
                  Version
                </Text>
                <Text style={styles.versionValue}>
                  {APP_VERSION}
                </Text>
              </View>
              <View style={styles.versionItem}>
                <Text style={styles.versionLabel}>
                  Build
                </Text>
                <Text style={styles.versionValue}>
                  {BUILD_NUMBER}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Features
          </Text>
          <Text style={styles.sectionSubtitle}>
            What's included in Brewprint
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>☕</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureName}>
                  Recipe Management
                </Text>
                <Text style={styles.featureDescription}>
                  Create, edit, and perfect your coffee brewing recipes
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureName}>
                  Analytics & Insights
                </Text>
                <Text style={styles.featureDescription}>
                  Track your brewing progress and quality trends
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🫘</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureName}>
                  Bean Library
                </Text>
                <Text style={styles.featureDescription}>
                  Manage your coffee bean inventory and notes
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>⏱️</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureName}>
                  Brewing Timer
                </Text>
                <Text style={styles.featureDescription}>
                  Guided brewing with precise timing and measurements
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Support & Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Support & Information
          </Text>
          <Text style={styles.sectionSubtitle}>
            Get help and learn more
          </Text>
          
          <View style={styles.linkList}>
            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={handleContactSupport}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Contact Support
              </Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={handleOpenWebsite}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Visit Website
              </Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={handleOpenPrivacyPolicy}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Privacy Policy
              </Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.linkItem, { borderBottomWidth: 0 }]} 
              onPress={handleOpenTerms}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Terms of Service
              </Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Credits
          </Text>
          <Text style={styles.sectionSubtitle}>
            Acknowledgments and thanks
          </Text>
          
          <Text style={styles.creditsText}>
            Built with love for the coffee community.
            {"\n\n"}
            Special thanks to all the coffee enthusiasts who helped shape
            Brewprint into the perfect brewing companion.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
