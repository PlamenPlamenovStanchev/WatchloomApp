import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';
import type { MovieListItemDto } from '@/types/api';

type MovieCardProps = {
  movie: MovieListItemDto;
};

export function MovieCard({ movie }: MovieCardProps) {
  const metadata = [
    movie.releaseYear,
    movie.durationMinutes ? `${movie.durationMinutes} min` : undefined,
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityLabel={`View ${movie.title}`}
      accessibilityRole="button"
      onPress={() => router.push(`/movies/${encodeURIComponent(movie.slug)}`)}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={styles.card}>
        {movie.posterUrl ? (
          <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.placeholderText}>No poster</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {movie.title}
          </Text>
          {metadata.length > 0 ? <Text style={styles.metadata}>{metadata.join(' · ')}</Text> : null}
          {movie.genres && movie.genres.length > 0 ? (
            <Text numberOfLines={2} style={styles.genres}>
              {movie.genres.map((genre) => genre.name).join(', ')}
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
