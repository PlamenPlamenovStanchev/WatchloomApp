import { useCallback, useEffect, useState } from 'react';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CastBlock } from '@/components/details/CastBlock';
import { DetailInfoRow } from '@/components/details/DetailInfoRow';
import { GenreChips } from '@/components/details/GenreChips';
import { PosterHeader } from '@/components/details/PosterHeader';
import { FavouriteActionButton } from '@/components/favourites/FavouriteActionButton';
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
import { getMovieBySlug } from '@/services/catalog-api';
import type { MovieDetailsDto } from '@/types/api';

export default function MovieDetailsScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { accessToken, isAuthenticated } = useAuth();
  const [movie, setMovie] = useState<MovieDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [watchlistModalVisible, setWatchlistModalVisible] = useState(false);

  const loadMovie = useCallback(async () => {
    if (!slug) {
      setMovie(null);
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      setMovie(await getMovieBySlug(slug));
    } catch (loadError) {
      setMovie(null);

      if (loadError instanceof ApiClientError && loadError.status === 404) {
        setNotFound(true);
      } else {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load this movie.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // This effect starts the detail request; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMovie();
  }, [loadMovie]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(routes.tabs.movies as Href);
    }
  };

  if (loading) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <LoadingState message="Loading movie..." />
      </Screen>
    );
  }

  if (notFound) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <ErrorState
          message="The movie you are looking for could not be found."
          retryAction={<Button onPress={goBack} title="Back to Movies" />}
          title="Movie not found"
        />
      </Screen>
    );
  }

  if (error || !movie) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <ErrorState
          message={error ?? 'Unable to load this movie.'}
          retryAction={
            <View style={styles.actions}>
              <Button onPress={() => void loadMovie()} title="Retry" />
              <Button onPress={goBack} title="Back" variant="secondary" />
            </View>
          }
          title="Could not load movie"
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Button onPress={goBack} title="Back" variant="ghost" />

      <PosterHeader
        eyebrow="MOVIE"
        metadata={formatSummary(movie)}
        posterUrl={movie.posterUrl}
        title={movie.title}
      />
      <GenreChips genres={movie.genres} />

      <Card>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.body}>{movie.overview || 'No description is available for this movie.'}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Details</Text>
        <DetailInfoRow label="Release year" value={movie.releaseYear} />
        <DetailInfoRow
          label="Duration"
          value={movie.durationMinutes ? `${movie.durationMinutes} min` : undefined}
        />
        <DetailInfoRow label="Director" value={movie.director} />
        <DetailInfoRow label="Writer" value={movie.writer} />
        <CastBlock cast={movie.cast} />
      </Card>

      {isAuthenticated && accessToken ? (
        <>
          <FavouriteActionButton mediaId={movie.id} mediaType="movie" token={accessToken} />
          <Button onPress={() => setWatchlistModalVisible(true)} title="Add to Watchlist" />
          <AddToWatchlistModal
            mediaId={movie.id}
            mediaType="movie"
            onClose={() => setWatchlistModalVisible(false)}
            token={accessToken}
            visible={watchlistModalVisible}
          />
        </>
      ) : (
        <Card>
          <Text style={styles.body}>Log in to add this movie to your watchlist</Text>
          <Button
            onPress={() => router.push(routes.auth.login as Href)}
            title="Log in"
          />
        </Card>
      )}
    </Screen>
  );
}

function formatSummary(movie: MovieDetailsDto) {
  return [
    movie.releaseYear,
    movie.durationMinutes ? `${movie.durationMinutes} min` : undefined,
  ]
    .filter(Boolean)
    .join(' | ');
}

const styles = StyleSheet.create({
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  actions: {
    gap: theme.spacing.sm,
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
