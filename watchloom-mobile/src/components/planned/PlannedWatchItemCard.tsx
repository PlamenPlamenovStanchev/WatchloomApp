import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { schedulePlannedItemReminder } from '@/lib/planned-notifications';
import type { PlannedWatchItemDto } from '@/types/api';

type PlannedWatchItemCardProps = {
  item: PlannedWatchItemDto;
};

export function PlannedWatchItemCard({ item }: PlannedWatchItemCardProps) {
  const [scheduling, setScheduling] = useState(false);
  const detailsRoute =
    item.media && item.mediaType === 'movie'
      ? routes.movieDetails(item.media.slug)
      : item.media
        ? routes.seriesDetails(item.media.slug)
        : undefined;

  async function scheduleReminder() {
    setScheduling(true);

    try {
      const result = await schedulePlannedItemReminder(item);
      Alert.alert(
        result === 'scheduled' ? 'Reminder scheduled' : 'Reminder already scheduled',
        result === 'scheduled'
          ? `We will remind you to watch ${item.media?.title || 'this title'}.`
          : 'A reminder is already set for this planned watch time.',
      );
    } catch (error) {
      Alert.alert(
        'Could not schedule reminder',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setScheduling(false);
    }
  }

  return (
    <Card style={styles.card}>
      <Pressable
        accessibilityRole={detailsRoute ? 'button' : undefined}
        disabled={!detailsRoute}
        onPress={() => {
          if (detailsRoute) {
            router.push(detailsRoute as Href);
          }
        }}
        style={({ pressed }) => [styles.summary, pressed && styles.pressed]}
      >
        {item.media?.posterUrl ? (
          <Image source={{ uri: item.media.posterUrl }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <Text style={styles.placeholderText}>No poster</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.type}>{item.mediaType.toUpperCase()}</Text>
          <Text style={styles.title}>{item.media?.title || 'Unavailable title'}</Text>
          <Text style={styles.metadata}>Status: {formatStatus(item.status)}</Text>
          <Text style={styles.metadata}>Planned: {formatDate(item.plannedWatchAt)}</Text>
          <Text style={styles.watchlist}>Watchlist: {item.watchlist.name}</Text>
        </View>
      </Pressable>
      <Button
        loading={scheduling}
        onPress={() => {
          void scheduleReminder();
        }}
        title="Remind me"
        variant="secondary"
      />
    </Card>
  );
}

function formatStatus(status: PlannedWatchItemDto['status']) {
  return status === 'to_watch' ? 'To watch' : status === 'watching' ? 'Watching' : 'Watched';
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  summary: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  poster: {
    aspectRatio: 2 / 3,
    backgroundColor: theme.colors.disabled,
    borderRadius: theme.radius.sm,
    width: 88,
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
  content: {
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
  watchlist: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
