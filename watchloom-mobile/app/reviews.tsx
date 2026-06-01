import { useCallback, useEffect, useState } from 'react';
import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { MyReviewsList } from '@/components/reviews/MyReviewsList';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { confirmAction } from '@/lib/confirm';
import { getUserFriendlyError } from '@/lib/errors';
import { showMessage } from '@/lib/message';
import { deleteReview, getMyReviews, type ReviewWithMediaDto } from '@/services/review-api';

export default function MyReviewsScreen() {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithMediaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(
    async (refresh = false) => {
      if (!accessToken) {
        setReviews([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        setReviews(await getMyReviews(accessToken));
      } catch (loadError) {
        setError(getUserFriendlyError(loadError, 'Unable to load reviews. Please try again.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    // This effect starts the authenticated request; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReviews();
  }, [loadReviews]);

  async function handleDelete(reviewId: number) {
    if (!accessToken) {
      router.replace(routes.auth.login as Href);
      return;
    }

    const confirmed = await confirmAction({
      confirmLabel: 'Delete',
      message: 'Delete this review?',
      title: 'Delete review?',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteReview(accessToken, reviewId);
      setReviews((current) => current.filter((review) => review.id !== reviewId));
      showMessage('Review deleted', 'Your review has been removed.');
    } catch (deleteError) {
      showMessage('Could not delete review', getUserFriendlyError(deleteError, 'Please try again.'));
    }
  }

  if (authLoading) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <LoadingState message="Loading your account..." />
      </Screen>
    );
  }

  if (!isAuthenticated || !accessToken) {
    return (
      <Screen contentContainerStyle={styles.centeredContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My reviews</Text>
          <Text style={styles.subtitle}>Log in or create an account to manage your reviews.</Text>
        </View>
        <View style={styles.actions}>
          <Button onPress={() => router.push(routes.auth.login as Href)} title="Log in" />
          <Button
            onPress={() => router.push(routes.auth.register as Href)}
            title="Create account"
            variant="secondary"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.screen} scroll={false}>
      <Button onPress={() => router.back()} title="Back" variant="ghost" />
      <View style={styles.header}>
        <Text style={styles.title}>My reviews</Text>
        <Text style={styles.subtitle}>Reviews you have written for movies and series.</Text>
      </View>
      <View style={styles.list}>
        {loading ? (
          <LoadingState message="Loading reviews..." />
        ) : error ? (
          <ErrorState
            message={error}
            retryAction={<Button onPress={() => void loadReviews()} title="Retry" />}
            title="Could not load reviews"
          />
        ) : (
          <MyReviewsList
            onDelete={handleDelete}
            onRefresh={() => void loadReviews(true)}
            refreshing={refreshing}
            reviews={reviews}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  screen: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.xxl,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
  actions: {
    gap: theme.spacing.md,
  },
  list: {
    flex: 1,
    marginHorizontal: -theme.spacing.md,
  },
});
