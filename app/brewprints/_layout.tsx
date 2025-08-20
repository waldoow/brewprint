import { Stack } from 'expo-router';

export default function BrewprintsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Mes Recettes',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Détail Recette',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}