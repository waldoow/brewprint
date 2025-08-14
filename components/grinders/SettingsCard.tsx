import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedBadge } from "@/components/ui/ThemedBadge";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { StyleSheet, View } from "react-native";

interface GrinderSetting {
  setting_number: number;
  description: string;
  method: string;
  bean_type: string;
  notes?: string;
}

interface SettingRange {
  min: number;
  max: number;
  increment: number;
}

interface SettingsCardProps {
  settings?: GrinderSetting[];
  defaultSetting?: number;
  settingRange?: SettingRange;
}

export function SettingsCard({ settings, defaultSetting, settingRange }: SettingsCardProps) {
  const cardBackgroundColor = useThemeColor({}, "cardBackground");

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackgroundColor }]}>
      {/* Setting Range */}
      {settingRange && (
        <View style={styles.rangeSection}>
          <IconSymbol name="slider.horizontal.3" size={16} color={Colors.light.text} />
          <ThemedText style={styles.rangeLabel}>Range:</ThemedText>
          <ThemedText style={styles.rangeValue}>
            {settingRange.min} - {settingRange.max}
          </ThemedText>
          {settingRange.increment !== 1 && (
            <ThemedText style={styles.incrementValue}>
              (±{settingRange.increment})
            </ThemedText>
          )}
        </View>
      )}

      {/* Default Setting */}
      {defaultSetting && (
        <View style={styles.defaultSection}>
          <IconSymbol name="target" size={16} color={Colors.light.text} />
          <ThemedText style={styles.defaultLabel}>Default Setting:</ThemedText>
          <ThemedBadge variant="default" size="sm">
            {defaultSetting}
          </ThemedBadge>
        </View>
      )}

      {/* Custom Settings */}
      {settings && settings.length > 0 && (
        <View style={styles.settingsSection}>
          <View style={styles.settingsHeader}>
            <IconSymbol name="list.bullet" size={16} color={Colors.light.text} />
            <ThemedText style={styles.settingsTitle}>
              Saved Settings ({settings.length})
            </ThemedText>
          </View>

          {settings.slice(0, 3).map((setting, index) => (
            <View key={index} style={styles.settingItem}>
              <ThemedBadge variant="outline" size="sm">
                {setting.setting_number}
              </ThemedBadge>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingDescription}>
                  {setting.description}
                </ThemedText>
                <ThemedText style={styles.settingDetails}>
                  {setting.method} • {setting.bean_type}
                </ThemedText>
              </View>
            </View>
          ))}

          {settings.length > 3 && (
            <ThemedText style={styles.moreSettings}>
              +{settings.length - 3} more settings
            </ThemedText>
          )}
        </View>
      )}

      {/* No Settings State */}
      {(!settings || settings.length === 0) && !defaultSetting && !settingRange && (
        <View style={styles.emptyState}>
          <IconSymbol name="dial" size={24} color={Colors.light.text} style={{ opacity: 0.3 }} />
          <ThemedText style={styles.emptyText}>No settings configured</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  rangeSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rangeLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  incrementValue: {
    fontSize: 12,
    opacity: 0.6,
  },
  defaultSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  defaultLabel: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
  },
  settingsSection: {
    gap: 8,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 24,
  },
  settingInfo: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    fontWeight: "500",
  },
  settingDetails: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  moreSettings: {
    fontSize: 12,
    opacity: 0.6,
    paddingLeft: 24,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.5,
  },
});