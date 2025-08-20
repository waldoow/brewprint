import { Stack } from 'expo-router';

export default function GrindersLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="new" 
        options={{ 
          presentation: 'modal',
          title: 'Add New Grinder'
        }} 
      />
      <Stack.Screen 
        name="edit/[id]" 
        options={{ 
          presentation: 'modal',
          title: 'Edit Grinder'
        }} 
      />
    </Stack>
  );
}