import { StyleSheet, Text, View } from 'react-native';

import { ReviewCard } from '@/components/reviews/ReviewCard';
import { theme } from '@/constants/theme';
import type { PublicReviewDto } from '@/services/review-api';

type ReviewListProps = {
  reviews: readonly PublicReviewDto[];
};

export function ReviewList({ reviews }: ReviewListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Public reviews</Text>
      {reviews.length === 0 ? (
        <Text style={styles.empty}>No public reviews yet.</Text>
      ) : (
        reviews.map((review) => <ReviewCard key={review.id} review={review} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  heading: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  empty: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
  },
});
