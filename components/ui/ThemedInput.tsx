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
import { Eye, EyeOff } from 'lucide-react-native';

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
    'inputBackground'
  );
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor(
    { light: lightBorderColor, dark: darkBorderColor },
    'border'
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
          borderColor: borderColor,
        };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: backgroundColor,
          borderWidth: 1,
          borderColor: borderColor,
        };
        break;
      case 'filled':
        variantStyle = {
          backgroundColor: backgroundColor,
          borderWidth: 1,
          borderColor: borderColor,
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
          placeholderTextColor={textColor + '70'}
          {...getInputProps()}
        />
        {type === 'password' && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={iconColor} />
            ) : (
              <Eye size={20} color={iconColor} />
            )}
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
  
  // Advanced minimal base style
  base: {
    borderRadius: 8, // 8px border radius for minimal design
    paddingHorizontal: 12,
    fontFamily: 'System',
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  passwordInput: {
    paddingRight: 40,
  },
  
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  
  // Professional size variants
  size_default: {
    height: 44,
    paddingVertical: 12,
  },
  size_sm: {
    height: 32,
    paddingVertical: 6,
  },
  size_lg: {
    height: 48,
    paddingVertical: 14,
  },
  
  // Technical typography
  text: {
    fontSize: 16,
    fontWeight: '400',
  },
  text_default: {
    fontSize: 16,
  },
  text_sm: {
    fontSize: 12,
  },
  text_lg: {
    fontSize: 16,
  },
  
  // Professional labels and errors
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
  },
});