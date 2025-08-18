import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from './IconSymbol';

export interface ThemedDatePickerProps {
  label?: string;
  value?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  error?: string;
  style?: any;
  mode?: 'date' | 'time' | 'datetime';
  maximumDate?: Date;
  minimumDate?: Date;
}

export function ThemedDatePicker({
  label,
  value,
  onDateChange,
  placeholder = 'Select date',
  error,
  style,
  mode = 'date',
  maximumDate,
  minimumDate,
}: ThemedDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const formatDate = (date: Date | undefined) => {
    if (!date) return placeholder;
    
    if (mode === 'date') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
    
    if (mode === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClearDate = () => {
    onDateChange(undefined);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, the picker stays open until the user selects or cancels
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onDateChange(selectedDate);
    }
    
    // On iOS, close the picker after selection
    if (Platform.OS === 'ios') {
      setShowPicker(false);
    }
  };

  return (
    <ThemedView style={[styles.container, style]}>
      {label && (
        <ThemedText style={[styles.label, { color: error ? colors.error : colors.text }]}>
          {label}
        </ThemedText>
      )}
      
      <TouchableOpacity
        style={[
          styles.input,
          {
            backgroundColor: colors.cardBackground,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
        onPress={() => setShowPicker(true)}
      >
        <View style={styles.inputContent}>
          <ThemedText
            style={[
              styles.inputText,
              {
                color: value ? colors.text : colors.textSecondary,
              },
            ]}
          >
            {formatDate(value)}
          </ThemedText>
          
          <View style={styles.inputActions}>
            {value && (
              <TouchableOpacity onPress={handleClearDate} style={styles.clearButton}>
                <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            <IconSymbol name="calendar" size={20} color={colors.textSecondary} />
          </View>
        </View>
      </TouchableOpacity>

      {error && (
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error}
        </ThemedText>
      )}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          themeVariant="dark"
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
  inputContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 2,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
});