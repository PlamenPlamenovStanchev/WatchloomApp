import { useCallback, useEffect, useState } from 'react';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { ApiClientError } from '@/lib/api-client';
import { getSeriesBySlug, getSeriesSeasons } from '@/services/catalog-api';
import type { SeasonDto, SeriesDetailsDto } from '@/types/api';

export default function SeriesDetailsScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { isAuthenticated } = useAuth();
  const [series, setSeries] = useState<SeriesDetailsDto | null>(null);
  const [seasons, setSeasons] = useState<SeasonDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadSeries = useCallback(async () => {
    if (!slug) {
      setSeries(null);
      setSeasons([]);
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
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
        setError(loadError instanceof Error ? loadError.message : 'Unable to load this series.');
      }
    } finally {
      setLoading(false);
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
    <Screen>
      <Button onPress={goBack} title="Back" variant="ghost" />

      {series.posterUrl ? (
        <Image source={{ uri: series.posterUrl }} style={styles.poster} />
      ) : (
        <View style={[styles.poster, styles.posterPlaceholder]}>
          <Text style={styles.placeholderText}>No poster available</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.eyebrow}>SERIES</Text>
        <Text style={styles.title}>{series.title}</Text>
        <Text style={styles.metadata}>{formatSummary(series)}</Text>
        {series.genres && series.genres.length > 0 ? (
          <Text style={styles.genres}>{series.genres.map((genre) => genre.name).join(', ')}</Text>
        ) : null}
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.body}>{series.overview || 'No description is available for this series.'}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Details</Text>
        <DetailRow label="Release year" value={series.releaseYear} />
        <DetailRow label="Status" value={series.status} />
        <DetailRow label="Network" value={series.network} />
        <DetailRow label="Creator" value={series.creator} />
        <DetailRow label="Cast" value={series.cast} />
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seasons</Text>
        {seasons.length > 0 ? (
          <View style={styles.seasons}>
            {seasons.map((season) => (
              <SeasonCard key={season.id} season={season} />
            ))}
          </View>
        ) : (
          <EmptyState
            message="Episodes will appear here when seasons are added."
            title="No seasons available"
          />
        )}
      </View>

      {isAuthenticated ? (
        <Button disabled onPress={() => undefined} title="Add to Watchlist" />
      ) : (
        <Card>
          <Text style={styles.body}>Log in to add this series to your watchlist</Text>
          <Button
            onPress={() => router.push(routes.auth.login as Href)}
            title="Log in"
          />
        </Card>
      )}
    </Screen>
  );
}

type SeasonCardProps = {
  season: SeasonDto;
};

function SeasonCard({ season }: SeasonCardProps) {
  return (
    <Pressable
      accessibilityLabel={`View season ${season.seasonNumber} episodes`}
      accessibilityRole="button"
      onPress={() => router.push(routes.seasonEpisodes(String(season.id)) as Href)}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card>
        <Text style={styles.seasonTitle}>{season.title || `Season ${season.seasonNumber}`}</Text>
        {season.releaseDate ? <Text style={styles.metadata}>{season.releaseDate}</Text> : null}
        {season.overview ? (
          <Text numberOfLines={3} style={styles.body}>
            {season.overview}
          </Text>
        ) : null}
      </Card>
    </Pressable>
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
  seasons: {
    gap: theme.spacing.md,
  },
  seasonTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
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
  pressed: {
    opacity: 0.8,
  },
});
