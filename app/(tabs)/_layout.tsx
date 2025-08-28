import { BlurView } from "expo-blur";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "react-native-ui-lib";
import { useAuth } from "@/context/AuthContext";

export default function TabLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={Colors.blue30}
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
        tabBarActiveTintColor: Colors.blue30,
        tabBarInactiveTintColor: Colors.grey40,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.grey60,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 34 : 16,
          height: Platform.OS === "ios" ? 88 : 70,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
          letterSpacing: 0.3,
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        ),
        animation: "shift",
        tabBarHideOnKeyboard: false,
        tabBarVisibilityAnimationConfig: {
          show: { animation: "timing", config: { duration: 200 } },
          hide: { animation: "timing", config: { duration: 200 } },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="brewprints"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="cup.and.saucer.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="books.vertical" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: "Folders",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="folder.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
