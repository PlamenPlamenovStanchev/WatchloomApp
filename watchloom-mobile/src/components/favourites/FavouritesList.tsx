import { FlatList, StyleSheet, View } from 'react-native';

import { FavouriteItemCard } from '@/components/favourites/FavouriteItemCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/constants/theme';
import type { FavouriteWithMediaDto } from '@/services/favourite-api';

type FavouritesListProps = {
  favourites: readonly FavouriteWithMediaDto[];
  onRefresh: () => void;
  onRemove: (favouriteId: number) => Promise<void>;
  refreshing: boolean;
};

export function FavouritesList({
  favourites,
  onRefresh,
  onRemove,
  refreshing,
}: FavouritesListProps) {
  return (
    <FlatList
      contentContainerStyle={[styles.content, favourites.length === 0 && styles.empty]}
      data={favourites}
      ItemSeparatorComponent={ItemSeparator}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={
        <EmptyState message="Save movies and series to find them here." title="No favourites yet." />
      }
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={({ item }) => <FavouriteItemCard item={item} onRemove={onRemove} />}
    />
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    maxWidth: theme.layout.contentMaxWidth,
    padding: theme.spacing.md,
    width: '100%',
  },
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: theme.spacing.md,
  },
});
