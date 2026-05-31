import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { WatchStatusPicker } from '@/components/watchlists/WatchStatusPicker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { theme } from '@/constants/theme';
import { addWatchlistItem, getWatchlists } from '@/services/watchlist-api';
import type { WatchlistSummaryDto, WatchStatus } from '@/types/api';

type AddToWatchlistModalProps = {
  mediaId: number;
  mediaType: 'movie' | 'series';
  onClose: () => void;
  token: string;
  visible: boolean;
};

export function AddToWatchlistModal({
  mediaId,
  mediaType,
  onClose,
  token,
  visible,
}: AddToWatchlistModalProps) {
  const [watchlists, setWatchlists] = useState<WatchlistSummaryDto[]>([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<number | null>(null);
  const [status, setStatus] = useState<WatchStatus>('to_watch');
  const [plannedWatchAt, setPlannedWatchAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadWatchlists = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await getWatchlists(token);
      setWatchlists(items);
      setSelectedWatchlistId((current) => current ?? items[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load watchlists.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadWatchlists();
    }
  }, [loadWatchlists, visible]);

  async function handleSubmit() {
    if (!selectedWatchlistId) {
      setError('Select a watchlist first.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await addWatchlistItem(token, selectedWatchlistId, {
        mediaType,
        movieId: mediaType === 'movie' ? mediaId : undefined,
        plannedWatchAt: status === 'to_watch' ? plannedWatchAt.trim() || null : null,
        seriesId: mediaType === 'series' ? mediaId : undefined,
        status,
      });
      setSuccess('Added to watchlist.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to add this title.');
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    setError(null);
    setSuccess(null);
    onClose();
  }

  return (
    <Modal animationType="slide" onRequestClose={close} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.title}>Add to Watchlist</Text>
              <Button onPress={close} title="Close" variant="ghost" />
            </View>

            {loading ? (
              <LoadingState message="Loading watchlists..." />
            ) : error && watchlists.length === 0 ? (
              <ErrorState
                message={error}
                retryAction={<Button onPress={() => void loadWatchlists()} title="Retry" />}
                title="Could not load watchlists"
              />
            ) : watchlists.length === 0 ? (
              <EmptyState
                message="Create a watchlist from the Watchlists tab first."
                title="No watchlists yet"
              />
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>Watchlist</Text>
                  {watchlists.map((watchlist) => (
                    <Pressable
                      accessibilityRole="button"
                      key={watchlist.id}
                      onPress={() => setSelectedWatchlistId(watchlist.id)}
                    >
                      <Card style={watchlist.id === selectedWatchlistId && styles.selectedCard}>
                        <Text style={styles.watchlistName}>{watchlist.name}</Text>
                        <Text style={styles.watchlistCount}>{watchlist.itemCount} items</Text>
                      </Card>
                    </Pressable>
                  ))}
                </View>

                <WatchStatusPicker disabled={submitting} onChange={setStatus} value={status} />

                {status === 'to_watch' ? (
                  <Input
                    editable={!submitting}
                    label="Planned watch date"
                    onChangeText={setPlannedWatchAt}
                    placeholder="YYYY-MM-DD"
                    value={plannedWatchAt}
                  />
                ) : null}

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {success ? <Text style={styles.success}>{success}</Text> : null}

                <Button
                  disabled={Boolean(success)}
                  loading={submitting}
                  onPress={() => void handleSubmit()}
                  title={success ? 'Added' : 'Add to Watchlist'}
                />
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    borderWidth: 1,
    maxHeight: '88%',
  },
  content: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
  },
  section: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  selectedCard: {
    borderColor: theme.colors.accent,
  },
  watchlistName: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  watchlistCount: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
  },
  success: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
});
