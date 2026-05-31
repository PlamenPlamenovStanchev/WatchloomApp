import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

const ratings = [1, 2, 3, 4, 5];

type RatingPickerProps = {
  disabled?: boolean;
  onChange: (rating: number | null) => void;
  value?: number | null;
};

export function RatingPicker({ disabled = false, onChange, value }: RatingPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rating</Text>
      <View style={styles.options}>
        {ratings.map((rating) => (
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            key={rating}
            onPress={() => onChange(value === rating ? null : rating)}
            style={[styles.option, value === rating && styles.selected, disabled && styles.disabled]}
          >
            <Text style={[styles.optionText, value === rating && styles.selectedText]}>{rating}</Text>
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
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 36,
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
