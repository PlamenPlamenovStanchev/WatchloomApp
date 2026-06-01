import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';
import type { PublicReviewDto } from '@/services/review-api';

type ReviewCardProps = {
  review: PublicReviewDto;
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>{review.title || 'Untitled review'}</Text>
        <Text style={styles.rating}>{review.rating}/5</Text>
      </View>
      <Text style={styles.metadata}>
        By {review.user.username}
        {review.createdAt ? ` | ${formatDate(review.createdAt)}` : ''}
      </Text>
      <Text style={styles.content}>{review.content}</Text>
    </Card>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.text,
    flex: 1,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  rating: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
  },
  metadata: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
  },
  content: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
  },
});
