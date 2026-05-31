import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Card>
            <Text style={styles.title}>{season.title || `Season ${season.seasonNumber}`}</Text>
            <Text style={styles.metadata}>{season.releaseDate || 'Release date unavailable'}</Text>
            <Text style={styles.body}>{season.overview || 'Description unavailable'}</Text>
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
