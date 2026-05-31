import type { ComponentType, ReactElement } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
  type FlatListProps,
  type ListRenderItem,
} from 'react-native';

import { CatalogEmptyState } from '@/components/catalog/CatalogEmptyState';
import { theme } from '@/constants/theme';

type CatalogListProps<ItemT> = Omit<
  FlatListProps<ItemT>,
  'data' | 'ListEmptyComponent' | 'ListFooterComponent' | 'renderItem'
> & {
  emptyState?: ComponentType | ReactElement | null;
  items: readonly ItemT[];
  loadingMore?: boolean;
  renderItem: ListRenderItem<ItemT>;
};

export function CatalogList<ItemT>({
  contentContainerStyle,
  emptyState,
  items,
  loadingMore = false,
  renderItem,
  ...props
}: CatalogListProps<ItemT>): ReactElement {
  return (
    <FlatList
      contentContainerStyle={[styles.content, items.length === 0 && styles.empty, contentContainerStyle]}
      data={items}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={emptyState ?? <CatalogEmptyState />}
      ListFooterComponent={loadingMore ? <LoadingFooter /> : null}
      renderItem={renderItem}
      {...props}
    />
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function LoadingFooter() {
  return (
    <View accessibilityRole="progressbar" style={styles.footer}>
      <ActivityIndicator color={theme.colors.accent} />
    </View>
  );
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
  footer: {
    paddingVertical: theme.spacing.lg,
  },
});
