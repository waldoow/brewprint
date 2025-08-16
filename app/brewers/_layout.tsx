import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function BrewersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        ...Platform.select({
          ios: {
            animation: "default", // Use iOS default slide animation
          },
          android: {
            animation: "slide_from_right",
          },
        }),
      }}
      initialRouteName="new"
    >
      <Stack.Screen
        name="new"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}