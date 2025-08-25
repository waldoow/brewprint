import React, { useEffect, useRef } from 'react';
import { View, ViewStyle, Animated, Easing } from 'react-native';
import { getTheme } from '@/constants/ProfessionalDesign';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AnimatedViewProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'bounce';
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  loop?: boolean;
  onAnimationComplete?: () => void;
}

export function AnimatedView({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 350,
  style,
  loop = false,
  onAnimationComplete,
}: AnimatedViewProps) {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.95)).current;
  const translateXValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationConfig = {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    };

    const animations = [];

    switch (animation) {
      case 'fadeIn':
        animations.push(
          Animated.timing(animatedValue, animationConfig)
        );
        break;
        
      case 'slideUp':
        translateYValue.setValue(30);
        animations.push(
          Animated.parallel([
            Animated.timing(animatedValue, animationConfig),
            Animated.timing(translateYValue, { ...animationConfig, toValue: 0 })
          ])
        );
        break;
        
      case 'slideDown':
        translateYValue.setValue(-30);
        animations.push(
          Animated.parallel([
            Animated.timing(animatedValue, animationConfig),
            Animated.timing(translateYValue, { ...animationConfig, toValue: 0 })
          ])
        );
        break;
        
      case 'slideLeft':
        translateXValue.setValue(30);
        animations.push(
          Animated.parallel([
            Animated.timing(animatedValue, animationConfig),
            Animated.timing(translateXValue, { ...animationConfig, toValue: 0 })
          ])
        );
        break;
        
      case 'slideRight':
        translateXValue.setValue(-30);
        animations.push(
          Animated.parallel([
            Animated.timing(animatedValue, animationConfig),
            Animated.timing(translateXValue, { ...animationConfig, toValue: 0 })
          ])
        );
        break;
        
      case 'scale':
        animations.push(
          Animated.parallel([
            Animated.timing(animatedValue, animationConfig),
            Animated.timing(scaleValue, { ...animationConfig, toValue: 1 })
          ])
        );
        break;
        
      case 'bounce':
        animations.push(
          Animated.sequence([
            Animated.timing(animatedValue, {
              ...animationConfig,
              easing: Easing.out(Easing.back(1.5)),
            }),
            Animated.timing(scaleValue, {
              ...animationConfig,
              toValue: 1,
              easing: Easing.elastic(2),
            })
          ])
        );
        break;
    }

    const animationSequence = Animated.sequence(animations);
    
    if (loop) {
      Animated.loop(animationSequence).start();
    } else {
      animationSequence.start(onAnimationComplete);
    }
  }, [animation, delay, duration, loop]);

  const getAnimatedStyle = (): ViewStyle => {
    const baseStyle = {
      opacity: animatedValue,
    };

    switch (animation) {
      case 'slideUp':
      case 'slideDown':
        return {
          ...baseStyle,
          transform: [{ translateY: translateYValue }],
        };
        
      case 'slideLeft':
      case 'slideRight':
        return {
          ...baseStyle,
          transform: [{ translateX: translateXValue }],
        };
        
      case 'scale':
      case 'bounce':
        return {
          ...baseStyle,
          transform: [{ scale: scaleValue }],
        };
        
      default:
        return baseStyle;
    }
  };

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
}

// Preset animation components for common use cases
export const FadeInView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (props) => (
  <AnimatedView {...props} animation="fadeIn" />
);

export const SlideUpView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (props) => (
  <AnimatedView {...props} animation="slideUp" />
);

export const ScaleView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (props) => (
  <AnimatedView {...props} animation="scale" />
);

export const BounceView: React.FC<Omit<AnimatedViewProps, 'animation'>> = (props) => (
  <AnimatedView {...props} animation="bounce" />
);