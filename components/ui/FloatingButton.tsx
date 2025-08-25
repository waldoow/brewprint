import React from 'react';
import { TouchableOpacity, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface FloatingButtonProps {
  icon: string;
  onPress: () => void;
  size?: 'md' | 'lg';
  variant?: 'primary' | 'accent';
  style?: ViewStyle;
  hapticFeedback?: boolean;
  gradient?: boolean;
}

export function FloatingButton({
  icon,
  onPress,
  size = 'lg',
  variant = 'primary',
  style,
  hapticFeedback = true,
  gradient = true,
}: FloatingButtonProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const handlePress = () => {
    if (hapticFeedback && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const getSize = () => {
    return size === 'lg' ? 56 : 48;
  };

  const getBaseStyle = (): ViewStyle => ({
    width: getSize(),
    height: getSize(),
    borderRadius: getSize() / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  });

  const getGradientColors = () => {
    switch (variant) {
      case 'accent':
        return theme.gradients.accent.colors;
      default:
        return theme.gradients.primary.colors;
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'accent':
        return theme.colors.accent;
      default:
        return theme.colors.primary;
    }
  };

  const renderContent = () => (
    <Text
      variant={size === 'lg' ? 'xl' : 'lg'}
      color="inverse"
      weight="normal"
      style={{ lineHeight: undefined }}
    >
      {icon}
    </Text>
  );

  if (gradient) {
    return (
      <TouchableOpacity
        style={[getBaseStyle(), style]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={{
            width: getSize(),
            height: getSize(),
            borderRadius: getSize() / 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        getBaseStyle(),
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}