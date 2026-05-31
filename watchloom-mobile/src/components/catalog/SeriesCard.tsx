import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';
import type { SeriesListItemDto } from '@/types/api';

type SeriesCardProps = {
  series: SeriesListItemDto;
};

export function SeriesCard({ series }: SeriesCardProps) {
  const metadata = [series.releaseYear, series.status, series.network].filter(Boolean);

  return (
    <Pressable
      accessibilityLabel={`View ${series.title}`}
      accessibilityRole="button"
      onPress={() => router.push(`/series/${encodeURIComponent(series.slug)}`)}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.card}>
        {series.posterUrl ? (
          <Image source={{ uri: series.posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.placeholderText}>No poster</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {series.title}
          </Text>
          {metadata.length > 0 ? <Text style={styles.metadata}>{metadata.join(' · ')}</Text> : null}
          {series.genres && series.genres.length > 0 ? (
            <Text numberOfLines={2} style={styles.genres}>
              {series.genres.map((genre) => genre.name).join(', ')}
            </Text>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
  },
  poster: {
    backgroundColor: theme.colors.disabled,
    borderRadius: theme.radius.sm,
    height: 150,
    width: 100,
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  metadata: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    lineHeight: 18,
  },
  genres: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.8,
  },
});
