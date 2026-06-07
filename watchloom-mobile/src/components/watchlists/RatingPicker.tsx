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
            accessibilityLabel={`${rating} star${rating === 1 ? '' : 's'}`}
            disabled={disabled}
            key={rating}
            onPress={() => onChange(value === rating ? null : rating)}
            style={[styles.option, disabled && styles.disabled]}
          >
            <Text style={[styles.star, value != null && rating <= value && styles.selectedStar]}>
              ★
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 36,
  },
  star: {
    color: theme.colors.textMuted,
    fontSize: 30,
    lineHeight: 34,
  },
  selectedStar: {
    color: theme.colors.accent,
  },
  disabled: {
    opacity: 0.55,
  },
});
