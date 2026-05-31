import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { GenreDto } from '@/types/api';

type GenreChipsProps = {
  genres?: readonly GenreDto[] | null;
};

export function GenreChips({ genres }: GenreChipsProps) {
  if (!genres || genres.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {genres.map((genre) => (
        <View key={genre.id} style={styles.chip}>
          <Text style={styles.text}>{genre.name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  text: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
  },
});
