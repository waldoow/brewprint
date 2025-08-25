import React from 'react';
import { View, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  onPress?: () => void;
  shadowColor?: 'default' | 'accent';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'none';
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
  onPress,
  shadowColor = 'default',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  ...props
}: CardProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const getCardStyle = (): ViewStyle => {
    const paddingMap = {
      sm: theme.spacing.sm,
      md: theme.spacing.lg,
      lg: theme.spacing.xl,
      xl: theme.spacing['2xl'],
    };

    const getShadow = () => {
      switch (shadowColor) {
        case 'accent':
          return theme.shadows.lg;
        default:
          return theme.shadows.md;
      }
    };

    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      padding: paddingMap[padding],
      borderWidth: 0.5,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...getShadow(),
          borderWidth: 0,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.borderAccent,
        };
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceGlass,
          borderWidth: 0.5,
          borderColor: theme.colors.borderLight,
          ...theme.shadows.sm,
        };
      case 'gradient':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 0,
          ...theme.shadows.lg,
        };
      case 'default':
      default:
        return {
          ...baseStyle,
          ...theme.shadows.sm,
        };
    }
  };

  const renderCardContent = (children: React.ReactNode) => {
    if (variant === 'glass') {
      return (
        <BlurView
          intensity={20}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          style={{
            borderRadius: theme.radius.xl,
            overflow: 'hidden',
            padding: getCardStyle().padding,
          }}
        >
          {children}
        </BlurView>
      );
    }
    
    if (variant === 'gradient') {
      const gradientColors = colorScheme === 'dark'
        ? ['rgba(63, 63, 70, 0.8)', 'rgba(39, 39, 42, 0.9)']
        : ['rgba(255, 255, 255, 0.9)', 'rgba(250, 250, 250, 0.8)'];
        
      return (
        <LinearGradient
          colors={gradientColors}
          style={{
            borderRadius: theme.radius.xl,
            padding: getCardStyle().padding,
          }}
        >
          {children}
        </LinearGradient>
      );
    }
    
    return children;
  };

  const cardStyle = getCardStyle();
  const cardContent = renderCardContent(children);
  
  if (onPress) {
    return (
      <TouchableOpacity
        style={[
          cardStyle,
          variant === 'glass' || variant === 'gradient' ? { padding: 0 } : {},
          style
        ]}
        onPress={onPress}
        activeOpacity={0.92}
        accessible={true}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[
      cardStyle,
      variant === 'glass' || variant === 'gradient' ? { padding: 0 } : {},
      style
    ]}>
      {cardContent}
    </View>
  );
}