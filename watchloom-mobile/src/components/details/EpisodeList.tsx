import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/constants/theme';
import type { EpisodeDto } from '@/types/api';

type EpisodeListProps = {
  episodes: readonly EpisodeDto[];
};

export function EpisodeList({ episodes }: EpisodeListProps) {
  if (episodes.length === 0) {
    return (
      <EmptyState
        message="Episodes will appear here when they are added."
        title="No episodes available"
      />
    );
  }

  const sortedEpisodes = [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);

  return (
    <View style={styles.list}>
      {sortedEpisodes.map((episode) => (
        <Card key={episode.id}>
          <Text style={styles.number}>EPISODE {episode.episodeNumber}</Text>
          <Text style={styles.title}>{episode.title || 'Untitled episode'}</Text>
          <Text style={styles.body}>
            {episode.overview || 'No description is available for this episode.'}
          </Text>
          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              Duration: {episode.durationMinutes ? `${episode.durationMinutes} min` : 'Unavailable'}
            </Text>
            <Text style={styles.metadataText}>Air date: {episode.airDate || 'Unavailable'}</Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.md,
  },
  number: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metadataText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
  },
});
