import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type CastBlockProps = {
  cast?: readonly string[] | string | null;
  title?: string;
};

export function CastBlock({ cast, title = 'Cast' }: CastBlockProps) {
  const value = Array.isArray(cast) ? cast.join(', ') : cast;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{value || 'Unavailable'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  body: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
  },
});
