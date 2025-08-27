// Initialize RNUI configuration first (must be before any RNUI imports)
import "@/config/rnui-config";

import { initializeRNUITheme } from "@/constants/RNUITheme";
import { AuthProvider } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Initialize RNUI theme on mount and when color scheme changes
  useEffect(() => {
    initializeRNUITheme();
  }, [colorScheme]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <AuthProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            key={colorScheme}
          >
            <Stack
              screenOptions={{
                headerShown: false,
                ...Platform.select({
                  ios: {
                    animation: "default",
                  },
                  android: {
                    animation: "slide_from_right",
                  },
                }),
              }}
              initialRouteName="index"
            >
              <SafeAreaView
                edges={["bottom", "left", "right"]}
                style={{ flex: 1, backgroundColor: "red" }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </SafeAreaView>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="brewprints" />
              <Stack.Screen name="brewing/[id]" />
              <Stack.Screen name="settings/about" />
              <Stack.Screen name="settings/data" />
              <Stack.Screen name="settings/notifications" />
              <Stack.Screen name="settings/preferences" />
              <Stack.Screen name="settings/profile" />
              <Stack.Screen name="folders/new" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <Toaster
              position="top-center"
              duration={3000}
              swipeToDismissDirection="up"
              visibleToasts={2}
            />
          </ThemeProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
