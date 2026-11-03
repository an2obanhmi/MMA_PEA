import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface GenreStatusPickerProps<T extends string> {
  label: string;
  options: readonly T[];
  emptyLabel: string;
  selectedValue: T | '';
  onSelect: (val: T | '') => void;
  error?: string;
}

export function GenreStatusPicker<T extends string>({
  label,
  options,
  emptyLabel,
  selectedValue,
  onSelect,
  error,
}: GenreStatusPickerProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, selectedValue === '' && styles.chipActive]}
          onPress={() => onSelect('')}
        >
          <Text style={[styles.chipText, selectedValue === '' && styles.chipTextActive]}>
            {emptyLabel}
          </Text>
        </TouchableOpacity>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, selectedValue === opt && styles.chipActive]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.chipText, selectedValue === opt && styles.chipTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSub,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
