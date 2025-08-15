import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
  style?: any;
}

export function SearchBar({ 
  placeholder = "Search", 
  onSearch, 
  onFilterPress, 
  showFilter = true,
  style 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch?.(text);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleSearch}
        />
      </View>
      
      {showFilter && (
        <TouchableOpacity 
          style={[styles.filterButton, { backgroundColor: colors.cardBackground }]} 
          onPress={onFilterPress}
        >
          <IconSymbol name="slider.horizontal.3" size={18} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  filterButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});