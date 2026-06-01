import { useCallback, useEffect, useState } from 'react';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { WatchlistForm } from '@/components/watchlists/WatchlistForm';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getUserFriendlyError } from '@/lib/errors';
import { getWatchlistById, updateWatchlist } from '@/services/watchlist-api';
import type { WatchlistWithItemsDto } from '@/types/api';

export default function EditWatchlistScreen() {
  const params = useLocalSearchParams<{ watchlistId?: string | string[] }>();
  const watchlistId = Array.isArray(params.watchlistId) ? params.watchlistId[0] : params.watchlistId;
  const { accessToken, isAuthenticated, isInitialized, isLoading: authLoading } = useRequireAuth();
  const [watchlist, setWatchlist] = useState<WatchlistWithItemsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWatchlist = useCallback(async () => {
    if (!accessToken || !watchlistId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setWatchlist(await getWatchlistById(accessToken, watchlistId));
    } catch (loadError) {
      setError(getUserFriendlyError(loadError, 'Unable to load this watchlist. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [accessToken, watchlistId]);

  useEffect(() => {
    // This effect starts the authenticated request; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWatchlist();
  }, [loadWatchlist]);

  async function handleSubmit(input: { name: string; description?: string | null }) {
    if (!accessToken || !watchlistId) {
      router.replace(routes.auth.login as Href);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await updateWatchlist(accessToken, watchlistId, input);
      router.replace(routes.watchlistDetails(watchlistId) as Href);
    } catch (submitError) {
      setError(getUserFriendlyError(submitError, 'Unable to update this watchlist. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!isInitialized || authLoading || !isAuthenticated || !accessToken || loading) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <LoadingState message="Loading watchlist..." />
      </Screen>
    );
  }

  if (error && !watchlist) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <ErrorState
          message={error}
          retryAction={<Button onPress={() => void loadWatchlist()} title="Retry" />}
          title="Could not load watchlist"
        />
      </Screen>
    );
  }

  if (!watchlist) {
    return null;
  }

  return (
    <Screen>
      <Button onPress={() => router.back()} title="Back" variant="ghost" />
      <View style={styles.header}>
        <Text style={styles.title}>Edit watchlist</Text>
        <Text style={styles.subtitle}>Update the name or description.</Text>
      </View>
      <WatchlistForm
        error={error}
        initialDescription={watchlist.description}
        initialName={watchlist.name}
        loading={submitting}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
});
