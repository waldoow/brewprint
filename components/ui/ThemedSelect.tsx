import { Check, ChevronDown } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { getTheme } from "@/constants/DataFirstDesign";
import { useColorScheme } from "@/hooks/useColorScheme";

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
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "filled";
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
  placeholder = "Select an option",
  label,
  error,
  disabled = false,
  size = "default",
  variant = "default",
  lightColor,
  darkColor,
  lightTextColor,
  darkTextColor,
  lightBorderColor,
  darkBorderColor,
  containerStyle,
}: ThemedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const selectRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme ?? 'light');

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (disabled) return;

    selectRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({
        top: y + height + 4, // 4px gap between trigger and dropdown
        left: x,
        width: width,
      });
      setIsOpen(true);
    });
  };

  const getSelectStyles = (): ViewStyle => {
    const baseStyle = styles.base;
    const sizeStyle = styles[`size_${size}`];

    return {
      ...baseStyle,
      ...sizeStyle,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: error ? theme.colors.error : theme.colors.border,
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyle = styles.text;
    const sizeTextStyle = styles[`text_${size}`];

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
      color: selectedOption ? theme.colors.text.primary : theme.colors.text.tertiary,
    };
  };

  const getLabelStyles = (): TextStyle => {
    return {
      ...styles.label,
      color: theme.colors.text.primary,
    };
  };

  const getErrorStyles = (): TextStyle => {
    return {
      ...styles.error,
      color: theme.colors.error,
    };
  };

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  const renderOption = ({
    item,
    index,
  }: {
    item: SelectOption;
    index: number;
  }) => {
    const isSelected = item.value === value;

    return (
      <TouchableOpacity
        style={[
          styles.option,
          index === 0 && styles.firstOption,
          index === options.length - 1 && styles.lastOption,
          isSelected && styles.selectedOption,
          { backgroundColor: isSelected ? theme.colors.interactive.default + "10" : "transparent" },
        ]}
        onPress={() => handleSelect(item.value)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionText,
            { color: theme.colors.text.primary },
            isSelected && styles.selectedOptionText,
          ]}
        >
          {item.label}
        </Text>
        {isSelected && <Check size={16} color={theme.colors.interactive.default} strokeWidth={2.5} />}
      </TouchableOpacity>
    );
  };

  const getDropdownHeight = () => {
    const itemHeight = size === "sm" ? 40 : size === "lg" ? 52 : 44;
    const maxItems = 5;
    const calculatedHeight =
      Math.min(options.length, maxItems) * itemHeight + 8; // 8px for padding
    return calculatedHeight;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={getLabelStyles()}>{label}</Text>}

      <TouchableOpacity
        ref={selectRef}
        style={[getSelectStyles(), isOpen && styles.selectOpen]}
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={getTextStyles()} numberOfLines={1}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Animated.View
          style={[styles.iconContainer, isOpen && styles.iconRotated]}
        >
          <ChevronDown size={16} color={theme.colors.text.secondary} strokeWidth={2} />
        </Animated.View>
      </TouchableOpacity>

      {error && <Text style={getErrorStyles()}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <Animated.View
            style={[
              styles.dropdown,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
                maxHeight: getDropdownHeight(),
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {options.map((item, index) => (
                <View key={item.value}>{renderOption({ item, index })}</View>
              ))}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  base: {
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: 'System',
  },

  selectOpen: {
    // Optional: Add a different style when open
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
    fontWeight: "400",
    fontFamily: 'System',
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

  iconContainer: {
    marginLeft: 8,
    transform: [{ rotate: "0deg" }],
  },

  iconRotated: {
    transform: [{ rotate: "180deg" }],
  },

  // Label and error styles
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },

  error: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 4,
  },

  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },

  dropdown: {
    position: "absolute",
    borderRadius: 8,
    borderWidth: 1,
    padding: 4,

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    // Shadow for Android
    elevation: 10,
  },

  scrollView: {
    flexGrow: 0,
  },

  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },

  firstOption: {
    // Optional: Add specific style for first option
  },

  lastOption: {
    // Optional: Add specific style for last option
  },

  selectedOption: {
    // Background color is set inline
  },

  optionText: {
    fontSize: 15,
    fontWeight: "400",
    flex: 1,
    fontFamily: 'System',
  },

  selectedOptionText: {
    fontWeight: "500",
  },
});
