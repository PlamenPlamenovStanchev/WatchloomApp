import { FlatList, StyleSheet, View } from 'react-native';

import { MyReviewCard } from '@/components/reviews/MyReviewCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/constants/theme';
import type { ReviewWithMediaDto } from '@/services/review-api';

type MyReviewsListProps = {
  onDelete: (reviewId: number) => Promise<void>;
  onRefresh: () => void;
  refreshing: boolean;
  reviews: readonly ReviewWithMediaDto[];
};

export function MyReviewsList({ onDelete, onRefresh, refreshing, reviews }: MyReviewsListProps) {
  return (
    <FlatList
      contentContainerStyle={[styles.content, reviews.length === 0 && styles.empty]}
      data={reviews}
      ItemSeparatorComponent={ItemSeparator}
      keyExtractor={(review) => String(review.id)}
      ListEmptyComponent={<EmptyState message="Write a review from a title's details page." title="No reviews yet." />}
      onRefresh={onRefresh}
      refreshing={refreshing}
      renderItem={({ item }) => <MyReviewCard onDelete={onDelete} review={item} />}
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
