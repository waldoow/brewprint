import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'strong';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: number;
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function GlassCard({
  children,
  intensity = 'medium',
  padding = 'lg',
  borderRadius,
  style,
  onPress,
  accessibilityLabel,
  accessibilityHint,
}: GlassCardProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const getBlurIntensity = () => {
    switch (intensity) {
      case 'light': return 15;
      case 'strong': return 35;
      default: return 25; // medium
    }
  };

  const getPaddingValue = () => {
    switch (padding) {
      case 'sm': return theme.spacing.md;
      case 'md': return theme.spacing.lg;
      case 'lg': return theme.spacing.xl;
      case 'xl': return theme.spacing['2xl'];
      default: return theme.spacing.xl;
    }
  };

  const getGradientColors = () => {
    if (colorScheme === 'dark') {
      return [
        'rgba(255, 255, 255, 0.1)',
        'rgba(255, 255, 255, 0.05)',
        'rgba(255, 255, 255, 0.02)',
      ];
    } else {
      return [
        'rgba(255, 255, 255, 0.8)',
        'rgba(255, 255, 255, 0.6)',
        'rgba(255, 255, 255, 0.4)',
      ];
    }
  };

  const borderRadiusValue = borderRadius || theme.radius.xl;

  const containerStyle: ViewStyle = {
    borderRadius: borderRadiusValue,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colorScheme === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)',
    ...theme.shadows.md,
  };

  const renderContent = () => (
    <View style={{ position: 'relative' }}>
      <BlurView
        intensity={getBlurIntensity()}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: borderRadiusValue,
        }}
      />
      <LinearGradient
        colors={getGradientColors()}
        style={{
          padding: getPaddingValue(),
          borderRadius: borderRadiusValue,
        }}
      >
        {children}
      </LinearGradient>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[containerStyle, style]}
        onPress={onPress}
        activeOpacity={0.95}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      {renderContent()}
    </View>
  );
}