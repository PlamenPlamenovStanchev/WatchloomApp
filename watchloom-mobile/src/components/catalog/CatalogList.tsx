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
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';

type CatalogListProps<ItemT> = Omit<
  FlatListProps<ItemT>,
  'data' | 'ListEmptyComponent' | 'ListFooterComponent' | 'renderItem'
> & {
  emptyState?: ComponentType | ReactElement | null;
  items: readonly ItemT[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  renderItem: ListRenderItem<ItemT>;
};

export function CatalogList<ItemT>({
  contentContainerStyle,
  emptyState,
  hasMore = false,
  items,
  loadingMore = false,
  onLoadMore,
  renderItem,
  ...props
}: CatalogListProps<ItemT>): ReactElement {
  return (
    <FlatList
      contentContainerStyle={[styles.content, items.length === 0 && styles.empty, contentContainerStyle]}
      data={items}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={emptyState ?? <CatalogEmptyState />}
      ListFooterComponent={
        items.length > 0 ? (
          <ListFooter hasMore={hasMore} loadingMore={loadingMore} onLoadMore={onLoadMore} />
        ) : null
      }
      renderItem={renderItem}
      {...props}
    />
  );
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function ListFooter({
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore?: () => void;
}) {
  if (loadingMore) {
    return <LoadingFooter />;
  }

  if (!hasMore || !onLoadMore) {
    return <View style={styles.footerSpacer} />;
  }

  return (
    <View style={styles.footer}>
      <Button onPress={onLoadMore} title="Load more" variant="secondary" />
    </View>
  );
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
  footer: {
    paddingVertical: theme.spacing.lg,
  },
  footerSpacer: {
    height: theme.spacing.lg,
  },
});
