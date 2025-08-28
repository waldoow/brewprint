import React from 'react';
import { Redirect } from 'expo-router';
import { View, Text } from 'react-native-ui-lib';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View flex center bg-screenBG padding-xxl>
        <Text body textSecondary>
          Loading...
        </Text>
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