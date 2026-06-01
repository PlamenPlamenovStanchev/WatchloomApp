import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { theme } from '@/constants/theme';

type PosterHeaderProps = {
  eyebrow?: string;
  metadata?: string;
  posterUrl?: string | null;
  title: string;
};

export function PosterHeader({ eyebrow, metadata, posterUrl, title }: PosterHeaderProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= theme.layout.tabletBreakpoint;

  return (
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterPlaceholder]}>
          <Text style={styles.placeholderText}>No poster available</Text>
        </View>
      )}
      <View style={[styles.header, isTablet && styles.tabletHeader]}>
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
  tabletContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  poster: {
    alignSelf: 'center',
    aspectRatio: 2 / 3,
    backgroundColor: theme.colors.disabled,
    borderRadius: theme.radius.md,
    maxWidth: 240,
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
  tabletHeader: {
    flex: 1,
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
    lineHeight: 42,
  },
  metadata: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
  },
});
