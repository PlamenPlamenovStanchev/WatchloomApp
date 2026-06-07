import { useCallback, useEffect, useState } from 'react';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { WatchlistItemCard } from '@/components/watchlists/WatchlistItemCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { confirmAction } from '@/lib/confirm';
import { getUserFriendlyError } from '@/lib/errors';
import {
  cancelPlannedItemReminder,
  rescheduleKnownPlannedItemReminder,
} from '@/lib/planned-notifications';
import {
  deleteWatchlist,
  getWatchlistById,
  removeWatchlistItem,
  updateWatchlistItem,
} from '@/services/watchlist-api';
import type { UpdateWatchlistItemInput, WatchlistWithItemsDto } from '@/types/api';

export default function WatchlistDetailsScreen() {
  const params = useLocalSearchParams<{ watchlistId?: string | string[] }>();
  const watchlistId = Array.isArray(params.watchlistId) ? params.watchlistId[0] : params.watchlistId;
  const { accessToken, isAuthenticated, isInitialized, isLoading: authLoading } = useRequireAuth();
  const [watchlist, setWatchlist] = useState<WatchlistWithItemsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWatchlist = useCallback(async (refresh = false) => {
    if (!accessToken || !watchlistId) {
      return;
    }

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      setWatchlist(await getWatchlistById(accessToken, watchlistId));
    } catch (loadError) {
      setError(getUserFriendlyError(loadError, 'Unable to load this watchlist. Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, watchlistId]);

  useEffect(() => {
    // This effect starts the authenticated request; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWatchlist();
  }, [loadWatchlist]);

  async function confirmDelete() {
    const confirmed = await confirmAction({
      confirmLabel: 'Delete',
      message: 'This action cannot be undone.',
      title: 'Delete watchlist?',
    });

    if (confirmed) {
      await handleDelete();
    }
  }

  async function handleDelete() {
    if (!accessToken || !watchlistId) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteWatchlist(accessToken, watchlistId);
      await Promise.all(
        watchlist?.items.map((item) => cancelPlannedItemReminder(item.id).catch(() => undefined)) ??
          [],
      );
      router.replace(routes.tabs.watchlists as Href);
    } catch (deleteError) {
      setError(getUserFriendlyError(deleteError, 'Unable to delete this watchlist. Please try again.'));
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpdateItem(itemId: number, input: UpdateWatchlistItemInput) {
    if (!accessToken) {
      router.replace(routes.auth.login as Href);
      return;
    }

    const updatedItem = await updateWatchlistItem(accessToken, itemId, input);
    const currentItem = watchlist?.items.find((item) => item.id === updatedItem.id);

    if (currentItem) {
      await rescheduleKnownPlannedItemReminder({ ...currentItem, ...updatedItem }).catch(
        () => undefined,
      );
    }

    setWatchlist((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
            ),
          }
        : current,
    );
  }

  async function handleRemoveItem(itemId: number) {
    if (!accessToken) {
      router.replace(routes.auth.login as Href);
      return;
    }

    await removeWatchlistItem(accessToken, itemId);
    await cancelPlannedItemReminder(itemId).catch(() => undefined);
    setWatchlist((current) =>
      current
        ? {
            ...current,
            items: current.items.filter((item) => item.id !== itemId),
          }
        : current,
    );
  }

  if (!isInitialized || authLoading || !isAuthenticated || !accessToken || loading) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <LoadingState message="Loading watchlist..." />
      </Screen>
    );
  }

  if (error || !watchlist) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <ErrorState
          message={error ?? 'Watchlist not found.'}
          retryAction={<Button onPress={() => void loadWatchlist()} title="Retry" />}
          title="Could not load watchlist"
        />
      </Screen>
    );
  }

  return (
    <Screen
      scrollViewProps={{
        refreshControl: <RefreshControl onRefresh={() => void loadWatchlist(true)} refreshing={refreshing} />,
      }}
    >
      <Button onPress={() => router.replace(routes.tabs.watchlists as Href)} title="Back" variant="back" />
      <View style={styles.header}>
        <Text style={styles.title}>{watchlist.name}</Text>
        <Text style={styles.subtitle}>{watchlist.description || 'No description provided.'}</Text>
      </View>
      <Card>
        <Text style={styles.count}>
          {watchlist.items.length === 1 ? '1 item' : `${watchlist.items.length} items`}
        </Text>
      </Card>
      <View style={styles.catalogActions}>
        <Button
          onPress={() => router.push(routes.tabs.movies as Href)}
          title="Add movie to the watchlist"
        />
        <Button
          onPress={() => router.push(routes.tabs.series as Href)}
          title="Add series to the watchlist"
          variant="secondary"
        />
      </View>
      <View style={styles.items}>
        <Text style={styles.sectionTitle}>Items</Text>
        {watchlist.items.length > 0 ? (
          watchlist.items.map((item) => (
            <WatchlistItemCard
              item={item}
              key={item.id}
              onRemove={handleRemoveItem}
              onUpdate={handleUpdateItem}
            />
          ))
        ) : (
          <EmptyState
            message="Add movies or series from the catalog to start building this watchlist."
            title="No items yet"
          />
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Button
          onPress={() => router.push(routes.editWatchlist(String(watchlist.id)) as Href)}
          title="Edit Watchlist"
        />
        <Button
          loading={deleting}
          onPress={() => void confirmDelete()}
          title="Delete Watchlist"
          variant="secondary"
        />
      </View>
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
  count: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  actions: {
    gap: theme.spacing.md,
  },
  catalogActions: {
    gap: theme.spacing.sm,
  },
  items: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
  },
});
