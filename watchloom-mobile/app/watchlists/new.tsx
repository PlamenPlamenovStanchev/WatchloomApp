import { useEffect, useState } from 'react';
import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { WatchlistForm } from '@/components/watchlists/WatchlistForm';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { createWatchlist } from '@/services/watchlist-api';

export default function NewWatchlistScreen() {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(routes.auth.login as Href);
    }
  }, [authLoading, isAuthenticated]);

  async function handleSubmit(input: { name: string; description?: string | null }) {
    if (!accessToken) {
      router.replace(routes.auth.login as Href);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const watchlist = await createWatchlist(accessToken, input);
      router.replace(routes.watchlistDetails(String(watchlist.id)) as Href);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create watchlist.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !isAuthenticated || !accessToken) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <LoadingState message="Loading your account..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Button onPress={() => router.back()} title="Back" variant="ghost" />
      <View style={styles.header}>
        <Text style={styles.title}>Create watchlist</Text>
        <Text style={styles.subtitle}>Start a new list for movies and series.</Text>
      </View>
      <WatchlistForm
        error={error}
        loading={submitting}
        onSubmit={handleSubmit}
        submitLabel="Create Watchlist"
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
