import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { ReviewDetailsInput } from '@/services/review-api';

const ratings: ReviewDetailsInput['rating'][] = [1, 2, 3, 4, 5];

type RatingInputProps = {
  disabled?: boolean;
  onChange: (rating: ReviewDetailsInput['rating']) => void;
  value: ReviewDetailsInput['rating'];
};

export function RatingInput({ disabled = false, onChange, value }: RatingInputProps) {
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
            onPress={() => onChange(rating)}
            style={[styles.option, disabled && styles.disabled]}
          >
            <Text style={[styles.star, rating <= value && styles.selectedStar]}>★</Text>
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
    minHeight: 40,
    minWidth: 40,
  },
  star: {
    color: theme.colors.textMuted,
    fontSize: 32,
    lineHeight: 36,
  },
  selectedStar: {
    color: theme.colors.accent,
  },
  disabled: {
    opacity: 0.55,
  },
});
