import { router, type Href } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import type { FavouriteWithMediaDto } from '@/services/favourite-api';

type FavouriteItemCardProps = {
  item: FavouriteWithMediaDto;
  onRemove: (favouriteId: number) => Promise<void>;
};

export function FavouriteItemCard({ item, onRemove }: FavouriteItemCardProps) {
  const detailsRoute =
    item.media && item.mediaType === 'movie'
      ? routes.movieDetails(item.media.slug)
      : item.media
        ? routes.seriesDetails(item.media.slug)
        : undefined;

  return (
    <Card>
      <Pressable
        accessibilityRole={detailsRoute ? 'button' : undefined}
        disabled={!detailsRoute}
        onPress={() => {
          if (detailsRoute) {
            router.push(detailsRoute as Href);
          }
        }}
        style={({ pressed }) => [styles.summary, pressed && styles.pressed]}
      >
        {item.media?.posterUrl ? (
          <Image source={{ uri: item.media.posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.placeholderText}>No poster</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.type}>{item.mediaType.toUpperCase()}</Text>
          <Text numberOfLines={3} style={styles.title}>{item.media?.title || 'Unavailable title'}</Text>
          {item.media?.releaseYear ? (
            <Text style={styles.metadata}>Released: {item.media.releaseYear}</Text>
          ) : null}
        </View>
      </Pressable>
      <Button
        onPress={() => {
          void onRemove(item.id);
        }}
        title="Remove from favourites"
        variant="ghost"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  poster: {
    aspectRatio: 2 / 3,
    backgroundColor: theme.colors.disabled,
    borderRadius: theme.radius.sm,
    width: 88,
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  type: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    lineHeight: 26,
  },
  metadata: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
