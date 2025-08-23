import React from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { ProfessionalText } from '@/components/ui/professional/Text';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Index() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: theme.colors.background,
        padding: 32 
      }}>
        <ProfessionalText variant="body" color="secondary">
          Loading...
        </ProfessionalText>
      </View>
    );
  }

  // Redirect based on authentication state
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)" />;
  }
}