import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CatalogList } from '@/components/catalog/CatalogList';
import { CatalogSearchBar } from '@/components/catalog/CatalogSearchBar';
import { SeriesCard } from '@/components/catalog/SeriesCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import { getSeries } from '@/services/catalog-api';
import type { SeriesListItemDto } from '@/types/api';

const PAGE_SIZE = 12;

export default function SeriesScreen() {
  const [series, setSeries] = useState<SeriesListItemDto[]>([]);
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadSeries = useCallback(
    async (nextPage = 1, mode: 'initial' | 'more' | 'refresh' = 'initial') => {
      const currentRequestId = ++requestId.current;

      await Promise.resolve();

      if (mode === 'more') {
        setLoadingMore(true);
      } else if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await getSeries({
          page: nextPage,
          pageSize: PAGE_SIZE,
          q: query || undefined,
        });

        if (currentRequestId !== requestId.current) {
          return;
        }

        setSeries((currentSeries) =>
          mode === 'more' ? [...currentSeries, ...response.items] : response.items,
        );
        setPage(response.page);
        setTotalPages(response.totalPages);
      } catch (loadError) {
        if (currentRequestId !== requestId.current) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load series.');
      } finally {
        if (currentRequestId === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [query],
  );

  useEffect(() => {
    // This effect starts the initial backend request; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSeries();
  }, [loadSeries]);

  const submitSearch = () => {
    setQuery(searchText.trim());
  };

  const loadMore = () => {
    if (!loading && !loadingMore && !refreshing && !error && page < totalPages) {
      void loadSeries(page + 1, 'more');
    }
  };

  const refresh = () => {
    void loadSeries(1, 'refresh');
  };

  return (
    <Screen contentContainerStyle={styles.screen} scroll={false}>
      <CatalogSearchBar
        onChangeText={setSearchText}
        onSubmit={submitSearch}
        placeholder="Search series"
        value={searchText}
      />
      <View style={styles.list}>
        {loading ? (
          <LoadingState message="Loading series..." />
        ) : error ? (
          <ErrorState
            message={error}
            retryAction={<Button onPress={() => void loadSeries()} title="Retry" />}
            title="Could not load series"
          />
        ) : (
          <CatalogList
            emptyState={
              <EmptyState
                message="Try changing your search and submitting it again."
                title="No series found"
              />
            }
            items={series}
            keyExtractor={(item) => String(item.id)}
            loadingMore={loadingMore}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            onRefresh={refresh}
            refreshing={refreshing}
            renderItem={({ item }) => <SeriesCard series={item} />}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  list: {
    flex: 1,
    marginHorizontal: -theme.spacing.md,
  },
});
