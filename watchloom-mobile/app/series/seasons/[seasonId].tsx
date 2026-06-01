import { useCallback, useEffect, useState } from 'react';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EpisodeList } from '@/components/details/EpisodeList';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { ApiClientError } from '@/lib/api-client';
import { getUserFriendlyError } from '@/lib/errors';
import { getSeasonEpisodes } from '@/services/catalog-api';
import type { EpisodeDto } from '@/types/api';

export default function SeasonEpisodesScreen() {
  const params = useLocalSearchParams<{ seasonId?: string | string[] }>();
  const seasonId = Array.isArray(params.seasonId) ? params.seasonId[0] : params.seasonId;
  const [episodes, setEpisodes] = useState<EpisodeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadEpisodes = useCallback(async (refresh = false) => {
    if (!seasonId) {
      setEpisodes([]);
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
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
        setError(getUserFriendlyError(loadError, 'Unable to load episodes. Please try again.'));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    <Screen
      scrollViewProps={{
        refreshControl: <RefreshControl onRefresh={() => void loadEpisodes(true)} refreshing={refreshing} />,
      }}
    >
      <Button onPress={goBack} title="Back" variant="ghost" />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>SERIES</Text>
        <Text style={styles.title}>Season episodes</Text>
        <Text style={styles.subtitle}>Season ID: {seasonId}</Text>
      </View>

      <EpisodeList episodes={episodes} />
    </Screen>
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
});
