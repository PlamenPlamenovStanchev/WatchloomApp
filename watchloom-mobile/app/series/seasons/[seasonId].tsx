import { useCallback, useEffect, useState } from 'react';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { ApiClientError } from '@/lib/api-client';
import { getSeasonEpisodes } from '@/services/catalog-api';
import type { EpisodeDto } from '@/types/api';

export default function SeasonEpisodesScreen() {
  const params = useLocalSearchParams<{ seasonId?: string | string[] }>();
  const seasonId = Array.isArray(params.seasonId) ? params.seasonId[0] : params.seasonId;
  const [episodes, setEpisodes] = useState<EpisodeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadEpisodes = useCallback(async () => {
    if (!seasonId) {
      setEpisodes([]);
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await getSeasonEpisodes(seasonId);
      setEpisodes([...response.items].sort((a, b) => a.episodeNumber - b.episodeNumber));
    } catch (loadError) {
      setEpisodes([]);

      if (loadError instanceof ApiClientError && loadError.status === 404) {
        setNotFound(true);
      } else {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load episodes.');
      }
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    // This effect starts the episode request; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadEpisodes();
  }, [loadEpisodes]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(routes.tabs.series as Href);
    }
  };

  if (loading) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <LoadingState message="Loading episodes..." />
      </Screen>
    );
  }

  if (notFound) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <ErrorState
          message="The season you are looking for could not be found."
          retryAction={<Button onPress={goBack} title="Back to Series" />}
          title="Season not found"
        />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <ErrorState
          message={error}
          retryAction={
            <View style={styles.actions}>
              <Button onPress={() => void loadEpisodes()} title="Retry" />
              <Button onPress={goBack} title="Back" variant="secondary" />
            </View>
          }
          title="Could not load episodes"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Button onPress={goBack} title="Back" variant="ghost" />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>SERIES</Text>
        <Text style={styles.title}>Season episodes</Text>
        <Text style={styles.subtitle}>Season ID: {seasonId}</Text>
      </View>

      {episodes.length > 0 ? (
        <View style={styles.episodes}>
          {episodes.map((episode) => (
            <EpisodeCard episode={episode} key={episode.id} />
          ))}
        </View>
      ) : (
        <EmptyState
          message="Episodes will appear here when they are added."
          title="No episodes available"
        />
      )}
    </Screen>
  );
}

type EpisodeCardProps = {
  episode: EpisodeDto;
};

function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <Card>
      <Text style={styles.episodeNumber}>EPISODE {episode.episodeNumber}</Text>
      <Text style={styles.episodeTitle}>{episode.title}</Text>
      {episode.overview ? (
        <Text style={styles.body}>{episode.overview}</Text>
      ) : (
        <Text style={styles.body}>No description is available for this episode.</Text>
      )}
      <View style={styles.metadata}>
        {episode.durationMinutes ? (
          <Text style={styles.metadataText}>{episode.durationMinutes} min</Text>
        ) : null}
        {episode.airDate ? <Text style={styles.metadataText}>{episode.airDate}</Text> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  actions: {
    gap: theme.spacing.sm,
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
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
  },
  episodes: {
    gap: theme.spacing.md,
  },
  episodeNumber: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  episodeTitle: {
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
