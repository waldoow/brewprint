import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Animated,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  lightColor?: string;
  darkColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
  containerStyle?: ViewStyle;
};

export function ThemedSwitch({
  value,
  onValueChange,
  label,
  disabled = false,
  size = 'default',
  lightColor,
  darkColor,
  lightTextColor,
  darkTextColor,
  containerStyle,
}: ThemedSwitchProps) {
  const textColor = useThemeColor(
    { light: lightTextColor, dark: darkTextColor },
    'text'
  );
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const getSwitchTrackStyles = (): ViewStyle => {
    const baseStyle = styles.track;
    const sizeStyle = styles[`track_${size}`];
    
    const backgroundColor = value ? tintColor : iconColor + '30';
    
    return {
      ...baseStyle,
      ...sizeStyle,
      backgroundColor,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getSwitchThumbStyles = (): ViewStyle => {
    const baseStyle = styles.thumb;
    const sizeStyle = styles[`thumb_${size}`];
    
    // Calculate thumb position based on switch size
    let translateX = 0;
    switch (size) {
      case 'sm':
        translateX = value ? 14 : 2;
        break;
      case 'lg':
        translateX = value ? 26 : 2;
        break;
      case 'default':
      default:
        translateX = value ? 20 : 2;
        break;
    }

    const thumbColor = value 
      ? (tintColor === Colors.dark.tint ? Colors.light.text : '#ffffff')
      : '#ffffff';
    
    return {
      ...baseStyle,
      ...sizeStyle,
      backgroundColor: thumbColor,
      transform: [{ translateX }],
    };
  };

  const getLabelStyles = (): TextStyle => {
    const sizeStyle = styles[`label_${size}`];
    return {
      ...styles.label,
      ...sizeStyle,
      color: textColor,
      opacity: disabled ? 0.6 : 1,
    };
  };

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={getSwitchTrackStyles()}>
        <Animated.View style={getSwitchThumbStyles()} />
      </View>
      {label && (
        <Text style={getLabelStyles()}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  // Track styles
  track: {
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
  },
  track_default: {
    width: 44,
    height: 24,
  },
  track_sm: {
    width: 32,
    height: 18,
  },
  track_lg: {
    width: 56,
    height: 32,
  },
  
  // Thumb styles
  thumb: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  thumb_default: {
    width: 20,
    height: 20,
  },
  thumb_sm: {
    width: 14,
    height: 14,
  },
  thumb_lg: {
    width: 28,
    height: 28,
  },
  
  // Label styles
  label: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  label_default: {
    fontSize: 16,
  },
  label_sm: {
    fontSize: 14,
  },
  label_lg: {
    fontSize: 18,
  },
});