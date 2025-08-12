import { Header } from "@/components/ui/Header";
import { ThemedButton } from "@/components/ui/ThemedButton";
import { ThemedInput } from "@/components/ui/ThemedInput";
import { ThemedText } from "@/components/ui/ThemedText";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <>
      <Header
        title="Brewprint"
        subtitle="Your Coffee Journey"
        showBackButton={false}
        customContent={<ThemedButton title="New Brew" onPress={() => {}} />}
      />
      <ScrollView style={styles.container}>
        <ThemedButton
          title="New Brew"
          onPress={() => {
            console.log("New Brew");
          }}
        />
        <ThemedInput
          placeholder="Search"
          value={"Search"}
          onChangeText={(text) => {
            console.log(text);
          }}
        />
        <ThemedText>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.
        </ThemedText>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20, // Add spacing between header and content
  },
  header: {
    marginBottom: 20, // Add bottom margin to the header
  },
  sectionContainer: {
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#8B4513", // Coffee brown color
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    textTransform: "capitalize",
  },
});
