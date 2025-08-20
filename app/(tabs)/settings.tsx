import { StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { Header } from '@/components/ui/Header';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: signOut 
        },
      ]
    );
  };

  const systemSections = [
    {
      title: "BREWING PREFERENCES",
      description: "Units • Temperature scale • Timer precision • Default parameters",
      icon: "slider.horizontal.3",
      route: "/settings/preferences",
      category: "system",
      priority: 1,
    },
    {
      title: "DATA MANAGEMENT", 
      description: "Backup • Export formats • Cloud sync • Import/export operations",
      icon: "tray.and.arrow.up",
      route: "/settings/data",
      category: "system",
      priority: 2,
    },
    {
      title: "BREWING ALERTS",
      description: "Timer notifications • Freshness warnings • Extraction alerts", 
      icon: "bell",
      route: "/settings/notifications",
      category: "system",
      priority: 3,
    },
  ];

  const advancedSections = [
    {
      title: "EQUIPMENT PROFILES",
      description: "Grinder calibration • Water chemistry • Brewing device settings",
      icon: "wrench.and.screwdriver",
      route: "/settings/equipment",
      category: "advanced",
      priority: 1,
    },
    {
      title: "EXTRACTION ANALYTICS",
      description: "TDS calculation • Yield analysis • Performance metrics",
      icon: "chart.line.uptrend.xyaxis",
      route: "/settings/analytics",
      category: "advanced",
      priority: 2,
    },
    {
      title: "SYSTEM DIAGNOSTICS",
      description: "Performance monitoring • Error logs • Debug information",
      icon: "stethoscope",
      route: "/settings/diagnostics",
      category: "advanced",
      priority: 3,
    },
  ];

  const accountSections = [
    {
      title: "PROFILE MANAGEMENT",
      description: "User settings • Authentication • Session management",
      icon: "person.crop.circle",
      route: "/settings/profile",
      category: "account",
      priority: 1,
    },
    {
      title: "PRIVACY & SECURITY",
      description: "Data protection • Access control • Privacy settings",
      icon: "lock.shield",
      route: "/settings/privacy",
      category: "account",
      priority: 2,
    },
    {
      title: "ABOUT & SUPPORT",
      description: "Version info • Documentation • Technical support",
      icon: "info.circle",
      route: "/settings/about",
      category: "account",
      priority: 3,
    },
  ];

  return (
    <ThemedView noBackground={false} style={styles.container}>
      {/* Professional Header for System Configuration */}
      <Header 
        title="System Configuration"
        subtitle="Advanced brewing system settings and preferences"
        showBackButton={false}
        showMenuButton={true}
        showProfileAvatar={true}
        showSearchButton={false}
        onMenuPress={() => console.log('Menu pressed')}
        onProfilePress={() => console.log('Profile pressed')}
        showTopSpacing={true}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* System Settings Section */}
        <ThemedView style={styles.configurationSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              SYSTEM SETTINGS
            </ThemedText>
            <ThemedText style={[styles.sectionCount, { color: colors.textSecondary }]}>
              {systemSections.length}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.settingsGrid}>
            {systemSections.map((setting, index) => (
              <TouchableOpacity 
                key={`system-${index}`}
                style={[styles.advancedSettingCard, { 
                  backgroundColor: colors.cardBackground,
                  borderLeftColor: colors.primary,
                }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  console.log(`${setting.title} - Implementation required`);
                }}
              >
                <ThemedView style={styles.settingHeader}>
                  <ThemedView style={styles.settingMain}>
                    <ThemedText style={[styles.settingTitleAdvanced, { color: colors.text }]}>
                      {setting.title}
                    </ThemedText>
                    <ThemedText style={[styles.settingDescriptionAdvanced, { color: colors.textSecondary }]}>
                      {setting.description}
                    </ThemedText>
                  </ThemedView>
                  <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
                </ThemedView>
                
                <ThemedView style={styles.settingAnalytics}>
                  <ThemedView style={styles.analyticsItem}>
                    <ThemedText style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                      PRIORITY
                    </ThemedText>
                    <ThemedText style={[styles.analyticsValue, { color: colors.text }]}>
                      {setting.priority}
                    </ThemedText>
                  </ThemedView>
                  
                  <ThemedView style={styles.analyticsItem}>
                    <ThemedText style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                      STATUS
                    </ThemedText>
                    <ThemedText style={[styles.analyticsValue, { color: colors.statusYellow }]}>
                      CONFIG
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Advanced Features Section */}
        <ThemedView style={styles.configurationSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              ADVANCED FEATURES
            </ThemedText>
            <ThemedText style={[styles.sectionCount, { color: colors.textSecondary }]}>
              {advancedSections.length}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.settingsGrid}>
            {advancedSections.map((setting, index) => (
              <TouchableOpacity 
                key={`advanced-${index}`}
                style={[styles.advancedSettingCard, { 
                  backgroundColor: colors.cardBackground,
                  borderLeftColor: colors.statusGreen,
                }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  console.log(`${setting.title} - Professional feature`);
                }}
              >
                <ThemedView style={styles.settingHeader}>
                  <ThemedView style={styles.settingMain}>
                    <ThemedText style={[styles.settingTitleAdvanced, { color: colors.text }]}>
                      {setting.title}
                    </ThemedText>
                    <ThemedText style={[styles.settingDescriptionAdvanced, { color: colors.textSecondary }]}>
                      {setting.description}
                    </ThemedText>
                  </ThemedView>
                  <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
                </ThemedView>
                
                <ThemedView style={styles.settingAnalytics}>
                  <ThemedView style={styles.analyticsItem}>
                    <ThemedText style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                      COMPLEXITY
                    </ThemedText>
                    <ThemedText style={[styles.analyticsValue, { color: colors.text }]}>
                      HIGH
                    </ThemedText>
                  </ThemedView>
                  
                  <ThemedView style={styles.analyticsItem}>
                    <ThemedText style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                      ACCESS
                    </ThemedText>
                    <ThemedText style={[styles.analyticsValue, { color: colors.statusGreen }]}>
                      EXPERT
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Account Management Section */}
        <ThemedView style={styles.configurationSection}>
          <ThemedView style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              ACCOUNT MANAGEMENT
            </ThemedText>
            <ThemedText style={[styles.sectionCount, { color: colors.textSecondary }]}>
              {accountSections.length}
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.settingsGrid}>
            {accountSections.map((setting, index) => (
              <TouchableOpacity 
                key={`account-${index}`}
                style={[styles.advancedSettingCard, { 
                  backgroundColor: colors.cardBackground,
                  borderLeftColor: colors.statusRed,
                }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  console.log(`${setting.title} - Account feature`);
                }}
              >
                <ThemedView style={styles.settingHeader}>
                  <ThemedView style={styles.settingMain}>
                    <ThemedText style={[styles.settingTitleAdvanced, { color: colors.text }]}>
                      {setting.title}
                    </ThemedText>
                    <ThemedText style={[styles.settingDescriptionAdvanced, { color: colors.textSecondary }]}>
                      {setting.description}
                    </ThemedText>
                  </ThemedView>
                  <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
                </ThemedView>
                
                <ThemedView style={styles.settingAnalytics}>
                  <ThemedView style={styles.analyticsItem}>
                    <ThemedText style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                      SECURITY
                    </ThemedText>
                    <ThemedText style={[styles.analyticsValue, { color: colors.text }]}>
                      HIGH
                    </ThemedText>
                  </ThemedView>
                  
                  <ThemedView style={styles.analyticsItem}>
                    <ThemedText style={[styles.analyticsLabel, { color: colors.textSecondary }]}>
                      REQUIRED
                    </ThemedText>
                    <ThemedText style={[styles.analyticsValue, { color: colors.statusRed }]}>
                      YES
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* User Session Information */}
        <ThemedView style={[styles.sessionCard, { 
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        }]}>
          <ThemedView style={styles.sessionHeader}>
            <ThemedText style={[styles.sessionTitle, { color: colors.text }]}>
              ACTIVE SESSION
            </ThemedText>
            <ThemedText style={[styles.sessionStatus, { color: colors.statusGreen }]}>
              AUTHENTICATED
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.sessionDetails}>
            <ThemedView style={styles.sessionRow}>
              <ThemedText style={[styles.sessionLabel, { color: colors.textSecondary }]}>
                USER
              </ThemedText>
              <ThemedText style={[styles.sessionValue, { color: colors.text }]}>
                {user?.email || 'Unknown'}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.sessionRow}>
              <ThemedText style={[styles.sessionLabel, { color: colors.textSecondary }]}>
                SESSION
              </ThemedText>
              <ThemedText style={[styles.sessionValue, { color: colors.text }]}>
                {new Date().toLocaleDateString()}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedButton
            onPress={handleSignOut}
            variant="outline"
            style={styles.terminateButton}
          >
            TERMINATE SESSION
          </ThemedButton>
        </ThemedView>
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
  configurationSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  
  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  
  // Settings grid
  settingsGrid: {
    gap: 12,
  },
  
  // Advanced setting card styles
  advancedSettingCard: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  settingMain: {
    flex: 1,
  },
  settingTitleAdvanced: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  settingDescriptionAdvanced: {
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Setting analytics
  settingAnalytics: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  analyticsItem: {
    flex: 1,
  },
  analyticsLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  analyticsValue: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  
  // Session card
  sessionCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sessionStatus: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Session details
  sessionDetails: {
    gap: 8,
    marginBottom: 16,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  sessionValue: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flex: 2,
  },
  
  // Terminate button
  terminateButton: {
    alignSelf: 'flex-start',
    minWidth: 160,
  },
});