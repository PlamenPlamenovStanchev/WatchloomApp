import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui/Card';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import type { WatchlistSummaryDto } from '@/types/api';

type WatchlistCardProps = {
  watchlist: WatchlistSummaryDto;
};

export function WatchlistCard({ watchlist }: WatchlistCardProps) {
  const itemLabel = watchlist.itemCount === 1 ? '1 item' : `${watchlist.itemCount} items`;

  return (
    <Pressable
      accessibilityLabel={`Open ${watchlist.name}`}
      accessibilityRole="button"
      onPress={() => router.push(routes.watchlistDetails(String(watchlist.id)) as Href)}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card>
        <Text numberOfLines={2} style={styles.title}>{watchlist.name}</Text>
        {watchlist.description ? <Text numberOfLines={3} style={styles.description}>{watchlist.description}</Text> : null}
        <Text style={styles.count}>{itemLabel}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    lineHeight: 26,
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
  },
  count: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
