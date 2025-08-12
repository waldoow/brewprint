import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Modal,
  FlatList,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type SelectOption = {
  label: string;
  value: string;
};

export type ThemedSelectProps = {
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
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

export function ThemedSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  size = 'default',
  variant = 'default',
  lightColor,
  darkColor,
  lightTextColor,
  darkTextColor,
  lightBorderColor,
  darkBorderColor,
  containerStyle,
}: ThemedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
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

  const selectedOption = options.find(option => option.value === value);

  const getSelectStyles = (): ViewStyle => {
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
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyle = styles.text;
    const sizeTextStyle = styles[`text_${size}`];

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
      color: selectedOption ? textColor : textColor + '60',
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
      color: '#dc2626',
    };
  };

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  const renderOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={[styles.option, { backgroundColor: backgroundColor }]}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={[styles.optionText, { color: textColor }]}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={getLabelStyles()}>{label}</Text>
      )}
      
      <TouchableOpacity
        style={getSelectStyles()}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={getTextStyles()}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={[styles.arrow, { color: iconColor }]}>▼</Text>
      </TouchableOpacity>

      {error && (
        <Text style={getErrorStyles()}>{error}</Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.dropdown, { backgroundColor: backgroundColor }]}>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  base: {
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
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
  
  arrow: {
    fontSize: 12,
    marginLeft: 8,
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
  
  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  dropdown: {
    width: '80%',
    maxHeight: '50%',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  optionsList: {
    maxHeight: 200,
  },
  
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  optionText: {
    fontSize: 16,
    fontWeight: '400',
  },
});