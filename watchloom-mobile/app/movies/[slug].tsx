import { useCallback, useEffect, useState } from 'react';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

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
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState<MovieDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

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

      {movie.posterUrl ? (
        <Image source={{ uri: movie.posterUrl }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterPlaceholder]}>
          <Text style={styles.placeholderText}>No poster available</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>MOVIE</Text>
        <Text style={styles.title}>{movie.title}</Text>
        <Text style={styles.metadata}>{formatSummary(movie)}</Text>
        {movie.genres && movie.genres.length > 0 ? (
          <Text style={styles.genres}>{movie.genres.map((genre) => genre.name).join(', ')}</Text>
        ) : null}
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.body}>{movie.overview || 'No description is available for this movie.'}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Details</Text>
        <DetailRow label="Release year" value={movie.releaseYear} />
        <DetailRow
          label="Duration"
          value={movie.durationMinutes ? `${movie.durationMinutes} min` : undefined}
        />
        <DetailRow label="Director" value={movie.director} />
        <DetailRow label="Writer" value={movie.writer} />
        <DetailRow label="Cast" value={movie.cast} />
      </Card>

      {isAuthenticated ? (
        <Button disabled onPress={() => undefined} title="Add to Watchlist" />
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

type DetailRowProps = {
  label: string;
  value?: number | string | null;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Not available'}</Text>
    </View>
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
  poster: {
    alignSelf: 'center',
    backgroundColor: theme.colors.disabled,
    borderRadius: theme.radius.md,
    height: 390,
    maxWidth: 260,
    width: '100%',
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
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
  metadata: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
  },
  genres: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
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
  detailRow: {
    gap: theme.spacing.xs,
  },
  detailLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
  },
});
