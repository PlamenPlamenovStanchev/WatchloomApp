import { useCallback, useEffect, useMemo, useState } from 'react';
import { router, type Href } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { confirmAction } from '@/lib/confirm';
import { showMessage } from '@/lib/message';
import { getUserFriendlyError } from '@/lib/errors';
import {
  createReview,
  deleteReview,
  getMyReviews,
  getReviewsForMedia,
  updateReview,
  type PublicReviewDto,
  type ReviewDetailsInput,
  type ReviewMediaInput,
} from '@/services/review-api';
import type { ReviewDto } from '@/types/api';

type MediaReviewsSectionProps = {
  isAuthenticated: boolean;
  mediaId: number;
  mediaType: 'movie' | 'series';
  token?: string | null;
};

export function MediaReviewsSection({
  isAuthenticated,
  mediaId,
  mediaType,
  token,
}: MediaReviewsSectionProps) {
  const input = useMemo(() => createMediaInput(mediaType, mediaId), [mediaId, mediaType]);
  const [reviews, setReviews] = useState<PublicReviewDto[]>([]);
  const [myReview, setMyReview] = useState<ReviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);

    try {
      const [publicReviews, myReviews] = await Promise.all([
        getReviewsForMedia(input),
        token ? getMyReviews(token) : Promise.resolve([]),
      ]);
      setReviews(publicReviews);
      setMyReview(myReviews.find((review) => matchesMedia(review, input)) ?? null);
    } catch (error) {
      showMessage('Could not load reviews', getUserFriendlyError(error, 'Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [input, token]);

  useEffect(() => {
    // This effect starts the review requests; the helper owns its loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReviews();
  }, [loadReviews]);

  async function submitReview(details: ReviewDetailsInput) {
    if (!token) {
      router.push(routes.auth.login as Href);
      return;
    }

    setSubmitting(true);

    try {
      if (myReview) {
        await updateReview(token, myReview.id, details);
        showMessage('Review updated', 'Your review has been updated.');
      } else {
        await createReview(token, { ...input, ...details });
        showMessage('Review saved', 'Your review has been saved.');
      }

      await loadReviews();
    } catch (error) {
      showMessage('Could not save review', getUserFriendlyError(error, 'Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function removeReview() {
    if (!token || !myReview) {
      return;
    }

    const confirmed = await confirmAction({
      confirmLabel: 'Delete',
      message: 'Delete your review for this title?',
      title: 'Delete review?',
    });

    if (!confirmed) {
      return;
    }

    setSubmitting(true);

    try {
      await deleteReview(token, myReview.id);
      showMessage('Review deleted', 'Your review has been removed.');
      await loadReviews();
    } catch (error) {
      showMessage('Could not delete review', getUserFriendlyError(error, 'Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading reviews..." />;
  }

  return (
    <>
      <ReviewList reviews={reviews} />
      <Card>
        {isAuthenticated && token ? (
          <ReviewForm
            key={myReview?.id ?? 'new-review'}
            loading={submitting}
            onDelete={myReview ? removeReview : undefined}
            onSubmit={submitReview}
            review={myReview}
          />
        ) : (
          <>
            <Text style={styles.body}>Log in to write a review</Text>
            <Button onPress={() => router.push(routes.auth.login as Href)} title="Log in" />
          </>
        )}
      </Card>
    </>
  );
}

function createMediaInput(mediaType: 'movie' | 'series', mediaId: number): ReviewMediaInput {
  return mediaType === 'movie' ? { mediaType, movieId: mediaId } : { mediaType, seriesId: mediaId };
}

function matchesMedia(review: ReviewDto, input: ReviewMediaInput) {
  return input.mediaType === 'movie'
    ? review.mediaType === 'movie' && review.movieId === input.movieId
    : review.mediaType === 'series' && review.seriesId === input.seriesId;
}

const styles = StyleSheet.create({
  body: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 24,
  },
});
