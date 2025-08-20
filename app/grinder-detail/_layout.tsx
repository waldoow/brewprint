import { Stack } from 'expo-router';

export default function GrinderDetailLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[id]" 
        options={{ 
          headerShown: false,
          title: 'Grinder Details'
        }} 
      />
    </Stack>
  );
}