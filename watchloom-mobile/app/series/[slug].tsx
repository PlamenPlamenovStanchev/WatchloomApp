import { useCallback, useEffect, useState } from 'react';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { CastBlock } from '@/components/details/CastBlock';
import { DetailInfoRow } from '@/components/details/DetailInfoRow';
import { GenreChips } from '@/components/details/GenreChips';
import { PosterHeader } from '@/components/details/PosterHeader';
import { SeasonList } from '@/components/details/SeasonList';
import { FavouriteActionButton } from '@/components/favourites/FavouriteActionButton';
import { MediaReviewsSection } from '@/components/reviews/MediaReviewsSection';
import { AddToWatchlistModal } from '@/components/watchlists/AddToWatchlistModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { ApiClientError } from '@/lib/api-client';
import { getUserFriendlyError } from '@/lib/errors';
import { getSeriesBySlug, getSeriesSeasons } from '@/services/catalog-api';
import type { SeasonDto, SeriesDetailsDto } from '@/types/api';

export default function SeriesDetailsScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { accessToken, isAuthenticated } = useAuth();
  const [series, setSeries] = useState<SeriesDetailsDto | null>(null);
  const [seasons, setSeasons] = useState<SeasonDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [watchlistModalVisible, setWatchlistModalVisible] = useState(false);

  const loadSeries = useCallback(async (refresh = false) => {
    if (!slug) {
      setSeries(null);
      setSeasons([]);
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
      const [seriesResponse, seasonsResponse] = await Promise.all([
        getSeriesBySlug(slug),
        getSeriesSeasons(slug),
      ]);

      setSeries(seriesResponse);
      setSeasons(seasonsResponse.items);
    } catch (loadError) {
      setSeries(null);
      setSeasons([]);

      if (loadError instanceof ApiClientError && loadError.status === 404) {
        setNotFound(true);
      } else {
        setError(getUserFriendlyError(loadError, 'Unable to load this series. Please try again.'));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    // This effect starts the detail requests; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSeries();
  }, [loadSeries]);

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
        <LoadingState message="Loading series..." />
      </Screen>
    );
  }

  if (notFound) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <ErrorState
          message="The series you are looking for could not be found."
          retryAction={<Button onPress={goBack} title="Back to Series" />}
          title="Series not found"
        />
      </Screen>
    );
  }

  if (error || !series) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <ErrorState
          message={error ?? 'Unable to load this series.'}
          retryAction={
            <View style={styles.actions}>
              <Button onPress={() => void loadSeries()} title="Retry" />
              <Button onPress={goBack} title="Back" variant="secondary" />
            </View>
          }
          title="Could not load series"
        />
      </Screen>
    );
  }

  return (
    <Screen
      scrollViewProps={{
        refreshControl: <RefreshControl onRefresh={() => void loadSeries(true)} refreshing={refreshing} />,
      }}
    >
      <Button onPress={goBack} title="Back" variant="ghost" />

      <PosterHeader
        eyebrow="SERIES"
        metadata={formatSummary(series)}
        posterUrl={series.posterUrl}
        title={series.title}
      />
      <GenreChips genres={series.genres} />

      <Card>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.body}>{series.overview || 'No description is available for this series.'}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Details</Text>
        <DetailInfoRow label="Release year" value={series.releaseYear} />
        <DetailInfoRow label="Status" value={series.status} />
        <DetailInfoRow label="Network" value={series.network} />
        <DetailInfoRow label="Creator" value={series.creator} />
        <CastBlock cast={series.cast} />
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seasons</Text>
        <SeasonList seasons={seasons} />
      </View>

      {isAuthenticated && accessToken ? (
        <>
          <FavouriteActionButton mediaId={series.id} mediaType="series" token={accessToken} />
          <Button onPress={() => setWatchlistModalVisible(true)} title="Add to Watchlist" />
          <AddToWatchlistModal
            mediaId={series.id}
            mediaType="series"
            onClose={() => setWatchlistModalVisible(false)}
            token={accessToken}
            visible={watchlistModalVisible}
          />
        </>
      ) : (
        <Card>
          <Text style={styles.body}>Log in to add this series to your watchlist</Text>
          <Button
            onPress={() => router.push(routes.auth.login as Href)}
            title="Log in"
          />
        </Card>
      )}

      <MediaReviewsSection
        isAuthenticated={isAuthenticated}
        mediaId={series.id}
        mediaType="series"
        token={accessToken}
      />
    </Screen>
  );
}

function formatSummary(series: SeriesDetailsDto) {
  return [series.releaseYear, series.status, series.network].filter(Boolean).join(' | ');
}

const styles = StyleSheet.create({
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  actions: {
    gap: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
});
