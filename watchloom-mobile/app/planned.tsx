import { useCallback, useEffect, useState } from 'react';
import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PlannedWatchList } from '@/components/planned/PlannedWatchList';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { getUserFriendlyError } from '@/lib/errors';
import { getPlannedWatchItems } from '@/services/watchlist-api';
import type { PlannedWatchItemDto } from '@/types/api';

export default function PlannedWatchingScreen() {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<PlannedWatchItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setItems([]);
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
        setItems(await getPlannedWatchItems(accessToken));
      } catch (loadError) {
        setError(getUserFriendlyError(loadError, 'Unable to load planned watching. Please try again.'));
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
    void loadItems();
  }, [loadItems]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(routes.tabs.watchlists as Href);
    }
  }

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
          <Text style={styles.title}>Planned watching</Text>
          <Text style={styles.subtitle}>
            Log in or create an account to view your scheduled movies and series.
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
      <Button onPress={goBack} title="Back" variant="back" />
      <View style={styles.header}>
        <Text style={styles.title}>Planned watching</Text>
        <Text style={styles.subtitle}>Your upcoming movies and series, ordered by date.</Text>
      </View>
      <View style={styles.list}>
        {loading ? (
          <LoadingState message="Loading planned watching..." />
        ) : error ? (
          <ErrorState
            message={error}
            retryAction={<Button onPress={() => void loadItems()} title="Retry" />}
            title="Could not load planned watching"
          />
        ) : (
          <PlannedWatchList
            items={items}
            onRefresh={() => void loadItems(true)}
            refreshing={refreshing}
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
