import React from 'react';
import { View, ScrollView, SafeAreaView, StatusBar, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: boolean;
  style?: ViewStyle;
  refreshControl?: React.ReactElement;
  gradient?: boolean;
  glassmorphism?: boolean;
}

export function Container({
  children,
  scrollable = false,
  padding = true,
  style,
  refreshControl,
  gradient = false,
  glassmorphism = false,
}: ContainerProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const getBackgroundComponent = () => {
    if (gradient) {
      const gradientColors = colorScheme === 'dark' 
        ? [theme.colors.background, theme.colors.backgroundTertiary]
        : [theme.colors.background, theme.colors.backgroundTertiary];
      
      return (
        <LinearGradient
          colors={gradientColors}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
      );
    }
    return null;
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: gradient ? 'transparent' : theme.colors.background,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: gradient ? 'transparent' : theme.colors.background }}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        translucent
      />
      {getBackgroundComponent()}
      {content}
    </SafeAreaView>
  );
}