// components/ui/ActionSheet.tsx
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface Action {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  actions: Action[];
  title?: string;
}

export function ActionSheet({
  visible,
  onClose,
  actions,
  title,
}: ActionSheetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      </Pressable>

      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        {title && (
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
        )}

        {actions.map((action, index) => (
          <Pressable
            key={action.id}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (error) {
                // Haptics not available, continue without feedback
              }
              action.onPress();
              onClose();
            }}
            style={({ pressed }) => [
              styles.action,
              {
                backgroundColor: pressed
                  ? colors.surfaceElevated
                  : "transparent",
              },
              index < actions.length - 1 && styles.actionBorder,
              { borderBottomColor: colors.border },
            ]}
          >
            <ThemedText type="body">{action.title}</ThemedText>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  title: {
    textAlign: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontWeight: "600",
  },
  action: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
