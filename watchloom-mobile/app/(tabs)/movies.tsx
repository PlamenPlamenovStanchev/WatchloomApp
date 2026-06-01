import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CatalogList } from '@/components/catalog/CatalogList';
import { CatalogSearchBar } from '@/components/catalog/CatalogSearchBar';
import { MovieCard } from '@/components/catalog/MovieCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { theme } from '@/constants/theme';
import { getUserFriendlyError } from '@/lib/errors';
import { getMovies } from '@/services/catalog-api';
import type { MovieListItemDto } from '@/types/api';

const PAGE_SIZE = 12;

export default function MoviesScreen() {
  const [movies, setMovies] = useState<MovieListItemDto[]>([]);
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadMovies = useCallback(
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
        const response = await getMovies({
          page: nextPage,
          pageSize: PAGE_SIZE,
          q: query || undefined,
        });

        if (currentRequestId !== requestId.current) {
          return;
        }

        setMovies((currentMovies) =>
          mode === 'more' ? [...currentMovies, ...response.items] : response.items,
        );
        setPage(response.page);
        setTotalPages(response.totalPages);
      } catch (loadError) {
        if (currentRequestId !== requestId.current) {
          return;
        }

        setError(getUserFriendlyError(loadError, 'Unable to load movies. Please try again.'));
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
    void loadMovies();
  }, [loadMovies]);

  const submitSearch = () => {
    setQuery(searchText.trim());
  };

  const loadMore = () => {
    if (!loading && !loadingMore && !refreshing && !error && page < totalPages) {
      void loadMovies(page + 1, 'more');
    }
  };

  const refresh = () => {
    void loadMovies(1, 'refresh');
  };

  return (
    <Screen contentContainerStyle={styles.screen} scroll={false}>
      <CatalogSearchBar
        onChangeText={setSearchText}
        onSubmit={submitSearch}
        placeholder="Search movies"
        value={searchText}
      />
      <View style={styles.list}>
        {loading ? (
          <LoadingState message="Loading movies..." />
        ) : error ? (
          <ErrorState
            message={error}
            retryAction={<Button onPress={() => void loadMovies()} title="Retry" />}
            title="Could not load movies"
          />
        ) : (
          <CatalogList
            emptyState={
              <EmptyState
                message="Try changing your search and submitting it again."
                title="No movies found"
              />
            }
            items={movies}
            keyExtractor={(movie) => String(movie.id)}
            loadingMore={loadingMore}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            onRefresh={refresh}
            refreshing={refreshing}
            renderItem={({ item }) => <MovieCard movie={item} />}
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
