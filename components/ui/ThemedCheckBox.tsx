import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedCheckBoxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline';
  lightColor?: string;
  darkColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
  containerStyle?: ViewStyle;
};

export function ThemedCheckBox({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  size = 'default',
  variant = 'default',
  lightColor,
  darkColor,
  lightTextColor,
  darkTextColor,
  containerStyle,
}: ThemedCheckBoxProps) {
  const textColor = useThemeColor(
    { light: lightTextColor, dark: darkTextColor },
    'text'
  );
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const getCheckBoxStyles = (): ViewStyle => {
    const baseStyle = styles.base;
    const sizeStyle = styles[`size_${size}`];
    
    let variantStyle: ViewStyle = {};
    
    if (checked) {
      variantStyle = {
        backgroundColor: tintColor,
        borderColor: tintColor,
      };
    } else {
      switch (variant) {
        case 'default':
          variantStyle = {
            backgroundColor: 'transparent',
            borderColor: iconColor + '60',
          };
          break;
        case 'outline':
          variantStyle = {
            backgroundColor: 'transparent',
            borderColor: iconColor + '40',
          };
          break;
      }
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      opacity: disabled ? 0.6 : 1,
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

  const getCheckMarkColor = (): string => {
    return checked ? (tintColor === Colors.dark.tint ? Colors.light.text : '#ffffff') : 'transparent';
  };

  const handlePress = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={getCheckBoxStyles()}>
        {checked && (
          <Text style={[styles.checkMark, { color: getCheckMarkColor() }]}>✓</Text>
        )}
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
  
  base: {
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  // Size variants
  size_default: {
    width: 20,
    height: 20,
  },
  size_sm: {
    width: 16,
    height: 16,
  },
  size_lg: {
    width: 24,
    height: 24,
  },
  
  // Check mark
  checkMark: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
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