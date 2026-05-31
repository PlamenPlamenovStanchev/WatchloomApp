import { FlatList, StyleSheet, View } from 'react-native';

import { PlannedWatchItemCard } from '@/components/planned/PlannedWatchItemCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/constants/theme';
import type { PlannedWatchItemDto } from '@/types/api';

type PlannedWatchListProps = {
  items: readonly PlannedWatchItemDto[];
  onRefresh: () => void;
  refreshing: boolean;
};

export function PlannedWatchList({ items, onRefresh, refreshing }: PlannedWatchListProps) {
  return (
    <FlatList
      contentContainerStyle={[styles.content, items.length === 0 && styles.empty]}
      data={items}
      ItemSeparatorComponent={ItemSeparator}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={
        <EmptyState
          message="Schedule a movie or series from one of your watchlists."
          title="No planned watching items yet."
        />
      }
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={({ item }) => <PlannedWatchItemCard item={item} />}
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
