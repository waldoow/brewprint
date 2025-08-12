import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedInputProps = TextInputProps & {
  label?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
  lightColor?: string;
  darkColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
  containerStyle?: ViewStyle;
};

export const ThemedInput = forwardRef<TextInput, ThemedInputProps>(({
  label,
  error,
  type = 'text',
  size = 'default',
  variant = 'default',
  style,
  lightColor,
  darkColor,
  lightTextColor,
  darkTextColor,
  lightBorderColor,
  darkBorderColor,
  containerStyle,
  ...rest
}, ref) => {
  const textColor = useThemeColor(
    { light: lightTextColor, dark: darkTextColor },
    'text'
  );
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor(
    { light: lightBorderColor, dark: darkBorderColor },
    'icon'
  );

  const [showPassword, setShowPassword] = useState(false);

  const getInputProps = () => {
    const baseProps = { ...rest };
    
    switch (type) {
      case 'email':
        return {
          ...baseProps,
          keyboardType: 'email-address' as const,
          autoCapitalize: 'none' as const,
          autoComplete: 'email' as const,
        };
      case 'password':
        return {
          ...baseProps,
          secureTextEntry: !showPassword,
          autoCapitalize: 'none' as const,
          autoComplete: 'current-password' as const,
        };
      case 'number':
        return {
          ...baseProps,
          keyboardType: 'numeric' as const,
          autoComplete: 'off' as const,
        };
      case 'text':
      default:
        return baseProps;
    }
  };

  const getInputStyles = (): ViewStyle => {
    const baseStyle = styles.base;
    const sizeStyle = styles[`size_${size}`];
    
    let variantStyle: ViewStyle = {};
    
    switch (variant) {
      case 'default':
        variantStyle = {
          backgroundColor: backgroundColor,
          borderWidth: 1,
          borderColor: iconColor + '40',
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: borderColor + '60',
        };
        break;
      case 'filled':
        variantStyle = {
          backgroundColor: iconColor + '10',
          borderWidth: 0,
        };
        break;
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyle = styles.text;
    const sizeTextStyle = styles[`text_${size}`];

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
      color: textColor,
    };
  };

  const getLabelStyles = (): TextStyle => {
    return {
      ...styles.label,
      color: textColor,
      opacity: 0.8,
    };
  };

  const getErrorStyles = (): TextStyle => {
    return {
      ...styles.error,
      color: '#dc2626', // Red color for errors
    };
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={getLabelStyles()}>{label}</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          ref={ref}
          style={[getInputStyles(), getTextStyles(), style, type === 'password' && styles.passwordInput]}
          placeholderTextColor={textColor + '60'}
          {...getInputProps()}
        />
        {type === 'password' && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={[styles.passwordToggleText, { color: iconColor }]}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={getErrorStyles()}>{error}</Text>
      )}
    </View>
  );
});

ThemedInput.displayName = 'ThemedInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  base: {
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'System',
    flex: 1,
  },
  
  passwordInput: {
    paddingRight: 40, // Make room for password toggle
  },
  
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  
  passwordToggleText: {
    fontSize: 16,
  },
  
  // Size variants
  size_default: {
    height: 44,
    paddingVertical: 12,
  },
  size_sm: {
    height: 36,
    paddingVertical: 8,
  },
  size_lg: {
    height: 52,
    paddingVertical: 16,
  },
  
  // Text styles
  text: {
    fontSize: 16,
    fontWeight: '400',
  },
  text_default: {
    fontSize: 16,
  },
  text_sm: {
    fontSize: 14,
  },
  text_lg: {
    fontSize: 18,
  },
  
  // Label and error styles
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  error: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  },
});