import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { getTheme } from "@/constants/ProfessionalDesign";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={theme.colors.text}
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
        tabBarActiveTintColor: theme.colors.text, // Professional black/white active color
        tabBarInactiveTintColor: theme.colors.textSecondary, // Professional gray inactive color
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingTop: 8, // Clean professional spacing
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          height: Platform.OS === "ios" ? 80 : 60, // Professional proportions
        },
        tabBarLabelStyle: {
          fontSize: 10, // Clean professional font size
          fontWeight: "500",
          marginTop: 4, // Professional spacing
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
