import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedBadge } from '@/components/ui/ThemedBadge';
import { Header } from '@/components/ui/Header';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import { toast } from 'sonner-native';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const handleContactSupport = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const email = 'support@brewprint.app';
      const subject = 'Brewprint Support Request';
      const body = `App Version: ${APP_VERSION}\nBuild: ${BUILD_NUMBER}\n\nPlease describe your issue:\n`;
      
      const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error('Email app not available');
      }
    } catch (error) {
      console.error('Failed to open email:', error);
      toast.error('Failed to open email');
    }
  };

  const handleOpenWebsite = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const url = 'https://brewprint.app';
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error('Cannot open website');
      }
    } catch (error) {
      console.error('Failed to open website:', error);
      toast.error('Failed to open website');
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const url = 'https://brewprint.app/privacy';
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error('Cannot open privacy policy');
      }
    } catch (error) {
      console.error('Failed to open privacy policy:', error);
      toast.error('Failed to open privacy policy');
    }
  };

  const handleOpenTerms = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const url = 'https://brewprint.app/terms';
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error('Cannot open terms of service');
      }
    } catch (error) {
      console.error('Failed to open terms:', error);
      toast.error('Failed to open terms');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Header 
        title="About" 
        onBack={() => router.back()}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Info */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.appHeader}>
            <ThemedText type="title" style={[styles.appName, { color: colors.text }]}>
              Brewprint
            </ThemedText>
            <ThemedBadge variant="secondary" size="sm">
              v{APP_VERSION}
            </ThemedBadge>
          </View>
          
          <ThemedText type="caption" style={[styles.tagline, { color: colors.textSecondary }]}>
            Your complete coffee recipe tracker for perfecting every brew
          </ThemedText>
          
          <View style={styles.versionInfo}>
            <View style={styles.versionItem}>
              <ThemedText type="caption" style={[styles.versionLabel, { color: colors.textSecondary }]}>
                Version
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.versionValue, { color: colors.text }]}>
                {APP_VERSION}
              </ThemedText>
            </View>
            
            <View style={styles.versionItem}>
              <ThemedText type="caption" style={[styles.versionLabel, { color: colors.textSecondary }]}>
                Build
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.versionValue, { color: colors.text }]}>
                {BUILD_NUMBER}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            What's Included
          </ThemedText>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.featureIconText}>☕</ThemedText>
              </View>
              <View style={styles.featureContent}>
                <ThemedText type="defaultSemiBold" style={[styles.featureTitle, { color: colors.text }]}>
                  Recipe Management
                </ThemedText>
                <ThemedText type="caption" style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Create, edit, and perfect your coffee brewing recipes
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.featureIconText}>📊</ThemedText>
              </View>
              <View style={styles.featureContent}>
                <ThemedText type="defaultSemiBold" style={[styles.featureTitle, { color: colors.text }]}>
                  Analytics & Insights
                </ThemedText>
                <ThemedText type="caption" style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Track your brewing progress and quality trends
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.featureIconText}>🫘</ThemedText>
              </View>
              <View style={styles.featureContent}>
                <ThemedText type="defaultSemiBold" style={[styles.featureTitle, { color: colors.text }]}>
                  Bean Library
                </ThemedText>
                <ThemedText type="caption" style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Manage your coffee bean inventory and notes
                </ThemedText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.featureIconText}>⏱️</ThemedText>
              </View>
              <View style={styles.featureContent}>
                <ThemedText type="defaultSemiBold" style={[styles.featureTitle, { color: colors.text }]}>
                  Brewing Timer
                </ThemedText>
                <ThemedText type="caption" style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  Guided brewing with precise timing and measurements
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Support & Links */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Support & Information
          </ThemedText>

          <View style={styles.linkList}>
            <TouchableOpacity style={styles.linkItem} onPress={handleContactSupport}>
              <ThemedText type="defaultSemiBold" style={[styles.linkText, { color: colors.primary }]}>
                Contact Support
              </ThemedText>
              <ThemedText style={styles.linkArrow}>→</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={handleOpenWebsite}>
              <ThemedText type="defaultSemiBold" style={[styles.linkText, { color: colors.primary }]}>
                Visit Website
              </ThemedText>
              <ThemedText style={styles.linkArrow}>→</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={handleOpenPrivacyPolicy}>
              <ThemedText type="defaultSemiBold" style={[styles.linkText, { color: colors.primary }]}>
                Privacy Policy
              </ThemedText>
              <ThemedText style={styles.linkArrow}>→</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={handleOpenTerms}>
              <ThemedText type="defaultSemiBold" style={[styles.linkText, { color: colors.primary }]}>
                Terms of Service
              </ThemedText>
              <ThemedText style={styles.linkArrow}>→</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Credits */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
            Credits
          </ThemedText>
          
          <ThemedText type="caption" style={[styles.creditsText, { color: colors.textSecondary }]}>
            Built with love for the coffee community.
            {'\n\n'}
            Special thanks to all the coffee enthusiasts who helped shape Brewprint into the perfect brewing companion.
          </ThemedText>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appName: {
    fontWeight: '700',
    fontSize: 28,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  versionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  versionItem: {
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  versionValue: {
    fontSize: 14,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});