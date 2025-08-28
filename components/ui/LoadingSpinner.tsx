import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, ViewStyle, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Text } from './Text';

const { width: screenWidth } = Dimensions.get('window');

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'coffee' | 'minimal' | 'pulse';
  message?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'coffee',
  message,
  overlay = false,
  style,
}: LoadingSpinnerProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: variant === 'minimal' ? 1200 : 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 600,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.9,
          duration: 600,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );

    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    if (variant === 'pulse') {
      pulseAnimation.start();
      opacityAnimation.start();
    }

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      opacityAnimation.stop();
    };
  }, [variant]);

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { diameter: 24, strokeWidth: 2.5, fontSize: 'sm' as const };
      case 'md':
        return { diameter: 32, strokeWidth: 3, fontSize: 'md' as const };
      case 'lg':
        return { diameter: 48, strokeWidth: 4, fontSize: 'lg' as const };
      case 'xl':
        return { diameter: 64, strokeWidth: 5, fontSize: 'xl' as const };
      default:
        return { diameter: 32, strokeWidth: 3, fontSize: 'md' as const };
    }
  };

  const { diameter, strokeWidth, fontSize } = getSizeConfig();
  const radius = (diameter - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderSpinner = () => {
    switch (variant) {
      case 'coffee':
        return (
          <Animated.View
            style={[
              {
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                borderWidth: strokeWidth,
                borderColor: 'transparent',
                borderTopColor: theme.colors.primary,
                borderRightColor: theme.colors.accent,
                transform: [{ rotate: spin }],
              },
              ...(variant === 'pulse' ? [{ transform: [{ scale: scaleValue }, { rotate: spin }] }] : []),
            ]}
          />
        );
        
      case 'minimal':
        return (
          <Animated.View
            style={{
              width: diameter,
              height: diameter,
              opacity: opacityValue,
              transform: [{ scale: scaleValue }],
            }}
          >
            <View
              style={{
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                borderWidth: strokeWidth,
                borderColor: theme.colors.borderLight,
                borderTopColor: theme.colors.text.secondary,
              }}
            />
          </Animated.View>
        );
        
      case 'pulse':
        return (
          <Animated.View
            style={{
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              backgroundColor: theme.colors.primary,
              opacity: opacityValue,
              transform: [{ scale: scaleValue }],
            }}
          />
        );
        
      default:
        return (
          <Animated.View
            style={{
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              borderWidth: strokeWidth,
              borderColor: theme.colors.borderLight,
              borderTopColor: theme.colors.primary,
              transform: [{ rotate: spin }],
            }}
          />
        );
    }
  };

  const content = (
    <View style={[
      {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
      },
      style,
    ]}>
      {renderSpinner()}
      {message && (
        <Text
          variant={fontSize}
          color="secondary"
          weight="medium"
          style={{
            marginTop: theme.spacing.md,
            textAlign: 'center',
            letterSpacing: 0.5,
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.xl,
            padding: theme.spacing.xl,
            marginHorizontal: theme.spacing.lg,
            ...theme.shadows.xl,
            minWidth: 160,
          }}
        >
          {content}
        </View>
      </View>
    );
  }

  return content;
}

// Preset loading components
export const CoffeeLoader: React.FC<Omit<LoadingSpinnerProps, 'variant'>> = (props) => (
  <LoadingSpinner {...props} variant="coffee" />
);

export const MinimalLoader: React.FC<Omit<LoadingSpinnerProps, 'variant'>> = (props) => (
  <LoadingSpinner {...props} variant="minimal" />
);

export const PulseLoader: React.FC<Omit<LoadingSpinnerProps, 'variant'>> = (props) => (
  <LoadingSpinner {...props} variant="pulse" />
);