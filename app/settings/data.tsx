import { DataLayout, DataGrid, DataSection } from "@/components/ui/DataLayout";
import { DataCard, InfoCard } from "@/components/ui/DataCard";
import { DataText } from "@/components/ui/DataText";
import { DataButton } from "@/components/ui/DataButton";
import { getTheme } from "@/constants/DataFirstDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ExportService } from "@/lib/services/export";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, Share, View } from "react-native";
import { toast } from "sonner-native";

export default function DataPrivacyScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? "light");

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

  return (
    <DataLayout
      title="Data & Privacy"
      subtitle="Export and manage your coffee data"
      scrollable
    >
      {/* Data Overview */}
      <DataSection title="Your Data" subtitle="Overview of your coffee information" spacing="lg">
        <DataCard>
          {backupStats ? (
            <DataGrid columns={2} gap="md">
              <View style={styles.statItem}>
                <DataText variant="caption" color="secondary" style={styles.statLabel}>
                  Total Items
                </DataText>
                <DataText variant="h3" weight="bold" style={styles.statValue}>
                  {backupStats.total_items}
                </DataText>
              </View>

              {Object.entries(backupStats.tables).map(([table, count]) => (
                <View key={table} style={styles.statItem}>
                  <DataText variant="caption" color="secondary" style={styles.statLabel}>
                    {table
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </DataText>
                  <DataText variant="h4" weight="semibold" style={styles.statValue}>
                    {count}
                  </DataText>
                </View>
              ))}
            </DataGrid>
          ) : (
            <View style={styles.loadingContainer}>
              <DataText variant="body" color="secondary">
                Loading data overview...
              </DataText>
            </View>
          )}
        </DataCard>
      </DataSection>

      {/* Export Section */}
      <DataSection 
        title="Export Data" 
        subtitle="Download your coffee data for backup or to use in other applications" 
        spacing="lg"
      >
        <DataCard>
          <DataGrid columns={1} gap="md">
            <DataButton
              title="Complete Backup (JSON)"
              onPress={handleExportAllData}
              variant="primary"
              loading={exporting}
              fullWidth
            />

            <DataButton
              title="Recipes (CSV)"
              onPress={handleExportBrewprintsCSV}
              variant="secondary"
              loading={exporting}
              fullWidth
            />

            <DataButton
              title="Bean Inventory (CSV)"
              onPress={handleExportBeansCSV}
              variant="secondary"
              loading={exporting}
              fullWidth
            />
          </DataGrid>

          <View style={styles.infoBox}>
            <DataText variant="caption" color="secondary" style={styles.infoText}>
              • Complete backup includes all data in JSON format for maximum compatibility{"\n"}
              • CSV exports are ideal for spreadsheet applications like Excel or Google Sheets{"\n"}
              • All exports respect your privacy - no data is sent to external servers
            </DataText>
          </View>
        </DataCard>
      </DataSection>

      {/* Privacy Section */}
      <DataSection title="Privacy & Security" spacing="lg">
        <DataCard>
          <View style={styles.privacyList}>
            <View style={styles.privacyItem}>
              <View style={[styles.privacyIcon, { backgroundColor: theme.colors.success }]}>
                <DataText style={styles.privacyIconText}>✓</DataText>
              </View>
              <View style={styles.privacyContent}>
                <DataText variant="body" weight="semibold" style={styles.privacyTitle}>
                  Local Data Storage
                </DataText>
                <DataText variant="caption" color="secondary" style={styles.privacyDescription}>
                  All your coffee data is stored securely on your device and in your personal cloud account
                </DataText>
              </View>
            </View>

            <View style={styles.privacyItem}>
              <View style={[styles.privacyIcon, { backgroundColor: theme.colors.success }]}>
                <DataText style={styles.privacyIconText}>✓</DataText>
              </View>
              <View style={styles.privacyContent}>
                <DataText variant="body" weight="semibold" style={styles.privacyTitle}>
                  No Analytics Tracking
                </DataText>
                <DataText variant="caption" color="secondary" style={styles.privacyDescription}>
                  We don&apos;t track your usage or collect personal data for analytics purposes
                </DataText>
              </View>
            </View>

            <View style={styles.privacyItem}>
              <View style={[styles.privacyIcon, { backgroundColor: theme.colors.success }]}>
                <DataText style={styles.privacyIconText}>✓</DataText>
              </View>
              <View style={styles.privacyContent}>
                <DataText variant="body" weight="semibold" style={styles.privacyTitle}>
                  Data Ownership
                </DataText>
                <DataText variant="caption" color="secondary" style={styles.privacyDescription}>
                  Your coffee data belongs to you. Export it anytime, no restrictions
                </DataText>
              </View>
            </View>
          </View>
        </DataCard>
      </DataSection>

      {/* Danger Zone */}
      <DataSection 
        title="Danger Zone" 
        subtitle="These actions cannot be undone. Please be careful." 
        spacing="lg"
      >
        <DataCard variant="error">
          <DataButton
            title="Clear All Data"
            onPress={handleClearAllData}
            variant="destructive"
            loading={clearing}
          />

          <View style={styles.warningBox}>
            <DataText variant="caption" color="error" style={styles.warningText}>
              ⚠️ This will permanently delete all your coffee data including recipes, brewing history, beans, equipment, and preferences. Make sure to export your data first!
            </DataText>
          </View>
        </DataCard>
      </DataSection>
    </DataLayout>
  );
}

const styles = {
  loadingContainer: {
    padding: 20,
    alignItems: "center" as const,
  },
  statItem: {
    alignItems: "center" as const,
    padding: 16,
  },
  statLabel: {
    textAlign: "center" as const,
    marginBottom: 4,
  },
  statValue: {
    textAlign: "center" as const,
  },
  infoBox: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
    marginTop: 16,
  },
  infoText: {
    lineHeight: 18,
  },
  privacyList: {
    gap: 20,
  },
  privacyItem: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
  },
  privacyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  privacyIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold" as const,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    marginBottom: 4,
  },
  privacyDescription: {
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.2)",
    marginTop: 16,
  },
  warningText: {
    lineHeight: 18,
  },
};