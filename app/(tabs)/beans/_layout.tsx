import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function BeansLayout() {
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
      initialRouteName="index"
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
