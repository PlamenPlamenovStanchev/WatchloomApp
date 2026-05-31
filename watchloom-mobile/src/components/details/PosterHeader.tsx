import { Image, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type PosterHeaderProps = {
  eyebrow?: string;
  metadata?: string;
  posterUrl?: string | null;
  title: string;
};

export function PosterHeader({ eyebrow, metadata, posterUrl, title }: PosterHeaderProps) {
  return (
    <View style={styles.container}>
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterPlaceholder]}>
          <Text style={styles.placeholderText}>No poster available</Text>
        </View>
      )}
      <View style={styles.header}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {metadata ? <Text style={styles.metadata}>{metadata}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  poster: {
    alignSelf: 'center',
    backgroundColor: theme.colors.disabled,
    borderRadius: theme.radius.md,
    height: 390,
    maxWidth: 260,
    width: '100%',
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
  },
  header: {
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.xxl,
    fontWeight: '700',
  },
  metadata: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
  },
});
