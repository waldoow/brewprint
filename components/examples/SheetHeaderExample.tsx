import React from "react";
import { ScrollView, StyleSheet } from "react-native";

import { ThemedButton } from "@/components/ui/ThemedButton";
import { SheetHeader } from "@/components/ui/SheetHeader";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";

export function SheetHeaderExample() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>SheetHeader Examples</ThemedText>

        {/* Header with Subtitle */}
        <ThemedView style={styles.example}>
          <SheetHeader
            title="Add New Bean"
            subtitle="Coffee inventory management"
            onClose={() => console.log("Close pressed")}
            showCloseButton={true}
          />
          <ThemedView style={styles.exampleContent} noBackground>
            <ThemedText>
              Header with both title and subtitle for context.
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Header with Custom Content */}
        <ThemedView style={styles.example}>
          <SheetHeader
            title="Settings"
            subtitle="Configure your preferences"
            onClose={() => console.log("Close pressed")}
            customContent={
              <ThemedView style={styles.customContent} noBackground>
                <ThemedButton title="Save Changes" size="sm" />
              </ThemedView>
            }
          />
          <ThemedView style={styles.exampleContent} noBackground>
            <ThemedText>
              Header with custom content area for additional actions.
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Header without Close Button */}
        <ThemedView style={styles.example}>
          <SheetHeader
            title="Information"
            subtitle="Read-only content"
            showCloseButton={false}
          />
          <ThemedView style={styles.exampleContent} noBackground>
            <ThemedText>
              Header without close button for informational sheets.
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Custom Themed Header */}
        <ThemedView style={styles.example}>
          <SheetHeader
            title="Custom Theme"
            subtitle="Coffee-themed header"
            onClose={() => console.log("Close pressed")}
            lightColor="#8B4513"
            darkColor="#5D2F0A"
            lightTextColor="#FFFFFF"
            darkTextColor="#F5F5DC"
          />
          <ThemedView style={styles.exampleContent} noBackground>
            <ThemedText>Header with custom coffee-themed colors.</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  example: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exampleContent: {
    padding: 20,
  },
  customContent: {
    alignItems: "flex-end",
  },
});
