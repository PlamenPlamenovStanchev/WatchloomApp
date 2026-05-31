import { FlatList, StyleSheet, View } from 'react-native';

import { WatchlistCard } from '@/components/watchlists/WatchlistCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/constants/theme';
import type { WatchlistSummaryDto } from '@/types/api';

type WatchlistListProps = {
  onRefresh: () => void;
  refreshing: boolean;
  watchlists: readonly WatchlistSummaryDto[];
};

export function WatchlistList({ onRefresh, refreshing, watchlists }: WatchlistListProps) {
  return (
    <FlatList
      contentContainerStyle={[styles.content, watchlists.length === 0 && styles.empty]}
      data={watchlists}
      ItemSeparatorComponent={ItemSeparator}
      keyExtractor={(watchlist) => String(watchlist.id)}
      ListEmptyComponent={
        <EmptyState
          message="Create a watchlist to start organizing your movies and series."
          title="No watchlists yet"
        />
      }
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={({ item }) => <WatchlistCard watchlist={item} />}
    />
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md,
  },
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: theme.spacing.md,
  },
});
