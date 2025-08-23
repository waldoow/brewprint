import { ProfessionalContainer } from "@/components/ui/professional/Container";
import { ProfessionalHeader } from "@/components/ui/professional/Header";
import { getTheme } from "@/constants/ProfessionalDesign";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ExportService } from "@/lib/services/export";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, View } from "react-native";
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
    <ProfessionalContainer scrollable>
      <ProfessionalHeader
        title="Data & Privacy"
        subtitle="Export and manage your coffee data"
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
        {/* Data Overview */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: colors.text }]}
          >
            Your Data
          </ThemedText>

          {backupStats ? (
            <View style={styles.statsGrid}>
              <View
                style={[styles.statItem, { backgroundColor: colors.surface }]}
              >
                <ThemedText
                  type="caption"
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total Items
                </ThemedText>
                <ThemedText
                  type="title"
                  style={[styles.statValue, { color: colors.text }]}
                >
                  {backupStats.total_items}
                </ThemedText>
              </View>

              {Object.entries(backupStats.tables).map(([table, count]) => (
                <View
                  key={table}
                  style={[styles.statItem, { backgroundColor: colors.surface }]}
                >
                  <ThemedText
                    type="caption"
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    {table
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </ThemedText>
                  <ThemedText
                    type="subtitle"
                    style={[styles.statValue, { color: colors.text }]}
                  >
                    {count}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ThemedText style={{ color: colors.textSecondary }}>
                Loading data overview...
              </ThemedText>
            </View>
          )}
        </View>

        {/* Export Section */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: colors.text }]}
          >
            Export Data
          </ThemedText>
          <ThemedText
            type="caption"
            style={[styles.sectionDescription, { color: colors.textSecondary }]}
          >
            Download your coffee data for backup or to use in other applications
          </ThemedText>

          <View style={styles.actionGrid}>
            <ThemedButton
              title="Complete Backup (JSON)"
              onPress={handleExportAllData}
              variant="default"
              size="default"
              loading={exporting}
              style={styles.exportButton}
            />

            <ThemedButton
              title="Recipes (CSV)"
              onPress={handleExportBrewprintsCSV}
              variant="secondary"
              size="default"
              loading={exporting}
              style={styles.exportButton}
            />

            <ThemedButton
              title="Bean Inventory (CSV)"
              onPress={handleExportBeansCSV}
              variant="secondary"
              size="default"
              loading={exporting}
              style={styles.exportButton}
            />
          </View>

          <View style={styles.infoBox}>
            <ThemedText
              type="caption"
              style={[styles.infoText, { color: colors.textSecondary }]}
            >
              • Complete backup includes all data in JSON format for maximum
              compatibility
              {"\n"}• CSV exports are ideal for spreadsheet applications like
              Excel or Google Sheets
              {"\n"}• All exports respect your privacy - no data is sent to
              external servers
            </ThemedText>
          </View>
        </View>

        {/* Privacy Section */}
        <View
          style={[styles.section, { backgroundColor: colors.cardBackground }]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: colors.text }]}
          >
            Privacy & Security
          </ThemedText>

          <View style={styles.privacyList}>
            <View style={styles.privacyItem}>
              <View
                style={[
                  styles.privacyIcon,
                  { backgroundColor: colors.statusGreen },
                ]}
              >
                <ThemedText style={styles.privacyIconText}>✓</ThemedText>
              </View>
              <View style={styles.privacyContent}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.privacyTitle, { color: colors.text }]}
                >
                  Local Data Storage
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={[
                    styles.privacyDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  All your coffee data is stored securely on your device and in
                  your personal cloud account
                </ThemedText>
              </View>
            </View>

            <View style={styles.privacyItem}>
              <View
                style={[
                  styles.privacyIcon,
                  { backgroundColor: colors.statusGreen },
                ]}
              >
                <ThemedText style={styles.privacyIconText}>✓</ThemedText>
              </View>
              <View style={styles.privacyContent}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.privacyTitle, { color: colors.text }]}
                >
                  No Analytics Tracking
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={[
                    styles.privacyDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  We don&apos;t track your usage or collect personal data for
                  analytics purposes
                </ThemedText>
              </View>
            </View>

            <View style={styles.privacyItem}>
              <View
                style={[
                  styles.privacyIcon,
                  { backgroundColor: colors.statusGreen },
                ]}
              >
                <ThemedText style={styles.privacyIconText}>✓</ThemedText>
              </View>
              <View style={styles.privacyContent}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.privacyTitle, { color: colors.text }]}
                >
                  Data Ownership
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={[
                    styles.privacyDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Your coffee data belongs to you. Export it anytime, no
                  restrictions
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View
          style={[
            styles.dangerSection,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.error,
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.sectionTitle, { color: colors.error }]}
          >
            Danger Zone
          </ThemedText>
          <ThemedText
            type="caption"
            style={[styles.sectionDescription, { color: colors.textSecondary }]}
          >
            These actions cannot be undone. Please be careful.
          </ThemedText>

          <ThemedButton
            title="Clear All Data"
            onPress={handleClearAllData}
            variant="destructive"
            size="default"
            loading={clearing}
            style={styles.dangerButton}
          />

          <View style={styles.warningBox}>
            <ThemedText
              type="caption"
              style={[styles.warningText, { color: colors.error }]}
            >
              ⚠️ This will permanently delete all your coffee data including
              recipes, brewing history, beans, equipment, and preferences. Make
              sure to export your data first!
            </ThemedText>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ProfessionalContainer>
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
  dangerSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    minWidth: "30%",
    maxWidth: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontWeight: "700",
  },
  actionGrid: {
    gap: 12,
    marginBottom: 16,
  },
  exportButton: {
    alignSelf: "stretch",
  },
  infoBox: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
  },
  privacyList: {
    gap: 16,
  },
  privacyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  privacyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  privacyIconText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    marginBottom: 2,
  },
  privacyDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  dangerButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.2)",
  },
  warningText: {
    fontSize: 12,
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});
