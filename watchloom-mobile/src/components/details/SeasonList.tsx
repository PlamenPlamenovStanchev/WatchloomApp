import { router, type Href } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import type { SeasonDto } from '@/types/api';

type SeasonListProps = {
  onPressSeason?: (season: SeasonDto) => void;
  seasons: readonly SeasonDto[];
};

export function SeasonList({ onPressSeason, seasons }: SeasonListProps) {
  if (seasons.length === 0) {
    return (
      <EmptyState
        message="Episodes will appear here when seasons are added."
        title="No seasons available"
      />
    );
  }

  return (
    <View style={styles.list}>
      {seasons.map((season) => (
        <Pressable
          accessibilityLabel={`View season ${season.seasonNumber} episodes`}
          accessibilityRole="button"
          key={season.id}
          onPress={() => {
            if (onPressSeason) {
              onPressSeason(season);
            } else {
              router.push(routes.seasonEpisodes(String(season.id)) as Href);
            }
          }}
          style={({ pressed }: { pressed: boolean }) => pressed && styles.pressed}
        >
          <Card style={styles.card}>
            {season.posterUrl ? (
              <Image source={{ uri: season.posterUrl }} style={styles.poster} />
            ) : (
              <View style={[styles.poster, styles.posterPlaceholder]}>
                <Text style={styles.placeholderText}>No poster</Text>
              </View>
            )}
            <View style={styles.content}>
              <Text style={styles.title}>{season.title || `Season ${season.seasonNumber}`}</Text>
              {season.releaseYear || season.releaseDate ? (
                <Text style={styles.metadata}>{season.releaseYear || season.releaseDate}</Text>
              ) : null}
              {season.overview ? <Text style={styles.body}>{season.overview}</Text> : null}
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
  },
  poster: {
    aspectRatio: 2 / 3,
    backgroundColor: theme.colors.disabled,
    borderRadius: theme.radius.sm,
    width: 72,
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
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  metadata: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.8,
  },
});
