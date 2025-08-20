import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? "light"].tint}
        />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "dark"].accent, // Using purple accent color
        tabBarInactiveTintColor: Colors[colorScheme ?? "dark"].textTertiary, // More subtle inactive color
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? "dark"].surface,
          borderTopColor: Colors[colorScheme ?? "dark"].borderSubtle, // More subtle border
          borderTopWidth: 1,
          paddingTop: 12, // Increased top padding
          paddingBottom: Platform.OS === "ios" ? 24 : 12, // Increased bottom padding
          height: Platform.OS === "ios" ? 88 : 64, // Increased height for better proportions
        },
        tabBarLabelStyle: {
          fontSize: 11, // Slightly smaller for professional look
          fontWeight: "500",
          letterSpacing: 0.2,
          marginTop: 2, // Added margin for better spacing
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        animation: "shift",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="brewprints"
        options={{
          title: "Brewprints",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="cup.and.saucer.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="books.vertical" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: "Organization",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="folder.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
