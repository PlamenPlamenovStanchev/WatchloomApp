import { useState } from 'react';
import { router, type Href } from 'expo-router';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { RatingPicker } from '@/components/watchlists/RatingPicker';
import { WatchStatusPicker } from '@/components/watchlists/WatchStatusPicker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import type { UpdateWatchlistItemInput, WatchlistItemWithMediaDto, WatchStatus } from '@/types/api';

type WatchlistItemCardProps = {
  item: WatchlistItemWithMediaDto;
  onRemove: (itemId: number) => Promise<void>;
  onUpdate: (itemId: number, input: UpdateWatchlistItemInput) => Promise<void>;
};

export function WatchlistItemCard({ item, onRemove, onUpdate }: WatchlistItemCardProps) {
  const [status, setStatus] = useState<WatchStatus>(item.status);
  const [rating, setRating] = useState(item.rating);
  const [plannedWatchAt, setPlannedWatchAt] = useState(formatDateInput(item.plannedWatchAt));
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(input: UpdateWatchlistItemInput) {
    setSaving(true);
    setError(null);

    try {
      await onUpdate(item.id, input);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update this item.');
    } finally {
      setSaving(false);
    }
  }

  function changeStatus(nextStatus: WatchStatus) {
    setStatus(nextStatus);

    if (nextStatus !== 'to_watch') {
      setPlannedWatchAt('');
      void save({ plannedWatchAt: null, status: nextStatus });
    } else {
      void save({ status: nextStatus });
    }
  }

  function changeRating(nextRating: number | null) {
    setRating(nextRating);
    void save({ rating: nextRating });
  }

  function confirmRemove() {
    Alert.alert('Remove item?', 'Remove this title from the watchlist?', [
      { style: 'cancel', text: 'Cancel' },
      { onPress: () => void remove(), style: 'destructive', text: 'Remove' },
    ]);
  }

  async function remove() {
    setRemoving(true);
    setError(null);

    try {
      await onRemove(item.id);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove this item.');
      setRemoving(false);
    }
  }

  const detailsRoute =
    item.media && item.mediaType === 'movie'
      ? routes.movieDetails(item.media.slug)
      : item.media
        ? routes.seriesDetails(item.media.slug)
        : undefined;

  return (
    <Card>
      <View style={styles.summary}>
        {item.media?.posterUrl ? (
          <Image source={{ uri: item.media.posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.placeholderText}>No poster</Text>
          </View>
        )}
        <View style={styles.summaryText}>
          <Text style={styles.type}>{item.mediaType.toUpperCase()}</Text>
          <Text style={styles.title}>{item.media?.title || 'Unavailable title'}</Text>
          {item.plannedWatchAt ? (
            <Text style={styles.metadata}>Planned: {formatDisplayDate(item.plannedWatchAt)}</Text>
          ) : null}
          {detailsRoute ? (
            <Pressable onPress={() => router.push(detailsRoute as Href)}>
              <Text style={styles.link}>Open details</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <WatchStatusPicker disabled={saving || removing} onChange={changeStatus} value={status} />
      <RatingPicker disabled={saving || removing} onChange={changeRating} value={rating} />

      {status === 'to_watch' ? (
        <View style={styles.dateSection}>
          <Input
            editable={!saving && !removing}
            label="Planned watch date"
            onChangeText={setPlannedWatchAt}
            placeholder="YYYY-MM-DD"
            value={plannedWatchAt}
          />
          <Button
            disabled={removing}
            loading={saving}
            onPress={() => void save({ plannedWatchAt: plannedWatchAt.trim() || null })}
            title="Save Planned Date"
            variant="secondary"
          />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button loading={removing} onPress={confirmRemove} title="Remove Item" variant="ghost" />
    </Card>
  );
}

function formatDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

function formatDisplayDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  poster: {
    aspectRatio: 2 / 3,
    backgroundColor: theme.colors.disabled,
    borderRadius: theme.radius.sm,
    width: 76,
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
  },
  placeholderText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    textAlign: 'center',
  },
  summaryText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  type: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  metadata: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
  },
  link: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  dateSection: {
    gap: theme.spacing.sm,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
  },
});
