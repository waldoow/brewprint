import React, { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextAreaProps = TextInputProps & {
  label?: string;
  error?: string;
  minHeight?: number;
  maxHeight?: number;
  variant?: 'default' | 'outline' | 'filled';
  lightColor?: string;
  darkColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
  containerStyle?: ViewStyle;
};

export const ThemedTextArea = forwardRef<TextInput, ThemedTextAreaProps>(({
  label,
  error,
  minHeight = 80,
  maxHeight = 200,
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
  const borderColor = useThemeColor(
    { light: lightBorderColor, dark: darkBorderColor },
    'border'
  );

  const getTextAreaStyles = (): ViewStyle => {
    const baseStyle = styles.base;
    
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
      ...variantStyle,
      minHeight,
      maxHeight,
    };
  };

  const getTextStyles = (): TextStyle => {
    return {
      ...styles.text,
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
      color: '#dc2626',
    };
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={getLabelStyles()}>{label}</Text>
      )}
      <TextInput
        ref={ref}
        style={[getTextAreaStyles(), getTextStyles(), style]}
        placeholderTextColor={textColor + '70'}
        multiline
        textAlignVertical="top"
        {...rest}
      />
      {error && (
        <Text style={getErrorStyles()}>{error}</Text>
      )}
    </View>
  );
});

ThemedTextArea.displayName = 'ThemedTextArea';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  base: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: 'System',
  },
  
  text: {
    fontSize: 16,
    fontWeight: '400',
  },
  
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