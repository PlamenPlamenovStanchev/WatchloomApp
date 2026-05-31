import { useCallback, useEffect, useState } from 'react';
import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { MovieCard } from '@/components/catalog/MovieCard';
import { SeriesCard } from '@/components/catalog/SeriesCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { getMovies, getSeries } from '@/services/catalog-api';
import type { MovieListItemDto, SeriesListItemDto } from '@/types/api';

const PREVIEW_PAGE_SIZE = 5;

export default function HomeScreen() {
  const { isAuthenticated, user } = useAuth();
  const [movies, setMovies] = useState<MovieListItemDto[]>([]);
  const [series, setSeries] = useState<SeriesListItemDto[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState<string | null>(null);
  const [seriesError, setSeriesError] = useState<string | null>(null);

  const loadMovies = useCallback(async () => {
    setMoviesLoading(true);
    setMoviesError(null);

    try {
      const response = await getMovies({ page: 1, pageSize: PREVIEW_PAGE_SIZE });
      setMovies(response.items);
    } catch (error) {
      setMoviesError(error instanceof Error ? error.message : 'Unable to load movies.');
    } finally {
      setMoviesLoading(false);
    }
  }, []);

  const loadSeries = useCallback(async () => {
    setSeriesLoading(true);
    setSeriesError(null);

    try {
      const response = await getSeries({ page: 1, pageSize: PREVIEW_PAGE_SIZE });
      setSeries(response.items);
    } catch (error) {
      setSeriesError(error instanceof Error ? error.message : 'Unable to load series.');
    } finally {
      setSeriesLoading(false);
    }
  }, []);

  useEffect(() => {
    // These effects start preview requests; each helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMovies();
    void loadSeries();
  }, [loadMovies, loadSeries]);

  return (
    <Screen>
      <Card style={styles.hero}>
        <Text style={styles.eyebrow}>WATCHLOOM</Text>
        <Text style={styles.title}>
          {isAuthenticated && user ? `Welcome back, ${user.username}` : 'Find your next story'}
        </Text>
        <Text style={styles.subtitle}>
          Browse movies and series, then keep your watch plans organized in one place.
        </Text>
        {!isAuthenticated ? (
          <View style={styles.actions}>
            <Button
              onPress={() => router.push(routes.auth.login as Href)}
              title="Log in"
            />
            <Button
              onPress={() => router.push(routes.auth.register as Href)}
              title="Create account"
              variant="secondary"
            />
          </View>
        ) : null}
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actions}>
          <Button
            onPress={() => router.push(routes.tabs.movies as Href)}
            title="Browse Movies"
          />
          <Button
            onPress={() => router.push(routes.tabs.series as Href)}
            title="Browse Series"
            variant="secondary"
          />
          <Button
            onPress={() => router.push(routes.tabs.watchlists as Href)}
            title="My Watchlists"
            variant="secondary"
          />
        </View>
      </View>

      <PreviewSection
        emptyMessage="Movies will appear here when the catalog has titles."
        error={moviesError}
        loading={moviesLoading}
        onBrowse={() => router.push(routes.tabs.movies as Href)}
        onRetry={() => void loadMovies()}
        title="Latest movies"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </PreviewSection>

      <PreviewSection
        emptyMessage="Series will appear here when the catalog has titles."
        error={seriesError}
        loading={seriesLoading}
        onBrowse={() => router.push(routes.tabs.series as Href)}
        onRetry={() => void loadSeries()}
        title="Latest series"
      >
        {series.map((item) => (
          <SeriesCard key={item.id} series={item} />
        ))}
      </PreviewSection>
    </Screen>
  );
}

type PreviewSectionProps = {
  children: React.ReactNode;
  emptyMessage: string;
  error: string | null;
  loading: boolean;
  onBrowse: () => void;
  onRetry: () => void;
  title: string;
};

function PreviewSection({
  children,
  emptyMessage,
  error,
  loading,
  onBrowse,
  onRetry,
  title,
}: PreviewSectionProps) {
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Button onPress={onBrowse} title="See all" variant="ghost" />
      </View>
      {loading ? (
        <LoadingState message={`Loading ${title.toLowerCase()}...`} />
      ) : error ? (
        <ErrorState
          message={error}
          retryAction={<Button onPress={onRetry} title="Retry" variant="secondary" />}
          title={`Could not load ${title.toLowerCase()}`}
        />
      ) : hasItems ? (
        <View style={styles.previewList}>{children}</View>
      ) : (
        <Card>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.md,
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
    lineHeight: 24,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  actions: {
    gap: theme.spacing.sm,
  },
  previewList: {
    gap: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
  },
});
