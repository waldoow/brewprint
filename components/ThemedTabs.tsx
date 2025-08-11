import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';

export type TabItem = {
  label: string;
  value: string;
  content?: React.ReactNode;
};

export type ThemedTabsProps = {
  items: TabItem[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'default' | 'sm' | 'lg';
  lightColor?: string;
  darkColor?: string;
  lightTextColor?: string;
  darkTextColor?: string;
  containerStyle?: ViewStyle;
};

export function ThemedTabs({
  items,
  defaultValue,
  onValueChange,
  variant = 'default',
  size = 'default',
  lightColor,
  darkColor,
  lightTextColor,
  darkTextColor,
  containerStyle,
}: ThemedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || items[0]?.value || '');

  const textColor = useThemeColor(
    { light: lightTextColor, dark: darkTextColor },
    'text'
  );
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const handleTabPress = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  const getTabListStyles = (): ViewStyle => {
    const baseStyle = styles.tabsList;
    
    let variantStyle: ViewStyle = {};
    
    switch (variant) {
      case 'default':
        variantStyle = {
          backgroundColor: iconColor + '10',
          borderRadius: 8,
          padding: 4,
        };
        break;
      case 'pills':
        variantStyle = {
          backgroundColor: 'transparent',
        };
        break;
      case 'underline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: iconColor + '20',
        };
        break;
    }

    return {
      ...baseStyle,
      ...variantStyle,
    };
  };

  const getTabStyles = (isActive: boolean): ViewStyle => {
    const baseStyle = styles.tab;
    const sizeStyle = styles[`tab_${size}`];
    
    let variantStyle: ViewStyle = {};
    
    switch (variant) {
      case 'default':
        variantStyle = {
          backgroundColor: isActive ? backgroundColor : 'transparent',
          borderRadius: 6,
        };
        break;
      case 'pills':
        variantStyle = {
          backgroundColor: isActive ? tintColor : 'transparent',
          borderRadius: 20,
        };
        break;
      case 'underline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderBottomWidth: 2,
          borderBottomColor: isActive ? tintColor : 'transparent',
        };
        break;
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
    };
  };

  const getTabTextStyles = (isActive: boolean): TextStyle => {
    const baseTextStyle = styles.tabText;
    const sizeTextStyle = styles[`tabText_${size}`];
    
    let color = textColor;
    
    switch (variant) {
      case 'default':
        color = isActive ? textColor : textColor + '70';
        break;
      case 'pills':
        color = isActive ? (tintColor === Colors.dark.tint ? Colors.light.text : '#ffffff') : textColor;
        break;
      case 'underline':
        color = isActive ? tintColor : textColor + '70';
        break;
    }

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
      color,
      fontWeight: isActive ? '600' : '400',
    };
  };

  const activeItem = items.find(item => item.value === activeTab);

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={getTabListStyles()}>
          {items.map((item) => {
            const isActive = activeTab === item.value;
            
            return (
              <TouchableOpacity
                key={item.value}
                style={getTabStyles(isActive)}
                onPress={() => handleTabPress(item.value)}
                activeOpacity={0.7}
              >
                <Text style={getTabTextStyles(isActive)}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      {activeItem?.content && (
        <View style={styles.content}>
          {activeItem.content}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  
  scrollView: {
    flexGrow: 0,
  },
  
  tabsList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginRight: 4,
  },
  
  // Size variants for tabs
  tab_default: {
    height: 40,
    paddingVertical: 8,
  },
  tab_sm: {
    height: 32,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tab_lg: {
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  
  // Text styles
  tabText: {
    fontSize: 16,
    textAlign: 'center',
  },
  tabText_default: {
    fontSize: 16,
  },
  tabText_sm: {
    fontSize: 14,
  },
  tabText_lg: {
    fontSize: 18,
  },
  
  content: {
    marginTop: 16,
  },
});