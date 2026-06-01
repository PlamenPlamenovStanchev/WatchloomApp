import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import type { ReviewWithMediaDto } from '@/services/review-api';

type MyReviewCardProps = {
  onDelete: (reviewId: number) => Promise<void>;
  review: ReviewWithMediaDto;
};

export function MyReviewCard({ onDelete, review }: MyReviewCardProps) {
  const detailsRoute =
    review.media && review.mediaType === 'movie'
      ? routes.movieDetails(review.media.slug)
      : review.media
        ? routes.seriesDetails(review.media.slug)
        : undefined;

  return (
    <Card>
      <Pressable
        accessibilityRole={detailsRoute ? 'button' : undefined}
        disabled={!detailsRoute}
        onPress={() => {
          if (detailsRoute) {
            router.push(detailsRoute as Href);
          }
        }}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Text style={styles.type}>{review.mediaType.toUpperCase()}</Text>
        <Text style={styles.mediaTitle}>{review.media?.title || 'Unavailable title'}</Text>
        <Text style={styles.title}>{review.title || 'Untitled review'}</Text>
        <Text style={styles.rating}>{review.rating}/5</Text>
        <Text style={styles.content}>{review.content}</Text>
      </Pressable>
      <Button
        onPress={() => {
          void onDelete(review.id);
        }}
        title="Delete Review"
        variant="ghost"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  type: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  mediaTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  rating: {
    color: theme.colors.accent,
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
  },
  content: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.8,
  },
});
