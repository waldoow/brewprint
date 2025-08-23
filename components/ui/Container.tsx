import React from 'react';
import { View, ScrollView, SafeAreaView, StatusBar, ViewStyle } from 'react-native';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: boolean;
  style?: ViewStyle;
  refreshControl?: React.ReactElement;
}

export function Container({
  children,
  scrollable = false,
  padding = true,
  style,
  refreshControl,
}: ContainerProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...(padding && {
      paddingHorizontal: theme.spacing.lg,
    }),
  };

  const content = scrollable ? (
    <ScrollView
      style={containerStyle}
      contentContainerStyle={{
        paddingVertical: theme.spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      {content}
    </SafeAreaView>
  );
}