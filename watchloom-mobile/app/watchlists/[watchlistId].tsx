import { useCallback, useEffect, useState } from 'react';
import { router, type Href, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { WatchlistItemCard } from '@/components/watchlists/WatchlistItemCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
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
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistWithItemsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(routes.auth.login as Href);
    }
  }, [authLoading, isAuthenticated]);

  const loadWatchlist = useCallback(async () => {
    if (!accessToken || !watchlistId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setWatchlist(await getWatchlistById(accessToken, watchlistId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load watchlist.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, watchlistId]);

  useEffect(() => {
    // This effect starts the authenticated request; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWatchlist();
  }, [loadWatchlist]);

  function confirmDelete() {
    Alert.alert('Delete watchlist?', 'This action cannot be undone.', [
      { style: 'cancel', text: 'Cancel' },
      { onPress: () => void handleDelete(), style: 'destructive', text: 'Delete' },
    ]);
  }

  async function handleDelete() {
    if (!accessToken || !watchlistId) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteWatchlist(accessToken, watchlistId);
      router.replace(routes.tabs.watchlists as Href);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete watchlist.');
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
    setWatchlist((current) =>
      current
        ? {
            ...current,
            items: current.items.filter((item) => item.id !== itemId),
          }
        : current,
    );
  }

  if (authLoading || !isAuthenticated || !accessToken || loading) {
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
    <Screen>
      <Button onPress={() => router.replace(routes.tabs.watchlists as Href)} title="Back" variant="ghost" />
      <View style={styles.header}>
        <Text style={styles.title}>{watchlist.name}</Text>
        <Text style={styles.subtitle}>{watchlist.description || 'No description provided.'}</Text>
      </View>
      <Card>
        <Text style={styles.count}>
          {watchlist.items.length === 1 ? '1 item' : `${watchlist.items.length} items`}
        </Text>
      </Card>
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
        <Button loading={deleting} onPress={confirmDelete} title="Delete Watchlist" variant="secondary" />
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
