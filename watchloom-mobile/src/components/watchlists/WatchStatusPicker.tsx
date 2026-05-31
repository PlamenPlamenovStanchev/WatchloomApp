import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { WatchStatus } from '@/types/api';

const statusOptions: { label: string; value: WatchStatus }[] = [
  { label: 'To watch', value: 'to_watch' },
  { label: 'Watching', value: 'watching' },
  { label: 'Watched', value: 'watched' },
];

type WatchStatusPickerProps = {
  disabled?: boolean;
  onChange: (status: WatchStatus) => void;
  value: WatchStatus;
};

export function WatchStatusPicker({ disabled = false, onChange, value }: WatchStatusPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Status</Text>
      <View style={styles.options}>
        {statusOptions.map((option) => (
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, option.value === value && styles.selected, disabled && styles.disabled]}
          >
            <Text style={[styles.optionText, option.value === value && styles.selectedText]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  option: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  selected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  optionText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
  },
  selectedText: {
    color: theme.colors.accentText,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.55,
  },
});
