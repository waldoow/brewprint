import { ExportService } from "@/lib/services/export";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, Share, StyleSheet, ScrollView } from "react-native";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native-ui-lib";
import { toast } from "sonner-native";
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function DataPrivacyScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const [backupStats, setBackupStats] = useState<{
    total_items: number;
    tables: Record<string, number>;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadBackupStats();
  }, []);

  const loadBackupStats = async () => {
    try {
      const result = await ExportService.getBackupStats();
      if (result.success && result.data) {
        setBackupStats(result.data);
      }
    } catch (error) {
      console.error("Failed to load backup stats:", error);
    }
  };

  const handleExportAllData = async () => {
    try {
      setExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await ExportService.exportAllData();

      if (result.success && result.data) {
        const filename = ExportService.generateBackupFilename("json");
        const fileUri = `${FileSystem.documentDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(
          fileUri,
          JSON.stringify(result.data, null, 2)
        );

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/json",
            dialogTitle: "Export Brewprint Data",
          });
        } else {
          // Fallback to Share API
          await Share.share({
            title: "Brewprint Data Export",
            message: "Your complete Brewprint data backup",
            url: fileUri,
          });
        }

        toast.success("Data exported successfully!");
      } else {
        toast.error(result.error || "Export failed");
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleExportBrewprintsCSV = async () => {
    try {
      setExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ExportService.exportBrewprintsCSV();

      if (result.success && result.data) {
        const filename = "brewprints-export.csv";
        const fileUri = `${FileSystem.documentDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(fileUri, result.data);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Export Brewprints",
          });
        }

        toast.success("Brewprints exported as CSV!");
      } else {
        toast.error(result.error || "CSV export failed");
      }
    } catch (error) {
      console.error("CSV export failed:", error);
      toast.error("CSV export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleExportBeansCSV = async () => {
    try {
      setExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ExportService.exportBeansCSV();

      if (result.success && result.data) {
        const filename = "beans-inventory-export.csv";
        const fileUri = `${FileSystem.documentDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(fileUri, result.data);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "text/csv",
            dialogTitle: "Export Bean Inventory",
          });
        }

        toast.success("Bean inventory exported as CSV!");
      } else {
        toast.error(result.error || "CSV export failed");
      }
    } catch (error) {
      console.error("CSV export failed:", error);
      toast.error("CSV export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete ALL your coffee data including beans, recipes, brewing history, and equipment. This action cannot be undone.\n\nAre you absolutely sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "I understand - Delete Everything",
          style: "destructive",
          onPress: () => {
            // Double confirmation
            Alert.alert(
              "Final Confirmation",
              'Type "CONFIRM DELETE" to proceed with deleting all data.',
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete All Data",
                  style: "destructive",
                  onPress: confirmClearAllData,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const confirmClearAllData = async () => {
    try {
      setClearing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const result = await ExportService.clearAllData(
        "CONFIRM_DELETE_ALL_DATA"
      );

      if (result.success) {
        toast.success("All data cleared successfully");
        // Refresh stats
        await loadBackupStats();
      } else {
        toast.error(result.error || "Failed to clear data");
      }
    } catch (error) {
      console.error("Failed to clear data:", error);
      toast.error("Failed to clear data");
    } finally {
      setClearing(false);
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
    dataCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      padding: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    statItem: {
      alignItems: 'center',
      padding: 16,
      minWidth: '45%',
    },
    statLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    statValueSmall: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    exportButtons: {
      gap: 12,
    },
    primaryButton: {
      backgroundColor: theme.colors.info,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.inverse,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    dangerButton: {
      backgroundColor: theme.colors.error,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: 'center',
    },
    dangerButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.inverse,
    },
    infoBox: {
      backgroundColor: 'rgba(37, 99, 235, 0.05)',
      borderWidth: 1,
      borderColor: theme.colors.info,
      padding: 12,
      borderRadius: 6,
      marginTop: 16,
    },
    infoText: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      lineHeight: 18,
    },
    privacyList: {
      gap: 20,
    },
    privacyItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    privacyIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    privacyIconText: {
      color: theme.colors.text.inverse,
      fontSize: 14,
      fontWeight: '600',
    },
    privacyContent: {
      flex: 1,
    },
    privacyTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    privacyDescription: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      lineHeight: 18,
    },
    dangerZone: {
      backgroundColor: 'rgba(220, 38, 38, 0.05)',
      borderWidth: 1,
      borderColor: theme.colors.error,
      borderRadius: 6,
      padding: 16,
    },
    warningBox: {
      backgroundColor: 'rgba(220, 38, 38, 0.05)',
      borderWidth: 1,
      borderColor: theme.colors.error,
      padding: 12,
      borderRadius: 6,
      marginTop: 16,
    },
    warningText: {
      fontSize: 10,
      color: theme.colors.error,
      lineHeight: 18,
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
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
          Data & Privacy
        </Text>
        <Text style={styles.pageSubtitle}>
          Export and manage your coffee data
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Data Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Your Data
          </Text>
          <Text style={styles.sectionSubtitle}>
            Overview of your coffee information
          </Text>
          
          <View style={styles.dataCard}>
            {backupStats ? (
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>
                    Total Items
                  </Text>
                  <Text style={styles.statValue}>
                    {backupStats.total_items}
                  </Text>
                </View>

                {Object.entries(backupStats.tables).map(([table, count]) => (
                  <View key={table} style={styles.statItem}>
                    <Text style={styles.statLabel}>
                      {table
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Text>
                    <Text style={styles.statValueSmall}>
                      {count}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Loading data overview...
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Export Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Export Data
          </Text>
          <Text style={styles.sectionSubtitle}>
            Download your coffee data for backup or to use in other applications
          </Text>
          
          <View style={styles.exportButtons}>
            <TouchableOpacity
              style={[styles.primaryButton, exporting && { opacity: 0.5 }]}
              onPress={handleExportAllData}
              disabled={exporting}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>
                Complete Backup (JSON)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, exporting && { opacity: 0.5 }]}
              onPress={handleExportBrewprintsCSV}
              disabled={exporting}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>
                Recipes (CSV)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, exporting && { opacity: 0.5 }]}
              onPress={handleExportBeansCSV}
              disabled={exporting}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>
                Bean Inventory (CSV)
              </Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                • Complete backup includes all data in JSON format for maximum compatibility{"\n"}
                • CSV exports are ideal for spreadsheet applications like Excel or Google Sheets{"\n"}
                • All exports respect your privacy - no data is sent to external servers
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Privacy & Security
          </Text>
          <Text style={styles.sectionSubtitle}>
            Your data protection and privacy assurance
          </Text>
          
          <View style={styles.privacyList}>
            <View style={styles.privacyItem}>
              <View style={styles.privacyIcon}>
                <Text style={styles.privacyIconText}>✓</Text>
              </View>
              <View style={styles.privacyContent}>
                <Text style={styles.privacyTitle}>
                  Local Data Storage
                </Text>
                <Text style={styles.privacyDescription}>
                  All your coffee data is stored securely on your device and in your personal cloud account
                </Text>
              </View>
            </View>

            <View style={styles.privacyItem}>
              <View style={styles.privacyIcon}>
                <Text style={styles.privacyIconText}>✓</Text>
              </View>
              <View style={styles.privacyContent}>
                <Text style={styles.privacyTitle}>
                  No Analytics Tracking
                </Text>
                <Text style={styles.privacyDescription}>
                  We don't track your usage or collect personal data for analytics purposes
                </Text>
              </View>
            </View>

            <View style={styles.privacyItem}>
              <View style={styles.privacyIcon}>
                <Text style={styles.privacyIconText}>✓</Text>
              </View>
              <View style={styles.privacyContent}>
                <Text style={styles.privacyTitle}>
                  Data Ownership
                </Text>
                <Text style={styles.privacyDescription}>
                  Your coffee data belongs to you. Export it anytime, no restrictions
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Danger Zone
          </Text>
          <Text style={styles.sectionSubtitle}>
            These actions cannot be undone. Please be careful.
          </Text>
          
          <View style={styles.dangerZone}>
            <TouchableOpacity
              style={[styles.dangerButton, clearing && { opacity: 0.5 }]}
              onPress={handleClearAllData}
              disabled={clearing}
              activeOpacity={0.7}
            >
              <Text style={styles.dangerButtonText}>
                Clear All Data
              </Text>
            </TouchableOpacity>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ This will permanently delete all your coffee data including recipes, brewing history, beans, equipment, and preferences. Make sure to export your data first!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}