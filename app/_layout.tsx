import { AuthProvider } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

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
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="beans" />
              <Stack.Screen name="brewers" />
              <Stack.Screen name="brewprints" />
              <Stack.Screen name="bean-detail/[id]" />
              <Stack.Screen name="brewer-detail/[id]" />
              <Stack.Screen name="brewing/[id]" />
              <Stack.Screen name="brewing/[id]/results" />
              <Stack.Screen name="settings/about" />
              <Stack.Screen name="settings/data" />
              <Stack.Screen name="settings/notifications" />
              <Stack.Screen name="settings/preferences" />
              <Stack.Screen name="settings/profile" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            <Toaster
              position="bottom-center"
              duration={3000}
              swipeToDismissDirection="up"
              visibleToasts={4}
            />
          </ThemeProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
