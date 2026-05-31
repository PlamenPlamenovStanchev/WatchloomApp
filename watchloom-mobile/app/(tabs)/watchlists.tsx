import { useCallback, useEffect, useState } from 'react';
import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { WatchlistList } from '@/components/watchlists/WatchlistList';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { getWatchlists } from '@/services/watchlist-api';
import type { WatchlistSummaryDto } from '@/types/api';

export default function WatchlistsScreen() {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const [watchlists, setWatchlists] = useState<WatchlistSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWatchlists = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setWatchlists([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        setWatchlists(await getWatchlists(accessToken));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load watchlists.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    // This effect starts the authenticated request; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWatchlists();
  }, [loadWatchlists]);

  if (authLoading) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <LoadingState message="Loading your account..." />
      </Screen>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your watchlists</Text>
          <Text style={styles.subtitle}>
            Log in or create an account to organize movies and series you want to watch.
          </Text>
        </View>
        <View style={styles.actions}>
          <Button onPress={() => router.push(routes.auth.login as Href)} title="Log in" />
          <Button
            onPress={() => router.push(routes.auth.register as Href)}
            title="Create account"
            variant="secondary"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.screen} scroll={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Your watchlists</Text>
        <Text style={styles.subtitle}>Keep your movies and series organized.</Text>
      </View>
      <Button
        onPress={() => router.push(routes.newWatchlist as Href)}
        title="Create Watchlist"
      />
      <View style={styles.list}>
        {loading ? (
          <LoadingState message="Loading watchlists..." />
        ) : error ? (
          <ErrorState
            message={error}
            retryAction={<Button onPress={() => void loadWatchlists()} title="Retry" />}
            title="Could not load watchlists"
          />
        ) : (
          <WatchlistList
            onRefresh={() => void loadWatchlists(true)}
            refreshing={refreshing}
            watchlists={watchlists}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  screen: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.sm,
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
  actions: {
    gap: theme.spacing.md,
  },
  list: {
    flex: 1,
    marginHorizontal: -theme.spacing.md,
  },
});
