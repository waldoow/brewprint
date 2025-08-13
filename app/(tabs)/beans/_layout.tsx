import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function BeansLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
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
    >
      <Stack.Screen
        name="[id]/index"
        options={{
          presentation: "card",
          gestureEnabled: true,
          ...Platform.select({
            ios: {
              animation: "default", // iOS native slide
            },
            android: {
              animation: "slide_from_right",
            },
          }),
        }}
      />
    </Stack>
  );
}
