import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import { getTheme } from '@/constants/DataFirstDesign';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  size?: 'default' | 'sm' | 'lg' | 'xl';
  variant?: 'default' | 'outline' | 'modern' | 'glass';
  containerStyle?: ViewStyle;
  glass?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  type = 'text',
  size = 'default',
  variant = 'modern',
  style,
  containerStyle,
  ...rest
}, ref) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');
  const [showPassword, setShowPassword] = useState(false);

  const getInputProps = () => {
    const baseProps = { ...rest };
    
    const handleNumericChange = (text: string) => {
      const numericValue = text.replace(/[^0-9.]/g, '');
      const parts = numericValue.split('.');
      const validValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
      
      if (rest.onChangeText) {
        rest.onChangeText(validValue);
      }
    };
    
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
          onChangeText: handleNumericChange,
        };
      case 'text':
      default:
        return baseProps;
    }
  };

  const getInputStyles = (): ViewStyle => {
    const baseStyle = {
      ...styles.base,
      backgroundColor: theme.colors.card,
      borderColor: error ? theme.colors.error : theme.colors.border,
    };
    
    const sizeStyle = styles[`size_${size}`];
    
    return {
      ...baseStyle,
      ...sizeStyle,
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyle = styles.text;
    const sizeTextStyle = styles[`text_${size}`];

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
      color: theme.colors.text.primary,
    };
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" weight="medium" style={styles.label}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          ref={ref}
          style={[getInputStyles(), getTextStyles(), style, type === 'password' && styles.passwordInput]}
          placeholderTextColor={theme.colors.text.tertiary}
          {...getInputProps()}
        />
        {type === 'password' && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={18} color={theme.colors.text.tertiary} />
            ) : (
              <Eye size={18} color={theme.colors.text.tertiary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text variant="caption" style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  
  label: {
    marginBottom: 8,
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
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '400',
  },
  
  passwordInput: {
    paddingRight: 48,
  },
  
  passwordToggle: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  
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
  
  text: {
    fontSize: 15,
    fontWeight: '400',
  },
  text_default: {
    fontSize: 15,
  },
  text_sm: {
    fontSize: 13,
  },
  text_lg: {
    fontSize: 16,
  },
  
  error: {
    marginTop: 4,
  },
});